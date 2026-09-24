import React from 'react';
import axios from 'axios';

export default function CandidateTable({
  candidates,
  vacancy,
  config,
  onUpdated
}) {
  if (!vacancy) {
    return null;
  }

  const requiredSkills = vacancy.skills
    ? vacancy.skills
        .split(',')
        .map(skill => skill.trim().toLowerCase())
        .filter(Boolean)
    : [];

  const calculateCandidate = (candidate) => {
    const candidateSkills = candidate.skills
      ? candidate.skills
          .split(',')
          .map(skill => skill.trim())
          .filter(Boolean)
      : [];

    const normalizedCandidateSkills =
      candidateSkills.map(skill => skill.toLowerCase());

    const matchedSkills = requiredSkills.filter(skill =>
      normalizedCandidateSkills.includes(skill)
    );

    const extraSkills = candidateSkills.filter(
      skill =>
        !requiredSkills.includes(skill.toLowerCase())
    );

    return {
      ...candidate,
      candidateSkills,
      matchedSkills,
      extraSkills
    };
  };

  const processedCandidates = candidates
    .map(calculateCandidate)
    .sort((a, b) => {

      if (b.matchedSkills.length !== a.matchedSkills.length) {
        return (
          b.matchedSkills.length -
          a.matchedSkills.length
        );
      }

      if (b.extraSkills.length !== a.extraSkills.length) {
        return (
          b.extraSkills.length -
          a.extraSkills.length
        );
      }

      return (
        b.experience_years -
        a.experience_years
      );
    });

  const handleInvite = async (candidate) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/candidates/${candidate.id}`,
        {
          full_name: candidate.full_name,
          email: candidate.email,
          experience_years: candidate.experience_years,
          skills: candidate.skills,
          status: 'Interview'
        },
        config
      );

      alert('Кандидат приглашен на собеседование');

      if (onUpdated) {
        onUpdated();
      }

    } catch (err) {
      alert(
        err.response?.data?.detail ||
        'Ошибка при приглашении кандидата'
      );
    }
  };

  if (processedCandidates.length === 0) {
    return (
      <div className="admin-section">
        <h3>Результаты поиска</h3>

        <p>
          Подходящих кандидатов не найдено.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-section">

      <h3>
        Найдено кандидатов: {processedCandidates.length}
      </h3>

      <div style={{ overflowX: 'auto' }}>

        <table
          className="candidates-table"
          style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}
        >

          <thead>
            <tr>
              <th>ФИО</th>
              <th>Email</th>
              <th>Опыт</th>
              <th>Совпадение</th>
              <th>Доп. навыки</th>
              <th>Навыки</th>
              <th>Статус</th>
              <th>Действие</th>
            </tr>
          </thead>

          <tbody>

            {processedCandidates.map(candidate => (

              <tr key={candidate.id}>

                <td>
                  <strong>
                    {candidate.full_name}
                  </strong>
                </td>

                <td>
                  {candidate.email}
                </td>

                <td>
                  {candidate.experience_years} лет
                </td>

                <td>
                  <strong>
                    {candidate.matchedSkills.length}
                  </strong>
                  {' / '}
                  {requiredSkills.length}
                </td>

                <td>
                  {candidate.extraSkills.length}
                </td>

                <td>
                  {candidate.candidateSkills.join(', ')}
                </td>

                <td>
                  {candidate.status}
                </td>

                <td>
                  {candidate.status !== 'Interview' ? (

                    <button
                      onClick={() =>
                        handleInvite(candidate)
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

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}