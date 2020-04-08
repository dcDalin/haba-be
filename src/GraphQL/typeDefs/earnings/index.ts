import { gql } from "apollo-server-express";

export default gql`
	extend type Query {
		earnings_userEarnings(
			type: String
			year: String
			month: String
			cursor: String
			limit: Int
		): EarningsConnection
	}

	extend type Subscription {
		earnings_transactonChange: SubConnection
	}

	type SubConnection {
		netIncome: Float
		withdrawn: Float
		availableForWithdrawal: Float
		earnings: Earnings
	}

	type EarningsConnection {
		hasNextPage: Boolean
		endCursor: String
		netIncome: Float
		withdrawn: Float
		availableForWithdrawal: Float
		earnings: [Earnings]
	}

	type Earnings {
		id: ID
		date: String
		transactionType: String
		amount: Float
		serviceFee: Float
		balance: Float
	}
`;
