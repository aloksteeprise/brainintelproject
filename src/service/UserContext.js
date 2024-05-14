import React, { useState, useEffect, createContext } from 'react';

import { isAuthenticated } from './Authservice';

import Login from '../component/User/Login';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const localUser = localStorage.getItem('userObject');

  useEffect(() => {
    
    const checkLoggedIn = () => {
      let cuser = isAuthenticated();

      if (cuser.length === undefined) {
        localStorage.setItem('userObject', JSON.stringify({}));
        cuser = '';
      }
      setCurrentUser(cuser);
    };
    checkLoggedIn();
  }, []);

  return (
    <UserContext.Provider value={[currentUser, setCurrentUser]}>
      {localUser ? children : <Login />}
    </UserContext.Provider>
  );
};

export default UserContext;
