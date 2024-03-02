import {
    GraphQLFloat,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString,
  } from 'graphql';
import { MemberId } from './memeberId.js';
import { profileInterface } from './profile.js';
import { MemberType } from '@prisma/client';
import { FastifyInstance } from 'fastify';


export const memberInterface :GraphQLObjectType = new GraphQLObjectType({
    name: "Member",
    fields:()=> ({
        id: {type: new GraphQLNonNull(MemberId)},
        discount: {type: new GraphQLNonNull(GraphQLFloat)},
        postsLimitPerMonth: {type: new GraphQLNonNull(GraphQLInt)},
        profiles:{
            type: new GraphQLList(profileInterface),
            resolve:async (parent: MemberType, args, {prisma}: FastifyInstance ) => {
                return await prisma.profile.findMany({
                    where:{
                        memberTypeId: parent.id
                    }
                })
            }
        }
    }),
})