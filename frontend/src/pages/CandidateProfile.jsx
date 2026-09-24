import React, { useEffect, useState } from 'react';
import axios from 'axios';

import NotificationList from '../components/profile/NotificationList';
import ResumeCard from '../components/profile/ResumeCard';
import ResumeForm from '../components/profile/ResumeForm';

export default function CandidateProfile() {

  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const token = localStorage.getItem('token');

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const loadData = async () => {

    try {

      const profileRes = await axios.get(
        'http://127.0.0.1:8000/me/profile',
        config
      );

      const notificationsRes = await axios.get(
        'http://127.0.0.1:8000/me/notifications',
        config
      );

      setProfile(profileRes.data);
      setNotifications(notificationsRes.data);

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

  if (!profile) {
    return (
      <div className="container">
        <p>
          Загрузка профиля...
        </p>
      </div>
    );
  }

  return (
    <div className="container">

      <h2>
        Личный кабинет: {profile.username}
      </h2>

      <NotificationList
        notifications={notifications}
      />

      <div className="section">

        <h3>
          📄 Моя анкета резюме
        </h3>

        {profile.candidate_info ? (

          <ResumeCard
            candidate={profile.candidate_info}
          />

        ) : (

          <ResumeForm
            config={config}
            onCreated={loadData}
          />

        )}

      </div>

    </div>
  );
}