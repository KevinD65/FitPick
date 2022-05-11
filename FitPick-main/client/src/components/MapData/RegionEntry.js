import React, { useState, useEffect } from 'react';
import { WButton, WInput, WRow, WCol } from 'wt-frontend';

const RegionEntry = (props) => {
    const { data } = props;

    const _id = data._id;
    const name = data.name;
    const capital = data.capital;
    const leader = data.leader;
    const flag = data.flag;
    const landmarksArr = data.landmarks;
    let landmarks = ""; //string of all the landmarks in a comma separated list for display purposes
    if(landmarksArr !== undefined){
        for(let i = 0; i < landmarksArr.length; i++){
            landmarks += landmarksArr[i].name + ", ";
        }
    }
    let imageName = name.split(" "); //array holding the split name of the region
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

    const [editingName, toggleNameEdit] = useState(false);
    const [editingCapital, toggleCapitalEdit] = useState(false);
    const [editingLeader, toggleLeaderEdit] = useState(false);

    useEffect (() => { //used for re-focusing after navigation with up/down arrow key
        if(props.activeField !== "None"){
            if(props.activeField === "name"){
                toggleNameEdit(!editingName);
            }
            else if(props.activeField === "capital"){
                toggleCapitalEdit(!editingCapital);
            }
            else{
                toggleLeaderEdit(!editingLeader);
            }
        }
    }, [props.activeField]);

    const handleNameEdit = (e) => {
        toggleNameEdit(false);
        const newName = e.target.value ? e.target.value : 'No Name';
        const prevName = name;
        if(newName !== prevName) //simply clicking should not make a transaction (actually needs to change)
            props.editRegion(data._id, 'name', newName, prevName);
    };

    const handleCapitalEdit = (e) => {
        toggleCapitalEdit(false);
        const newCapital = e.target.value ? e.target.value : 'No Capital';
        const prevCapital = capital;
        if(newCapital !== prevCapital) //simply clicking should not make a transaction (actually needs to change)
            props.editRegion(data._id, 'capital', newCapital, prevCapital);
    };

    const handleLeaderEdit = (e) => {
        toggleLeaderEdit(false);
        const newLeader = e.target.value ? e.target.value : 'No Leader';
        const prevLeader = leader;
        if(newLeader !== prevLeader) //simply clicking should not make a transaction (actually needs to change)
            props.editRegion(data._id, 'leader', newLeader, prevLeader);
    };

    const handleDeleteRegion = () => {
        props.deleteRegionHandler(data, props.index);
    }

    const handleGoToViewer = async () => {
        await props.resetTPSStack();
        await props.setViewedRegion(data._id); //changed from data to data._id
        props.toggleRegionViewerScreen(true);
    }

    const enterRegionSpreadsheet = async () => {
        await props.resetTPSStack();
        props.setShowSpreadsheetScreen(data._id, true, false);
    }

    const navigateSpreadsheet = async (e, field) => {
        if(e.keyCode === 37){ //attempt to move left
            if(field === "name")
                return;
            else if(field === "capital"){
                e.target.blur();
                toggleNameEdit(!editingName);
            }
            else{
                e.target.blur();
                toggleCapitalEdit(!editingCapital);
            }
        }
        else if(e.keyCode === 39){ //attempt to move right
            if(field === "leader")
                return;
            else if(field === "name"){
                e.target.blur();
                toggleCapitalEdit(!editingCapital);
            }
            else{
                e.target.blur();
                toggleLeaderEdit(!editingLeader);
            }
        }
        else if(e.keyCode === 38){ //attempt to move up
            let newIndex = props.index + 1;
            if(field === "name"){
                if(props.index !== 0){
                    e.target.blur();
                    props.handleUpDownArrow("up", "name", props.index);
                }
            }
            else if(field === "capital"){
                if(props.index !== 0){
                    e.target.blur();
                    props.handleUpDownArrow("up", "capital", props.index);
                }
            }
            else{
                if(props.index !== 0){
                    e.target.blur();
                    props.handleUpDownArrow("up", "leader", props.index);
                }
            }
        }
        else if(e.keyCode === 40){ //attempt to move down
            let newIndex = props.index - 1;
            if(field === "name"){
                if(props.index !== props.listLength - 1){
                    e.target.blur();
                    await props.handleUpDownArrow("down", "name", props.index);
                }
            }
            else if(field === "capital"){
                if(props.index !== props.listLength - 1){
                    e.target.blur();
                    props.handleUpDownArrow("down", "capital", props.index);
                }
            }
            else{
                if(props.index !== props.listLength - 1){
                    e.target.blur();
                    props.handleUpDownArrow("down", "leader", props.index);
                }
            }
        }
    }

    return (
        <WRow className='table-entry'>
            <WCol size = "1" className = "table-entry-column deleteRegionButton" onClick = {handleDeleteRegion/*() => props.deleteRegion(data/*data.parent, data._id)*/}>
                X
            </WCol>
            <WCol size="2" className = "table-entry-column">
                {
                    editingName || name === ''
                        ? <WInput
                            className='table-input' onBlur={handleNameEdit} onKeyDown={(e) => navigateSpreadsheet(e, "name")}
                            autoFocus={true} defaultValue={name} type='text'
                            wType="outlined" barAnimation="solid" inputClass="table-input-class"
                            fillColor="default"
                        />
                        : <div>
                            <div className="table-text regionName"
                                onClick={enterRegionSpreadsheet/*() => props.setShowSpreadsheetScreen(data._id, true, false)/*toggleNameEdit(!editingName)*/}
                            >{name}
                            </div>
                            <i className="material-icons regionNameEdit" onClick={toggleNameEdit}>edit</i>
                        </div>
                }
            </WCol>

            <WCol size="3" className = "table-entry-column">
                {
                    editingCapital || capital === '' 
                    ?<WInput
                        className='table-input' onBlur={handleCapitalEdit} onKeyDown={(e) => navigateSpreadsheet(e, "capital")}
                        autoFocus={true} defaultValue={capital} type='text'
                        wType="outlined" barAnimation="solid" inputClass="table-input-class"
                    />
                    : <div className="table-text"
                        onClick={() => toggleCapitalEdit(!editingCapital)}
                    >{capital}
                    </div>
                }
            </WCol>

            <WCol size="2" className = "table-entry-column">
                {
                    editingLeader || leader === '' 
                    ?<WInput
                        className='table-input' onBlur={handleLeaderEdit} onKeyDown={(e) => navigateSpreadsheet(e, "leader")}
                        autoFocus={true} defaultValue={leader} type='text'
                        wType="outlined" barAnimation="solid" inputClass="table-input-class"
                    />
                    : <div className="table-text"
                        onClick={() => toggleLeaderEdit(!editingLeader)}
                    >{leader}
                    </div>
                }
            </WCol>

            <WCol size="1" className = "table-entry-column">
                { hasFlag ?
                    <img className = "tableFlag" src = {require(`../../Images/The World/${modifiedImageName} Flag.png`)} alt = "No Flag"/>
                : <div className = "spreadsheet-flags">No Flag</div>
                }
            </WCol>

            <WCol size="3" onClick = {handleGoToViewer}>
                <div className = "spreadsheet-landmarks">
                    {landmarks}
                </div>
            </WCol>
        </WRow>
    );
};

export default RegionEntry;
