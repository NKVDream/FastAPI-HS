import React, { useEffect, useState } from 'react';
import axios from 'axios';

import VacancyForm from '../components/admin/VacancyForm';
import VacancySelector from '../components/admin/VacancySelector';
import SearchPanel from '../components/admin/SearchPanel';
import CandidateTable from '../components/admin/CandidateTable';

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

  const searchCandidates = async (vacancyId) => {

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

      setMatchedCandidates([]);
    }
  };

  useEffect(() => {
    loadVacancies();
  }, []);

  const currentVacancy = vacancies.find(
    vacancy =>
      String(vacancy.id) === String(selectedVacancy)
  );

  return (
    <div className="container">

      <h2>
        Панель поиска кандидатов
      </h2>

      <VacancyForm
        config={config}
        onCreated={loadVacancies}
      />

      <VacancySelector
        vacancies={vacancies}
        selectedVacancy={selectedVacancy}
        onSelect={searchCandidates}
      />

      <SearchPanel
        vacancy={currentVacancy}
      />

      <CandidateTable
        candidates={matchedCandidates}
        vacancy={currentVacancy}
        config={config}
        onUpdated={() =>
          searchCandidates(selectedVacancy)
        }
      />

    </div>
  );
}