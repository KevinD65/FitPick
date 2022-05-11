const ObjectId = require('mongoose').Types.ObjectId;
const Map = require('../models/map-model');
const Region = require('../models/region-model');

// The underscore param, "_", is a wildcard that can represent any value;
// here it is a stand-in for the parent parameter, which can be read about in
// the Apollo Server documentation regarding resolvers

module.exports = {
	Query: {
		/** 
		 	@param 	 {object} req - the request object containing a user id
			@returns {array} an array of map objects on success, and an empty array on failure
		**/
		getAllMaps: async (_, __, { req }) => {
			const _id = new ObjectId(req.userId);
			if(!_id) { return([])};
			const maps = await Map.find({owner: _id});
			if(maps) return (maps);
		},
		/** 
		 	@param 	 {object} args - a map id
			@returns {object} a map on success and an empty object on failure
		**/
		getMapById: async (_, args) => {
			const { _id } = args;
			const objectId = new ObjectId(_id);
			const map = await Map.findOne({_id: objectId});
			if(map) return map;
			else return ({});
		},
		/** 
		 	@param 	 {object} req - the request object containing a user id
			@returns {array} an array of region objects on success, and an empty array on failure
		**/
		getAllRegions: async (_, __, { req }) => {
			const _id = new ObjectId(req.userId);
			if(!_id) { return([])};
			const regions = await Region.find({owner: _id});
			if(regions) return (regions);
		},
		/** 
		 	@param 	 {object} args - a map id
			@returns {object} a map on success and an empty object on failure
		**/
	},
	Mutation: {
		/** 
		 	@param 	 {object} args - a map id and an empty region object
			@returns {string} the objectID of the region or an error message
		**/
		addRegion: async(_, args) => {
			const { _id, region, index } = args;
			const mapId = new ObjectId(_id);
			const objectId = new ObjectId();
			let found = await Map.findOne({_id: mapId});
			if(!found) { //instead, check regions for the parent (greater depth than 1)
				found = await Region.findOne({_id: mapId});
			}
			if(region._id === '') {region._id = objectId;}
			let mapRegions = found.subregions;
		        if(index < 0) mapRegions.push(region._id);
			else mapRegions.splice(index, 0, region._id);
			await Map.updateOne({_id: mapId}, { subregions: mapRegions }); //appends the newRegionID to the parent's subregions array
			await Region.updateOne({_id: mapId}, { subregions: mapRegions });
			
			const newRegion = new Region({
				_id: region._id,
				id: region.id,
				name: region.name,
				capital: region.capital,
				leader: region.leader,
				flag: region.flag,
				landmarks: region.landmarks,
				position: region.position,
				parent: region.parent,
				subregions: region.subregions,
				path: region.path,
				owner: region.owner,
			});
			const updated = await newRegion.save();
			//const updated = await region.save();
		
			if(updated) return (region._id);
			else return ('Could not add region');
		},
		/** 
		 	@param 	 {object} args - an empty map object
			@returns {string} the objectID of the map or an error message
		**/
		addMap: async (_, args) => {
			//console.log("MADE IT HERE");
			const { map } = args;
			const objectId = new ObjectId();
			const { id, name, owner, subregions, landmarks } = map;
			const newMap = new Map({
				_id: objectId,
				id: id,
				name: name,
				owner: owner,
				subregions: subregions,
				landmarks: landmarks,
			});
			const updated = await newMap.save();
			if(updated) return objectId;
			else return ('Could not add map');
		},
		/** 
		 	@param 	 {object} args - a map/region objectID and item objectID
			@returns {array} the updated regions array on success or the initial 
							 array on failure
		**/
		deleteRegion: async (_, args) => {
			const  { parentId, regionId } = args;
			//const listId = new ObjectId(_id);
			//const found = await Todolist.findOne({_id: listId});
			//let listItems = found.items;
			//listItems = listItems.filter(item => item._id.toString() !== itemId);
			let deleteFromParent = await Region.findOne({_id: parentId});
			//return(deleteFromParent._id.toString());
			if(deleteFromParent){ //the parent of the region to delete is a region
				//return(deleteFromParent._)
				let parentSubregions = deleteFromParent.subregions;
				let updatedParentSubregions = parentSubregions.filter(region => region.toString() !== regionId); //remove the region to delete from its parent's subregions' array (array of IDs)
				await Region.updateOne({_id: parentId}, {subregions: updatedParentSubregions});
			}
			else{ //the parent of the region to delete is a map data file
				deleteFromParent = await Map.findOne({_id: parentId});
				//return deleteFromParent._id.toString();
				let parentSubregions = deleteFromParent.subregions;
				let updatedParentSubregions = parentSubregions.filter(region => region.toString() !== regionId); //remove the region to delete from its parent's subregions' array (array of IDs)
				//return updated
				await Map.updateOne({_id: parentId}, {subregions: updatedParentSubregions});
			}
			const updated = await Region.deleteOne({_id: regionId})
			if(updated) return ("Region was successfully deleted");
			else return ("Region failed to delete");

		},
		/** 
		 	@param 	 {object} args - a map objectID 
			@returns {boolean} true on successful delete, false on failure
		**/
		deleteMap: async (_, args) => {
			const { _id } = args;
			const objectId = new ObjectId(_id);
			const deleted = await Map.deleteOne({_id: objectId});
			if(deleted) return true;
			else return false;
		},
		/** 
		 	@param 	 {object} args - a map objectID, field, and the update value
			@returns {string} the new value on successful update, empty string on failure
		**/
		updateMapName: async (_, args) => {
			const { _id, value } = args;
			const objectId = new ObjectId(_id);
			const updated = await Map.updateOne({_id: objectId}, {name: value});
			if(updated) return value;
			else return "";
		},
		/** 
			@param	 {object} args - a region objectID, field, and update value.
			@returns {string} a string indicating if the edit was successful or not
		**/
		editRegionField: async (_, args) => {
			const { regionId, field } = args;
			let { value } = args
			let updated;
			if(field === 'name')
				updated = await Region.updateOne({_id: regionId}, { name: value })
			else if(field === 'capital')
				updated = await Region.updateOne({_id: regionId}, { capital: value })
			else if(field === 'leader')
				updated = await Region.updateOne({_id: regionId}, { leader: value })
			else
				updated = undefined;
			//updating of flag goes here based on region name
			if(updated) return (field + " edit was successful");
			else return (field + " edit was unsuccessful");
		},
		/**
			@param 	 {object} args - contains list id, item to swap, and swap direction
			@returns {array} the reordered item array on success, or initial ordering on failure
		**/
		reorderItems: async (_, args) => {
			const { _id, itemId, direction } = args;
			const listId = new ObjectId(_id);
			const found = await Todolist.findOne({_id: listId});
			let listItems = found.items;
			const index = listItems.findIndex(item => item._id.toString() === itemId);
			// move selected item visually down the list
			if(direction === 1 && index < listItems.length - 1) {
				let next = listItems[index + 1];
				let current = listItems[index]
				listItems[index + 1] = current;
				listItems[index] = next;
			}
			// move selected item visually up the list
			else if(direction === -1 && index > 0) {
				let prev = listItems[index - 1];
				let current = listItems[index]
				listItems[index - 1] = current;
				listItems[index] = prev;
			}
			const updated = await Todolist.updateOne({_id: listId}, { items: listItems })
			if(updated) return (listItems);
			// return old ordering if reorder was unsuccessful
			listItems = found.items;
			return (found.items);
		},

		/**
		 * @param	{object} args - contains the parent _id and the sortCode
		 * @returns	{string} a String indicating whether the sort was successful or not
		 */
		sortByColumn: async (_, args) => {
			const { parentId, sortCode } = args;
			let isMap = false;
			const parentID = new ObjectId(parentId);
			let findParent = await Region.findOne({_id: parentID});
			if(!findParent){
				isMap = true;
				findParent = await Map.findOne({_id: parentID});
			}
			//return findParent.toString();
			let parentSubregions = findParent.subregions;
			if(sortCode === 0){ //sort by name
				let regionHolder1, regionHolder2;
				let sorted = true; //flag used to determine if items are already sorted so reverse can be done
				for(let i = 0; i < parentSubregions.length - 1; i++){ //selection sort algorithm
					let indexOfLowest = i;
					let temp = parentSubregions[i];
					for(let j = i + 1; j < parentSubregions.length; j++){
						//return parentSubregions[j];
						regionHolder1 = await Region.findOne({_id: parentSubregions[j]});
						regionHolder2 = await Region.findOne({_id: parentSubregions[indexOfLowest]});
						if(regionHolder1.name.toUpperCase().localeCompare(regionHolder2.name.toUpperCase()) < 0){
							indexOfLowest = j;
							sorted = false; //items were not already sorted
						}
					}
					parentSubregions[i] = parentSubregions[indexOfLowest];
					parentSubregions[indexOfLowest] = temp;
				}
				//return parentSubregions.toString();
				if(sorted){ //used to reverse items if already sorted
					let temp;
					let middle = Math.floor(parentSubregions.length/2);
					let endIndex = parentSubregions.length - 1;
					for(let r = 0; r < middle; r++){
						temp = parentSubregions[r];
						parentSubregions[r] = parentSubregions[endIndex - r];
						parentSubregions[endIndex - r] = temp;
					}
				}
			}
			else if(sortCode === 1){ //sort by capital
				let regionHolder1, regionHolder2;
				let sorted = true; //flag used to determine if items are already sorted so reverse can be done
				for(let i = 0; i < parentSubregions.length - 1; i++){ //selection sort algorithm
					let indexOfLowest = i;
					let temp = parentSubregions[i];
					for(let j = i + 1; j < parentSubregions.length; j++){
						regionHolder1 = await Region.findOne({_id: parentSubregions[j]});
						regionHolder2 = await Region.findOne({_id: parentSubregions[indexOfLowest]});
						if(regionHolder1.capital.toUpperCase().localeCompare(regionHolder2.capital.toUpperCase()) < 0){
							//parentSubregions[i] = parentSubregions[j];
							//parentSubregions[j] = temp;
							indexOfLowest = j;
							sorted = false; //items were not already sorted
						}
					}
					parentSubregions[i] = parentSubregions[indexOfLowest];
					parentSubregions[indexOfLowest] = temp;
				}
				if(sorted){ //used to reverse items if already sorted
					let temp;
					let middle = Math.floor(parentSubregions.length/2);
					let endIndex = parentSubregions.length - 1;
					for(let r = 0; r < middle; r++){
						temp = parentSubregions[r];
						parentSubregions[r] = parentSubregions[endIndex - r];
						parentSubregions[endIndex - r] = temp;
					}
				}
			}
			else if(sortCode === 2){ //sort by leader
				let regionHolder1, regionHolder2;
				let sorted = true; //flag used to determine if items are already sorted so reverse can be done
				for(let i = 0; i < parentSubregions.length - 1; i++){ //selection sort algorithm
					let indexOfLowest = i;
					let temp = parentSubregions[i];
					for(let j = i + 1; j < parentSubregions.length; j++){
						regionHolder1 = await Region.findOne({_id: parentSubregions[j]});
						regionHolder2 = await Region.findOne({_id: parentSubregions[indexOfLowest]});
						if(regionHolder1.leader.toUpperCase().localeCompare(regionHolder2.leader.toUpperCase()) < 0){
							//parentSubregions[i] = parentSubregions[j];
							//parentSubregions[j] = temp;
							indexOfLowest = j;
							sorted = false; //items were not already sorted
						}
					}
					parentSubregions[i] = parentSubregions[indexOfLowest];
					parentSubregions[indexOfLowest] = temp;
				}
				if(sorted){ //used to reverse items if already sorted
					let temp;
					let middle = Math.floor(parentSubregions.length/2);
					let endIndex = parentSubregions.length - 1;
					for(let r = 0; r < middle; r++){
						temp = parentSubregions[r];
						parentSubregions[r] = parentSubregions[endIndex - r];
						parentSubregions[endIndex - r] = temp;
					}
				}
			}
			else{
				return "Invalid opcode";
			}

			let successfulSort;
			if(isMap){
				successfulSort = await Map.updateOne({_id: parentId}, {subregions: parentSubregions}); //parent subregions array is reordered but we still have to configure region positions
				let positionHandler;
				for(let t = 0; t < parentSubregions.length; t++){
					positionHandler = parentSubregions[t];
					await Region.updateOne({_id: positionHandler}, {position: t});
				}
			}
			else {
				successfulSort = await Region.updateOne({_id: parentId}, {subregions: parentSubregions}); //parent subregions array is reordered but we still have to configure region positions
				let positionHandler;
				for(let t = 0; t < parentSubregions.length; t++){
					positionHandler = parentSubregions[t];
					await Region.updateOne({_id: positionHandler}, {position: t});
				}
			}
			return successfulSort.toString();
		},

		revertSort: async (_, args) => {
			const { parentId, prevConfig, sortCode } = args;
			let isMap = false;
			let findParent = await Region.findOne({_id: parentId});
			if(findParent){ //if the parent is a Region
				await Region.updateOne({_id: parentId}, {subregions: prevConfig});
			}
			else { //otherwise, the parent is a Map
				isMap = true;
				//findParent = await Map.findOne({_id: parentID});
				await Map.updateOne({_id: parentId}, {subregions: prevConfig});
			}
			let updatedParentSubregions = prevConfig;

			let positionHandler;
			for(let t = 0; t < updatedParentSubregions.length; t++){ //update the positions of the regions correspondingly
				positionHandler = updatedParentSubregions[t];
				await Region.updateOne({_id: positionHandler}, {position: t});
			}
			return "Successfully reverted sort";
		},

		addLandmark: async (_, args) => {
			const { parentId, activeMapId, landmark } = args;
			const objectId = new ObjectId();
			let myLandmark = {
				_id: objectId,
				id: landmark.id,
				name: landmark.name,
				ownerRegion: landmark.ownerRegion,
			}
			let holder = await Map.findOne({_id: parentId});
			let reachedMap = true;
			if(!holder){ //if the landmark is being added directly to a region, not a map
				holder = await Region.findOne({_id: parentId});
				reachedMap = false;
				//return(activeMapId);
			}
			while(reachedMap === false){ //while the map data file hasn't been reached yet
				let updatedLandmarks = holder.landmarks;
				updatedLandmarks.push(myLandmark);
				await Region.updateOne({_id: holder._id}, {landmarks: updatedLandmarks});
				let holderParent = holder.parent;
				holder = await Region.findOne({_id: holderParent}); //traverse up the tree
				//holder = await Region.findOne({_id: holderParent});
				//holder = holder.parent;
				if(holderParent == activeMapId){
					reachedMap = true;
					holder = await Map.findOne({_id: holderParent});
				}
			}
			//lastly, add the landmark the to landmarks array of the map data file
			let updatedMapLandmarks = holder.landmarks;
			updatedMapLandmarks.push(myLandmark);
			const updated = await Map.updateOne({_id: activeMapId}, {landmarks: updatedMapLandmarks});
			if(updated) return objectId; //return the new landmark _id
			else return "Failed to add landmark";
		},

		deleteLandmark: async (_, args) => {
			const { parentId, activeMapId, landmarkToDeleteId } = args;
			//return parentId;
			let holder = await Map.findOne({_id: parentId});
			let reachedMap = true;
			if(!holder){ //if the landmark is being deleted from a region, not a map
				holder = await Region.findOne({_id: parentId});
				reachedMap = false;
				//return("WE ARE DELETING");
			}
			while(reachedMap === false){ //while the map data file hasn't been reached yet
				let landmarks = holder.landmarks;
				//await updatedLandmarks.filter(landmark => landmark._id !== landmarkToDeleteId); //filter out the landmark to be removed
				let updatedLandmarks = landmarks.filter(function(landmark) {
					return landmark._id != landmarkToDeleteId;
				});
				//return updatedLandmarks.toString();
				await Region.updateOne({_id: holder._id}, {landmarks: updatedLandmarks});
				let holderParent = holder.parent;
				holder = await Region.findOne({_id: holderParent}); //traverse up the tree
				if(holderParent == activeMapId){
					reachedMap = true;
					holder = await Map.findOne({_id: holderParent});
				}
			}
			//lastly, delete the landmark from the landmarks array of the map data file
			let updatedMapLandmarks = holder.landmarks;
			updatedMapLandmarks = updatedMapLandmarks.filter(function(landmark) {
				return landmark._id != landmarkToDeleteId;
			});
			await Map.updateOne({_id: activeMapId}, {landmarks: updatedMapLandmarks});
			return "Successfully deleted landmark";
		},

		editLandmark: async (_, args) => {
			const { landmarkID, parentID, name, activeMapId } = args;
			let holder = await Map.findOne({_id: parentID});
			let reachedMap = true;
			if(!holder){ //if the landmark is being edited from a region, not a map
				holder = await Region.findOne({_id: parentID});
				reachedMap = false;
			}
			while(reachedMap === false){ //while the map data file hasn't been reached yet
				let landmarks = holder.landmarks;
				let indexOfLandmarkToEdit;
				for(let i = 0; i < landmarks.length; i++){
					if(landmarks[i]._id.toString() === landmarkID){
						indexOfLandmarkToEdit = i;
						break;
					}
				}
				let updatedLandmark = {
					_id: landmarkID,
					id: landmarks[indexOfLandmarkToEdit].id,
					name: name,
					ownerRegion: landmarks[indexOfLandmarkToEdit].ownerRegion,
				}
				landmarks.splice(indexOfLandmarkToEdit, 1, updatedLandmark);
				//return updatedLandmarks.toString();
				await Region.updateOne({_id: holder._id}, {landmarks: landmarks});
				let holderParent = holder.parent;
				holder = await Region.findOne({_id: holderParent}); //traverse up the tree
				if(holderParent == activeMapId){
					reachedMap = true;
					holder = await Map.findOne({_id: holderParent});
				}
			}
			//lastly, delete the landmark from the landmarks array of the map data file
			let updatedMapLandmarks = holder.landmarks;
			let indexOfLandmarkToEdit;
			for(let i = 0; i < updatedMapLandmarks.length; i++){
				if(updatedMapLandmarks[i]._id.toString() === landmarkID){
					indexOfLandmarkToEdit = i;
					break;
				}
			}
			let updatedLandmark = {
				_id: landmarkID,
				id: updatedMapLandmarks[indexOfLandmarkToEdit].id,
				name: name,
				ownerRegion: updatedMapLandmarks[indexOfLandmarkToEdit].ownerRegion,
			}
			updatedMapLandmarks.splice(indexOfLandmarkToEdit, 1, updatedLandmark);
			/*updatedMapLandmarks = updatedMapLandmarks.filter(function(landmark) {
				return landmark._id != landmarkToDeleteId;
			});*/
			await Map.updateOne({_id: activeMapId}, {landmarks: updatedMapLandmarks});
			return "Successfully edited landmark";
		},

		changeParent: async (_, args) => {
			const { regionID, parentID, newParent } = args;
			let oldParent = await Region.findOne({_id: parentID}); //find the old (current) parent
			let grandparentID = oldParent.parent;
			let grandparent = await Region.findOne({_id: grandparentID}); //attempt to find the grandparent
			if(!grandparent)
				grandparent = await Map.findOne({_id: grandparentID}); //if the grandparent is a map data file
			
			let auntsUnclesOfRegionArr = grandparent.subregions;
			let validChange = await Region.findOne({name: newParent}); //verify that the parent to change to is a sibling of the current parent
			if(!validChange)
				return "Entered parent to change to is not valid option";

			//removing the region's landmarks from the old parent's landmarks array and appending them to the new parent's landmarks array
			let region = await Region.findOne({_id: regionID}); //find the region
			let regionLandmarks = region.landmarks;
			let parentLandmarks = oldParent.landmarks;
			let updatedParentLandmarks = [];
			let updatedNewParentLandmarks = validChange.landmarks; //holds the landmarks of the parent to change to
			//return (parentLandmarks.length.toString());
			for(let r = 0; r < parentLandmarks.length; r++){
				let landmarkOfParent = parentLandmarks[r]; //holds a landmark of the parent
				let foundInRegion = regionLandmarks.find(landmark => landmark._id.toString() === landmarkOfParent._id.toString()); //checks to see if the landmark is also in the region
				//return foundInRegion.toString();
				if(!foundInRegion){
					updatedParentLandmarks.push(landmarkOfParent); //if the landmark is original to the parent, it still belongs in the parent's landmarks array
				}
				else{
					updatedNewParentLandmarks.push(landmarkOfParent); //if the landmark is not original to the parent (belongs to the region (or its children))
				}
			}
			await Region.updateOne({_id: parentID}, {landmarks: updatedParentLandmarks}); //update the landmarks array of the parent
			await Region.updateOne({_id: validChange._id}, {landmarks: updatedNewParentLandmarks});

			//remove the region from the parent's subregions array and append to the new parent's subregions array
			let parentSubregions = oldParent.subregions;
			let newParentSubregions = validChange.subregions;
			//return regionID;
			let updatedParentSubregions = parentSubregions.filter(subregion => subregion !== regionID); //filters out the region that's being moved
			let updatedNewParentSubregions = newParentSubregions.concat(regionID); //concatenates the new region into the new parent's subregions array
			await Region.updateOne({_id: parentID}, {subregions: updatedParentSubregions});
			await Region.updateOne({_id: validChange._id}, {subregions: updatedNewParentSubregions});

			//change the parent field of the region
			const updated = await Region.updateOne({_id: regionID}, {parent: validChange._id}); //change the parent of the region being moved
			if(updated) return "Successfully changed parent";
			else return "Failed to change parent";
		}
	}
}
