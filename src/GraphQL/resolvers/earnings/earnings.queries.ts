import { Op } from "sequelize";
import User from "../../../models/user.model";
import UserTransactions from "../../../models/userTransaction.model";
import checkAuth from "../../../utils/checkAuth";
import { fromCursorHash, toCursorHash } from "../../../utils/cursor";

export default {
	Query: {
		async earnings_userEarnings(
			_: null,
			{ limit = 10, cursor }: any,
			context: any
		) {
			const me = checkAuth(context);

			// Get user id from decoded token
			const userId = me.id;

			const user = await User.findByPk(userId);

			const cursorOptions = cursor
				? {
						where: {
							userId,
							createdAt: {
								[Op.lt]: fromCursorHash(cursor),
							},
						},
				  }
				: {};

			// Get user transactions
			const transactions = await UserTransactions.findAll({
				where: { userId },
				order: [["createdAt", "DESC"]],
				limit: limit + 1,
				raw: true,
				...cursorOptions,
			});

			const { netIncome, withdrawn, balance } = user;

			// array does not exist, is not an array, or is empty
			// ⇒ do not attempt to process array
			if (!Array.isArray(transactions) || !transactions.length) {
				return {
					hasNextPage: null,
					endCursor: null,
					netIncome,
					withdrawn,
					availableForWithdrawal: balance,
					earnings: transactions,
				};
			} else {
				const hasNextPage = transactions.length > limit;
				const edges = hasNextPage ? transactions.slice(0, -1) : transactions;
				return {
					hasNextPage,
					endCursor: toCursorHash(edges[edges.length - 1].createdAt.toString()),
					netIncome,
					withdrawn,
					availableForWithdrawal: balance,
					earnings: edges,
				};
			}
		},
	},
};
