const validateSignup = (
	userName: string,
	email: string,
	password: string
): any => {
	const errors: any = {};

	if (userName.trim() === "") {
		errors.userName = "Username is required";
	} else if (userName.trim().length < 3) {
		errors.userName = "Username must be at least 3 characters long";
	} else if (userName.trim().length > 30) {
		errors.userName = "Username should be less than 30 character";
	}

	// Email validations
	const emailRegEx = /\S+@\S+\.\S+/;

	if (email.trim() === "") {
		errors.email = "Email is required";
	} else if (!email.trim().match(emailRegEx)) {
		errors.email = "Invalid Email Address";
	}

	// Password validations
	if (password.trim() === "") {
		errors.password = "Password is required";
	} else if (password.trim().length < 6) {
		errors.password = "Password must be at least 6 characters long";
	} else if (password.trim().length > 15) {
		errors.password = "Password should be less than 15 character";
	}

	return {
		errors,
		valid: Object.keys(errors).length < 1
	};
};

export default validateSignup;
