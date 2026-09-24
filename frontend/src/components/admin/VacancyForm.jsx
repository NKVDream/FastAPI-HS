import React, { useState } from 'react';
import axios from 'axios';

import { AVAILABLE_SKILLS } from '../../constants/skills';

export default function VacancyForm({ onCreated }) {
  const [title, setTitle] = useState('');
  const [experience, setExperience] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const handleSkillChange = (skill) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      }

      return [...prev, skill];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Введите название вакансии');
      return;
    }

    if (selectedSkills.length === 0) {
      alert('Выберите хотя бы один навык');
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        'http://127.0.0.1:8000/vacancies',
        {
          title: title.trim(),
          required_experience: Number(experience),
          skills: selectedSkills.join(', ')
        },
        config
      );

      alert('Вакансия создана');

      setTitle('');
      setExperience(0);
      setSelectedSkills([]);

      if (onCreated) {
        onCreated();
      }

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
        'Ошибка при создании вакансии'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vacancy-form">

      <h2>Создать вакансию</h2>

      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Название вакансии</label>

          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="..."
            required
          />
        </div>

        <div className="form-group">
          <label>Минимальный опыт (лет)</label>

          <input
            type="number"
            min="0"
            value={experience}
            onChange={e => setExperience(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Требуемые навыки</label>

          <div className="skills-grid">
            {AVAILABLE_SKILLS.map(skill => (
              <label
                key={skill}
                className="skill-option"
              >
                <input
                  type="checkbox"
                  className="skill-checkbox"
                  checked={selectedSkills.includes(skill)}
                  onChange={() => handleSkillChange(skill)}
                />

                <span>{skill}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
        >
          {loading ? 'Создание...' : 'Создать вакансию'}
        </button>

      </form>

    </div>
  );
}