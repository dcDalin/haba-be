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
					// Context in this case comes from the front end
					// initialized on the apollo server instance in the root of the project
					const me = checkAuth(context);

					return payload.earnings_transactonChange.id === me.id;
				}
			),
		},
	},
};
