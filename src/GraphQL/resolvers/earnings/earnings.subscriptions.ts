import { withFilter } from "graphql-subscriptions";
import pubsub from "../pubSub";
import { TRANSACTION_CHANGE } from "../types";
import checkAuth from "../../../utils/checkAuth";

export default {
	Subscription: {
		earnings_transactonChange: {
			subscribe: withFilter(
				() => pubsub.asyncIterator([TRANSACTION_CHANGE]),
				(payload, _, context) => {
					// Shape auth header as is required by checkAuth function
					const authHeader = {
						req: {
							headers: {
								authorization: context.Authorization,
							},
						},
					};
					const me = checkAuth(authHeader);

					console.log("Me is: ", me);

					return payload.earnings_transactonChange.id === me.id;
				}
			),
		},
	},
};
