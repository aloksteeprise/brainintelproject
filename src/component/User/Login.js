import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Appside from '../../layout/Appside/Appside';
import { Typography, TextField, Button } from '@mui/material';
import HeaderLogin from '../../layout/Header/HeaderLogin';
import Helplink from '../../layout/Header/HelpLink';
import Registration from './Registration';
import ForgotPassword from './ForgotPassword';
import InstructionPage from './InstructionPage';
import Footer from '../../layout/Footer/Footer';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PrimaryButton from '../../layout/Buton/PrimaryButton';
import StyledInput from '../../layout/TextInput';
import config from '../../translation/config';
import { login } from '../../service/Authservice';
import {withAuthenticator } from '@aws-amplify/ui-react'

import './Login.scss';

const Login = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [username, setUserName] = React.useState('');
  const [password, setpassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [page, setPage] = React.useState('login');

  localStorage.clear();
  React.useEffect(() => {
    setError(false);
  }, []);

  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const redirectForgot = () => {
    setPage('forgot');
  };

  const redirectRegister = () => {
    setPage('signup');
  };

  const redirectAuthenticator = async (e) => {
    e.preventDefault();

    try {
      setError('');
      await login(username, password);
      navigate('/record');
    } catch (error) {
      if (username.length === 0 || password.length === 0) {
        setError('Please fill in both the fields');
      } else {
        setError('Invalid Credentials');
      }

      console.error('error', error);
    }
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  return (
    <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Appside />
        </Grid>
        {page === 'login' ? (
          <Grid item xs={12} sm={6}>
            <Typography mt={15}>
              <HeaderLogin />
            </Typography>
            <Typography mt={4}>
              <p className="subheading">{config.loginSubheading}</p>
            </Typography>
            {error ? <p className="error-stmt">{error}</p> : null}
            <Typography sx={{ justifyContent: 'center', display: 'flex' }}>
              <StyledInput
                id="outlined-basic"
                label="Email"
                variant="outlined"
                value={username}
                required
                onChange={(ev) => setUserName(ev.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment />,
                }}
              />
            </Typography>
            <Typography
              mt={2}
              sx={{ justifyContent: 'center', display: 'flex' }}
            >
              <StyledInput
                id="outlined-basic-password"
                label="Password"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {showPassword ? (
                        <VisibilityOff onClick={() => setShowPassword(false)} />
                      ) : (
                        <Visibility onClick={() => setShowPassword(true)} />
                      )}
                    </InputAdornment>
                  ),
                }}
                onChange={(ev) => setpassword(ev.target.value)}
                value={password}
                required
              />
            </Typography>

            {/* <div  className='footernote' >
                        {config.loginFooter}<br/> {config.continuedFooterNote}
                        <a href="#" style={{display: 'contents'}}>{config.loginPrivacyPOlicy}</a>
                    </div>  */}
            <Typography
              className="button-container"
              mt={2}
              sx={{ display: 'flex', justifyContent: 'space-evenly' }}
            >
              <a
                href="#"
                onClick={redirectForgot}
                style={{ position: 'relative', right: '8px' }}
              >
                {config.loginForgotPassword}
              </a>
              <PrimaryButton
                variant="contained"
                className="buttonPrimarylogin"
                onClick={redirectAuthenticator}
              >
                {config.loginButton}
              </PrimaryButton>
            </Typography>
            <div className="no-account" onClick={redirectRegister}>
              {' '}
              {config.loginAccount} <a href="#">{config.loginContactUS}</a>
            </div>
            {/* <Footer style="75px" /> */}
          </Grid>
        ) : page === 'signup' ? (
          <Registration setPage={setPage} />
        ) : page === 'forgot' ? (
          <ForgotPassword setPage={setPage} page={page} />
        ) : page === 'link' ? (
          <InstructionPage />
        ) : null}
      </Grid>
    </Box>
  );
};

export default Login; // withAuthenticator(Login);
