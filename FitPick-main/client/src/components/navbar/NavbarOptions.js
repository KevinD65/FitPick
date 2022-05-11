import React                                from 'react';
import { LOGOUT }                           from '../../cache/mutations';
import { useMutation, useApolloClient }     from '@apollo/client';
import { WButton, WNavItem }                from 'wt-frontend';
import RegionViewerScreen from '../regionViewerScreen/RegionViewerScreen';

const LoggedIn = (props) => {
    const client = useApolloClient();
	const [Logout] = useMutation(LOGOUT);
    let parent, parentIDForNav, ParentIsMap, regionName;
    let resetVR = false;
    //console.log(props.viewedRegion);

    let myMaps = props.maps;
    let myRegions = props.regions;

    console.log(props.activeRegion);
    console.log(props.activeMap);
/*
    if(props.activeRegion === null)
        parent = props.activeMap;
    else if(props.activeRegion === undefined)
        parent = props.activeMap;
    else{
        parent = props.activeRegion[0];
    }*/

    //console.log(myRegions);
    if(props.spreadsheetScreenOn || props.regionViewerScreen){
        /*
        if(props.activeRegion === "ROCKSOLID" && props.activeRegion === null){ //might not be needed
            console.log("GET PRANKED");
            console.log(props.activeMap);
            //parent = props.activeMap[0].name;
            regionName = props.viewedRegion.name;
        }*/
        if(props.activeRegion === null){ //we're seeing the spreadsheet screen of a map data file
            console.log("like a someboody");
            parent = props.activeMap.name;
            parentIDForNav = props.activeMap._id; //we are viewing a map data file's spreadsheet. Clicking the name of the map will simply bring them to this same spreadsheet page
            ParentIsMap = false;
            //ParentIsMap = false;
            if(props.viewedRegion === undefined){ //landmark view of the map data file itself (blue name was clicked) CHECK THIS AND MAKE SURE IT IS WORKING
                regionName = parent;
                parent = "";
            }/*
            else{
                regionName = props.viewedRegion.name;
            }*/
        }
        else{ //we're seeing the spreadsheet screen of a region
            console.log("VERY NICE");
            //console.log(props.activeRegion);
            let parentID = props.activeRegion.parent;
            //console.log(parentID);
            parent = myRegions.find(region => region._id === parentID);
            ParentIsMap = true;
            console.log(parent);
            if(parent === undefined){ //if we are dealing with a subregion of a map data file
                parent = myMaps.find(map => map._id === parentID);
                ParentIsMap = false;
                resetVR = true;
                console.log("IN HERE");
            }
            parentIDForNav = parent._id;
            //console.log(parent);
            if(parent !== undefined/* !== undefined*/){ //this is vacuously true since it just got set
                console.log("HAHAHAHAHA");
                parent = parent.name;
                console.log(props.viewedRegion);
                console.log(props.activeRegion);
                let region = myRegions.find(region => region._id === props.activeRegion._id);
                regionName = region.name;
            }
            else if(props.viewedRegion === undefined){ //landmark view of the map data file itself
                regionName = parent;
                parent = "";
            }
            else{
                regionName = props.viewedRegion.name;
            }
        }
        console.log(parentIDForNav);
        console.log(ParentIsMap);
        //console.log(parent);
        //console.log(regionName);
    }

    const handleLogout = async (e) => {
        Logout();
        const { data } = await props.fetchUser();
        if (data) {
            let reset = await client.resetStore();
            props.resetTPSStack();
            if (reset) props.toggleMapSelectScreen(false);
        }

    };
/*
    const toRegionViewer = () => {
        props.resetTPSStack();
        props.toggleRegionViewerScreen(false);
    }
*/
    const toParentSpreadsheet = () => {
        props.resetTPSStack();
        console.log(parentIDForNav);
        console.log(ParentIsMap);
        console.log(resetVR);
        props.setShowSpreadsheetScreen(parentIDForNav, ParentIsMap, resetVR);
    }

    const toOwnSpreadsheet = () => {
        props.resetTPSStack();
        props.toggleRegionViewerScreen(false);
    }

    return (
        //add user's name here for updateaccount option
        <> { props.regionViewerScreen || props.spreadsheetScreenOn ?
            <WNavItem className = "regionViewerNavigation" hoverAnimation="lighten">
                <div onClick = {toParentSpreadsheet/*() => props.setShowSpreadsheetScreen(parentIDForNav, ParentIsMap, resetVR)*/}>
                    {parent}
                </div>
                <i className="material-icons">chevron_right</i>
                <div onClick = {toOwnSpreadsheet/*() => props.toggleRegionViewerScreen(false)*/}>
                    {regionName}
                </div>
            </WNavItem>
            :<></>
            }
            <WNavItem hoverAnimation="lighten">
                <WButton className="navbar-options" onClick={props.setShowUpdate} wType="texted" hoverAnimation="text-primary">
                    {props.userName}
                </WButton>
            </WNavItem >
            <WNavItem hoverAnimation="lighten">
                <WButton className="navbar-options" onClick={handleLogout} wType="texted" hoverAnimation="text-primary">
                    Logout
                </WButton>
            </WNavItem >
        </>
    );
};

const LoggedOut = (props) => {

    return (
        <>
            <WNavItem hoverAnimation="lighten">
                <WButton className="navbar-options acc" onClick={props.setShowCreate} wType="texted" hoverAnimation="text-primary"> 
                    Create Account
                </WButton>
            </WNavItem>
            <WNavItem hoverAnimation="lighten">
                <WButton className="navbar-options" onClick={props.setShowLogin} wType="texted" hoverAnimation="text-primary">
                    Login
                </WButton>
            </WNavItem>
        </>
    );
};


const NavbarOptions = (props) => {
    return (
        <>
            {
                props.auth === false ? <LoggedOut setShowLogin={props.setShowLogin} setShowCreate={props.setShowCreate}/>
                : <LoggedIn fetchUser={props.fetchUser} userName={props.userName} toggleMapSelectScreen={props.toggleMapSelectScreen} setShowUpdate={props.setShowUpdate} 
                    viewedRegion={props.viewedRegion} maps={props.maps} regions={props.regions} activeMap={props.activeMap} activeRegion={props.activeRegion}
                    spreadsheetScreenOn={props.spreadsheetScreenOn} regionViewerScreen={props.regionViewerScreen} backToSpreadSheet={props.backToSpreadSheet} 
                    setShowSpreadsheetScreen={props.setShowSpreadsheetScreen} toggleRegionViewerScreen={props.toggleRegionViewerScreen} resetTPSStack={props.resetTPSStack}/>
            }
        </>

    );
};

export default NavbarOptions;