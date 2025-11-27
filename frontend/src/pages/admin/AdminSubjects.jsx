import { useNavigate } from 'react-router-dom';
import styles from './AdminSubjects.module.css';

function AdminSubjects() {
  const navigate = useNavigate();

  const handleGradeClick = (grade, mode = 'view') => {
    navigate(`/admin/subjects/${grade}/${mode}`);
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.subjectsHeader}>
        <h2>Subject</h2>
      </div>

      {/* View & Edit Subjects Section */}
      <div className={styles.sectionWrapper}>
        <div className={styles.sectionHeader}>View & Edit Subjects</div>
        <div className={styles.sectionCard}>
          <div className={styles.sectionBody}>
            <div className={styles.buttonRow}>
              <button
                className={`${styles.gradeButton} ${styles.grade7}`}
                onClick={() => handleGradeClick('grade7', 'view')}
              >
                Grade 7
              </button>
              <button
                className={`${styles.gradeButton} ${styles.grade9}`}
                onClick={() => handleGradeClick('grade9', 'view')}
              >
                Grade 9
              </button>
            </div>
            <div className={styles.buttonRow}>
              <button
                className={`${styles.gradeButton} ${styles.grade8}`}
                onClick={() => handleGradeClick('grade8', 'view')}
              >
                Grade 8
              </button>
              <button
                className={`${styles.gradeButton} ${styles.grade10}`}
                onClick={() => handleGradeClick('grade10', 'view')}
              >
                Grade 10
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload & Edit Subject Materials Section */}
      <div className={styles.sectionWrapper}>
        <div className={styles.sectionHeader}>Upload & Edit Subject Materials</div>
        <div className={styles.sectionCard}>
          <div className={styles.sectionBody}>
            <div className={styles.buttonRow}>
              <button
                className={`${styles.gradeButton} ${styles.grade7}`}
                onClick={() => handleGradeClick('grade7', 'materials')}
              >
                Grade 7
              </button>
              <button
                className={`${styles.gradeButton} ${styles.grade9}`}
                onClick={() => handleGradeClick('grade9', 'materials')}
              >
                Grade 9
              </button>
            </div>
            <div className={styles.buttonRow}>
              <button
                className={`${styles.gradeButton} ${styles.grade8}`}
                onClick={() => handleGradeClick('grade8', 'materials')}
              >
                Grade 8
              </button>
              <button
                className={`${styles.gradeButton} ${styles.grade10}`}
                onClick={() => handleGradeClick('grade10', 'materials')}
              >
                Grade 10
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSubjects;

