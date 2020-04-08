import Haba from "../../../models/haba.model";

export default {
	Query: {
		async haba_allHabas() {
			// Save to DB
			try {
				const res = await Haba.findAll();

				return res;
			} catch (err) {
				console.log("Err is: ", err);
			}
		},
	},
};
