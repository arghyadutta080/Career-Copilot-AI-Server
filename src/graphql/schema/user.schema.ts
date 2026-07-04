export const userTypeDefs = `#graphql

type Preferences {

    targetRole:String

    location:String

    remote:Boolean

    expectedSalary:Int
}

type User {

    id:ID!

    name:String!

    email:String!

    avatar:String

    currentRole:String

    experience:Int

    preferences:Preferences
}
`;