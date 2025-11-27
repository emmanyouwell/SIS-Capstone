import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminEnrollment.module.css';

function AdminEnrollment() {
  const navigate = useNavigate();
  const [enrolledCount] = useState(422);
  const [pendingCount] = useState(3);

  const handleViewEnrolled = () => {
    navigate('/admin/enrollment/enrolled');
  };

  const handleViewPending = () => {
    navigate('/admin/enrollment/pending');
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.enrollmentHeader}>
        <h2>Enrollment</h2>
      </div>
      <div className={styles.enrollmentSummaryCards}>
        <div className={styles.enrollmentSummaryCard}>
          <div className={styles.enrollmentSummaryTitle}>ENROLLED STUDENTS:</div>
          <div className={styles.enrollmentSummaryCount}>{enrolledCount}</div>
          <button
            className={styles.enrollmentSummaryBtn}
            onClick={handleViewEnrolled}
          >
            VIEW
          </button>
        </div>
        <div className={styles.enrollmentSummaryCard}>
          <div className={styles.enrollmentSummaryTitle}>PENDING ENROLLMENT:</div>
          <div className={styles.enrollmentSummaryCount}>{pendingCount}</div>
          <button
            className={styles.enrollmentSummaryBtn}
            onClick={handleViewPending}
          >
            VIEW
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminEnrollment;

