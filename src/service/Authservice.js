import axios from 'axios';
import jwtDecode from 'jwt-decode';

import { fetchAuthSession, getCurrentUser, signIn, signOut, verifyTOTPSetup, signUp,confirmSignUp  } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import awsconfig from '../aws-exports';
import {withAuthenticator } from '@aws-amplify/ui-react'
import { confirmResetPassword ,resendSignUpCode} from 'aws-amplify/auth';

import { resetPassword as awsResetPassword  } from 'aws-amplify/auth';
Amplify.configure(awsconfig);

function decodeJWT(token) {
  if (!token) return;
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace;
}

const host = 'https://velocite.link/';


export const login = async (username, password) => {
  //   const response = await axios.post(`${host}users/login`, {
  
  /*const response = await axios.post(
    `https://dqxrg92yu7.execute-api.ap-south-1.amazonaws.com/prod/login`,
    {
      email: username,
      password: password,
    }
  );
  */

 

  const response = await signIn({ username: username, password: password});
  console.log(response);

  let result;

  if (response) {
    console.log('success');
    // const headers = response?.headers;
    // const authHeader = String(response.headers['authorization'] || '');
    // if (authHeader.startsWith('Bearer ')) {
    //   const token = authHeader.substring(7, authHeader.length);
    //   const payload = jwtDecode(token);
    //   localStorage.setItem('userInfo', payload?.sub);
    //   const userObject = { userId: headers.userid, userInfo: payload?.sub };
    //   localStorage.setItem('userObject', JSON.stringify(userObject));
    // }

    result = username;
    if(response.isSignedIn){
      const userObject = { userId: username, userInfo: "" };
      localStorage.setItem('userObject', JSON.stringify(userObject));

    }
  } else {
    const userObject = { userId: "", userInfo: "" };
    localStorage.setItem('userObject', JSON.stringify(userObject));
    result = 'Invalid username and password';
  }

  return result;
};

export const verifyEmail = async (email, verificationCode) => {

  debugger
  const response =await confirmSignUp({
    username: email,
    confirmationCode: verificationCode
  });
  return response;
};

// export const resendSignUp = async (username) => {
//   try {
//     debugger;
//     await resendSignUpCode({email: username});
//     console.log('Confirmation code resent successfully'); 
//   } catch (error) {
//     console.error('Error resending confirmation code:', error);
//   }
// };

// Define the handleConfirmResetPassword function

export const handleConfirmResetPassword = async ( username,confirmationCode,  newPassword ) => {
  try {
    debugger;
    await confirmResetPassword({username,confirmationCode,  newPassword });
  } catch (error) {
    console.log(error);
  }
};


export const register = async (email, firstName, lastName, password) => {
  
  const response = await signUp({
    username: email, // Assuming email as the username
    password: password,
    attributes: {
        email: email,
        given_name: firstName,
        family_name: lastName
    }
});
  

  
  
  /*
  const response = await axios.post(
    `https://dqxrg92yu7.execute-api.ap-south-1.amazonaws.com/prod/register`,
    {
      email: email,
      firstName: firstName,
      lastName: lastName,
      password: password,
    }
  );

  */

  let result;
  const userId = response?.userId;
  if (userId) {
    result = true;
  } else {
    result = false;
  }

  return result;
};




export const resetPassword = async function handleResetPassword(username) {
  try {
    debugger;
    const output = await awsResetPassword({ username });
    handleResetPasswordNextSteps(output);
  } catch (error) {
    console.log(error);
  }
};


export const forgotPassowrd = async (email) => {
  let forgotPassowrdResponse;
  // const response = await axios.post(`${host}users/password-reset-request`, {

  /*
  const response = await axios.post(
    `https://dqxrg92yu7.execute-api.ap-south-1.amazonaws.com/prod/password-reset-request`,
    {
      email: email,
    }
  );
  */
  const response = await resetPassword({ email });
  forgotPassowrdResponse =handleResetPasswordNextSteps(response);
  return forgotPassowrdResponse;
};

function handleResetPasswordNextSteps(output) {
  const { nextStep } = output;
  let forgotPassowrdResponse1;
  switch (nextStep.resetPasswordStep) {
    case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
      const codeDeliveryDetails = nextStep.codeDeliveryDetails;
      forgotPassowrdResponse1 =`Confirmation code was sent to ${codeDeliveryDetails.deliveryMedium}`;
      // Collect the confirmation code from the user and pass to confirmResetPassword.
      break;
    case 'DONE':
      forgotPassowrdResponse1 =`Successfully reset password.`;
      break;
  }
  return forgotPassowrdResponse1
}


// export const resetPassword = async (token, newPassword) => {
//   // const response = await axios.post(
//   //   `https://dqxrg92yu7.execute-api.ap-south-1.amazonaws.com/prod/password-reset`,
//   //   {
//   //     token: token,
//   //     password: newPassword,
//   //   }
//   // );
//   console.log('response');
//   //console.log(response);
// };

export const isAuthenticated = () => {
  const user = localStorage.getItem('userObject');
  if (!user) {
    console.log('authenticate');
    return {};
  }
  return user;
};
