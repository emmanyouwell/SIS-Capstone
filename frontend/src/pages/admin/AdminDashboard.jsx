import styles from './AdminDashboard.module.css';

function AdminDashboard() {
  const notifications = [
    {
      id: 1,
      type: 'enrollment',
      icon: '📝',
      title: 'Enrollment',
      message: '3 Students submitted their documents for enrollment.',
      date: 'June 10'
    },
    {
      id: 2,
      type: 'message',
      icon: '📩',
      title: 'Message',
      message: 'Ms. Mariah A. Lordez sent a message.',
      date: 'June 3'
    },
    {
      id: 3,
      type: 'message',
      icon: '📩',
      title: 'Message',
      message: 'Mr. Jason K. Yason sent a message.',
      date: 'June 3'
    },
    {
      id: 4,
      type: 'subject',
      icon: '📚',
      title: 'Subject Materials',
      message: 'Mr. James B. Ramos posted a file in Science Grade 8 Section 2.',
      date: 'May 28'
    },
    {
      id: 5,
      type: 'announcement',
      icon: '📢',
      title: 'Announcement',
      message: 'Ms. Karla D. Sales posted a class announcement.',
      date: 'May 27'
    },
    {
      id: 6,
      type: 'announcement',
      icon: '📢',
      title: 'Announcement',
      message: 'Your post has been archived.',
      date: 'May 25'
    }
  ];

  return (
    <div className={styles.mainContent}>
        <div className={styles.dashboardLeft}>
          <h2 className={styles.dashboardTitle}>Admin Dashboard</h2>
          <div className={styles.statsContainer}>
            <div className={`${styles.statCard} ${styles.purple}`}>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Students</div>
                <div className={styles.statNumber}>422</div>
              </div>
              <div className={styles.statIcon}>👨‍🎓</div>
              <a href="#students" className={styles.statChevron} title="Go to Students">&gt;</a>
            </div>
            <div className={`${styles.statCard} ${styles.green}`}>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Enrollment</div>
                <div className={styles.statNumber}>3</div>
              </div>
              <div className={styles.statIcon}>📝</div>
              <a href="#enrollment" className={styles.statChevron} title="Go to Enrollment">&gt;</a>
            </div>
            <div className={`${styles.statCard} ${styles.blue}`}>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Events</div>
                <div className={styles.statNumber}>0</div>
              </div>
              <div className={styles.statIcon}>📅</div>
              <a href="#events" className={styles.statChevron} title="Go to Events">&gt;</a>
            </div>
            <div className={`${styles.statCard} ${styles.red}`}>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Messages</div>
                <div className={styles.statNumber}>6</div>
              </div>
              <div className={styles.statIcon}>📩</div>
              <a href="#messages" className={styles.statChevron} title="Go to Messages">&gt;</a>
            </div>
          </div>
        </div>
        <div className={styles.dashboardRight}>
          <div className={styles.notificationPanel}>
            <h3 className={styles.notificationPanelTitle}>Notifications</h3>
            <div className={styles.notificationList}>
              {notifications.map((notification) => (
                <div key={notification.id} className={`${styles.notificationCard} ${styles[notification.type]}`}>
                  <span className={styles.notificationIcon}>{notification.icon}</span>
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationTitle}>{notification.title}</div>
                    <div className={styles.notificationMessage}>{notification.message}</div>
                    <div className={styles.notificationDate}>{notification.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}

export default AdminDashboard;

