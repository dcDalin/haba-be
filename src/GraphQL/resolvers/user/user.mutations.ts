import { unlink } from 'fs';
import { UserInputError } from 'apollo-server-express';
import bcrypt from 'bcryptjs';
import cloudinary from 'cloudinary';
import User from '../../../models/user.model';
import { generateToken } from '../../../utils/generateToken';
import validateUserSignUp from './validateUserSignUp';
import checkAuth from '../../../utils/checkAuth';
import fileUpload from '../../../utils/fileUpload';

interface UserSignUpInput {
  userSignUpInput: {
    userName: string;
    phoneNumber: string;
    password: string;
  };
}

interface UserSignInInput {
  userSignInInput: {
    phoneNumber: string;
    password: string;
  };
}

export default {
  Mutation: {
    async user_signUp(
      _: null,
      { userSignUpInput: { userName, phoneNumber, password } }: UserSignUpInput
    ) {
      // Validate user input
      const { valid, errors } = validateUserSignUp(
        userName,
        phoneNumber,
        password
      );
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      // Make sure phoneNumber doesn't exist
      // Front end checks this as well but you can never be too sure :)
      // Mongo unique does the same :D
      const userPhoneNumber = await User.findOne({
        where: { phoneNumber },
      });

      if (userPhoneNumber) {
        throw new UserInputError('Phone number exists', {
          errors: {
            phoneNumber: 'Phone number already exists',
          },
        });
      }

      const userUserName = await User.findOne({
        where: { userName: userName.toLowerCase() },
      });

      if (userUserName) {
        throw new UserInputError('Username exists', {
          errors: {
            userName: 'Username already exists',
          },
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Save to DB
      const res = await User.create({
        userName: userName.toLowerCase(),
        phoneNumber,
        password: hashedPassword,
      });

      // Generate token
      const token = generateToken(res.toJSON());

      return {
        token,
        userName,
      };
    },
    async user_signIn(
      _: null,
      { userSignInInput: { phoneNumber, password } }: UserSignInInput
    ) {
      const user = await User.findOne({
        where: { phoneNumber },
      });

      const errors: any = {};

      if (!user) {
        errors.general = 'User not found';
        throw new UserInputError('Wrong phone number and or password');
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        errors.general = 'User not found';
        throw new UserInputError('Wrong phone number and or password');
      }

      const token = generateToken(user.toJSON());

      return {
        token,
        userName: user.userName,
      };
    },
    async user_updateProfile(
      _: null,
      { userUpdateInput: { bio, userName, displayName } }: any,
      context: any
    ) {
      const me = checkAuth(context);

      // Get user id from decoded token
      const userId = me.id;

      try {
        // Lowercase userName, otherwise it will cause an error
        const res = await User.update(
          {
            bio,
            userName: userName.toLowerCase(),
            displayName,
          },
          { where: { id: userId } }
        );
        if (res) {
          return true;
        }
        return false;
      } catch (err) {
        console.log('Err is: ', err);
        return false;
      }
    },
    async user_updateProfilePicture(_: null, { file }: any, context: any) {
      const me = checkAuth(context);

      const { id } = me;

      const user = await User.findByPk(id);

      if (!user) {
        return false;
      }

      // check empty or null '' || null
      const isEmpty = (value: string) => Boolean(!value);

      // Upload file to our server and retrieve path to upload to cloudinary
      const uploadFile = await fileUpload(file);

      if (uploadFile) {
        // Local file path
        const { path } = uploadFile;

        const { publicId } = user;

        // Replace the image with the same publicId
        const upload = await cloudinary.v2.uploader.upload(
          path,
          { folder: 'haba_profile_pic/', public_id: publicId },
          (error: any, result: any) => {
            if (error) return false;
            // Result needed for upload below
            return result;
          }
        );

        if (upload) {
          const newPublicId = !isEmpty(publicId) ? publicId : upload.public_id;
          const res = await User.update(
            {
              publicId: newPublicId,
              profileUrl: upload.url,
            },
            { where: { id } }
          );

          unlink(path, (err) => {
            console.error(err);
          });

          if (res) {
            return true;
          } else {
            return false;
          }
        } else {
          unlink(path, (err) => {
            console.error(err);
          });
          return false;
        }
      } else {
        return false;
      }
    },
  },
};
