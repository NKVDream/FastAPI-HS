import React, { useState } from 'react';
import axios from 'axios';

import { AVAILABLE_SKILLS } from '../../constants/skills';

export default function ResumeForm({
  config,
  onCreated
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [expYears, setExpYears] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSkillChange = (skill) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(
          selected => selected !== skill
        );
      }

      return [...prev, skill];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert('Введите ФИО');
      return;
    }

    if (!email.trim()) {
      alert('Введите email');
      return;
    }

    if (selectedSkills.length === 0) {
      alert('Пожалуйста, выберите хотя бы один навык');
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        'http://127.0.0.1:8000/candidates',
        {
          full_name: fullName.trim(),
          email: email.trim(),
          experience_years: Number(expYears),
          skills: selectedSkills.join(', ')
        },
        config
      );

      alert('Резюме успешно опубликовано');

      setFullName('');
      setEmail('');
      setExpYears(0);
      setSelectedSkills([]);

      if (onCreated) {
        onCreated();
      }

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
        'Ошибка при создании резюме'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="resume-form"
    >

      <div className="form-group">
        <label>ФИО</label>

        <input
          type="text"
          placeholder="Введите ФИО"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Email</label>

        <input
          type="email"
          placeholder="Введите email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Опыт работы (лет)</label>

        <input
          type="number"
          min="0"
          value={expYears}
          onChange={e => setExpYears(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Выберите ваши навыки</label>

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
        {loading ? 'Публикация...' : 'Создать резюме'}
      </button>

    </form>
  );
}