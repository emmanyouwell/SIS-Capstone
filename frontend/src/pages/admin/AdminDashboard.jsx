import { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminDashboard.module.css';
import { fetchAllEnrollments } from '../../store/slices/enrollmentSlice';
import { fetchAllUsers } from '../../store/slices/userSlice';
import { fetchUnreadMessageCount } from '../../store/slices/messageSlice';

function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const chartRef = useRef(null);

  const { enrollments, loading: enrollmentsLoading } = useSelector(
    (state) => state.enrollments
  );
  const { users, loading: usersLoading } = useSelector((state) => state.users);
  const { unreadCount: unreadMessageCount } = useSelector((state) => state.messages);

  useEffect(() => {
    dispatch(fetchAllEnrollments());
    dispatch(fetchAllUsers({ role: 'Student' }));
    dispatch(fetchUnreadMessageCount());
  }, [dispatch]);

  // Calculate enrollment statistics
  const enrollmentStats = useMemo(() => {
    const enrolled = enrollments.filter((e) => e.status === 'enrolled').length;
    const pending = enrollments.filter((e) => e.status === 'pending').length;
    const declined = enrollments.filter((e) => e.status === 'declined').length;
    const totalStudents = users.filter((u) => u.role === 'Student').length;

    // Group by grade
    const byGrade = { 7: 0, 8: 0, 9: 0, 10: 0 };
    enrollments
      .filter((e) => e.status === 'enrolled')
      .forEach((e) => {
        const grade = e.gradeLevelToEnroll;
        if (grade >= 7 && grade <= 10) {
          byGrade[grade]++;
        }
      });

    return {
      enrolled,
      pending,
      declined,
      totalStudents,
      byGrade,
    };
  }, [enrollments, users]);

  // Initialize Chart.js for enrollment distribution
  useEffect(() => {
    if (chartRef.current && enrollmentStats.enrolled > 0) {
      import('chart.js/auto').then(({ default: Chart }) => {
        const ctx = chartRef.current.getContext('2d');

        // Destroy existing chart if it exists
        if (window.dashboardEnrollChart) {
          window.dashboardEnrollChart.destroy();
        }

        const data = [
          enrollmentStats.byGrade[7],
          enrollmentStats.byGrade[8],
          enrollmentStats.byGrade[9],
          enrollmentStats.byGrade[10],
        ];

        window.dashboardEnrollChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
            datasets: [
              {
                label: 'Enrolled Students',
                data,
                backgroundColor: ['#7c4dff', '#42a5f5', '#ffb74d', '#66bb6a'],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
              },
            },
          },
        });
      });
    }

    return () => {
      if (window.dashboardEnrollChart) {
        window.dashboardEnrollChart.destroy();
        window.dashboardEnrollChart = null;
      }
    };
  }, [enrollmentStats]);

  const notifications = [
    {
      id: 1,
      type: 'enrollment',
      icon: '📝',
      title: 'Enrollment',
      message: `${enrollmentStats.pending} Student${enrollmentStats.pending !== 1 ? 's' : ''} submitted their documents for enrollment.`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    },
    {
      id: 2,
      type: 'message',
      icon: '📩',
      title: 'Message',
      message: 'Ms. Mariah A. Lordez sent a message.',
      date: 'June 3',
    },
    {
      id: 3,
      type: 'message',
      icon: '📩',
      title: 'Message',
      message: 'Mr. Jason K. Yason sent a message.',
      date: 'June 3',
    },
    {
      id: 4,
      type: 'subject',
      icon: '📚',
      title: 'Subject Materials',
      message: 'Mr. James B. Ramos posted a file in Science Grade 8 Section 2.',
      date: 'May 28',
    },
    {
      id: 5,
      type: 'announcement',
      icon: '📢',
      title: 'Announcement',
      message: 'Ms. Karla D. Sales posted a class announcement.',
      date: 'May 27',
    },
    {
      id: 6,
      type: 'announcement',
      icon: '📢',
      title: 'Announcement',
      message: 'Your post has been archived.',
      date: 'May 25',
    },
  ];

  const loading = enrollmentsLoading || usersLoading;

  return (
    <div className={styles.mainContent}>
      <div className={styles.dashboardLeft}>
        <h2 className={styles.dashboardTitle}>Admin Dashboard</h2>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : (
          <>
            <div className={styles.statsContainer}>
              <div className={`${styles.statCard} ${styles.purple}`}>
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Students</div>
                  <div className={styles.statNumber}>{enrollmentStats.totalStudents}</div>
                </div>
                <div className={styles.statIcon}>👨‍🎓</div>
                <a
                  href="#students"
                  className={styles.statChevron}
                  title="Go to Students"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/admin/accounts/students');
                  }}
                >
                  &gt;
                </a>
              </div>
              <div className={`${styles.statCard} ${styles.green}`}>
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Enrollment</div>
                  <div className={styles.statNumber}>{enrollmentStats.pending}</div>
                </div>
                <div className={styles.statIcon}>📝</div>
                <a
                  href="#enrollment"
                  className={styles.statChevron}
                  title="Go to Enrollment"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/admin/enrollment');
                  }}
                >
                  &gt;
                </a>
              </div>
              <div className={`${styles.statCard} ${styles.blue}`}>
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Enrolled</div>
                  <div className={styles.statNumber}>{enrollmentStats.enrolled}</div>
                </div>
                <div className={styles.statIcon}>✅</div>
                <a
                  href="#enrolled"
                  className={styles.statChevron}
                  title="Go to Enrolled"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/admin/enrollment/enrolled');
                  }}
                >
                  &gt;
                </a>
              </div>
              <div className={`${styles.statCard} ${styles.red}`}>
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Messages</div>
                  <div className={styles.statNumber}>{unreadMessageCount || 0}</div>
                </div>
                <div className={styles.statIcon}>📩</div>
                <a
                  href="#messages"
                  className={styles.statChevron}
                  title="Go to Messages"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/admin/messages');
                  }}
                >
                  &gt;
                </a>
              </div>
            </div>

            {/* Enrollment Chart */}
            {enrollmentStats.enrolled > 0 && (
              <div className={styles.chartContainer}>
                <h3 className={styles.chartTitle}>Enrollment by Grade Level</h3>
                <canvas ref={chartRef} style={{ maxHeight: '300px' }}></canvas>
              </div>
            )}
          </>
        )}
      </div>
      <div className={styles.dashboardRight}>
        <div className={styles.notificationPanel}>
          <h3 className={styles.notificationPanelTitle}>Notifications</h3>
          <div className={styles.notificationList}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notificationCard} ${styles[notification.type]}`}
              >
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

