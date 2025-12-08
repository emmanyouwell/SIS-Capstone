import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminEnrollment.module.css';
import { fetchAllEnrollments, clearError } from '../../store/slices/enrollmentSlice';
import { fetchAllStudents } from '../../store/slices/studentSlice';
import AdminEnrollmentForm from '../../components/enrollment/AdminEnrollmentForm';

function AdminEnrollment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enrollments, loading, error } = useSelector((state) => state.enrollments);
  const { students } = useSelector((state) => state.students);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    dispatch(fetchAllEnrollments());
    dispatch(fetchAllStudents());
  }, [dispatch]);

  // Calculate counts from real data
  const enrolledCount = enrollments.filter((e) => e.status === 'enrolled').length;
  const pendingCount = enrollments.filter((e) => e.status === 'pending').length;
  
  // Get students without enrollment or with pending enrollment
  const studentsWithoutEnrollment = students.filter((student) => {
    const hasEnrollment = enrollments.some(
      (e) => e.studentId?._id === student._id || e.studentId === student._id
    );
    return !hasEnrollment || !student.enrollmentStatus;
  });

  const handleViewEnrolled = () => {
    navigate('/admin/enrollment/enrolled');
  };

  const handleViewPending = () => {
    navigate('/admin/enrollment/pending');
  };

  const handleCreateEnrollment = (studentId = null) => {
    setSelectedStudentId(studentId);
    setShowEnrollmentForm(true);
  };

  const handleEnrollmentFormClose = () => {
    setShowEnrollmentForm(false);
    setSelectedStudentId(null);
    // Refresh data
    dispatch(fetchAllEnrollments());
    dispatch(fetchAllStudents());
  };

  const handleEnrollmentFormSuccess = () => {
    handleEnrollmentFormClose();
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
        <>
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

          {/* Pending Enrollment Section */}
          <div className={styles.pendingEnrollmentSection}>
            <div className={styles.pendingEnrollmentHeader}>
              <h3>Pending Enrollment</h3>
              <p>Students without enrollment form or with pending enrollment status</p>
            </div>
            <div className={styles.pendingEnrollmentCard}>
              <div className={styles.pendingEnrollmentInfo}>
                <div className={styles.pendingEnrollmentCount}>
                  {studentsWithoutEnrollment.length} student{studentsWithoutEnrollment.length !== 1 ? 's' : ''} need{studentsWithoutEnrollment.length === 1 ? 's' : ''} enrollment form
                </div>
                <button
                  className={styles.newEnrollmentBtn}
                  onClick={() => handleCreateEnrollment()}
                >
                  + New Enrollment Form
                </button>
              </div>
              {studentsWithoutEnrollment.length > 0 && (
                <div className={styles.pendingStudentsList}>
                  <div className={styles.pendingStudentsListHeader}>
                    <span>Student Name</span>
                    <span>Action</span>
                  </div>
                  {studentsWithoutEnrollment.slice(0, 5).map((student) => {
                    const user = student.userId;
                    const studentName = user
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : 'Unknown Student';
                    return (
                      <div key={student._id} className={styles.pendingStudentItem}>
                        <span>{studentName}</span>
                        <button
                          className={styles.createEnrollmentBtn}
                          onClick={() => handleCreateEnrollment(student._id)}
                        >
                          Create Enrollment Form
                        </button>
                      </div>
                    );
                  })}
                  {studentsWithoutEnrollment.length > 5 && (
                    <div className={styles.pendingStudentsMore}>
                      + {studentsWithoutEnrollment.length - 5} more student{studentsWithoutEnrollment.length - 5 !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Enrollment Form Modal */}
      {showEnrollmentForm && (
        <AdminEnrollmentForm
          key={selectedStudentId || 'new-enrollment'}
          studentId={selectedStudentId}
          onClose={handleEnrollmentFormClose}
          onSuccess={handleEnrollmentFormSuccess}
        />
      )}
    </div>
  );
}

export default AdminEnrollment;

