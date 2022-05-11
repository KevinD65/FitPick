import { gql } from "@apollo/client";

export const LOGIN = gql`
	mutation Login($email: String!, $password: String!) {
		login(email: $email, password: $password) {
			email 
			_id
			name
			password
		}
	}
`;

export const REGISTER = gql`
	mutation Register($email: String!, $password: String!, $name: String!) {
		register(email: $email, password: $password, name: $name) {
			email
			password
			name
		}
	}
`;

export const UPDATE = gql`
	mutation Update($email: String!, $password: String!, $name: String!) {
		update(email: $email, password: $password, name: $name){
			email
			password
			name
		}
	}
`;

export const LOGOUT = gql`
	mutation Logout {
		logout 
	}
`;

export const ADD_REGION = gql`
	mutation AddRegion($region: RegionInput!, $_id: String!, $index: Int!) {
	  	addRegion(region: $region, _id: $_id, index: $index)
	}
`;

export const DELETE_REGION = gql`
	mutation DeleteRegion($parentId: String!, $regionId: String!) {
		deleteRegion(parentId: $parentId, regionId: $regionId)
	}
`;

export const EDIT_REGION_FIELD = gql`
	mutation EditRegionField($regionId: String!, $field: String!, $value: String!) {
		editRegionField(regionId: $regionId, field: $field, value: $value)
	}
`;

export const REORDER_ITEMS = gql`
	mutation ReorderItems($_id: String!, $itemId: String!, $direction: Int!) {
		reorderItems(_id: $_id, itemId: $itemId, direction: $direction) {
			_id
			id
			description
			due_date
			assigned_to
			completed
		}
	}
`;

export const SORT_BY_COLUMN = gql`
	mutation SortByColumn($parentId: String!, $sortCode: Int!) {
		sortByColumn(parentId: $parentId, sortCode: $sortCode)
	}
`;

export const REVERT_SORT = gql`
	mutation RevertSort($parentId: String!, $prevConfig: [String]!, $sortCode: Int!) {
		revertSort(parentId: $parentId, prevConfig: $prevConfig, sortCode: $sortCode)
	}
`;

export const ADD_MAP = gql`
	mutation AddMap($map: MapInput!) {
		addMap(map: $map)
	}
`;

export const DELETE_MAP = gql`
	mutation DeleteMap($_id: String!) {
		deleteMap(_id: $_id)
	}
`;

export const UPDATE_MAP_NAME = gql`
	mutation UpdateMapName($_id: String!, $value: String!) {
		updateMapName(_id: $_id, value: $value)
	}
`;

export const ADD_LANDMARK = gql`
	mutation AddLandmark($parentId: String!, $activeMapId: String!, $landmark: LandmarkInput!) {
		addLandmark(parentId: $parentId, activeMapId: $activeMapId, landmark: $landmark)
	}
`;

export const DELETE_LANDMARK = gql`
	mutation DeleteLandmark($parentId: String!, $activeMapId: String!, $landmarkToDeleteId: String!) {
		deleteLandmark(parentId: $parentId, activeMapId: $activeMapId, landmarkToDeleteId: $landmarkToDeleteId)
	}
`;

export const EDIT_LANDMARK = gql`
	mutation EditLandmark($landmarkID: String!, $parentID: String!, $activeMapId: String!, $name: String!){
		editLandmark(landmarkID: $landmarkID, parentID: $parentID, activeMapId: $activeMapId, name: $name)
	}
`;

export const CHANGE_PARENT = gql`
	mutation ChangeParent($regionID: String!, $parentID: String!, $newParent: String!){
		changeParent(regionID: $regionID, parentID: $parentID, newParent: $newParent)
	}
`;