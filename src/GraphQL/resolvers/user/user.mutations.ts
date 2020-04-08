import { UserInputError } from "apollo-server-express";
import bcrypt from "bcryptjs";
import User from "../../../models/user.model";
import { generateToken } from "../../../utils/generateToken";
import validateUserSignUp from "./validateUserSignUp";

interface UserSignUpInput {
	userSignUpInput: {
		userName: string;
		email: string;
		password: string;
	};
}

interface UserSignInInput {
	userSignInInput: {
		email: string;
		password: string;
	};
}

export default {
	Mutation: {
		async user_signUp(
			_: null,
			{ userSignUpInput: { userName, email, password } }: UserSignUpInput
		) {
			// Validate user input
			const { valid, errors } = validateUserSignUp(userName, email, password);
			if (!valid) {
				throw new UserInputError("Errors", { errors });
			}

			// Make sure email doesn't exist
			// Front end checks this as well but you can never be too sure :)
			// Mongo unique does the same :D
			const userEmail = await User.findOne({
				where: { email: email.toLowerCase() },
			});

			if (userEmail) {
				throw new UserInputError("Email exists", {
					errors: {
						email: "Email already exists",
					},
				});
			}

			const userUserName = await User.findOne({
				where: { userName: userName.toLowerCase() },
			});

			if (userUserName) {
				throw new UserInputError("Username exists", {
					errors: {
						userName: "Username already exists",
					},
				});
			}

			// Hash the password
			const hashedPassword = await bcrypt.hash(password, 12);

			// Save to DB
			const res = await User.create({
				userName: userName.toLowerCase(),
				email: email.toLowerCase(),
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
			{ userSignInInput: { email, password } }: UserSignInInput
		) {
			const user = await User.findOne({
				where: { email: email.toLowerCase() },
			});

			const errors: any = {};

			if (!user) {
				errors.general = "User not found";
				throw new UserInputError("Wrong email and or password");
			}

			if (!user.password) {
				errors.general = "Password not set";
				throw new UserInputError(
					"Please reset your password by clicking 'Forgot Password'"
				);
			}

			const match = await bcrypt.compare(password, user.password);

			if (!match) {
				errors.general = "User not found";
				throw new UserInputError("Wrong email and or password");
			}

			const token = generateToken(user.toJSON());

			return {
				token,
			};
		},
	},
};
