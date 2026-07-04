export const authTypeDefs = `#graphql

type AuthPayload {

    token:String!

    user:User!

}

type Query {

    me:User

}

type Mutation {

    googleAuth(
        token:String!
    ):AuthPayload

}
`;
