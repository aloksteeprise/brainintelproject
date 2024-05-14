import './Footer.scss';
import * as React from 'react';

const Footer = (props) => {
  return (
    <>
      <footer
        className="citeline-footer"
        style={{ marginTop: props.style ? props.style : '30px' }}
      >
        <a
          style={{ color: '#333E5B', fontSize: '15px', fontFamily: 'Proxima' }}
        >
          Copyright @ {new Date().getFullYear()}
        </a>
      </footer>
    </>
  );
};

export default Footer;
