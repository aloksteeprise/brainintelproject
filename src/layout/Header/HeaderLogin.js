import config from '../../translation/config';
import * as React from 'react';
import companyLogo from '../../images/bic.jpeg';


const HeaderLogin = () => {
  return (
    <div style={{ position: 'relative', textAlign: 'center' }}>
      <img
        // // src="src/images/bic.jpeg"
        // className='image-photo-logo'
        src='https://amplify-brainintelproject-dev-50421-deployment.s3.ap-south-1.amazonaws.com/companyLogo.jpeg'
        alt="Company Logo"
        style={{
          width: '100px',
          height: 'auto',
          display: 'block',
          margin: '0 auto',
          marginTop: '-15px', 
        }}
      />
    </div>
  );
};

export default HeaderLogin;
