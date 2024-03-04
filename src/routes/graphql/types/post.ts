import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { userInterface } from './user.js';
import { UUIDType } from './uuid.js';

export const PostInterafase: GraphQLObjectType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    author: { type: new GraphQLNonNull(userInterface) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
  }),
});
