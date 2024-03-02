import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLSchema,
  GraphQLString,
  graphql,
} from 'graphql';
import { Prisma, User } from '@prisma/client';
import { GraphQLList, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { UUIDType } from './types/uuid.js';
import { userInterface } from './types/user.js';
import { memberInterface } from './types/member.js';
import { MemberTypeId } from './types/memeberId.js';
import { profileInterface } from './types/profile.js';
import { FastifyInstance } from 'fastify';
import { PostInterafase } from './types/post.js';
import { parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const prisma = fastify.prisma;
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;
      console.log(query, variables);

      const Query = new GraphQLObjectType({
        name: 'Query',
        fields: {
          user: {
            type: userInterface,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve: async (parent, args: { id: string }) => {
              const user = await prisma.user.findUnique({
                where: {
                  id: args.id,
                },
              });
              return user;
            },
          },
          users: {
            type: new GraphQLList(userInterface),
            args: {},
            resolve: () => {
              return prisma.user.findMany();
            },
          },
          memberType: {
            type: memberInterface,
            args: {
              id: { type: MemberTypeId },
            },
            resolve: async (
              parent,
              {
                id,
              }: {
                id: string;
              },
            ) => {
              return await prisma.memberType.findUnique({
                where: { id },
              });
            },
          },
          memberTypes: {
            type: new GraphQLList(memberInterface),
            resolve: async () => {
              const memberTypesCollection = await prisma.memberType.findMany();
              return memberTypesCollection;
            },
          },
          posts: {
            type: new GraphQLList(PostInterafase),
            resolve: async () => {
              return await prisma.post.findMany();
            },
          },
          post: {
            type: PostInterafase,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve: async (
              parent,
              {
                id,
              }: {
                id: string;
              },
            ) => {
              return await prisma.post.findUnique({
                where: { id },
              });
            },
          },
          profiles: {
            type: new GraphQLList(profileInterface),
            resolve: async (parent, arg) => {
              const profiles = await prisma.profile.findMany();
              return profiles;
            },
          },
          profile: {
            type: profileInterface,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve: async (
              parent: unknown,
              {
                id,
              }: {
                id: string;
              },
            ) => {
              return await prisma.profile.findUnique({
                where: { id },
              });
            },
          },
        },
      });

      const Mutation = new GraphQLObjectType({
        name: 'Mutation',
        fields: {
          createUser: {
            type: userInterface,
            args: {
              dto: {
                type: new GraphQLInputObjectType({
                  name: 'CreateUserInput',
                  fields: {
                    name: { type: GraphQLString },
                    balance: { type: GraphQLFloat },
                  },
                }),
              },
            },
            resolve: async (parent, args: { dto: { name: string; balance: number } }) => {
              const user = await prisma.user.create({
                data: args.dto,
              });

              if (user) {
                return user;
              }
              return null;
            },
          },
          createPost: {
            type: PostInterafase,
            args: {
              dto: {
                type: new GraphQLInputObjectType({
                  name: 'CreatePostInput',
                  fields: {
                    authorId: { type: GraphQLString },
                    content: { type: UUIDType },
                    title: { type: UUIDType },
                  },
                }),
              },
            },
            resolve: (
              parent,
              args: { dto: { authorId: string; content: string; title: string } },
            ) => {
              return prisma.post.create({ data: args.dto });
            },
          },
          createProfile: {
            type: profileInterface,
            args: {
              dto: {
                type: new GraphQLNonNull(
                  new GraphQLInputObjectType({
                    name: 'CreateProfileInput',
                    fields: {
                      userId: { type: GraphQLString },
                      memberTypeId: { type: MemberTypeId },
                      isMale: { type: GraphQLBoolean },
                      yearOfBirth: { type: GraphQLInt},
                    },
                  }),
                ),
              },
            },
            resolve: (
              parent,
              args: {
                dto: {
                  userId: string;
                  memberTypeId: string;
                  isMale: boolean;
                  yearOfBirth: number;
                };
              },
            ) => {
              return prisma.profile.create({ data: args.dto });
            },
          },
          changeUser: {
            type: userInterface,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
              dto: {
                type: new GraphQLNonNull(
                  new GraphQLInputObjectType({
                    name: 'ChangeUserInput',
                    fields: {
                      name: { type: GraphQLString },
                      balance: { type: GraphQLFloat },
                    },
                  }),
                ),
              },
            },
            resolve: (
              parent,
              args: {
                id: string;
                dto: { name: string; balance: number };
              },
            ) => {
              return prisma.user.update({
                where: {
                  id: args.id,
                },
                data: args.dto,
              });
            },
          },
          changePost: {
            type: PostInterafase,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
              dto: {
                type: new GraphQLNonNull(
                  new GraphQLInputObjectType({
                    name: 'ChangePostInput',
                    fields: {
                      authorId: { type: GraphQLString },
                      content: { type: UUIDType },
                      title: { type: UUIDType },
                    },
                  }),
                ),
              },
            },
            resolve: (
              parent,
              args: {
                id: string;
                dto: { authorId: string; content: string; title: string };
              },
            ) => {
              return prisma.post.update({
                where: {
                  id: args.id,
                },
                data: args.dto,
              });
            },
          },
          changeProfile: {
            type: profileInterface,
            args: {
              id: { type: new GraphQLNonNull(UUIDType) },
              dto: {
                type: new GraphQLInputObjectType({
                  name: 'ChangeProfileInput',
                  fields: {
                    memberTypeId: { type: MemberTypeId },
                    isMale: { type: GraphQLBoolean },
                    yearOfBirth: { type: GraphQLInt },
                  },
                }),
              },
            },
            resolve: (
              parent,
              args: {
                id: string;
                dto: {
                  memberTypeId: string;
                  isMale: boolean;
                  yearOfBirth: number;
                };
              },
            ) => {
              return prisma.profile.update({
                where: {
                  id: args.id,
                },
                data: args.dto,
              });
            },
          },
          deleteUser: {
            type: GraphQLBoolean,
            args: { id: { type: new GraphQLNonNull(UUIDType) } },
            resolve: async (parent, args: { id: string }) => {
              await prisma.user.delete({
                where: {
                  id: args.id,
                },
              });
            },
          },
          deletePost: {
            type: GraphQLBoolean,
            args: { id: { type: new GraphQLNonNull(UUIDType) } },
            resolve: async (parent, args: { id: string }) => {
              await prisma.post.delete({
                where: {
                  id: args.id,
                },
              });
            },
          },
          deleteProfile: {
            type: GraphQLBoolean,
            args: { id: { type: new GraphQLNonNull(UUIDType) } },
            resolve: async (parent, args: { id: string }) => {
              await prisma.profile.delete({
                where: {
                  id: args.id,
                },
              });
            },
          },
          subscribeTo: {
            type: userInterface,
            args: {
              userId: { type: new GraphQLNonNull(UUIDType) },
              authorId: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve: (parent, args: { userId: string; authorId: string }) => {
              return prisma.user.update({
                where: {
                  id: args.userId,
                },
                data: {
                  userSubscribedTo: {
                    create: {
                      authorId: args.authorId,
                    },
                  },
                },
              });
            },
          },
          unsubscribeFrom: {
            type: GraphQLBoolean,
            args: {
              userId: { type: new GraphQLNonNull(UUIDType) },
              authorId: { type: new GraphQLNonNull(UUIDType) },
            },
            resolve: async (parent, args: { userId: string; authorId: string }) => {
              await prisma.subscribersOnAuthors.delete({
                where: {
                  subscriberId_authorId: {
                    subscriberId: args.userId,
                    authorId: args.authorId,
                  },
                },
              });
            },
          },
        },
      });

      const schema: GraphQLSchema = new GraphQLSchema({
        query: Query,
        mutation: Mutation,
      });
      const validationResult = validate(schema, parse(req.body.query), [depthLimit(5)]);
      if (validationResult.length) {
        return { errors: validationResult };
      }

      const result = await graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: { prisma },
      });
      console.log(result);
      return result;
    },
  });
};

export default plugin;
