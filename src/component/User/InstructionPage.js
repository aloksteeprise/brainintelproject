import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Typography, TextField, Button, InputAdornment } from '@mui/material';
import { Tooltip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import config from '../../translation/config';
import Appside from '../../layout/Appside/Appside';
import StyledInput from '../../layout/TextInput';
import Pdf from '../../document/ConsentFormat.pdf';
import PrimaryButton from '../../layout/Buton/PrimaryButton';
import Grid from '@mui/material/Grid';

import HeaderLogin from '../../layout/Header/HeaderLogin'
import Helplink from '../../layout/Header/HelpLink';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Footer from '../../layout/Footer/Footer';
import { verifyEmail,resendSignUp } from '../../service/Authservice';

const InstructionPage = (props) => {
  //const {setPage} =props;

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [errorMsg, setErrorMsg] = React.useState('');
  const navigate = useNavigate();


  React.useEffect(() => {
    const username = JSON.parse(localStorage.getItem('registration'));
    setEmail(username);
    setPassword('');


  }, []);

  const verifyEmailOTP = async (ev) => {
    ev.preventDefault();
    try {
      if (!password) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
  
      if (password.length !== 6) {
        setErrorMsg('Password must be exactly 6 characters long.');
        return;
      }
      setErrorMsg('');
  
      // Continue with verification if password meets criteria
      await verifyEmail(email, password);
      navigate('/verifyEmail');
    } catch (err) {
      console.log('These are the errors:', err);
      setErrorMsg('Invalid Otp');
    }
  }
  // const resendEmailOTP = async (ev) => {
  //   ev.preventDefault();
  
  // debugger;
  //     // Continue with verification if password meets criteria
  //     await resendSignUp(email);
    
  // }
  



  return (
    <Grid xs={12} sm={6} >
      <Typography >
        <Helplink />
      </Typography>
      <Typography mt={22}>
        <HeaderLogin />
      </Typography>
      <Typography mt={6}>
        <p style={{ textAlign: 'center' }}>Thankyou for your interest in Happiness Index</p>
        {/* <p style={{textAlign: 'center'}}>Instructions have been sent your mail id. </p>
                <p style={{textAlign: 'center'}}>Please verify</p> */}



      </Typography>

      <Typography sx={{ justifyContent: 'center', display: 'none' }} mt={2}>
        <StyledInput
          id="outlined-basic"
          label="Email"
          variant="outlined"
          value=""
          disabled
        />
      </Typography>

      <Typography mt={2} sx={{ justifyContent: 'center', display: 'flex' }}>
        <StyledInput
          id="outlined-basic-password"
          label="OTP"
          variant="outlined"
          type="text"
          onChange={(ev) => setPassword(ev.target.value)}
          value={password}
          required
        />
      </Typography>
      <Typography className="error-message" color="error" mt={2} sx={{ justifyContent: 'center', display: 'flex' }}>
        {errorMsg}
      </Typography>


      <Typography className="button-container" mt={2}>



        <PrimaryButton
          variant="contained"
          className=""

          onClick={verifyEmailOTP}

        >
          {config.verifyButton}
        </PrimaryButton>

      </Typography>
      {/* <Typography className="button-container" mt={2}>



<PrimaryButton
  variant="contained"
  className=""

  onClick={resendEmailOTP}

>
  {config.resendOtp}
</PrimaryButton>

</Typography> */}


    </Grid>
  )
}

export default InstructionPage;