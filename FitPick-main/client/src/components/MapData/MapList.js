import React        from 'react';
import MapEntry from './MapEntry';

const MapList = (props) => {
    return (
        <>
            {
                props.maps &&
                props.maps.map(map => (
                    <MapEntry
                        key={map.id}
                        handleSetActive={props.handleSetActive}
                        id={map.id} name={map.name} _id={map._id}
                        deleteMap={props.deleteMap} editMapName={props.editMapName}
                        setShowSpreadsheetScreen={props.setShowSpreadsheetScreen}
                        handleMapDeletion={props.handleMapDeletion}
                    />
                ))
            }
        </>
    );
};

export default MapList;