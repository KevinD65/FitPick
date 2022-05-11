import React, { useState } 	from 'react';
import { UPDATE }			from '../../cache/mutations';
import { useMutation }    	from '@apollo/client';

import { WModal, WMHeader, WMMain, WMFooter, WButton, WInput, WRow, WCol } from 'wt-frontend';

const UpdateAccount = (props) => {
	//let myUser = await props.fetchUser();
	//myUser = myUser.data.getCurrentUser._id;
	const [input, setInput] = useState({ email: '', password: '', name: ''});
	const [loading, toggleLoading] = useState(false);
	const [UpdateAccount] = useMutation(UPDATE);

	const updateInput = async (e) => {
		const { name, value } = e.target;
		//console.log(name);
		const updated = { ...input, [name]: value };
		//console.log(updated);
		setInput(updated);
	};

	const handleUpdateAccount = async (e) => {
		for (let field in input) {
			if (!input[field] && field !== "userID") {
				console.log(field);
				alert('All fields must be filled');
				return;
			}
		}

		const { loading, error, data } = await UpdateAccount({ variables: { ...input } });
		//console.log("MADE IT OUT");
		if (loading) { toggleLoading(true) };
		if (error) { return `Error: ${error.message}` };
		if (data) {
			console.log(data)
			toggleLoading(false);/*
			if(data.register.email === 'already exists') {
				alert('User with that email already registered');
			}
			else {
				props.fetchUser();
			}*/
			let myUser = await props.fetchUser();
			//console.log(myUser.data.getCurrentUser.name);
			props.setShowUpdate(false);

		};
	};

	return (
		<WModal className="signup-modal">
		<div className="signupModal-header" onClose={() => props.setShowUpdate(false)}>
			Enter Updated Account Information
		</div>
		<WButton className = "signupModal-x" onClick ={ () => props.setShowUpdate(false)}>X</WButton>

		{
			loading ? <div />
				: <div>
					<div className="modal-spacer">&nbsp;</div>
					<div className="modal-spacer">&nbsp;</div>
					<div className = "modal-nameInput-field" >Name: </div>
					<WInput 
						className="modal-input-field" onBlur={updateInput} name="name" labelAnimation="up" 
						barAnimation="solid" placeholderText="*Enter Name Here*" wType="outlined" inputType="text" 
					/>
					<div className="modal-spacer">&nbsp;</div>
					<div className = "modal-emailInput-label" >Email: </div>
					<WInput 
						className="modal-input-field" onBlur={updateInput} name="email" labelAnimation="up" 
						barAnimation="solid" placeholderText="*Enter Email Here*" wType="outlined" inputType="text" 
					/>
					<div className="modal-spacer">&nbsp;</div>
					<div className = "modal-passwordInput-label" >Password: </div>
					<WInput 
						className="modal-input-field" onBlur={updateInput} name="password" labelAnimation="up" 
						barAnimation="solid" placeholderText="*Enter Password Here*" wType="outlined" inputType="password" 
					/>
					<div className="modal-spacer">&nbsp;</div>
				</div>
		}
		<div className = "paddingLeft">
			<WButton className="modal-button" onClick={handleUpdateAccount} clickAnimation="ripple-light" hoverAnimation="darken" shape="rounded" color="primary">
				Submit
			</WButton>
			<WButton className="modal-button" onClick={() => props.setShowUpdate(false)} clickAnimation="ripple-light" hoverAnimation="darken" shape="rounded" color="primary">
				Cancel
			</WButton>
		</div>
	</WModal>
	);
}

export default UpdateAccount;