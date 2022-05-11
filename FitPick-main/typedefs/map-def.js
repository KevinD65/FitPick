const { gql } = require('apollo-server');

const typeDefs = gql `
	type Map {
		_id: String!
		id: Int!
		name: String!
		owner: String!
		subregions: [String]!
		landmarks: [Landmark]
	}

	type Region {
		_id: String!
		id: Int!
		name: String!
		capital: String!
		leader: String!
		flag: String
		landmarks: [Landmark]
		position: Int!
		parent: String!
		subregions: [String]!
		path: [String]!
		owner: String!
	}

	type Landmark {
		_id: String!
		id: Int!
		name: String!
		ownerRegion: String!
	}

	extend type Query {
		getAllMaps: [Map]
		getMapById(_id: String!): Map 
		getAllRegions: [Region]
	}

	extend type Mutation {
		addRegion(region: RegionInput!, _id: String!, index: Int!): String
		addMap(map: MapInput!): String
		deleteMap(_id: String!): Boolean
		deleteRegion(parentId: String!, regionId: String!): String		
		updateMapName(_id: String!, value: String!): String
		editRegionField(regionId: String!, field: String!, value: String!): String
		sortByColumn(parentId: String!, sortCode: Int!): String
		revertSort(parentId: String!, prevConfig: [String], sortCode: Int!): String
		addLandmark(parentId: String!, activeMapId: String!, landmark: LandmarkInput!): String
		deleteLandmark(parentId: String!, activeMapId: String!, landmarkToDeleteId: String!): String
		editLandmark(landmarkID: String!, parentID: String!, activeMapId: String!, name: String!): String
		changeParent(regionID: String!, parentID: String!, newParent: String!): String
	}

	input LandmarkInput {
		_id: String
		id: Int
		name: String
		ownerRegion: String
	}

	input RegionInput {
		_id: String
		id: Int
		name: String
		capital: String
		leader: String
		flag: String
		landmarks: [LandmarkInput]
		position: Int
		parent: String
		subregions: [String]
		path: [String]
		owner: String
	}

	input MapInput {
		_id: String
		id: Int
		name: String
		owner: String
		subregions: [String]
		landmarks: [LandmarkInput]
	}
`;

module.exports = { typeDefs: typeDefs }