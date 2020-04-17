import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    user_allUsers: [User]
    user_searchUserName(userName: String!): [User]
    user_userNameExists(userName: String!): Boolean
    user_userPhoneNumberExists(phoneNumber: String!): Boolean
    user_allowChangeUserName(
      newUserName: String!
      originalUserName: String!
    ): Boolean
    user_allowChangePhoneNumber(
      newPhoneNumber: String!
      originalPhoneNumber: String!
    ): Boolean
    user_me: User!
    user_profile(
      userName: String!
      cursor: String
      limit: Int
    ): UserProfileConnection
  }

  extend type Mutation {
    user_signUp(userSignUpInput: UserSignUpInput): UserAuthResponse!
    user_signIn(userSignInInput: UserSignInInput): UserAuthResponse!
    user_updateProfile(userUpdateInput: UserUpdateInput): Boolean
    user_updateProfilePicture(file: Upload!): Boolean
  }

  type User {
    id: ID
    userName: String
    displayName: String
    phoneNumber: String
    profileUrl: String
    bio: String
  }

  type UserProfileConnection {
    hasNextPage: Boolean
    endCursor: String
    user: User
    haba: [UserProfileHaba]
  }

  type UserProfile {
    id: ID
    userName: String
    displayName: String
    phoneNumber: String
    bio: String
  }

  input UserUpdateInput {
    phoneNumberNew: String!
    bio: String!
    userName: String!
    displayName: String!
  }

  type UserProfileHaba {
    id: String
    fromName: String
    fromMessage: String
    fromIsPrivate: Boolean
    fromAmount: String
    createdAt: String
    reply: String
  }

  input UserSignUpInput {
    userName: String!
    phoneNumber: String!
    password: String!
  }

  input UserSignInInput {
    phoneNumber: String!
    password: String!
  }

  type UserAuthResponse {
    token: String!
    userName: String!
  }
`;
