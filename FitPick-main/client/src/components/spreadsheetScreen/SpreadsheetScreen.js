import React from 'react';
import { BrowserRouter, Switch, Route, } from 'react-router-dom';
import SpreadsheetHeader from '../MapData/SpreadsheetHeader';
import SpreadsheetContents from '../MapData/SpreadsheetContents';

const SpreadsheetScreen = (props) => {

    return(
			<BrowserRouter>
				<Switch>
                    <Route path = "/regionSpreadsheet">
						<SpreadsheetHeader
							activeMap={props.activeMap} activeRegion={props.activeRegion}
							region={props.regions} addRegion={props.addRegion}
							undo={props.undo} redo={props.redo}
							tpsHasUndo={props.tpsHasUndo} tpsHasRedo={props.tpsHasRedo}
							refetch2={props.refetch2}
							toggleRegionViewerScreen={props.toggleRegionViewerScreen}
							sortByColumn={props.sortByColumn}
						/>
						<div className = "spreadsheetBackground">
							<SpreadsheetContents
								activeMap={props.activeMap} activeRegion={props.activeRegion}
								regions={props.regions} editRegion={props.editRegion} deleteRegionHandler={props.deleteRegionHandler}
								setShowRegionViewerScreen={props.setShowRegionViewerScreen}
								setShowSpreadsheetScreen={props.setShowSpreadsheetScreen}
								toggleRegionViewerScreen={props.toggleRegionViewerScreen}
								setViewedRegion={props.setViewedRegion}
								refetch2={props.refetch2}
								resetTPSStack={props.resetTPSStack}
								regionsOfParent={props.regionsOfParent}
							/>    
						</div>
                    </Route>
				</Switch>
			</BrowserRouter>
    );
};
export default SpreadsheetScreen;