import config from '../../translation/config';
import * as React from 'react';
import companyLogo from './companyLogo.jpeg';

const HeaderLogin = () => {
  return (
    <div style={{ position: 'relative', textAlign: 'center' }}>
      <img
        src="https://amplify-brainintelproject-dev-50421-deployment.s3.ap-south-1.amazonaws.com/companyLogo.jpeg"
        alt="Company Logo"
        style={{
          width: '100px',
          height: 'auto',
          display: 'block',
          margin: '0 auto',
          marginTop: '-15px', // Adjust this value to shift the logo position
        }}
      />
    </div>
  );
};

export default HeaderLogin;
