// this stuff seems standard
import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions
} from 'graphql-relay';

// this stuff is game specific
import {
  Game,
  HidingSpot,
  checkHidingSpotForTreasure,
  getGame,
  getHidingSpot,
  getHidingSpots,
  getTurnsRemaining
} from './database';

// wtf is this?
// "Node interface and type"
// "We need "
let {nodeInterface, nodeField} = nodeDefinitions(
  // first argument does... what?
  globalId => {
    const {type, id} = fromGlobalId(globalId);
    switch (type) {
      case 'Game': return getGame(id);
      case 'HidingSpot': return getHidingSpot(id);
      default: return null;      
    }
  },
  // second argument does... what again?
  obj => {
    if (obj instanceof Game) {
      return gameType;
    } else if (obj instanceof HidingSpot) {
      return hidingSpotType;
    }
    return null;
  }
);

// "let's define our game and hiding spot types, and the fields that are available on each"
let gameType = new GraphQLObjectType({
  name: 'Game',
  description: 'A treasure search game',
  fields: () => ({
    id: globalIdField('Game'),
    hidingSpots: {
      type: hidingSpotConnection, // DEFINED BELOW !@#$
      description: 'Places where treasure might be hidden',
      args: connectionArgs, // 'graphql-relay'.connectionArgs
      resolve: (game, args) => connectionFromArray(getHidingSpots(), args) // 'graphql-relay'.connectionFromArray
    }
  }),
  interfaces: [nodeInterface] // defined above
});

let hidingSpotType = new GraphQLObjectType({
  name: 'HidingSpot',
  description: 'A place where you might find treasure',
  fields: () => ({
    id: globalIdField('HidingSpot'),
    hasBeenChecked: {
      type: GraphQLBoolean, // 'graphql'.GraphQLBoolean
      description: 'True if this spot has already been checked for treasure',
      resolve: hidingSpot => hidingSpot.hasBeenChecked
    },
    hasTreasure: {
      type: GraphQLBoolean,
      description: 'True if this hiding spot holds treasure',
      resolve: hidingSpot => {
        if (hidingSpot.hasBeenChecked) {
          return hidingSpot.hasTreasure
        }
        return null; // it must be checked before it will return true or false
      }
    }
  }),
  interfaces: [nodeInterface] // definedAbove
});

// more weirdness
// "we need to create a connection to link all the many hiding spots"
let {connectionType: hidingSpotConnection} = connectionDefinitions({name: 'HidingSpot', nodeType: hidingSpotType});

// "let's asscoiate these types with the root query type"
const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField, // DEFINED ABOVE
    game: {
      type: gameType, // again, defined above
      resolve: () => getGame()
    }
  })
});

// now we have mutations
// "spend a turn checking a spot for treasure"
// my god this thing looks crazy
const CheckHidingSpotForTreasureMutation = mutationWithClientMutationId({
  name: 'CheckHidingSpotForTreasure',
  inputFields: {
    id: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  outputFields: {
    hidingSpot: {
      type: hidingSpotType,
      resolve: localHidingSpotId => getHidingSpot(localHidingSpotId)
    },
    game: {
      type: gameType,
      resolve: () => getGame()
    }
  },
  mutateAndGetPayload: ({id, text}) => {
    const localHidingSpotId = fromGlobalId(id).id; // 'graphql-relay'.fromGlobalId
    checkHidingSpotForTreasure(localHidingSpotId);
    return { localHidingSpotId }; // ??????
  }
});

// "associate with the root mutation type"
const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    checkHdingSpotForTreasure: CheckHidingSpotForTreasureMutation
  })
});

export const Schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType
});