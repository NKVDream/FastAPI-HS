import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/auth/login', { username, password });
      const accessToken = response.data.access_token;

      // Получаем профиль для определения роли
      const profileRes = await axios.get('http://127.0.0.1:8000/me/profile', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      localStorage.setItem('token', accessToken);
      localStorage.setItem('role', profileRes.data.role);

      // Перенаправляем в зависимости от роли
      if (profileRes.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="auth-container">
      <h2>Вход в систему</h2>
      <form onSubmit={handleLogin} className="auth-form">
        <div className="form-group">
          <label>Логин:</label>
          <input type="text" onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Пароль:</label>
          <input type="password" onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn-submit">Войти</button>
      </form>
      <p className="switch-text">
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </div>
  );
}
