import React 							from 'react';
import globe							from '../../Images/Globe.PNG';
import { WButton, WRow, WCol } 			from 'wt-frontend';
import WLayout 							from 'wt-frontend/build/components/wlayout/WLayout';
import WLMain 							from 'wt-frontend/build/components/wlayout/WLMain';
import WLHeader 						from 'wt-frontend/build/components/wlayout/WLHeader';
import MapContents 						from '../MapData/MapContents';

const MapSelect = (props) => {
    return(
		<>
			<div className = "mapSelect-spacing"></div>
			<WLayout wLayout = "header">
				<WLHeader>
					<WRow className = "mapSelect-redbar"></WRow>
					<div className = "mapSelect-blackbar">Your Maps</div>
				</WLHeader>
				<WLMain>
					<>
					<div className = "mapSelectionBox"> 
						<MapContents
							maps={props.maps} regions={props.regions}
							activeMap={props.activeMap}
							toggleSpreadsheetScreen={props.toggleSpreadsheetScreen}
							handleMapDeletion={props.handleMapDeletion}
							setShowSpreadsheetScreen={props.setShowSpreadsheetScreen}
							editMapName={props.editMapName}
						/>
					</div>
					<div className = "globeBox"> 
						<div className = "mapSelectGlobe"><img src = {globe} className="mapSelectGlobeImage"/></div>
						<WButton className = "createNewMap-button" span = "true" onClick = {props.createNewMap}>Create New Map</WButton>
					</div>
					</>
				</WLMain>
			</WLayout>
		</>
    );
};
export default MapSelect;