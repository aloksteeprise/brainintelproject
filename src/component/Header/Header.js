import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import './Header.scss';

const Header = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const currentUser = localStorage.getItem('userObject');

  const onCloseHandler = () => {
    navigate('/login');
    setOpen(false);
    // localStorage.removeItem('userObject');
    // localStorage.removeItem('user');
    // localStorage.removeItem('userid');
    // localStorage.removeItem('userInfo');
    localStorage.clear();
    //asdasdasdsa

  };

  const [user, setUser] = useState();

  useEffect(() => {
    if (currentUser) {
      let u = JSON.parse(currentUser);
      if (u.userInfo) {
        let name = u.userInfo.split('@')[0];
        setUser({ ...u, name: name });
      }
    }
  }, [currentUser]);

  useEffect(() => {
    document.addEventListener('click', onRemoveHandler, true);
  }, []);

  const onRemoveHandler = () => {
    setOpen(false);
  };
  return (
    <div className="about">
      <span className="aham">अहं ब्रह्मास्मि</span>
      <div className="about-text" onClick={() => setOpen(true)}>
        {user?.name?.charAt(0).toUpperCase()}
      </div>
      <div id="modal" className={open ? 'open' : ''}>
        <div className="container">
          <div className="user-text">{user?.name}</div>
          <div className="user-text">{user?.userId}</div>
          <button className="logout-button" onClick={() => onCloseHandler()}>
            <LogoutIcon />
            &nbsp;&nbsp;<span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
