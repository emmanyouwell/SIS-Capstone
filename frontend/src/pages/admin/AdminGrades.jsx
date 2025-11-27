import { useNavigate } from 'react-router-dom';
import styles from './AdminGrades.module.css';

function AdminGrades() {
  const navigate = useNavigate();

  const handleGradeClick = (grade) => {
    navigate(`/admin/grades/${grade}`);
  };

  return (
    <div className={styles.mainContent}>
      <h2 className={styles.pageTitle}>Grades</h2>
      
      <div className={styles.gradesContainer}>
        <div className={styles.containerHeader}>View & Edit Lists</div>
        <div className={styles.containerBody}>
          <div className={styles.buttonRow}>
            <button
              className={`${styles.gradeButton} ${styles.grade7}`}
              onClick={() => handleGradeClick('grade7')}
            >
              Grade 7
            </button>
            <button
              className={`${styles.gradeButton} ${styles.grade9}`}
              onClick={() => handleGradeClick('grade9')}
            >
              Grade 9
            </button>
          </div>
          <div className={styles.buttonRow}>
            <button
              className={`${styles.gradeButton} ${styles.grade8}`}
              onClick={() => handleGradeClick('grade8')}
            >
              Grade 8
            </button>
            <button
              className={`${styles.gradeButton} ${styles.grade10}`}
              onClick={() => handleGradeClick('grade10')}
            >
              Grade 10
            </button>
          </div>
        </div>
      </div>

      <div className={styles.footerSection}>
        <img
          src="/images/logo.jpg"
          alt="School Logo"
          className={styles.schoolLogo}
        />
        <div className={styles.schoolYear}>S.Y. 2025 - 2026</div>
      </div>
    </div>
  );
}

export default AdminGrades;

