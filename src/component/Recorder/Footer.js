import React from 'react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#333e5b',
        color: 'white',
        padding: '10px',
        textAlign: 'center',
        position: 'fixed',
        bottom: '0',
        width: '100%',
        fontSize: '15px',
        fontFamily: 'Roboto, sans-serif',
        zIndex: '9999', // Ensure the footer is above other content
      }}
    >
      For R&D purposes only
    </footer>
  );
};

export default Footer;
