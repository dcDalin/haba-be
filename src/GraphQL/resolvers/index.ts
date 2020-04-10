import * as user from './user';
import * as haba from './haba';
import * as earnings from './earnings';

export default {
  Query: {
    ...user.userQueries.Query,
    ...haba.habaQueries.Query,
    ...earnings.earningsQueries.Query,
  },
  Mutation: {
    ...user.userMutations.Mutation,
    ...haba.habaMutations.Mutation,
  },
  Subscription: {
    ...haba.habaSubscriptions.Subscription,
    ...earnings.earningsSubscriptions.Subscription,
  },
};
