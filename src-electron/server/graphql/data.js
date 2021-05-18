import * as graphql from "graphql";
import {getData} from '../controllers/data';

export const DataType = new graphql.GraphQLObjectType({
    name: 'Data',
    fields: () => ({
        id: { type: graphql.GraphQLID },
        path: {type: graphql.GraphQLString},
        size: {type: graphql.GraphQLInt},
        type: {type: graphql.GraphQLInt}
    })
})

export const DataQueries = {
    Data: {
        type: graphql.GraphQLList(DataType),
        resolve: (root, args, context, info) => {
            return getData(context);
        }
    }
}