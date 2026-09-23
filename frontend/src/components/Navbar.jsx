import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">HR-Portal</div>
      <div className="nav-links">
        {!token ? (
          <>
            <Link to="/login">Вход</Link>
            <Link to="/register">Регистрация</Link>
          </>
        ) : (
          <>
            {role === 'admin' && <Link to="/admin">Поиск кадров</Link>}
            {role === 'candidate' && <Link to="/profile">Личный кабинет</Link>}
            <button onClick={logout} className="btn-logout-nav">Выйти</button>
          </>
        )}
      </div>
    </nav>
  );
}
