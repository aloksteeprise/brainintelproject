import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { UserProvider } from './service/UserContext';

import MainRoutes from './routes';

const App = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <MainRoutes />
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;
