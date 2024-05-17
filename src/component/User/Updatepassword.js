import * as React from 'react';
import Grid from '@mui/material/Grid';
import { Typography, TextField, Button, Box, Snackbar } from '@mui/material';
import StyledInput from '../../layout/TextInput';
import Appside from '../../layout/Appside/Appside'
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import ArrowBack from '@mui/icons-material/ArrowBack';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PrimaryButton from '../../layout/Buton/PrimaryButton';
import HeaderLogin from '../../layout/Header/HeaderLogin'
import Footer from '../../layout/Footer/Footer';
import Helplink from '../../layout/Header/HelpLink';
import config from '../../translation/config';
import { handleSignOut, handleUpdatePassword, resetPassword } from '../../service/Authservice';
import { useNavigate } from 'react-router-dom';
import { handleConfirmResetPassword } from '../../service/Authservice';

import '../../index.css';


const UpdatePassword = (props) => {

    const url = window.location.href;
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const [password, setPassword] = React.useState('');
    const [newpassword, setNewPassword] = React.useState('');
    const [otpcode, setOtpcode] = React.useState('');
    const [token, setToken] = React.useState('');
    const [errorMsg, setErrorMsg] = React.useState('');
    const [messages, setMessage] = React.useState(false);
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);

    const navigate = useNavigate();

    React.useEffect(() => {
        const urltoken = url.split('=').pop();
        setToken(urltoken);
    }, [])

    React.useEffect(() => {
        setErrorMsg('');
    }, [])

    const backtoLogin = () => {
        navigate('/record');
    }

    const updatePassword = async (ev) => {
        ev.preventDefault();
        debugger;

        try {
            debugger;
            const response = await handleUpdatePassword(password, newpassword);
            setPassword("")
            setNewPassword("")
            if (response === true) {
                setMessage(response);
                handleSignOut();
                setErrorMsg("")
            }
            else {
                setErrorMsg("Incorrect Old password")
            }
            // setSnackbarOpen(true);


        }

        catch (err) {
            console.log('thes are the errors', err);
        }
    }
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleLogout = () => {
        handleSignOut();
        navigate('/login');
    };
    const handleKeyDown = (event) => {
        if(event.keyCode==32){
          event.preventDefault();
        }
        
    };

    return (
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Appside />
                </Grid>
                <Grid xs={12} sm={6} >

                    <Typography mt={16} >
                        <HeaderLogin />
                    </Typography>

                    <Typography mt={6}>
                        <p className='subheading'>{config.resetHeading}</p>
                    </Typography>
                    {/* {
                        errorMsg.length > 0 ?
                            <Typography mt={2}>
                                <p style={{ fontSize: 'small', color: 'red', justifyContent: 'center', display: 'flex' }}>{errorMsg}</p>
                            </Typography> : null
                    } */}

                    <Typography sx={{ justifyContent: 'center', display: 'flex' }} mt={2}>
                        <StyledInput id="outlined-basic" label="Old Password" variant="outlined" onKeyDown={handleKeyDown} onChange={(ev) => setPassword(ev.target.value)}
                            value={password} style={{ width: '315px' }} type={showPassword ? 'text' : 'password'} 
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position='end' >
                                        {showPassword ? <VisibilityOff onClick={() => setShowPassword(false)} /> :
                                            <Visibility onClick={() => setShowPassword(true)} />}
                                    </InputAdornment>
                                ),
                                inputProps: {
                                    maxLength: config.passwordmaxlenght
                                  }
                            }}
                            required />
                    </Typography>
                    <Typography sx={{ justifyContent: 'center', display: 'flex' }} mt={2}>
                        <StyledInput id="outlined-basic" label="New Password" variant="outlined" onKeyDown={handleKeyDown} onChange={(ev) => setNewPassword(ev.target.value)}
                            value={newpassword} style={{ width: '315px' }} type={showPassword ? 'text' : 'password'}

                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position='end'>
                                        {showConfirmPassword ? <VisibilityOff onClick={() => setShowConfirmPassword(false)} /> :
                                            <Visibility onClick={() => setShowConfirmPassword(true)} />}
                                    </InputAdornment>
                                ),
                                inputProps: {
                                    maxLength: config.passwordmaxlenght
                                  }
                            }}
                            required />
                    </Typography>
                    <Typography className="error-message" color="error" mt={2} sx={{ justifyContent: 'center', display: 'flex' }}>
                        {errorMsg}
                    </Typography>
                    {!messages && (
                        <Typography sx={{ justifyContent: 'center', display: 'flex' }} mt={6}>

                            <Button variant='oulined' startIcon={<ArrowBack />} color="#333E5B" style={{ marginRight: '150px' }}
                                onClick={backtoLogin}>Back
                            </Button>
                            <PrimaryButton variant='contained' className='buttonPrimarylogin' onClick={updatePassword}
                            >{config.updatepassword}

                            </PrimaryButton>
                        </Typography>
                    )}
                    {messages && (
                        <Grid>
                            <Typography
                                className="button-container"
                                mt={2}
                                sx={{ display: 'flex', justifyContent: 'space-evenly' }}
                            >
                                {config.updatePassword}

                            </Typography>
                            <Typography
                                className="button-container"
                                mt={2}
                                sx={{ display: 'flex', justifyContent: 'space-evenly' }}
                            >

                                <a
                                    href="#"
                                    onClick={handleLogout}
                                    style={{ position: 'relative', right: '8px' }}
                                >
                                    {config.onupdatePasswordLogin}
                                </a>
                            </Typography>
                        </Grid>
                    )}



                    <Footer style='140px' />

                </Grid>
            </Grid>
            {/* <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={snackbarOpen}
                autoHideDuration={2000}
                onClose={handleSnackbarClose}
                message="Password updated successfully! Please Go to Login"
            /> */}
        </Box>
    )
};


export default UpdatePassword;