import axios from 'axios';
import jwtDecode from 'jwt-decode';

import { fetchAuthSession, getCurrentUser, signIn, signOut, verifyTOTPSetup, signUp,confirmSignUp  } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import AWS from 'aws-sdk';
import awsconfig from '../aws-exports';
import {withAuthenticator } from '@aws-amplify/ui-react'
import { confirmResetPassword ,resendSignUpCode,updatePassword,sendUserAttributeVerificationCode,updateUserAttribute } from 'aws-amplify/auth';

import { resetPassword as awsResetPassword  } from 'aws-amplify/auth';
Amplify.configure(awsconfig, {ssr: true})


var albumBucketName = 'amplify-brainintelproject-dev-50421-deployment';
  var bucketRegion = 'ap-south-1';
  var IdentityPoolIdt = 'ap-south-1:9ed22e29-51b1-4d95-84a6-e10ab74b8ce3';

  AWS.config.region = bucketRegion; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolIdt,
  });
  AWS.config.update({
    region: bucketRegion,
    apiVersion: 'latest',
    credentials: {
      accessKeyId: 'AKIATZJIQJPCSOHHC4WG',
      secretAccessKey: '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',
    },
  });

  var s3 = new AWS.S3({
    apiVersion: '2012-10-17',
    params: { Bucket: albumBucketName },
  });

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

  if (response && response.isSignedIn) {
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
    
    result = '1-'+username;
    if(response.isSignedIn){
      const userObject = { userId: username, userInfo: "" };
      localStorage.setItem('userObject', JSON.stringify(userObject));

    }
  } 
  else {
    if(response){
      const userObject = { userId: "", userInfo: "" };
      localStorage.setItem('userObject', JSON.stringify(userObject));
      if(response.nextStep.signInStep = 'CONFIRM_SIGN_UP'){
        result = '0-'+'Email id is not verified.';

      }
      else{
        result = '0-'+'Invalid username and password';

      }
    }
    
  }

  return result;
};

export const verifyEmail = async (email, verificationCode) => {
  const response =await confirmSignUp({
    username: email,
    confirmationCode: verificationCode
  });
  return response;
};

export const resendSignUp = async (username) => {
  try {
   
    await resendSignUpCode({email: username});
    console.log('Confirmation code resent successfully'); 
  } catch (error) {
    console.error('Error resending confirmation code:', error);
  }
};

export const validateEmailSendOtp = async (username) => {
  let result = '';
  try {
   
     result = await resendSignUpCode({username});
     result = '1-'+ 'Confirmation code resent successfully';
    console.log('Confirmation code resent successfully'); 
   
  } catch (error) {
    result = '0-'+ error.message;
    console.error('Error resending confirmation code:', error);
  }
  return result;
};
export const userAttributeVerificationCode = async (email, verificationCode) => {
  let result;
  try{
    await updateUserAttribute(email,verificationCode);
    result = '1-'+'Success';
  }
  catch(error){
    result = '0-'+ error.message;
  }
  return result;
};
// Define the handleConfirmResetPassword function

export const handleConfirmResetPassword = async ( username,confirmationCode,  newPassword ) => {
  let result;
  try {
     await confirmResetPassword({username,confirmationCode,  newPassword });
    result = '1-'+'Success';
  } catch (error) {
    result = '0-'+ error.message;
  }
  return result;
};

export const handleUpdatePassword = async  (oldPassword, newPassword) =>{
  let isPasswordChangeDone ='';
  try {
    
    const result =  await updatePassword({ oldPassword, newPassword });
    isPasswordChangeDone = '1-'+ '' + result;
    return isPasswordChangeDone;

  } catch (err) {
    isPasswordChangeDone = '0-'+ '' + err.message;
    return isPasswordChangeDone;
  }
}


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
  let responseMesage='';
  try {
   
   
    const output = await awsResetPassword({ username });
   const message= handleResetPasswordNextSteps(output);
   responseMesage = '1'+'-'+message;
  } catch (error) {

    if(error.name)
      {
        //responseMesage= error.message;
        responseMesage = '0'+'-'+error.message;
      }
      
    
    console.log(error);
  }
  return responseMesage;
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

export const handleSignOut = async () => {
  try {
     await signOut();
  } catch (error) {
    console.log('error signing out: ', error);
    handlerLogs(error.message)
  }
}

export const handlerLogs = async (message) => {
  const loginUser = getLoginUserName();
  const url = window.location.href;
  const body = url +' - '+ loginUser +' - '+ message;
  const date = new Date().toISOString().split('T')[0];
  const logFileName = `logs_${date}.txt`;
  const bucketName = albumBucketName  // Replace with your bucket name
  const folderName='Logs'
  const params = {
      Bucket: albumBucketName,
      Key: `${folderName}/${logFileName}`,
      Body: `${new Date().toISOString()}: ${body}\n`,
      ContentType: 'text/plain',
      ACL: 'private'
  };

  try {
      // Check if the file already exists
      const existingObject = await s3.getObject({ Bucket: bucketName, Key: params.Key }).promise();
      params.Body = existingObject.Body.toString() + params.Body;
  } catch (err) {
      // File does not exist, proceed with new log
      if (err.code !== 'NoSuchKey') {
          throw err;
      }
  }

  try {
      await s3.putObject(params).promise();
      return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Log written successfully' }),
      };
  } catch (err) {
      return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to write log' }),
      };
  }
};


const getLoginUserName = () => {
  const userInfo =  JSON.parse(localStorage.getItem('userObject'));
  let id ='';
  if(userInfo){
    id = userInfo?.userId;
  }
 return id;
};
