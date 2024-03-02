import { GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { UUIDType } from './uuid.js';
import { userInterface } from './user.js';
import { Profile } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import { memberInterface } from './member.js';
import { MemberId } from './memeberId.js';

export const profileInterface = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    user: {
      type: new GraphQLNonNull(userInterface),
    },
    memberType: {
      type: memberInterface,
      resolve: async (parent: Profile, args, { prisma }: FastifyInstance) => {
        const member = await prisma.memberType.findUnique({
          where: {
            id: 'basic',
          },
        });
        return member;
      },
    },
    memberTypeId: { type: MemberId },
  }),
});
