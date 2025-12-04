import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminEnrollment.module.css';
import { fetchAllEnrollments, clearError } from '../../store/slices/enrollmentSlice';

function AdminEnrollment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enrollments, loading, error } = useSelector((state) => state.enrollments);

  useEffect(() => {
    dispatch(fetchAllEnrollments());
  }, [dispatch]);

  // Calculate counts from real data
  const enrolledCount = enrollments.filter((e) => e.status === 'enrolled').length;
  const pendingCount = enrollments.filter((e) => e.status === 'pending').length;

  const handleViewEnrolled = () => {
    navigate('/admin/enrollment/enrolled');
  };

  const handleViewPending = () => {
    navigate('/admin/enrollment/pending');
  };

  if (error) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.enrollmentHeader}>
          <h2>Enrollment</h2>
        </div>
        <div style={{ color: 'red', padding: '1rem' }}>
          Error: {error}
          <button onClick={() => dispatch(clearError())} style={{ marginLeft: '1rem' }}>
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainContent}>
      <div className={styles.enrollmentHeader}>
        <h2>Enrollment</h2>
      </div>
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      ) : (
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
      )}
    </div>
  );
}

export default AdminEnrollment;

