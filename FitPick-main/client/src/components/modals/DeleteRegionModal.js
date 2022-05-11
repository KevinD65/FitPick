import React from 'react';
import { WModal, WMHeader, WMMain, WButton } from 'wt-frontend';

const DeleteRegionModal = (props) => {

    const handleDelete = async () => {
        props.deleteRegion(props.regionToDelete, props.indexOfRegionToDelete);
        props.setShowDeleteRegion(false);
    }

    return (
        <WModal className="deleteMap-modal">
            <div className="delete-modal-header" onClose={() => props.setShowDeleteRegion(false)}>
                Delete Region?
			</div>
            <WButton className = "deleteModal-x" onClick ={ () => props.setShowDeleteRegion(false)}>X</WButton>

            <div className = "modal-button-container">
                <WButton className="modal-button" onClick={() => props.setShowDeleteRegion(false)} clickAnimation="ripple-light" hoverAnimation="darken" color="">
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

export default DeleteRegionModal;