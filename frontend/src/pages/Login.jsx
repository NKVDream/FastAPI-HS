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
      const response = await axios.post(
        'http://127.0.0.1:8000/auth/login',
        {
          username,
          password
        }
      );

      const accessToken = response.data.access_token;

      localStorage.setItem('token', accessToken);

      const profileRes = await axios.get(
        'http://127.0.0.1:8000/me/profile',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      localStorage.setItem('role', profileRes.data.role);

      if (profileRes.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }

    } catch (err) {
      console.error('Ошибка авторизации:', err);

      setError(
        err.response?.data?.detail ||
        'Неверный логин или пароль'
      );
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-header">

          <div className="auth-label">
            HR PLATFORM
          </div>

          <h2>
            Вход в систему
          </h2>

          <p className="auth-description">
            Авторизуйтесь для доступа к личному кабинету.
          </p>

        </div>


        <form
          onSubmit={handleLogin}
          className="auth-form"
        >

          <div className="form-group">

            <label>
              Логин
            </label>

            <input
              type="text"
              value={username}
              placeholder="Введите логин"
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
            />

          </div>


          <div className="form-group">

            <label>
              Пароль
            </label>

            <input
              type="password"
              value={password}
              placeholder="Введите пароль"
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>


          {error && (
            <p className="error-text">
              {error}
            </p>
          )}


          <button
            type="submit"
            className="btn-submit"
          >
            Войти
          </button>

        </form>


        <p className="switch-text">
          Нет аккаунта?{' '}
          <Link to="/register">
            Зарегистрироваться
          </Link>
        </p>

      </div>

    </div>
  );
}