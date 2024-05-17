import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { Document, Page, pdfjs } from 'react-pdf';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Typography, TextField, Button, InputAdornment } from '@mui/material';
import { Tooltip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import config from '../../translation/config';
import Appside from '../../layout/Appside/Appside';
import StyledInput from '../../layout/TextInput';
import Pdf from '../../document/ConsentFormat.pdf';
import PrimaryButton from '../../layout/Buton/PrimaryButton';
import HeaderLogin from '../../layout/Header/HeaderLogin';
import Helplink from '../../layout/Header/HelpLink';
import Footer from '../../layout/Footer/Footer';
import { register } from '../../service/Authservice';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import './Login.scss';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    justifyContent: 'center',
    width: '70%',
    height: '90%',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    background: '#FFFFFF',
  },
};

const Registration = (props) => {
  const { setPage } = props;
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [password, setpassword] = React.useState('');
  const [modalShow, setModalShow] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [isChecked, setChecked] = React.useState(false);
  const [errMailMessage, setErrorMailMessage] = React.useState('');
  const [isRequiredMessage, setIsRequiredmsg] = React.useState(false);
  const [signupErrorMesageshow, setSignupErrormsgShow] = React.useState(false);
  const [signupErrorMesage, setSignupErrormsg] = React.useState('');
  const [numPages, setNumPages] = React.useState(null);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [text, setText] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [checkMail, setCheckMail] = React.useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  React.useEffect(() => {
    setChecked(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setpassword('');
    setIsRequiredmsg('');
    setErrorMailMessage('');
    setSignupErrormsg('');
    setSignupErrormsgShow('');

  }, []);
  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  /*handling error conditions*/
  const checkValidation = () => {
    if (
      email.length === 0 ||
      firstName.length === 0 ||
      lastName.length === 0 ||
      password.length === 0
    ) {
      setIsRequiredmsg(true);
    } else if (!validateEmail(email)) {
      setErrorMailMessage('Invalid email');
      setIsRequiredmsg(false);
    } else if (signupErrorMesage.length > 0) {
      setErrorMailMessage('');
      setIsRequiredmsg(false);
      setSignupErrormsgShow(true);
    } else {
      setIsRequiredmsg(false);
      setErrorMailMessage('');
      setSignupErrormsgShow(false);
    }
  };

  /* registration*/
  const signUp = async (ev) => {
    ev.preventDefault();
    
    try {
      checkValidation();
      await register(email, firstName, lastName, password);
      // navigate('/login');
      setCheckMail(true);
      //setPage('link');

      navigate('/Instruction');

    } catch (err) {
      console.error('error', err);
      setSignupErrormsgShow(true);
      if (password.length <= 8 ){
        setSignupErrormsg("Password must be minimum 8 character");
      }
      else{
        setSignupErrormsg(err.message);
      }
    }
  };

  const checkHandler = () => {
    setChecked(!isChecked);
  };

  const onDocumentLoadSuccess = (pdf) => {
    setNumPages(pdf._pdfInfo.numPages);
  };

  const onChangeTerms = () => {
    setModalShow(true);
  };

  React.useEffect(() => {
    localStorage.setItem('registration', JSON.stringify(email));
  }, [email]);

  const handleKeyDown = (event) => {
    if(event.keyCode==32){
      event.preventDefault();
    }
    
};

  return (
    <Grid xs={12} sm={6}>
      <Typography>
        <Helplink />
      </Typography>
      <Typography mt={8}>
        <HeaderLogin />
      </Typography>
      <Typography mt={2}>
        <p className="subheading">{config.registrationHeading}</p>
      </Typography>
      {isRequiredMessage ? (
        <Typography mt={2}>
          <p
            style={{
              fontSize: 'medium',
              color: 'red',
              justifyContent: 'center',
              display: 'flex',
            }}
          >
            Please fill in all the fields
          </p>
        </Typography>
      ) : signupErrorMesageshow ? (
        <Typography mt={2}>
          <p
            style={{
              fontSize: 'small',
              color: 'red',
              justifyContent: 'center',
              display: 'flex',
            }}
          >
            {signupErrorMesage}
          </p>
        </Typography>
      ) : null}
      <Typography sx={{ justifyContent: 'center', display: 'flex' }} mt={2}>
        <StyledInput
          id="outlined-basic"
          label="First Name"
          variant="outlined"
          onKeyDown={handleKeyDown}
          onChange={(ev) => setFirstName(ev.target.value)}
          value={firstName}
          required
        />
      </Typography>
      <Typography sx={{ justifyContent: 'center', display: 'flex' }} mt={2}>
        <StyledInput
          id="outlined-basic"
          label="Last Name"
          variant="outlined"
          onKeyDown={handleKeyDown}
          onChange={(ev) => setLastName(ev.target.value)}
          value={lastName}
          required
        />
      </Typography>
      {errMailMessage.length > 0 && (
        <Typography>
          <p
            style={{
              fontSize: 'small',
              color: 'red',
              justifyContent: 'center',
              display: 'flex',
            }}
          >
            Invalid email pattern
          </p>
        </Typography>
      )}
      <Typography sx={{ justifyContent: 'center', display: 'flex' }} mt={2}>
        <StyledInput
          id="outlined-basic"
          label="Email"
          variant="outlined"
          onChange={(ev) => setEmail(ev.target.value)}
          onKeyDown={handleKeyDown}
          value={email}
          required
        />
      </Typography>
      {/* <Typography sx={{ justifyContent: 'center', display: 'flex' }} mt={2}>
        <StyledInput
          id="outlined-basic"
          label="password"
          variant="outlined"
          type="password"
          onChange={(ev) => setpassword(ev.target.value)}
          value={password}
          required
        />
      </Typography> */}

      <Typography mt={2} sx={{ justifyContent: 'center', display: 'flex' }}>
        <StyledInput
          id="outlined-basic-password1"
          label="Password"
          variant="outlined"
          onKeyDown={handleKeyDown}
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
            inputProps: {
              maxLength: config.passwordmaxlenght
            }
          }}
          onChange={(ev) => setpassword(ev.target.value)}
          value={password}
          required
        />
      </Typography>

      
      <Typography sx={{ justifyContent: 'center', display: 'flex' }} mt={2}>
        <div className="tacbox">
          <input
            className="checkbox-class"
            type="checkbox"
            checked={isChecked}
            onChange={checkHandler}
          />
          <label for="checkbox">
            {' '}
            I agree to these{' '}
            <a href="#" onClick={() => onChangeTerms()}>
              Terms and Conditions
            </a>
            .
          </label>
        </div>
      </Typography>
      <Typography className="button-container" mt={2}>
        <a
          href="#"
          style={{ position: 'relative', right: '8px' }}
          onClick={() => setPage('login')}
        >
          {config.loginRedirect}
        </a>

        <Tooltip
          title={!isChecked ? 'Please accept the terms and conditions' : null}
        >
          <span>
            <PrimaryButton
              variant="contained"
              className="buttonPrimarylogin"
              onClick={signUp}
              disabled={!isChecked}
            >
              {config.registrationButton}
            </PrimaryButton>
          </span>
        </Tooltip>
      </Typography>
      <Footer style="85px" />
      <Modal
        isOpen={modalShow}
        onRequestClose={() => setModalShow(false)}
        ariaHideApp={false}
        style={customStyles}
      >
        <div className="modalClose" onClick={() => setModalShow(false)}>
          X
        </div>
        <Document
          file='https://amplify-brainintelproject-dev-50421-deployment.s3.ap-south-1.amazonaws.com/ConsentFormat.pdf'
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={console.error}
        >
          <Page
            onGetTextSuccess={() => setText(true)}
            loading={'Please wait!'}
            scale={1}
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
          {text && (
            <p>
              Page {pageNumber} of {numPages}
            </p>
          )}
          {text && (
            <PrimaryButton
              variant="contained"
              className="buttonPrimarylogin"
              onClick={() => [setPageNumber(pageNumber - 1), setText(!text)]}
              disabled={numPages > pageNumber}
              style={{ position: 'relative' }}
            >
              Previous
            </PrimaryButton>
          )}
          &nbsp;&nbsp;
          {text && (
            <PrimaryButton
              variant="contained"
              className="buttonPrimarylogin"
              onClick={() => [setPageNumber(pageNumber + 1), setText(!text)]}
              disabled={numPages <= pageNumber}
              style={{ position: 'relative' }}
            >
              {' '}
              Next
            </PrimaryButton>
          )}
        </Document>
      </Modal>
    </Grid>
  );
};

export default Registration;
