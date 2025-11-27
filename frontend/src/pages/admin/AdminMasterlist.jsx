import { useNavigate } from 'react-router-dom';
import styles from './AdminMasterlist.module.css';

function AdminMasterlist() {
  const navigate = useNavigate();

  const handleGradeClick = (grade) => {
    navigate(`/admin/masterlist/grade${grade}`);
  };

  const handleAssignTeacherClick = () => {
    navigate('/admin/masterlist/assign-teacher');
  };

  const handleAssignStudentClick = () => {
    navigate('/admin/masterlist/assign-student');
  };

  return (
    <div className={styles.mainContent}>
      <h2 className={styles.pageTitle}>Masterlist</h2>

      {/* Top Card: View & Edit Lists */}
      <div className={styles.topCard}>
        <div className={styles.topHeader}>View & Edit Lists</div>
        <div className={styles.gradeButtons}>
          <div className={styles.gradeButtonRow}>
            <button
              className={`${styles.gradeButton} ${styles.grade7}`}
              onClick={() => handleGradeClick(7)}
            >
              Grade 7
            </button>
            <button
              className={`${styles.gradeButton} ${styles.grade9}`}
              onClick={() => handleGradeClick(9)}
            >
              Grade 9
            </button>
          </div>
          <div className={styles.gradeButtonRow}>
            <button
              className={`${styles.gradeButton} ${styles.grade8}`}
              onClick={() => handleGradeClick(8)}
            >
              Grade 8
            </button>
            <button
              className={`${styles.gradeButton} ${styles.grade10}`}
              onClick={() => handleGradeClick(10)}
            >
              Grade 10
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Cards: Assign Teachers/Students */}
      <div className={styles.bottomCards}>
        <div className={styles.bottomCard}>
          <div className={styles.bottomTitle}>Assign Teachers</div>
          <div className={styles.bottomGreen}>
            <button className={styles.viewButton} onClick={handleAssignTeacherClick}>
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="21" y1="12" x2="17" y2="12" />
              </svg>
              View
            </button>
          </div>
        </div>
        <div className={styles.bottomCard}>
          <div className={styles.bottomTitle}>Assign Students</div>
          <div className={styles.bottomGreen}>
            <button className={styles.viewButton} onClick={handleAssignStudentClick}>
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="21" y1="12" x2="17" y2="12" />
              </svg>
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminMasterlist;

