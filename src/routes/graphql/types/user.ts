import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { profileInterface } from './profile.js';
import { User } from '@prisma/client';
import { PostInterafase } from './post.js';
import { FastifyInstance } from 'fastify';


export const userInterface: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    id: { type: new GraphQLNonNull(UUIDType) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: profileInterface,
      resolve: async (source: User, args, { prisma }: FastifyInstance) => {
        return await prisma.profile.findUnique({ where: { userId: source.id } });
      },
    }, 
    posts: {
      type: new GraphQLList(PostInterafase),
      resolve: async (source: User, args, { prisma }: FastifyInstance) => {
        return await prisma.post.findMany({
          where: { authorId: source.id },
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(userInterface),
      resolve: async (parent: User, args, { prisma }: FastifyInstance) => {
        return await prisma.user.findMany({
          where: {
            subscribedToUser: {
              some: {
                subscriberId: parent.id,
              },
            },
          },
        });
      },
    },
    subscribedToUser: {
      type: new GraphQLList(userInterface),
      resolve:async (parent: User, args, {prisma}: FastifyInstance) => {
          return await prisma.user.findMany({
              where:{
                  userSubscribedTo:{
                      some: {
                          authorId: parent.id
                      }
                  }
              }
          })
      }
  }
    
  }),
});
