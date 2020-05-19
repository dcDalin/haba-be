import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    haba_allHabas: [Haba!]!
  }

  extend type Mutation {
    haba_newHaba(habaNewInput: HabaNewInput!): Haba
    haba_reply(habaId: String!, reply: String!): HabaResponse
  }

  extend type Subscription {
    haba_subNewHaba(userId: String!): Haba
  }

  type Haba {
    id: ID!
    userId: String
    fromNumber: String
    fromName: String
    fromMessage: String
    fromIsPrivate: Boolean
    fromAmount: Float
    createdAt: String
    fromNow: String
  }

  input HabaNewInput {
    userId: String
    mpesaCode: String
    fromNumber: String
    fromName: String
    fromMessage: String
    fromIsPrivate: Boolean
    fromAmount: Float
  }

  type HabaResponse {
    status: String!
    message: String!
  }
`;
