import * as React from 'react';
import Grid from '@mui/material/Grid';
import { Typography, TextField, Button,Box} from '@mui/material';
import StyledInput from '../../layout/TextInput';
import  Appside from '../../layout/Appside/Appside'
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import ArrowBack from '@mui/icons-material/ArrowBack';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PrimaryButton from '../../layout/Buton/PrimaryButton';
import HeaderLogin from '../../layout/Header/HeaderLogin'
import Footer from '../../layout/Footer/Footer';
import Helplink from '../../layout/Header/HelpLink';
import config from '../../translation/config';
import {resetPassword} from '../../service/Authservice';
import {useNavigate } from 'react-router-dom';
import {verifyEmail} from '../../service/Authservice';


import '../../index.css';


const EmailVerificationPage = (props) => {

    const url = window.location.href;
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const [password, setPassword]= React.useState('');
    const [confirmpassword, setConfirmPassword]= React.useState('');
    const [otpcode, setOtpcode]= React.useState('');
    const [token, setToken]= React.useState('');
    const [errorMsg, setErrorMsg] = React.useState('');
    const [succMsg, setSuccMsg] = React.useState('');
    const navigate=useNavigate();
    const [isChecked, setChecked] = React.useState(false);
    React.useEffect(() => {
      const urltoken=  url.split('=').pop();
      setToken(urltoken);
    },[])

    React.useEffect(()=> {
        setErrorMsg('');
    },[])

    const backtoLogin = () => {
        navigate('/login');
    }


    const checkValidation=()=> {
        if(password !== confirmpassword){
            setErrorMsg('Both the passowrds dont match')
        }
        else if(password.length ===0 || confirmpassword.length === 0)
        {
            setErrorMsg('Please fill in both the fields');
        }
        else {
            resetPassword(token, confirmpassword);
            navigate('/login');
        }
    }

    const resetPasswordAPI= () => {
       
        try {
           checkValidation();
        }
        catch(err) {
            console.error('err', err);
        }    
    }

    const username= JSON.parse(localStorage.getItem('items'));

    const verifyEmailOTPds =  async (ev) => {   
        ev.preventDefault();
        setChecked(true);
        try{
           
            // handleConfirmResetPassword(username,otpcode,password);
             const resutl = verifyEmail(username,otpcode)
            // navigate('/');
            localStorage.removeItem("items")
            setChecked(false);
            setSuccMsg('Your email is verified please login using back button.')
            setOtpcode('');
            setChecked(true);
        }
        catch(err){
            // console.log('thes are the errors', err);
            setErrorMsg(err.message);
            setSuccMsg('')
            setChecked(false);
        }
    }

    const handleKeyDown = (event) => {
        if(event.keyCode==32){
          event.preventDefault();
        }
        
    };

   
 
return(
        <Box sx={{flexGrow: 1, overflow:'hidden'}}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Appside/>
                </Grid>
                <Grid xs={12} sm={6} >
                
                    <Typography mt={16} >
                        <HeaderLogin/>
                    </Typography>

                    <Typography mt={6}>
                        <p className='subheading'>{config.updateOTP}</p>
                    </Typography>
                    {
                            errorMsg.length>0 ?
                            <Typography mt={2}>
                                <p style={{fontSize: 'small', color:'red', justifyContent:'center', display: 'flex'}}>{errorMsg}</p>
                            </Typography> :null
                    }
                     {
                            succMsg.length>0 ?
                            <Typography mt={2}>
                                <p style={{fontSize: 'small', color:'blue', justifyContent:'center', display: 'flex'}}>{succMsg}</p>
                            </Typography> :null
                    }
                     <Typography sx={{justifyContent:'center', display: 'flex' }} mt={2}>    
                        <StyledInput id="outlined-basic" label="Enter the OTP" variant="outlined" onChange={(ev) => setOtpcode(ev.target.value)} 
                                    value={otpcode}   style={{width:'315px'}} type='number'
                                    disabled={isChecked}
                                    required/>        
                    </Typography>
                   
                   
                    <Typography sx={{justifyContent:'center', display: 'flex' }} mt={6}>
                        
                    <Button variant='oulined'  startIcon={<ArrowBack/>} color="#333E5B" style={{marginRight: '150px'}}
                          onClick={backtoLogin}>Back
                        </Button>
                        <PrimaryButton variant='contained' className='buttonPrimarylogin' disabled={isChecked} onClick={verifyEmailOTPds}
                            >{config.validateEmailOtp}
                        </PrimaryButton>
                    </Typography>  
                    <Footer style='140px'/>
 
                </Grid>
            </Grid>
    </Box>
   )
};


export default EmailVerificationPage;