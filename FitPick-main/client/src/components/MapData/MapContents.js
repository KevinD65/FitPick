import React            from 'react';
import MapList            from './MapList';

const MapContents = (props) => {

    return (
        <div className='table ' >
            <MapList
                maps={props.maps} activeMap={props.activeMaps} 
                deleteMap={props.deleteMap} editMapName={props.editMapName}
                toggleSpreadsheetScreen={props.toggleSpreadsheetScreen}
                handleMapDeletion={props.handleMapDeletion}
                setShowSpreadsheetScreen={props.setShowSpreadsheetScreen}
            />
        </div>
    );
};

export default MapContents;