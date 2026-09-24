import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Registration() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [error, setError] = useState('');

  const navigate = useNavigate();


  const handleRegister = async (e) => {

    e.preventDefault();
    setError('');

    try {

      await axios.post(
        'http://127.0.0.1:8000/auth/register',
        {
          username,
          password,
          role
        }
      );

      alert('Регистрация успешна!');

      navigate('/login');

    } catch (err) {

      console.error('Ошибка регистрации:', err);

      setError(
        err.response?.data?.detail ||
        'Ошибка при регистрации'
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
            Создание аккаунта
          </h2>

          <p className="auth-description">
            Создайте учетную запись для работы с платформой.
          </p>

        </div>


        <form
          onSubmit={handleRegister}
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


          <div className="form-group">

            <label>
              Тип аккаунта
            </label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
            >

              <option value="candidate">
                Соискатель
              </option>

              <option value="admin">
                Работодатель
              </option>

            </select>

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
            Создать аккаунт
          </button>

        </form>


        <p className="switch-text">

          Уже есть аккаунт?{' '}

          <Link to="/login">
            Войти
          </Link>

        </p>

      </div>

    </div>

  );
}