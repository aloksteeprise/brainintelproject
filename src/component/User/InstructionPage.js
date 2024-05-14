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
import {verifyEmail} from '../../service/Authservice';

const InstructionPage = (props) => {
    //const {setPage} =props;

    const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const navigate = useNavigate();
 
  
  React.useEffect(() => {
  
    setEmail('');
    setPassword('');
  
  }, []);

    const verifyEmailOTP =  async (ev) => {
        ev.preventDefault();
        debugger;
        try{
            verifyEmail(email,password);
            navigate('/verifyEmail');
        }
        catch(err){
            console.log('thes are the errors', err);
        }
    }
   


    return(
        <Grid xs={12} sm={6} >
            <Typography >
                <Helplink />
            </Typography>
            <Typography  mt={22}>
                <HeaderLogin/>
            </Typography>
            <Typography mt={6}>
                <p style={{textAlign: 'center'}}>Thankyou for your interest in Happiness Index</p>
                {/* <p style={{textAlign: 'center'}}>Instructions have been sent your mail id. </p>
                <p style={{textAlign: 'center'}}>Please verify</p> */}

           

            </Typography> 

            <Typography sx={{ justifyContent: 'center', display: 'flex' }} mt={2}>
        <StyledInput
          id="outlined-basic"
          label="Email"
          variant="outlined"
          onChange={(ev) => setEmail(ev.target.value)}
          value={email}
          required
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


      <Typography className="button-container" mt={2}>
       

        
            <PrimaryButton
              variant="contained"
              className=""
              onClick={verifyEmailOTP}
            
            >
              {config.verifyButton}
            </PrimaryButton>
         
      </Typography>
            
            {/* <div>
            <h2>Sign Up</h2>
            <form onSubmit={verifyEmailOTP}>
                
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={email} onChange={(ev) => setEmail(ev.target.value)} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" name="password" value={password} onChange={(ev) => setpassword(ev.target.value)} required />
                </div>
                <button type="submit">verify</button>
            </form>
           
        </div>
            <Footer style='240px'/>     */}
        </Grid>
    )
}

export default InstructionPage;