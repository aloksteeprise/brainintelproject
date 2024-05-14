import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import * as React from 'react';
import Login from './component/User/Login';
//import SignInSide from './component/User/LoginPage';
import './App.css';
import RecorderPage from './component/Recorder/Recorderpage';
import ResetPassword from './component/User/ResetPassword';
import EmailVerification from './component/User/EmailVerification';
import InstructionPage from  './component/User/InstructionPage'

const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/record" element={<RecorderPage />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="/verifyEmail" element={<EmailVerification />} />
      <Route path="/Instruction" element={<InstructionPage />} />
    </Routes>
  );
};

export default MainRoutes;
