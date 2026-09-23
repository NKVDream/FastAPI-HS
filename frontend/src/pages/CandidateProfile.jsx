import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Список доступных навыков для выбора
const AVAILABLE_SKILLS = [
  "C#",
  "SQL",
  "Git",
  "Entity Framework",
  "FastAPI",
  "Python",
  "React",
  "Docker"
];

export default function CandidateProfile() {
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [expYears, setExpYears] = useState(0);

  // Выбранные навыки
  const [selectedSkills, setSelectedSkills] = useState([]);

  const token = localStorage.getItem('token');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // ============================================================
  // Загрузка профиля и уведомлений
  // ============================================================

  const loadData = async () => {
    try {
      // Получаем профиль текущего пользователя
      const profileRes = await axios.get(
        'http://127.0.0.1:8000/me/profile',
        config
      );

      // Получаем уведомления текущего пользователя
      const notifyRes = await axios.get(
        'http://127.0.0.1:8000/me/notifications',
        config
      );

      setProfile(profileRes.data);
      setNotifications(notifyRes.data);

    } catch (err) {
      console.error(
        'Ошибка загрузки данных профиля:',
        err
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // Выбор навыков
  // ============================================================

  const handleSkillChange = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(
        selectedSkills.filter(s => s !== skill)
      );
    } else {
      setSelectedSkills([
        ...selectedSkills,
        skill
      ]);
    }
  };

  // ============================================================
  // Создание резюме
  // ============================================================

  const handleCreateResume = async (e) => {
    e.preventDefault();

    if (selectedSkills.length === 0) {
      alert('Пожалуйста, выберите хотя бы один навык!');
      return;
    }

    try {
      // Превращаем массив навыков:
      // ["C#", "SQL", "Git"]
      //
      // в строку:
      // "C#, SQL, Git"
      const skillsString = selectedSkills.join(', ');

      await axios.post(
        'http://127.0.0.1:8000/candidates',
        {
          full_name: fullName,
          email: email,
          experience_years: parseInt(expYears),
          skills: skillsString
        },
        config
      );

      alert('Резюме успешно опубликовано!');

      // После создания заново загружаем профиль
      loadData();

    } catch (err) {
      console.error(
        'Ошибка создания резюме:',
        err
      );

      alert(
        err.response?.data?.detail ||
        'Ошибка при создании резюме'
      );
    }
  };

  // ============================================================
  // Пока профиль загружается
  // ============================================================

  if (!profile) {
    return (
      <div className="container">
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  // ============================================================
  // Страница кандидата
  // ============================================================

  return (
    <div className="container">

      {/* ======================================================
          Заголовок
      ====================================================== */}

      <h2>
        Личный кабинет: {profile.username}
      </h2>


      {/* ======================================================
          Уведомления
      ====================================================== */}

      <div className="section">

        <h3>🔔 Уведомления</h3>

        {notifications.length === 0 ? (
          <p>Нет новых уведомлений</p>
        ) : (

          notifications.map((notification) => (

            <div
              key={notification.id}
              className="notification-card"
            >
              ✨ {notification.message}
            </div>

          ))

        )}

      </div>


      {/* ======================================================
          Резюме кандидата
      ====================================================== */}

      <div className="section">

        <h3>📄 Моя анкета резюме</h3>

        {profile.candidate_info ? (

          // ====================================================
          // Если резюме уже существует
          // ====================================================

          <div className="resume-display">

            <p>
              <strong>ФИО:</strong>{' '}
              {profile.candidate_info.full_name}
            </p>

            <p>
              <strong>Email:</strong>{' '}
              {profile.candidate_info.email}
            </p>

            <p>
              <strong>Опыт:</strong>{' '}
              {profile.candidate_info.experience_years} г.
            </p>

            <p>
              <strong>Навыки:</strong>{' '}
              {profile.candidate_info.skills}
            </p>

            <p>
              <strong>Статус:</strong>{' '}

              <span className="status-badge">
                {profile.candidate_info.status}
              </span>

            </p>

          </div>

        ) : (

          // ====================================================
          // Если резюме ещё не создано
          // ====================================================

          <form
            onSubmit={handleCreateResume}
            className="resume-form"
          >

            {/* ФИО */}

            <div className="form-group">

              <input
                type="text"
                placeholder="ФИО"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                required
              />

            </div>


            {/* Email */}

            <div className="form-group">

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>


            {/* Опыт */}

            <div className="form-group">

              <input
                type="number"
                placeholder="Опыт (лет)"
                min="0"
                value={expYears}
                onChange={(e) =>
                  setExpYears(e.target.value)
                }
                required
              />

            </div>


            {/* =================================================
                Навыки
            ================================================= */}

            <div className="form-group skills-selector">

              <label>
                <strong>
                  Выберите ваши ключевые навыки:
                </strong>
              </label>

              <div
                className="skills-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginTop: '10px'
                }}
              >

                {AVAILABLE_SKILLS.map((skill) => (

                  <label
                    key={skill}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >

                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() =>
                        handleSkillChange(skill)
                      }
                    />

                    {skill}

                  </label>

                ))}

              </div>

            </div>


            {/* =================================================
                Кнопка
            ================================================= */}

            <button
              type="submit"
              className="btn-submit"
              style={{ marginTop: '15px' }}
            >
              Создать резюме
            </button>

          </form>

        )}

      </div>

    </div>
  );
}