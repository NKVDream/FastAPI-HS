import React from 'react';

export default function VacancySelector({
    vacancies,
    selectedVacancy,
    onSelect
}) {
    return (
        <div className="vacancy-selector">
            <label htmlFor="vacancy-select">
                Выберите вакансию компании:
            </label>

            <select
                id="vacancy-select"
                value={selectedVacancy}
                onChange={(e) => onSelect(e.target.value)}
                className="vacancy-select"
            >
                <option value="">-- Выберите вакансию --</option>

                {vacancies.map((vacancy) => (
                    <option key={vacancy.id} value={vacancy.id}>
                        {vacancy.title}
                    </option>
                ))}
            </select>
        </div>
    );
}