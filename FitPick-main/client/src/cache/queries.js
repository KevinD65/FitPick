import { gql } from "@apollo/client";

export const GET_DB_USER = gql`
	query GetDBUser {
		getCurrentUser {
			_id
			name
			email
		}
	}
`;

export const GET_DB_MAPS = gql`
	query GetAllMaps {
		getAllMaps {
			_id
			id
			name
			owner
			subregions
			landmarks {
				_id
				id
				name
				ownerRegion
			}
		}
	}
`;

export const GET_MAP_BY_ID = gql`
	query getMapByID ($_id: String!) {
		getMapById (_id: $_id) {
			_id
			id
			name
			owner
			subregions
			landmarks {
				_id
				id
				name
				ownerRegion
			}
		}
	}
`;

export const GET_DB_REGIONS = gql`
	query getDBRegions {
		getAllRegions {
			_id
			id
			name
			capital
			leader
			flag
			position
			parent
			subregions
			path
			owner
			landmarks {
				_id
				id
				name
				ownerRegion
			}
		}
	}
`;
