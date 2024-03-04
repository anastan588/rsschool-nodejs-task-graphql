import { GraphQLBoolean, GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { UUIDType } from './uuid.js';
import { userInterface } from './user.js';
import { PrismaClient, Profile, User } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import { memberInterface } from './member.js';
import { MemberId } from './memeberId.js';
import DataLoader from 'dataloader';

export const profileInterface = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberId) },
    // user: {
    //   type: new GraphQLNonNull(userInterface),
    //   resolve: async (
    //     parent,
    //     args,
    //     context: {
    //       prisma: PrismaClient;
    //       loaders: WeakMap<object, DataLoader<string, unknown>>;
    //     },
    //     info,
    //   ) => {
    //     const { prisma, loaders } = context;
    //     let loader = loaders.get(info.fieldNodes);
    //     if (!loader) {
    //       loader = new DataLoader(async (keys) => {
    //         const users = await prisma.user.findMany({
    //           where: {
    //             id: {
    //               in: keys as string[],
    //             },
    //           },
    //         });
    //         const result = keys.map((key: string) =>
    //           users.filter((user) => user.id === key),
    //         );
    //         return result;
    //       });
    //       loaders.set(info.fieldNodes, loader);
    //     }
    //     const promise = loader.load(parent.id);
    //     return promise;
    //   },
    // },
    memberType: {
      type: memberInterface,
      resolve: async (
        parent: { memberTypeId: string },
        args,
        context: {
          prisma: PrismaClient;
          loaders: WeakMap<object, DataLoader<string, unknown>>;
        },
        info,
      ) => {
        const { prisma, loaders } = context;
        let loader = loaders.get(info.fieldNodes);
        console.log(loaders);
        if (!loader) {
          loader = new DataLoader(async (keys) => {
            const members = await prisma.memberType.findMany({
              where: {
                id: {
                  in: keys as string[],
                },
              },
            });
            const result = keys.map((key: string) =>
              members.find((member) => member.id === key),
            );
            return result;
          });

          loaders.set(info.fieldNodes, loader);
        }
        const promise = loader.load(parent.memberTypeId);
        return promise;
        // const member = await prisma.memberType.findUnique({
        //   where: {
        //     id: 'basic',
        //   },
        // });
        // return member;
      },
    },
  }),
});
