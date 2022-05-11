import React, { useState } 	from 'react';
import { LOGIN } 			from '../../cache/mutations';
import { useMutation }    	from '@apollo/client';

import { WModal, WMHeader, WMMain, WMFooter, WButton, WInput, WRow, WCol } from 'wt-frontend';

const Login = (props) => {
	const [input, setInput] = useState({ email: '', password: '' });
	const [loading, toggleLoading] = useState(false);
	const [showErr, displayErrorMsg] = useState(false);
	const errorMsg = "Email/Password not found.";
	const [Login] = useMutation(LOGIN);

	const updateInput = (e) => {
		const { name, value } = e.target;
		const updated = { ...input, [name]: value };
		setInput(updated);
	}

	const handleLogin = async (e) => {
		
		const { loading, error, data } = await Login({ variables: { ...input } });
		if (loading) { toggleLoading(true) };
		if (data.login._id === null) {
			displayErrorMsg(true);
			return;
		}
		if (data) {
			props.fetchUser();
			//props.refetchTodos();
			toggleLoading(false)
			props.setShowLogin(false)
			props.toggleMapSelectScreen(true);
			window.location.reload(false);
		};
	};


	return (
		<WModal className = "login-modal">
			<div className = "loginModal-header" onClose={() => props.setShowLogin(false)}>
				Login To Your Account
			</div>
			<WButton className = "loginModal-x" onClick ={ () => props.setShowLogin(false)}>X</WButton>

			{
				loading ? <div/>
					: <div>
						<div className="modal-spacer">&nbsp;</div>
						<div className="modal-spacer">&nbsp;</div>
						<div className="modal-col-gap">
								<div className = "modal-emailInput-label" >Email: </div>
								<WInput 
									className="modal-input-field" onBlur={updateInput} name="email" labelAnimation="up" 
									barAnimation="solid" placeholderText="*Enter Email Here*" wType="outlined" inputType="text"
									outlined = "disabled"
									 
								/>
						</div>
						<div className="modal-spacer">&nbsp;</div>
						<div className="modal-col-gap">
								<div className = "modal-passwordInput-label" >Password: </div>
								<WInput 
									className="modal-input-field" onBlur={updateInput} name="password" labelAnimation="up" 
									barAnimation="solid" placeholderText="*Enter Password Here*" wType="outlined" inputType="password" 
								/>
						</div>
					</div>
			}
				<div className="modal-spacer">&nbsp;</div>
				<div className = "paddingLeft">
					<WButton className="modal-button" onClick={handleLogin} clickAnimation="ripple-light" hoverAnimation="darken" shape="rounded" color="primary">
						Login
					</WButton>
					<WButton className="modal-button" onClick={() => props.setShowLogin(false)} clickAnimation="ripple-light" hoverAnimation="darken" shape="rounded" color="primary">
						Cancel
					</WButton>
				</div>
		</WModal>
		/*
		<WModal className="login-modal">
			<div className="modal-header" onClose={() => props.setShowLogin(false)}>
				Login
			</div>

			{
				loading ? <div />
					: <div className="main-login-modal">

						<WInput className="modal-input" onBlur={updateInput} name='email' labelAnimation="up" barAnimation="solid" labelText="Email Address" wType="outlined" inputType='text' />
						<div className="modal-spacer">&nbsp;</div>
						<WInput className="modal-input" onBlur={updateInput} name='password' labelAnimation="up" barAnimation="solid" labelText="Password" wType="outlined" inputType='password' />

						{
							showErr ? <div className='modal-error'>
								{errorMsg}
							</div>
								: <div className='modal-error'>&nbsp;</div>
						}

					</div>
			}
			<div>
				<WButton className="modal-button" onClick={handleLogin} span clickAnimation="ripple-light" hoverAnimation="darken" shape="rounded" color="primary">
					Login
				</WButton>
			</div>
		</WModal>
		*/
	);
}

export default Login;