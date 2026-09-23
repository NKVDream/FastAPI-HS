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
      // ВОТ ЗДЕСЬ ВСЁ ИСПРАВЛЕНО: ПРАВИЛЬНЫЙ АДРЕС И ПУТЬ БЭКЕНДА
      await axios.post('http://127.0.0.1:8000/auth/register', { username, password, role });
      alert('Регистрация успешна!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при регистрации');
    }
  };

  return (
    <div className="auth-container">
      <h2>Регистрация</h2>
      <form onSubmit={handleRegister} className="auth-form">
        <div className="form-group">
          <label>Логин:</label>
          <input type="text" onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Пароль:</label>
          <input type="password" onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Кто вы?</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="candidate">Соискатель (Кандидат)</option>
            <option value="admin">Работодатель (Администратор)</option>
          </select>
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn-submit">Создать аккаунт</button>
      </form>
      <p className="switch-text">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
}
