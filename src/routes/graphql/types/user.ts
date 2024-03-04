import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { profileInterface } from './profile.js';
import { Post, PrismaClient, Profile, User } from '@prisma/client';
import { PostInterafase } from './post.js';
import DataLoader from 'dataloader';

export const userInterface: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    id: { type: new GraphQLNonNull(UUIDType) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    posts: {
      type: new GraphQLList(PostInterafase),
      resolve: async (
        parent: { id: string },
        args,
        context: {
          prisma: PrismaClient;
          loaders: WeakMap<object, DataLoader<string, unknown>>;
        },
        info,
      ) => {
        const { prisma, loaders } = context;
        let loader = loaders.get(info.fieldNodes);
        if (!loader) {
          loader = new DataLoader(async (keys) => {
            const posts = await prisma.post.findMany({
              where: {
                authorId: {
                  in: keys as string[],
                },
              },
            });
            const result = keys.map((key: string) =>
              posts.filter((post) => post.authorId === key),
            );
            return result;
          });
          loaders.set(info.fieldNodes, loader);
        }
        const promise = loader.load(parent.id);
        return promise;
        // return await prisma.post.findMany({
        //   where: { authorId: parent.id },
        // });
      },
    },
    profile: {
      type: profileInterface,
      resolve: async (
        parent:{ id: string },
        args,
        context: {
          prisma: PrismaClient;
          loaders: WeakMap<object, DataLoader<string, unknown>>;
        },
        info,
      ) => {
        const { prisma, loaders } = context;
        let loader = loaders.get(info.fieldNodes);
        if (!loader) {
          loader = new DataLoader(async (keys) => {
            const profiles = await prisma.profile.findMany({
              where: {
                userId: {
                  in: keys as string[],
                },
              },
            });
            const result = keys.map((key: string) =>
              profiles.find((profile) => profile.userId === key),
            );
            return result;
          });
          loaders.set(info.fieldNodes, loader);
        }
        const promise = loader.load(parent.id);
        return promise;
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(userInterface),
      resolve: async (parent: { id: string }, args, { prisma }) => {
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
      resolve: async (parent: { id: string }, args, { prisma }) => {
        return await prisma.user.findMany({
          where: {
            userSubscribedTo: {
              some: {
                authorId: parent.id,
              },
            },
          },
        });
      },
    },
  }),
});
