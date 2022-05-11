import React, { useState, useEffect } 	from 'react';
import { WLayout, WLHeader, WLSide, WLMain, WInput } from 'wt-frontend';
import LandmarkContents from './LandmarkContents';

const RegionViewerScreen = (props) => {
    const [input, setInput] = useState("");
    const [editingParent, toggleEditingParent] = useState(false);

    let RegionName, ParentRegion, RegionCapital, RegionLeader, NumSubregions, parent, locateViewedRegion, returnToMap;
    locateViewedRegion = props.regions.find(region => region._id === props.viewedRegion);
    if(!locateViewedRegion){ //viewed region is the map data file
        locateViewedRegion = props.maps.find(map => map._id === props.viewedRegion);
        parent = locateViewedRegion;
        RegionName = locateViewedRegion.name;
        ParentRegion = "N/A";
        RegionCapital = "N/A";
        RegionLeader = "N/A";
        NumSubregions = locateViewedRegion.subregions.length;
    }
    else{ //viewed region is a region
        let locateViewedRegionParent = props.regions.find(region => region._id === locateViewedRegion.parent);
        returnToMap = false;
        if(!locateViewedRegionParent){
            locateViewedRegionParent = props.maps.find(map => map._id === locateViewedRegion.parent);
            returnToMap = true;
        }
        parent = locateViewedRegion;
        RegionName = locateViewedRegion.name;
        ParentRegion = locateViewedRegionParent.name;
        RegionCapital = locateViewedRegion.capital;
        RegionLeader = locateViewedRegion.leader;
        NumSubregions = locateViewedRegion.subregions.length;
    }

    let imageName = RegionName.split(" "); //array holding the split name of the region
    let modifiedImageName = "";
    for(let s = 0; s < imageName.length; s++){
        let capitalizeFirstLetter = imageName[s].substring(0, 1).toUpperCase();
        let modifiedStr = capitalizeFirstLetter += imageName[s].slice(1);
        modifiedImageName += modifiedStr + " ";
    }
    modifiedImageName = modifiedImageName.substring(0, modifiedImageName.length - 1);

    let hasFlag = false;
    const findFlag = async () => {
        try{
            const imgFile = require(`../../Images/The World/${modifiedImageName} Flag.png`); //dynamic import of flag
            hasFlag = true;
        }
        catch(err){
            console.log("No flag available");
        }
    }
    findFlag();

    const updateInput = (e) => {
		setInput(e.target.value);
	}

    const handleAddLandmark = () => {
        let landmarkName = input;
        props.addLandmark(parent, landmarkName);
    }

    const handleParentEdit = (e) => {
        let newParent = e.target.value;
        toggleEditingParent(false);
        props.changeParent(parent._id, newParent, ParentRegion);
    }

    const toParentSpreadsheet = () => {
        props.resetTPSStack();
        if(returnToMap) //viewed region's parent is a region
            props.setShowSpreadsheetScreen(parent.parent, false, true);
        else if(returnToMap !== undefined) //viewed region's parent is a map
            props.setShowSpreadsheetScreen(parent.parent, true, false);
    }

    const controlZcontrolY = (event) => {
		if(event.ctrlKey && event.keyCode === 90 && props.tpsHasUndo()){
			props.undo();
		}
		else if(event.ctrlKey && event.keyCode === 89 && props.tpsHasRedo()){
			props.redo();
		}
	}

    return(
        <>
            <div className = "regionViewer-header-spacer"></div>
            <WLayout wLayout = "header" className = "regionViewer-body" onKeyDown={controlZcontrolY} tabIndex={0}> 
                <WLHeader>
                    {props.tpsHasUndo() ?
                        <i className="material-icons undo" onClick = {props.undo}>undo</i>
                    : <i className="material-icons disabledUndo">undo</i>
                    }
                    {props.tpsHasRedo() ?
                        <i className="material-icons redo" onClick = {props.redo}>redo</i>
                    : <i className="material-icons disabledRedo">redo</i>
                    }
                </WLHeader>
                <WLMain>
                    <div className="RegionViewerLeftSide">
                        <div className = "RegionViewerImageContainer">
                        { hasFlag ?
                            <img className = "viewerFlag" src = {require(`../../Images/The World/${modifiedImageName} Flag.png`)} alt = "No Flag"/>
                        : <div className = "NoFlag">No Flag</div>
                        }
                        </div>
                        <div className="modal-spacer">&nbsp;</div>
                        {/* spacing here between image and region information */}
                        <div className = "RegionViewerInfoContainer">
                            <div className = "RegionViewerInfo">
                                Region Name: {RegionName}
                            </div>
                        </div>
                        <div className = "RegionViewerInfoContainer">
                            {editingParent || ParentRegion === '' ?
                            <WInput
                                className='table-input' onBlur={handleParentEdit}
                                autoFocus={true} defaultValue={ParentRegion} type='text'
                                wType="outlined" barAnimation="solid" inputClass="table-input-class"
                                fillColor="default"
                            />
                            : <div className = "RegionViewerInfo">
                                <div className = "regionViewerParent">
                                    Parent Region:
                                </div>
                                <div className = "regionViewerParentName" onClick = {toParentSpreadsheet}>
                                    { ParentRegion}
                                </div>
                                <i className="material-icons" onClick = {toggleEditingParent}>edit</i>
                             </div>
                            }
                        </div>
                        <div className = "RegionViewerInfoContainer">
                            <div className = "RegionViewerInfo">
                                Region Capital: {RegionCapital}
                            </div>
                        </div>
                        <div className = "RegionViewerInfoContainer">
                            <div className = "RegionViewerInfo">
                                Region Leader: {RegionLeader}
                            </div>
                        </div>
                        <div className = "RegionViewerInfoContainer">
                            <div className = "RegionViewerInfo">
                                # of Sub Regions: {NumSubregions}
                            </div>
                        </div>
                    </div>
                    <div className = "RegionViewerRightSide">
                        <div className = "regionLandmarks-header">Region Landmarks:</div>
                        <div className = "regionLandmarks">
                            <LandmarkContents
                                activeMap={props.activeMap} activeRegion={props.activeRegion}
                                editLandmark={props.editLandmark} viewedRegion={props.viewedRegion}
                                maps={props.maps} regions={props.regions} deleteLandmark={props.deleteLandmark}
                            />
                        </div>
                        <div className = "regionLandmarks-add-container" /*onClick for add landmark*/> 
                            <i className="material-icons addLandmark" onClick = {handleAddLandmark}>add</i>
                            <WInput className = "landmarkInput" autofocus={true} placeholderText="Enter landmark" type="text" wType="outlined" inputClass="table-input-class" 
                                onBlur={updateInput}/>
                        </div>
                    </div>
                </WLMain>
            </WLayout>
        </>
    );
}

export default RegionViewerScreen;