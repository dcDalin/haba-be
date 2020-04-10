import { UserInputError } from 'apollo-server-express';
import bcrypt from 'bcryptjs';
import User from '../../../models/user.model';
import { generateToken } from '../../../utils/generateToken';
import validateUserSignUp from './validateUserSignUp';

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
      };
    },
  },
};
