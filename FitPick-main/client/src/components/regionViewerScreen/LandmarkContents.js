import React from 'react';
import LandmarkEntry from './LandmarkEntry';

const LandmarkContents = (props) => {

    console.log(props.activeRegion);
    console.log(props.activeMap);
    console.log(props.viewedRegion);
/*
    let parentOfActive;
    if(props.activeRegion === null){
        //parentOfActive = props.activeMap;
        //console.log(parentOfActive.landmarks);
        parentOfActive = props.maps.find(map => map._id === props.viewedRegion);
    }
    else{
        //parentOfActive = props.activeRegion;
        //console.log(props.activeRegion);
        parentOfActive = props.regions.find(region => region._id === props.viewedRegion);
    }
    
    let landmarksToRender = parentOfActive.landmarks;
    console.log(props.viewedRegion);
*/
    let parentOfActive = props.maps.find(map => map._id === props.viewedRegion);
    if(!parentOfActive)
        parentOfActive = props.regions.find(region => region._id === props.viewedRegion);
    let landmarksToRender = parentOfActive.landmarks;

return(
    landmarksToRender.map((entry, index) => (
        <LandmarkEntry
            data={entry} index={index} key={entry.id}
            activeMap={props.activeMap} activeRegion={props.activeRegion}
            editLandmark={props.editLandmark} viewedRegion={props.viewedRegion}
            deleteLandmark={props.deleteLandmark} regions={props.regions} maps={props.maps}
        />
    ))
);

};

export default LandmarkContents;
