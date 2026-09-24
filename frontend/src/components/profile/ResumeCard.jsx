import React from 'react';

export default function ResumeCard({ candidate }) {
  return (
    <div className="resume-display">

      <p>
        <strong>ФИО:</strong>{' '}
        {candidate.full_name}
      </p>

      <p>
        <strong>Email:</strong>{' '}
        {candidate.email}
      </p>

      <p>
        <strong>Опыт:</strong>{' '}
        {candidate.experience_years} г.
      </p>

      <p>
        <strong>Навыки:</strong>{' '}
        {candidate.skills}
      </p>

      <p>
        <strong>Статус:</strong>{' '}

        <span className="status-badge">
          {candidate.status}
        </span>

      </p>

    </div>
  );
}