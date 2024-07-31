import config from '../../translation/config';
import * as React from 'react';
import companyLogo from '../../images/bic.jpeg';


const HeaderLogin = () => {
  return (
    <div style={{ position: 'relative', textAlign: 'center' }}>
      <img
        // // src="src/images/bic.jpeg"
        // className='image-photo-logo'
        src={companyLogo}
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
