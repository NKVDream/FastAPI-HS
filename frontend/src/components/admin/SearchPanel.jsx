import React from 'react';

export default function SearchPanel({ vacancy }) {
  if (!vacancy) {
    return (
      <div className="admin-section">
        <h3>Поиск кандидатов</h3>

        <p>
          Выберите вакансию, чтобы начать
          многокритериальный поиск кандидатов.
        </p>
      </div>
    );
  }

  const skills = vacancy.skills
    ? vacancy.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="admin-section">

      <h3>
        Поиск кандидатов: {vacancy.title}
      </h3>

      <p>
        Минимальный опыт:{' '}
        <strong>
          {vacancy.required_experience} лет
        </strong>
      </p>

      <div>
        <strong>Требуемые навыки:</strong>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '10px'
          }}
        >
          {skills.map(skill => (
            <span
              key={skill}
              style={{
                padding: '5px 10px',
                borderRadius: '4px',
                background: '#e8f7fa',
                color: '#009fc0',
                fontSize: '14px'
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}