import React, { useState }  from 'react';
import { WNavItem, WInput } from 'wt-frontend';

const MapEntry = (props) => {
    const { data } = props;

    const [editing, toggleEditing] = useState(false);
    //const [preEdit, setPreEdit] = useState(props.name); //name prior to change for undo/redo

    const handleEditing = (e) => {
        e.stopPropagation();
        //setPreEdit(props.name);
        toggleEditing(!editing);
    };

    const handleSubmit = (e) => {
        handleEditing(e);
        let name = e.target.value;
        props.editMapName(props._id, name);
    };

    const handleDeleteMap = () => {
        props.handleMapDeletion(props._id);
    }

    //const entryStyle = props.id === props.activeid ? 'list-item list-item-active' : 'list-item ';
    
    return (
        <>
            <WNavItem 
                className="MapName" onDoubleClick={handleEditing} 
                onClick={() => props.setShowSpreadsheetScreen(props._id, false, true)} hoverAnimation="lighten"
            >
                {
                    editing ? <WInput className="map-edit" inputClass="map-edit-input" wType="lined" barAnimation="solid" /*name="name"*/ onBlur={handleSubmit} autoFocus={true} defaultValue={props.name} />
                        :   <div className='list-text'>
                                {props.name}
                            </div>
                }
            </WNavItem>
            <WNavItem>
                <i className="material-icons" onClick={handleDeleteMap}>delete_outline</i>
            </WNavItem>
            <WNavItem>
                <i className="material-icons" onClick={toggleEditing}>edit</i>
            </WNavItem>
        </>
    );
};

export default MapEntry;