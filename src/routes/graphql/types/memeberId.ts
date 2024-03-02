import { GraphQLEnumType } from 'graphql';

export const MemberId = new GraphQLEnumType({
  name: "MemberTypeId",
  values: {
    basic: { value: "basic"},
    business: {value: "business"},
  }
})