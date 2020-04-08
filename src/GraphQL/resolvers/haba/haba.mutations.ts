import pubsub from "../pubSub";
import sequelize from "../../../db/connection";
import Haba from "../../../models/haba.model";
import User from "../../../models/user.model";
import Admin from "../../../models/admin.model";
import UserTransaction from "../../../models/userTransaction.model";
import AdminTransaction from "../../../models/adminTransaction.model";
import { NEW_HABA, TRANSACTION_CHANGE } from "../types";

export default {
	Mutation: {
		async haba_newHaba(
			_: null,
			{
				habaNewInput: {
					userId,
					mpesaCode,
					fromNumber,
					fromName,
					fromMessage,
					fromIsPrivate,
					fromAmount,
				},
			}: any
		) {
			// start a transaction
			const t = await sequelize.transaction();
			try {
				// New transaction started from MPESA Success
				const res = await Haba.create(
					{
						userId,
						mpesaCode,
						fromNumber,
						fromName,
						fromMessage,
						fromIsPrivate,
						fromAmount,
					},
					{ transaction: t }
				);

				const amountReceived = fromAmount;
				const amountUserReceived = 0.9 * amountReceived;
				const amountCompanyReceived = 0.1 * amountReceived;

				const adminOneEmail = "mcdalinoluoch@gmail.com";
				const adminTwoEmail = "benardo016@gmail.com";

				const adminOnceCut = 0.8 * amountCompanyReceived;
				const adminTwoCut = 0.2 * amountCompanyReceived;

				// Update balance on user table
				const userBalance = await User.increment("balance", {
					by: amountUserReceived,
					where: {
						id: userId,
					},
					returning: true, // to get updated data back
					plain: true,
					transaction: t,
				});

				// Update net Income on user table
				await User.increment("netIncome", {
					by: amountUserReceived,
					where: {
						id: userId,
					},
					transaction: t,
				});

				// Check if balance exists from previous update
				if (!userBalance[0][0].balance) {
					console.error("error");
				}

				// Create new user transaction
				const transRes = await UserTransaction.create(
					{
						userId,
						amount: amountUserReceived,
						serviceFee: amountCompanyReceived,
						transactionType: "HABA",
						balance: userBalance[0][0].balance,
					},
					{ transaction: t }
				);

				// Update balance on admin one
				const adminOne = await Admin.increment("balance", {
					by: adminOnceCut,
					where: {
						email: adminOneEmail,
					},
					returning: true,
					plain: true,
					transaction: t,
				});

				// Update net income on admin one
				await Admin.increment("netIncome", {
					by: adminOnceCut,
					where: {
						email: adminOneEmail,
					},

					transaction: t,
				});

				// Update balance on admin two
				const adminTwo = await Admin.increment("balance", {
					by: adminTwoCut,
					where: {
						email: adminTwoEmail,
					},
					returning: true,
					plain: true,
					transaction: t,
				});

				// Update net income on admin two
				await Admin.increment("netIncome", {
					by: adminTwoCut,
					where: {
						email: adminTwoEmail,
					},

					transaction: t,
				});

				// Create new admin transaction
				// Transaction runs two queries for both admins
				await AdminTransaction.create({
					adminEmail: adminOneEmail,
					amount: adminOnceCut,
					transactionType: "SERVICE FEE",
					balance: adminOne[0][0].balance,
				});

				await AdminTransaction.create({
					adminEmail: adminTwoEmail,
					amount: adminTwoCut,
					transactionType: "SERVICE FEE",
					balance: adminTwo[0][0].balance,
				});

				await t.commit();

				const updatedUser = await User.findByPk(userId);

				const { id, netIncome, withdrawn, balance } = updatedUser;

				const subRes = {
					id,
					netIncome,
					withdrawn,
					availableForWithdrawal: balance,
					earnings: transRes.toJSON(),
				};

				// Subscription on the logged in user side,
				// While on earnings page case a new earning pops up
				pubsub.publish(TRANSACTION_CHANGE, {
					earnings_transactonChange: subRes,
				});

				// Sub on the user profile
				// When a new haba pops up
				pubsub.publish(NEW_HABA, { haba_subNewHaba: res.toJSON() });

				return res.toJSON();
			} catch (err) {
				console.log("Err is: ", err);
			}
		},
	},
};
