import React, { useState, useEffect } 						from 'react';
import globe 												from '../../Images/Globe.PNG';
//import components/modals
import Logo 												from '../navbar/Logo';
import NavbarOptions 										from '../navbar/NavbarOptions';
import MapSelect 											from '../mapSelectScreen/MapSelect';
import SpreadsheetScreen                                    from '../spreadsheetScreen/SpreadsheetScreen';
import RegionViewerScreen									from '../regionViewerScreen/RegionViewerScreen';

import Login 												from '../modals/Login';
import CreateAccount 										from '../modals/CreateAccount';
import UpdateAccount 										from '../modals/UpdateAccount';
import DeleteMapModal										from '../modals/DeleteMapModal';
import DeleteRegionModal									from  '../modals/DeleteRegionModal';

//import queries/mutations
import * as queries 				    					from '../../cache/queries';
import * as mutations 										from '../../cache/mutations';
import { useMutation, useQuery, useApolloClient } 			from '@apollo/client';

//import WolfieTools stuff
import { WNavbar, WSidebar, WNavItem } 						from 'wt-frontend';
import { WLayout, WLHeader, WLMain, WLSide } 				from 'wt-frontend';

import { UpdateListField_Transaction, 
	UpdateSpreadsheetItems_Transaction, 
	ReorderItems_Transaction, 
	SortByColumn_Transaction,
	EditRegion_Transaction,
	AddDeleteLandmark_Transaction,
	EditLandmark_Transaction,
	ChangeParent_Transaction} 								from '../../utils/jsTPS';
import { BrowserRouter, Switch, Route, Redirect, useHistory} from 'react-router-dom';

const Welcome = (props) => {
	//define all screen/modal hooks
	const [showDeleteMap, toggleShowDeleteMap] 				= useState(false);
	const [showDeleteRegion, toggleShowDeleteRegion]		= useState(false);
	const [showLogin, toggleShowLogin] 						= useState(false);
	const [showCreate, toggleShowCreate] 					= useState(false);
	const [showUpdate, toggleShowUpdate]					= useState(false);
	const [spreadsheetScreenOn, toggleSpreadsheetScreen]	= useState(false);
	const [mapSelectScreen, toggleMapSelectScreen] 			= useState(false);
	const [regionViewerScreen, toggleRegionViewerScreen] 	= useState(false);
	const [home, toggleHome]								= useState(false);

	//define mutations/queries needed
	const [AddMap] 											= useMutation(mutations.ADD_MAP);
	const [DeleteMap] 										= useMutation(mutations.DELETE_MAP);
	const [UpdateMapName]									= useMutation(mutations.UPDATE_MAP_NAME);
	const [AddRegion]										= useMutation(mutations.ADD_REGION);
	const [EditRegion]										= useMutation(mutations.EDIT_REGION_FIELD);
	const [DeleteRegion]									= useMutation(mutations.DELETE_REGION);
	const [sortingFunction]									= useMutation(mutations.SORT_BY_COLUMN);
	const [revertingFunction]								= useMutation(mutations.REVERT_SORT);
	const [AddLandmark]										= useMutation(mutations.ADD_LANDMARK);
	const [DeleteLandmark]									= useMutation(mutations.DELETE_LANDMARK);
	const [EditLandmark]									= useMutation(mutations.EDIT_LANDMARK);
	const [ChangeParent]									= useMutation(mutations.CHANGE_PARENT);

	let maps = []; //holds all the maps
	let regions = []; //holds all the regions
	let regionsOfParent = [];
	const [regionToDelete, toggleRegionToDelete] = useState(null);
	const [indexOfRegionToDelete, toggleIndexOfRegionToDelete] = useState(null);
	//let regionToDelete, indexOfRegionToDelete;

	//const client = useApolloClient();
    const [activeMap, setActiveMap] = useState(null); //an array holding a singular map object (or none). The map whose spreadsheet screen is being showed
	const [activeRegion, setActiveRegion] = useState(null); //an array holding a singular region object (or none). The region whose spreadsheet screen is being showed
	const [viewedRegion, setViewedRegion] = useState(null); //the map/region whose region viewed screen is being showed (should be an _id);

	const { loading, error, data, refetch } = useQuery(queries.GET_DB_MAPS);
	const regionQuery = useQuery(queries.GET_DB_REGIONS);
	if(loading) { console.log(loading, 'loading'); }
	if(error) { console.log(error, 'error'); }
	if(data) {data.getAllMaps.map(map => maps.push(map));}

	if(regionQuery.loading) { console.log(loading, 'loading'); }
	if(regionQuery.error) { console.log(error, 'error'); }
	if(regionQuery.data) { //used to fill regionsOfParent array with all regions that are subregions of the activeMap/activeRegion
		let active = null;
		if(activeRegion === null)
			active = activeMap;
		else if(activeRegion !== null)
			active = activeRegion;
		if(active !== null){
			regionQuery.data.getAllRegions.map(region => regions.push(region));
			console.log(regionsOfParent);
			regionsOfParent = [];
			for(let i = 0; i < regions.length; i++){ //simply makes the array of regions associated with this parent
				if(regions[i].parent === active._id){
					console.log(regions[i]);
					regionsOfParent.push(regions[i]);
				}
			}

			let temp;
			for(let a = 0; a < regionsOfParent.length; a++){ //bubble sort to actually sort the array of regions associated with this parent
				for(let b = 0; b < regionsOfParent.length - a - 1; b++){
					if(regionsOfParent[b].position > regionsOfParent[b+1].position){
						temp = regionsOfParent[b];
						regionsOfParent[b] = regionsOfParent[b+1];
						regionsOfParent[b+1] = temp;
					}
				}
			}
			//console.log(regionsOfParent)
		}
	}

	const refetch2 = regionQuery.refetch;

	const userName = props.userName;

    const refetchMaps = async (refetch) => {
		const { loading, error, data } = await refetch();
		if (data) {
			maps = data.getAllMaps;
			if (activeMap !== null) {
				let tempID = activeMap._id; 
				let myMap = maps.find(map => map._id === tempID);
				setActiveMap(myMap);
			}
		}
	}

	const refetchRegions = async (refetch) => {
		const regionRefetch = await refetch();
		if(regionRefetch) {
			regions = regionRefetch.data.getAllRegions;
		}
	}

	const auth = props.user === null ? false : true; //used to check if a user is logged in

	const tpsUndo = async () => {
		const retVal = await props.tps.undoTransaction();
		refetchMaps(refetch);
		return retVal;
	}

	const tpsRedo = async () => {
		const retVal = await props.tps.doTransaction();
		await refetchMaps(refetch);
		await refetchRegions(refetch2);
		return retVal;
	}

	const tpsHasUndo = () => {
		const hasUndo = props.tps.hasTransactionToUndo();
		return hasUndo;
	}

	const tpsHasRedo = () => {
		const hasRedo = props.tps.hasTransactionToRedo();
		return hasRedo;
	}

	const resetTPSStack = async () => { //gets called whenever screen is switched away from spreadsheet view/regionViewer
		await props.tps.clearAllTransactions();
	}

	const handleMapDeletion = (_id) => {
		handleSetActive(_id);
		toggleShowDeleteMap(!showDeleteMap);
	}

	const handleSetActive = (id) => {
		const map = maps.find(map => map.id === id || map._id === id);
		setActiveMap(map);
	};

	const handleSetActiveRegion = async (id) => {
		const region = await regions.find(region => region.id === id || region._id === id);
		await setActiveRegion(region);
		await refetchRegions(refetch2);
	};

	const createNewMap = async () => { //creates and adds a new map
		const length = maps.length
		const id = length >= 1 ? maps[length - 1].id + Math.floor((Math.random() * 100) + 1) : 1;
		let map = {
			_id: '',
			id: id,
			name: 'Untitled',
			owner: props.user._id,
			subregions: [],
			landmarks: [],
		}
		const { data } = await AddMap({ variables: { map: map }, refetchQueries: [{ query: queries.GET_DB_MAPS }] });
		await refetchMaps(refetch);
	};

	const editMapName = async (mapID, name) => {
		await UpdateMapName({ variables: { _id: mapID, value: name }, refetchQueries: [{ query: queries.GET_DB_MAPS }]});
		await refetchMaps(refetch);
	}

	const deleteMap = async (_id) => { 
		//deleting a map will delete all of its subregions from the database as well (perhaps everytime a new region is added, it's _id is appended to the root's array of subregions)
		await DeleteMap({ variables: { _id: _id }, refetchQueries: [{ query: queries.GET_DB_MAPS }] });
		setActiveMap(null);
		setActiveRegion(null);
	};

	const addRegion = async (parentID) => {
		let map;
		let updatedPath = [];
		if(activeRegion == null || activeRegion === undefined){
			map = activeMap;
			updatedPath.push(map._id);
		}
		else{
			map = activeRegion;
			updatedPath = map.path;
			updatedPath = updatedPath.concat(map._id);
		}
		const regions = map.subregions; //regions holds an array of IDs
		console.log(regions);
		const lastID = regions.length >= 1 ? regions.length : 0;
        const lastPosition = regions.length >= 1 ? regions.length: 0;

		const newRegion = {
			_id: '',
			id: lastID,
			name: 'N/A',
			capital: 'N/A',
			leader: 'N/A',
            flag: '',
            landmarks: [],
            position: lastPosition,
            parent: parentID,
            subregions: [],
            path: updatedPath,
			owner: props.user._id,
		};
		let opcode = 1;
		let regionID = newRegion._id;
		let transaction = new UpdateSpreadsheetItems_Transaction(parentID, regionID, newRegion, opcode, AddRegion, DeleteRegion);
		props.tps.addTransaction(transaction);
		await tpsRedo();
		await refetchMaps(refetch);
		await refetchRegions(refetch2);
	};

	
    const editRegion = async (regionId, field, value, prev) => { //user can edit name, capital, or leader
		let transaction = new EditRegion_Transaction(regionId, field, prev, value, EditRegion);
		props.tps.addTransaction(transaction);
		tpsRedo();
	};

	const deleteRegionHandler = async (region, index) => {
		toggleRegionToDelete(region);
		toggleIndexOfRegionToDelete(index);
		toggleShowDeleteRegion(true);
	}

	const deleteRegion = async (region, index) => {
		let opcode = 0; //opcode for deletion
		let regionToDelete = {
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
		}
		let transaction = new UpdateSpreadsheetItems_Transaction(region.parent, region._id, regionToDelete, opcode, AddRegion, DeleteRegion, index);
		props.tps.addTransaction(transaction);
		await tpsRedo();
		await refetchMaps(refetch);
		await refetchRegions(refetch2);
	}

	const sortByColumn = async (parent, sortCode) => {
		let prevSubregionsArr = parent.subregions;

		console.log(parent._id);
		let transaction = new SortByColumn_Transaction(parent._id, prevSubregionsArr, sortingFunction, revertingFunction, sortCode);
		props.tps.addTransaction(transaction);
		const myString = await tpsRedo();
		console.log(myString);
	}

	const addLandmark = async (parent, landmarkToAddName) => {
		const lastID = parent.landmarks.length >= 1 ? parent.landmarks.length : 0;
		let landmarkToAdd = {
			_id: '',
			id: lastID,
			name: landmarkToAddName,
			ownerRegion: parent._id,
		}
		let transaction = new AddDeleteLandmark_Transaction(parent._id, activeMap._id, landmarkToAdd, 1, AddLandmark, DeleteLandmark);
		props.tps.addTransaction(transaction);
		const myString = await tpsRedo();
		console.log(myString);
	}

	const deleteLandmark = async (landmarkToDelete, parentID) => {
		let transaction = new AddDeleteLandmark_Transaction(parentID, activeMap._id, landmarkToDelete, 0, AddLandmark, DeleteLandmark);
		//console.log("WORKING ON DELETION");
		props.tps.addTransaction(transaction);
		const myString = await tpsRedo();
		console.log(myString);
	}

	const editLandmark = async (landmarkID, parentID, newName, prevName) => {
		//console.log(landmark);
		//create transaction for editing landmark
		let transaction = new EditLandmark_Transaction(landmarkID, parentID, activeMap._id, newName, prevName, EditLandmark);
		props.tps.addTransaction(transaction);
		const myString = await tpsRedo();
		console.log(myString);
	}

	const changeParent = async (regionID, newParent, prevParent) => {
		console.log(regionID);
		let currentRegion = regions.find(region => region._id === regionID);
		if(!currentRegion) //the region whose parent we're attempting to change is a map data file
			 return ("Could not update parent");
			//console.log("Could not update parent");
		let parentRegion = regions.find(region => region._id === currentRegion.parent);
		if(!parentRegion) //the region whose parent we're attempting to change is the direct child of a map data file (shouldn't be able to change parents across map data files)
			 return ("Could not update parent");
			//console.log("CHILDREN");
		let transaction = new ChangeParent_Transaction(currentRegion._id, parentRegion._id, newParent, prevParent, ChangeParent);
		props.tps.addTransaction(transaction);
		const myString = await tpsRedo();
		console.log(myString);
	}

	const viewPreviousRegion = async() => {
		let currentViewedRegion = viewedRegion;
		let currentViewedRegionIndex;
		for(let t = 0; t < regionsOfParent.length; t++){
			if(regionsOfParent[t]._id === currentViewedRegion){
				if(t === 0){
					return;
				}
				currentViewedRegionIndex = t;
				let previousRegionID = regionsOfParent[currentViewedRegionIndex - 1]._id;
				setViewedRegion(previousRegionID);
				break;
			}
		}
	}

	const viewNextRegion = async() => {
		let currentViewedRegion = viewedRegion;
		let currentViewedRegionIndex;
		for(let t = 0; t < regionsOfParent.length; t++){
			if(regionsOfParent[t]._id === currentViewedRegion){
				if(t === regionsOfParent.length - 1){
					return;
				}
				currentViewedRegionIndex = t;
				let previousRegionID = regionsOfParent[currentViewedRegionIndex + 1]._id;
				setViewedRegion(previousRegionID);
				break;
			}
		}
	}

	/*
		Used for toggling modals
	*/
	const setShowLogin = () => {
		toggleShowUpdate(false);
		toggleShowDeleteMap(false);
		toggleShowCreate(false);
		toggleShowLogin(!showLogin);
	};

	const setShowCreate = () => {
		toggleShowUpdate(false);
		toggleShowDeleteMap(false);
		toggleShowLogin(false);
		toggleShowCreate(!showCreate);
	};

	const setShowUpdate = () => {
		toggleShowDeleteMap(false);
		toggleShowLogin(false);
		toggleShowCreate(false);
		toggleShowUpdate(!showUpdate);
	}

	const setShowDeleteMap = () => {
		toggleShowUpdate(false);
		toggleShowCreate(false);
		toggleShowLogin(false);
		toggleShowDeleteMap(!showDeleteMap)
	}

	const setShowDeleteRegion = () => {
		toggleShowUpdate(false);
		toggleShowCreate(false);
		toggleShowLogin(false);
		toggleShowDeleteMap(false);
		toggleShowDeleteRegion(!showDeleteRegion);
	}

	/*
		Used for toggling between screens
	*/
	const setShowSpreadsheetScreen = async (parentID, setCode, resetActiveRegion) => {
		//console.log("parent" + parentID);
		toggleMapSelectScreen(false);
		toggleRegionViewerScreen(false);
		toggleSpreadsheetScreen(true);
		
		//console.log(mapSelectScreen);
		//console.log(regionViewerScreen);
		//console.log(spreadsheetScreenOn);

		if(resetActiveRegion){ //decides whether to reset the active region (Ex: returning from a subregion's spreadsheet to the map data file's spreadsheet)
			//setViewedRegion(null);
			setActiveRegion(null);
			//console.log("this happened");
		}
		
		if(!setCode){ //conditional used to set up activeRegion/activeMap so spreadsheets open properly
			await handleSetActive(parentID);
			//await setActiveRegion(null);
			//console.log(activeRegion);
			await refetchRegions(refetch2);
		}
		else{
			await handleSetActiveRegion(parentID);
			console.log(activeRegion);
			await refetchRegions(refetch2);
			console.log(parentID);
		}
		setViewedRegion(parentID);
	}

	const setShowRegionViewerScreen = async (_id) => {
		setViewedRegion(_id);
		toggleMapSelectScreen(false);
		toggleSpreadsheetScreen(false);
		toggleRegionViewerScreen(true);

		console.log(mapSelectScreen)
		console.log(spreadsheetScreenOn);
		console.log(regionViewerScreen);
	}

	const backToSpreadSheet = async () => {
		toggleRegionViewerScreen(false);
		toggleMapSelectScreen(false);
		toggleSpreadsheetScreen(true);
	}

	const goHome = () =>{
		props.tps.clearAllTransactions();
		toggleSpreadsheetScreen(false);
		toggleRegionViewerScreen(false);
		toggleMapSelectScreen(true);
		setViewedRegion(null); //reset the viewedRegion
		setActiveRegion(null); //reset the activeRegion
	}

	const controlZcontrolY = (event) => {
		if(event.ctrlKey && event.keyCode === 90 && tpsHasUndo()){
			tpsUndo();
		}
		else if(event.ctrlKey && event.keyCode === 89 && tpsHasRedo()){
			tpsRedo();
		}
	}

	return (
		<>
		<BrowserRouter>
			<Switch>
				<Route exact path="/"> 
					<Redirect exact from="/" to="/welcome"/>
				</Route>

				<Route path = "/welcome"> 
					{/* {auth ?  */}
					
						<>{/* {if(auth !== null) console.log("hi");} SIMULATE A LOGOUT} */}</>
					<WLayout wLayout="header">
						<WLHeader>
							<WNavbar color="colored">
								<ul>
									<WNavItem>
										<Logo className='logo' />
									</WNavItem>
								</ul>
								<ul>
									<NavbarOptions
										fetchUser={props.fetchUser} auth={auth} 
										setShowCreate={setShowCreate} setShowLogin={setShowLogin}
										setShowUpdate={setShowUpdate} userName={userName}/*Need a prop for the user's name*/
										toggleMapSelectScreen={toggleMapSelectScreen} spreadsheetScreenOn={props.spreadsheetScreenOn}
									/>
								</ul>
							</WNavbar>
						</WLHeader>

						<WLMain>
							{!auth ? 
								<>
									<Redirect exact from="/mapSelect" to={ {pathname: "/welcome"} } />
									<div className="container-secondary">
										<img src={globe}/>
									</div>
									<div className = "welcome-title">
										Welcome To The
									</div>
									<div className = "welcome-title bottom-text">
										World Data Mapper
									</div>
									{
										showCreate && (<CreateAccount fetchUser={props.fetchUser} setShowCreate={setShowCreate} />)
									}

									{
										showLogin && (<Login fetchUser={props.fetchUser} /*refetchTodos={refetch}*/ setShowLogin={setShowLogin} toggleMapSelectScreen={toggleMapSelectScreen}/>)
									}
									{
										showUpdate && (<UpdateAccount fetchUser={props.fetchUser} setShowUpdate={setShowUpdate}/>)
									}
								</>
								:<Redirect exact from="/welcome" to="/mapSelect"/>
							}
						</WLMain>
					</WLayout>
					{/* } */}
				</Route>

				<Route 
					path = "/mapSelect" 
					name = "/mapSelect">
					<>
					{auth ?
						!spreadsheetScreenOn && !regionViewerScreen ?
							<WLayout wLayout="header">
								<WLHeader>
									<WNavbar color="colored">
										<ul>
											<WNavItem onClick={goHome}>
												<Logo className='logo' />
											</WNavItem>
										</ul>
										<ul>
											<NavbarOptions
												fetchUser={props.fetchUser} auth={auth} 
												setShowCreate={setShowCreate} setShowLogin={setShowLogin}
												setShowUpdate={setShowUpdate} userName={userName}
												toggleMapSelectScreen={toggleMapSelectScreen} spreadsheetScreenOn={props.spreadsheetScreenOn}
												resetTPSStack={resetTPSStack}
											/>
										</ul>
									</WNavbar>
								</WLHeader>
								<WLMain>
									<>
										<MapSelect
											auth={auth} fetchUser={props.fetchUser}
											user={props.user} handleMapDeletion={handleMapDeletion}
											setShowSpreadsheetScreen={setShowSpreadsheetScreen}
											maps={maps} regions={regions} activeMap={activeMap}
											createNewMap={createNewMap} editMapName={editMapName}
										/>
									</>
								</WLMain>
										{
											showCreate && (<CreateAccount fetchUser={props.fetchUser} setShowCreate={setShowCreate} />)
										}

										{
											showLogin && (<Login fetchUser={props.fetchUser} /*refetchTodos={refetch}*/ setShowLogin={setShowLogin} toggleMapSelectScreen={toggleMapSelectScreen}/>)
										}
										{
											showUpdate && (<UpdateAccount fetchUser={props.fetchUser} setShowUpdate={setShowUpdate}/>)
										}
										{
											showDeleteMap && (<DeleteMapModal deleteMap={deleteMap} setShowDeleteMap={setShowDeleteMap} activeMap_id={activeMap._id}/>)
										}
							</WLayout>
						: <Redirect from="/mapSelect" to="/regionSpreadsheet"/>
					: <Redirect exact from="/mapSelect" to="/welcome"/>}
					</>
				</Route>

				<Route path = "/regionSpreadsheet">
					{auth ?
					 !mapSelectScreen ?
						!regionViewerScreen ?
						<WLayout wLayout = "header" onKeyDown={controlZcontrolY} tabIndex={0}>
							<WLHeader>
								<WNavbar color="colored">
									<ul>
										<WNavItem onClick={goHome}>
											<Logo className='logo' />
										</WNavItem>
									</ul>
									<ul>
										<NavbarOptions
											fetchUser={props.fetchUser} auth={auth} 
											setShowCreate={setShowCreate} setShowLogin={setShowLogin}
											setShowUpdate={setShowUpdate} userName={userName}
											toggleMapSelectScreen={toggleMapSelectScreen}
											spreadsheetScreenOn={spreadsheetScreenOn}
											activeMap={activeMap} activeRegion={activeRegion}
											maps={maps} regions={regions}
											viewedRegion={viewedRegion}
											setShowSpreadsheetScreen={setShowSpreadsheetScreen}
											toggleRegionViewerScreen={toggleRegionViewerScreen}
											resetTPSStack={resetTPSStack}
										/>
									</ul>
								</WNavbar>
							</WLHeader>
							<WLMain>
								<SpreadsheetScreen
									activeMap={activeMap} activeRegion={activeRegion /*We are sending both activeMap & activeRegion. In RegionEntry, we will check if activeRegion is null 
									or not and decide there whether to render the activeMap's subregions or the activeRegion's subregions*/}
									undo={tpsUndo} redo={tpsRedo}
									addRegion={addRegion} editRegion={editRegion} deleteRegionHandler={deleteRegionHandler}
									regions={regions}
									setShowSpreadsheetScreen={setShowSpreadsheetScreen}
									setShowRegionViewerScreen={setShowRegionViewerScreen}
									toggleRegionViewerScreen={toggleRegionViewerScreen}
									refetch2={refetch2}
									setViewedRegion={setViewedRegion}
									resetTPSStack={resetTPSStack}

									regionsOfParent={regionsOfParent}
									sortByColumn={sortByColumn}
									tpsClea
									tpsHasUndo={tpsHasUndo} tpsHasRedo={tpsHasRedo}
								/>
								{
									showUpdate && (<UpdateAccount fetchUser={props.fetchUser} setShowUpdate={setShowUpdate}/>)
								}
								{
									showDeleteRegion && <DeleteRegionModal deleteRegion={deleteRegion} setShowDeleteRegion={setShowDeleteRegion} regionToDelete={regionToDelete}
										indexOfRegionToDelete={indexOfRegionToDelete}/>
								}
							</WLMain>
						</WLayout>
						: <Redirect exact from="/regionSpreadsheet" to="/regionViewerScreen"/>
					: <Redirect from="/regionSpreadsheet" to="/mapSelect"/>
					: <Redirect from="/regionSpreadsheet" to="/welcome"/>
					}
				</Route>

				<Route path = "/regionViewerScreen">
					{auth ?
						regionViewerScreen ? 
						<WLayout wLayout = "header">
							<WLHeader>
								<WNavbar color="colored">
									<ul>
										<WNavItem onClick={goHome}>
											<Logo className='logo' />
										</WNavItem>
									</ul>
									<ul>
										<WNavItem>
											<i className="material-icons" onClick = {viewPreviousRegion}>west</i>
											<i className="material-icons" onClick = {viewNextRegion}>east</i>
										</WNavItem>
									</ul>
									<ul>
										<NavbarOptions
											fetchUser={props.fetchUser} auth={auth} 
											setShowCreate={setShowCreate} setShowLogin={setShowLogin}
											setShowUpdate={setShowUpdate} userName={userName}
											toggleMapSelectScreen={toggleMapSelectScreen} 
											toggleRegionViewerScreen={toggleRegionViewerScreen}
											backToSpreadSheet={backToSpreadSheet}
											setShowSpreadsheetScreen={setShowSpreadsheetScreen}
											resetTPSStack={resetTPSStack}

											spreadsheetScreenOn={props.spreadsheetScreenOn}
											regionViewerScreen={regionViewerScreen}
											activeRegion={activeRegion} activeMap={activeMap}
											viewedRegion={viewedRegion}
											maps={maps} regions={regions}
										/>
									</ul>
								</WNavbar>
							</WLHeader>
							<WLMain>
								<RegionViewerScreen
									viewedRegion={viewedRegion} regions={regions} maps={maps}
									toggleRegionViewerScreen={toggleRegionViewerScreen}
									undo={tpsUndo} redo={tpsRedo} activeMap={activeMap} activeRegion={activeRegion}
									addLandmark={addLandmark} deleteLandmark={deleteLandmark} editLandmark={editLandmark}
									changeParent={changeParent} resetTPSStack={resetTPSStack} setShowSpreadsheetScreen={setShowSpreadsheetScreen}
									tpsHasUndo={tpsHasUndo} tpsHasRedo={tpsHasRedo}
								/>
								{
									showUpdate && (<UpdateAccount fetchUser={props.fetchUser} setShowUpdate={setShowUpdate}/>)
								}
							</WLMain>
						</WLayout>
						
						: <Redirect from="/regionViewerScreen" to="/regionSpreadsheet"/>	
					: <Redirect from="/regionViewerScreen" to="/welcome"/>
					}
				</Route>
			</Switch>
		</BrowserRouter>
		</>
	);
};

export default Welcome;
