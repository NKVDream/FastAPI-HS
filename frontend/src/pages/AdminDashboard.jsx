import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [vacancies, setVacancies] = useState([]);
  const [selectedVacancy, setSelectedVacancy] = useState('');
  const [matchedCandidates, setMatchedCandidates] = useState([]);

  const token = localStorage.getItem('token');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // ============================================================
  // Загрузка вакансий
  // ============================================================

  useEffect(() => {
    const loadVacancies = async () => {
      try {
        const response = await axios.get(
          'http://127.0.0.1:8000/vacancies'
        );

        setVacancies(response.data);

      } catch (err) {
        console.error(
          'Ошибка загрузки вакансий:',
          err
        );
      }
    };

    loadVacancies();
  }, []);

  // ============================================================
  // Поиск подходящих кандидатов
  // ============================================================

  const handleSearch = async (vacancyId) => {
    setSelectedVacancy(vacancyId);

    if (!vacancyId) {
      setMatchedCandidates([]);
      return;
    }

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/search/match-candidates/${vacancyId}`,
        config
      );

      setMatchedCandidates(response.data);

    } catch (err) {
      console.error(
        'Ошибка поиска кандидатов:',
        err
      );

      alert(
        err.response?.data?.detail ||
        'Ошибка при поиске кандидатов'
      );
    }
  };

  // ============================================================
  // Приглашение кандидата
  // ============================================================

  const handleInvite = async (candidateId) => {
    const candidate = matchedCandidates.find(
      c => c.id === candidateId
    );

    if (!candidate) {
      return;
    }

    try {
      await axios.put(
        `http://127.0.0.1:8000/candidates/${candidateId}`,
        {
          full_name: candidate.full_name,
          email: candidate.email,
          experience_years: candidate.experience_years,
          skills: candidate.skills,
          status: 'Interview'
        },
        config
      );

      alert('Кандидат приглашен!');

      // Обновляем список кандидатов
      handleSearch(selectedVacancy);

    } catch (err) {
      console.error(
        'Ошибка приглашения кандидата:',
        err
      );

      alert(
        err.response?.data?.detail ||
        'Ошибка при приглашении кандидата'
      );
    }
  };

  // ============================================================
  // Интерфейс
  // ============================================================

  return (
    <div className="container">

      <h2>Панель поиска кандидатов (Админ)</h2>

      {/* ======================================================
          Выбор вакансии
      ====================================================== */}

      <div className="form-group">

        <label>
          Выберите вакансию компании:
        </label>

        <select
          value={selectedVacancy}
          onChange={(e) => handleSearch(e.target.value)}
        >

          <option value="">
            -- Выберите вакансию --
          </option>

          {vacancies.map((vacancy) => (

            <option
              key={vacancy.id}
              value={vacancy.id}
            >
              {vacancy.title}
            </option>

          ))}

        </select>

      </div>


      {/* ======================================================
          Таблица кандидатов
      ====================================================== */}

      {selectedVacancy && (

        <table
          className="candidates-table"
          border="1"
          style={{
            width: '100%',
            marginTop: '20px',
            borderCollapse: 'collapse'
          }}
        >

          <thead>

            <tr>
              <th>ФИО</th>
              <th>Email</th>
              <th>Опыт</th>
              <th>Навыки</th>
              <th>Статус</th>
              <th>Действие</th>
            </tr>

          </thead>

          <tbody>

            {matchedCandidates.length === 0 ? (

              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: 'center' }}
                >
                  Подходящие кандидаты не найдены
                </td>
              </tr>

            ) : (

              matchedCandidates.map((candidate) => (

                <tr key={candidate.id}>

                  <td>
                    {candidate.full_name}
                  </td>

                  <td>
                    {candidate.email}
                  </td>

                  <td>
                    {candidate.experience_years} г.
                  </td>

                  <td>
                    {candidate.skills}
                  </td>

                  <td>
                    {candidate.status}
                  </td>

                  <td>

                    {candidate.status !== 'Interview' ? (

                      <button
                        onClick={() =>
                          handleInvite(candidate.id)
                        }
                      >
                        Пригласить
                      </button>

                    ) : (

                      <span>
                        Приглашен
                      </span>

                    )}

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      )}

    </div>
  );
}