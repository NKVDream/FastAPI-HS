import React from 'react';

export default function NotificationList({
  notifications
}) {
  return (
    <div className="section">

      <h3>Уведомления</h3>

      {notifications.length === 0 ? (

        <p>
          Нет новых уведомлений
        </p>

      ) : (

        notifications.map(notification => (

          <div
            key={notification.id}
            className="notification-card"
          >
            {notification.message}
          </div>

        ))

      )}

    </div>
  );
}