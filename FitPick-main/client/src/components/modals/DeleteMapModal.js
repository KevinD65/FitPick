import React from 'react';
import { WModal, WMHeader, WMMain, WButton } from 'wt-frontend';

const DeleteMapModal = (props) => {

    const handleDelete = async () => {
        props.deleteMap(props.activeMap_id);
        props.setShowDeleteMap(false);
    }

    return (
        <WModal className="deleteMap-modal">
            <div className="delete-modal-header" onClose={() => props.setShowDeleteMap(false)}>
                Delete Map?
			</div>
            <WButton className = "deleteModal-x" onClick ={ () => props.setShowDeleteMap(false)}>X</WButton>

            <div className = "modal-button-container">
                <WButton className="modal-button" onClick={() => props.setShowDeleteMap(false)} clickAnimation="ripple-light" hoverAnimation="darken" color="">
                    Cancel
				</WButton>
                <label className="col-spacer">&nbsp;</label>
                <WButton className="modal-button" onClick={handleDelete} clickAnimation="ripple-light" hoverAnimation="darken" color="white">
                    Delete
				</WButton>
            </div>
        </WModal>
    );
}

export default DeleteMapModal;