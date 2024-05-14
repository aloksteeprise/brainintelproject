import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import  Appside from '../../layout/Appside/Appside';
import { Typography, TextField, Button} from '@mui/material';
import HeaderLogin from '../../layout/Header/HeaderLogin'
import Helplink from '../../layout/Header/HelpLink';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {verifyEmail} from '../../service/Authservice';
import Registration from './Registration';
import config from '../../translation/config';
import PrimaryButton from '../../layout/Buton/PrimaryButton';

const EmailVerification = () => {
     const url = window.location.href;
    const [token, setToken] = React.useState('');
    const [registration, setRegistration]=React.useState(false);
    const navigate = useNavigate();
     const backtoLogin = () => {
         navigate('/login');
     }

    // const verify = (token) => {
    //     try{
    //         verifyEmail(token);
    //         setRegistration(true);
    //     }
    //     catch(err){
    //         console.log('thes are the errors', err);
    //     }
    // }
    // React.useEffect(() => {
    //     const urltoken=  url.split('=').pop().toString();
    //     setToken(urltoken);
    //     verify(urltoken);
    // },[]);
 
    return(
        <Box sx={{flexGrow: 1, overflow:'visible'}}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Appside/>
                </Grid>
                <Grid xs={12} sm={6} >
                    <Typography >
                        <Helplink />
                    </Typography>
                    <Typography  mt={22}>
                        <HeaderLogin/>
                    </Typography>
                    {registration ?
                    <>
                        <Typography mt={2}>
                            <p style={{textAlign: 'center', fontFamily:'Prooxima-bold'}}>You email has been verified.Registration Successful!!</p>
                        
                        </Typography> 
                        <a href="#" onClick={backtoLogin}>
                             <p style={{textAlign:'center'}}>Back to Login</p>
                        </a>
                        {/* <Button variant='oulined'  startIcon={<ArrowBackIcon/>} color="#333E5B" style={{marginRight: '150px'}}
                                onClick={backtoLogin}>Login
                        </Button> */}
                    </> :<Typography>
                    <p style={{textAlign: 'center', fontFamily:'Prooxima-bold'}}>You email has been verified.Registration Successful!!</p>

                        </Typography>}

                <Typography className="button-container" mt={2}>



                <PrimaryButton
                variant="contained"
                className=""
                onClick={backtoLogin}

                >
                {config.loginRedirect}
                </PrimaryButton>

                </Typography>
                </Grid>
            </Grid>
    </Box>
    )
};

export default EmailVerification;