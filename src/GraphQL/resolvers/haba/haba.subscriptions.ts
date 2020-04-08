import { withFilter } from "graphql-subscriptions";
import pubsub from "../pubSub";
import { NEW_HABA } from "../types";

export default {
	Subscription: {
		haba_subNewHaba: {
			subscribe: withFilter(
				() => pubsub.asyncIterator([NEW_HABA]),
				(payload, args) => {
					const argsUserId = parseInt(args.userId);
					const payloadUserId = parseInt(payload.haba_subNewHaba.userId);

					return argsUserId === payloadUserId;
				}
			),
		},
	},
};
