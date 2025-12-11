import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminEnrollment.module.css';
import { fetchAllEnrollments, clearError, updateEnrollment, deleteEnrollment, fetchEnrollmentById, clearSelectedEnrollment } from '../../store/slices/enrollmentSlice';
import { fetchAllStudents } from '../../store/slices/studentSlice';
import { updateUser } from '../../store/slices/userSlice';
import { fetchCurrentEnrollmentPeriod } from '../../store/slices/enrollmentPeriodSlice';
import AdminEnrollmentForm from '../../components/enrollment/AdminEnrollmentForm';
import EnrollmentPeriodManager from '../../components/enrollment/EnrollmentPeriodManager';
import EditEnrollmentForm from '../../components/enrollment/EditEnrollmentForm';
import MessageModal from '../../components/MessageModal';

const ITEMS_PER_PAGE = 15;

function AdminEnrollment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enrollments, loading, error, selectedEnrollment } = useSelector((state) => state.enrollments);
  const { students } = useSelector((state) => state.students);
  const { isPeriodActive, loading: periodLoading } = useSelector((state) => state.enrollmentPeriod);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [showEditEnrollmentForm, setShowEditEnrollmentForm] = useState(false);
  const [selectedEnrollmentForEdit, setSelectedEnrollmentForEdit] = useState(null);
  const [notEnrolledSearchTerm, setNotEnrolledSearchTerm] = useState('');
  const [notEnrolledCurrentPage, setNotEnrolledCurrentPage] = useState(1);
  const [showDropConfirmModal, setShowDropConfirmModal] = useState(false);
  const [enrollmentToDrop, setEnrollmentToDrop] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({ type: 'info', message: '' });

  useEffect(() => {
    dispatch(fetchAllEnrollments());
    dispatch(fetchAllStudents());
    dispatch(fetchCurrentEnrollmentPeriod());
  }, [dispatch]);

  // Calculate counts from real data
  const enrolledCount = enrollments.filter((e) => e.status === 'enrolled').length;
  const pendingCount = enrollments.filter((e) => e.status === 'pending').length;
  const notEnrolledCount = enrollments.filter((e) => {
    // Only count enrollments with status 'not enrolled'
    if (e.status !== 'not enrolled') {
      return false;
    }
    
    // Get the student object (could be populated or just an ID)
    const student = e.studentId;
    
    // Only count if isPromoted is explicitly false (not undefined, null, or true)
    if (student && typeof student === 'object' && 'isPromoted' in student) {
      return student.isPromoted === false;
    }
    
    // If student is not populated or doesn't have isPromoted, don't count it
    return false;
  }).length;
  
  // Get students with no enrollment forms at all
  const studentsWithoutEnrollment = students.filter((student) => {
    const hasEnrollment = enrollments.some(
      (e) => e.studentId?._id === student._id || e.studentId === student._id
    );
    return !hasEnrollment;
  });

  // Get not enrolled enrollments (only students with isPromoted === false)
  const notEnrolledEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      // Only show enrollments with status 'not enrolled'
      if (e.status !== 'not enrolled') {
        return false;
      }
      
      // Get the student object (could be populated or just an ID)
      const student = e.studentId;
      
      // Only show if isPromoted is explicitly false (not undefined, null, or true)
      // Check if student is populated and has isPromoted field
      if (student && typeof student === 'object' && 'isPromoted' in student) {
        return student.isPromoted === false;
      }
      
      // If student is not populated or doesn't have isPromoted, exclude it
      return false;
    });
  }, [enrollments]);

  // Filter not enrolled enrollments by search term
  const filteredNotEnrolled = useMemo(() => {
    return notEnrolledEnrollments.filter((enrollment) => {
      if (notEnrolledSearchTerm) {
        const term = notEnrolledSearchTerm.toLowerCase().trim();
        const student = enrollment.studentId;
        const studentUser = student?.userId || {};
        const name = enrollment.firstName && enrollment.lastName
          ? `${enrollment.firstName} ${enrollment.middleName || ''} ${enrollment.lastName} ${enrollment.extensionName || ''}`.trim().toLowerCase()
          : studentUser.firstName && studentUser.lastName
            ? `${studentUser.firstName} ${studentUser.middleName || ''} ${studentUser.lastName} ${studentUser.extensionName || ''}`.trim().toLowerCase()
            : 'unknown student';
        const lrn = (enrollment.lrn || student?.lrn || '').toLowerCase();
        const grade = `grade ${enrollment.gradeToEnroll || enrollment.gradeLevelToEnroll || ''}`.toLowerCase();
        
        if (!name.includes(term) && !lrn.includes(term) && !grade.includes(term)) {
          return false;
        }
      }
      return true;
    });
  }, [notEnrolledEnrollments, notEnrolledSearchTerm]);

  // Pagination for not enrolled
  const notEnrolledTotalPages = Math.ceil(filteredNotEnrolled.length / ITEMS_PER_PAGE);
  const notEnrolledStartIndex = (notEnrolledCurrentPage - 1) * ITEMS_PER_PAGE;
  const notEnrolledEndIndex = notEnrolledStartIndex + ITEMS_PER_PAGE;
  const paginatedNotEnrolled = filteredNotEnrolled.slice(notEnrolledStartIndex, notEnrolledEndIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setNotEnrolledCurrentPage(1);
  }, [notEnrolledSearchTerm]);

  const handleViewEnrolled = () => {
    navigate('/admin/enrollment/enrolled');
  };

  const handleViewPending = () => {
    navigate('/admin/enrollment/pending');
  };

  const handleCreateEnrollment = (studentId = null) => {
    if (!isPeriodActive) {
      setMessageModalContent({
        type: 'error',
        message: 'Cannot create enrollment form. No active enrollment period. Please create an enrollment period first.',
      });
      setShowMessageModal(true);
      return;
    }
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

  const handleEditEnrollmentForm = async (enrollmentId) => {
    try {
      await dispatch(fetchEnrollmentById(enrollmentId)).unwrap();
      setSelectedEnrollmentForEdit(enrollmentId);
      setShowEditEnrollmentForm(true);
    } catch (err) {
      setMessageModalContent({
        type: 'error',
        message: 'Failed to load enrollment form',
      });
      setShowMessageModal(true);
    }
  };

  const handleEditEnrollmentFormClose = () => {
    setShowEditEnrollmentForm(false);
    setSelectedEnrollmentForEdit(null);
    dispatch(clearSelectedEnrollment());
    dispatch(fetchAllEnrollments());
  };

  const handleEditEnrollmentFormSuccess = () => {
    handleEditEnrollmentFormClose();
  };

  const handleDropStudent = (enrollment) => {
    setEnrollmentToDrop(enrollment);
    setShowDropConfirmModal(true);
  };

  const confirmDropStudent = async () => {
    if (!enrollmentToDrop) return;

    try {
      // Delete enrollment form
      await dispatch(deleteEnrollment(enrollmentToDrop._id)).unwrap();

      // Get student's userId to update status
      const student = enrollmentToDrop.studentId;
      const userId = student?.userId?._id || student?.userId;
      
      if (userId) {
        // Set user account to inactive
        await dispatch(updateUser({ id: userId, data: { status: 'Inactive' } })).unwrap();
      }

      setMessageModalContent({
        type: 'success',
        message: 'Student has been dropped. Enrollment form deleted, enrollment status set to false, and account set to inactive.',
      });
      setShowMessageModal(true);
      setShowDropConfirmModal(false);
      setEnrollmentToDrop(null);
      
      // Refresh data
      dispatch(fetchAllEnrollments());
      dispatch(fetchAllStudents());
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : err?.message || 'Failed to drop student';
      setMessageModalContent({
        type: 'error',
        message: errorMessage,
      });
      setShowMessageModal(true);
    }
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

          {/* New Students Section */}
          <div className={styles.pendingEnrollmentSection}>
            <div className={styles.pendingEnrollmentHeader}>
              <h3>New Students</h3>
              <p>Students with no enrollment forms</p>
            </div>
            <div className={styles.pendingEnrollmentCard}>
              <div className={styles.pendingEnrollmentInfo}>
                <div className={styles.pendingEnrollmentCount}>
                  {studentsWithoutEnrollment.length} student{studentsWithoutEnrollment.length !== 1 ? 's' : ''} need{studentsWithoutEnrollment.length === 1 ? 's' : ''} enrollment form
                </div>
                <button
                  className={styles.newEnrollmentBtn}
                  onClick={() => handleCreateEnrollment()}
                  disabled={!isPeriodActive || periodLoading}
                  title={!isPeriodActive ? 'An active enrollment period is required to create enrollment forms' : ''}
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
                          disabled={!isPeriodActive || periodLoading}
                          title={!isPeriodActive ? 'An active enrollment period is required to create enrollment forms' : ''}
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

          {/* Not Enrolled Section */}
          <div className={styles.pendingEnrollmentSection} style={{ marginTop: '2rem' }}>
            <div className={styles.pendingEnrollmentHeader}>
              <h3>Not Enrolled Students</h3>
              <p>Students who completed a whole school year and are either promoted or retained</p>
            </div>
            <div className={styles.pendingEnrollmentCard}>
              <div className={styles.tableFilters}>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Search by name, LRN, or grade..."
                    value={notEnrolledSearchTerm}
                    onChange={(e) => setNotEnrolledSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
              </div>
              <div className={styles.tableInfo}>
                Showing {filteredNotEnrolled.length} student{filteredNotEnrolled.length !== 1 ? 's' : ''}
                {filteredNotEnrolled.length > 0 && (
                  <span className={styles.pageInfo}>
                    {' '}
                    (Page {notEnrolledCurrentPage} of {notEnrolledTotalPages})
                  </span>
                )}
              </div>
              {filteredNotEnrolled.length > 0 ? (
                <>
                  <div className={styles.tableContainer}>
                    <table className={styles.pendingTable}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Grade</th>
                          <th>LRN</th>
                          <th>Returning Learner</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedNotEnrolled.map((enrollment) => {
                          const student = enrollment.studentId;
                          const studentUser = student?.userId || {};
                          const studentName = enrollment.firstName && enrollment.lastName
                            ? `${enrollment.firstName || ''} ${enrollment.lastName || ''} ${enrollment.middleName || ''}`.trim()
                            : studentUser.firstName && studentUser.lastName
                              ? `${studentUser.firstName || ''} ${studentUser.lastName || ''} ${studentUser.middleName || ''}`.trim()
                              : 'Unknown Student';
                          return (
                            <tr key={enrollment._id}>
                              <td>{studentName}</td>
                              <td>Grade {enrollment.gradeLevelToEnroll || enrollment.gradeToEnroll}</td>
                              <td>{enrollment.lrn || student?.lrn || 'N/A'}</td>
                              <td>{enrollment.returning ? 'Yes' : 'No'}</td>
                              <td>
                                <div className={styles.actionButtons}>
                                  <button
                                    className={styles.editFormBtn}
                                    onClick={() => handleEditEnrollmentForm(enrollment._id)}
                                  >
                                    Edit Form
                                  </button>
                                  <button
                                    className={styles.dropBtn}
                                    onClick={() => handleDropStudent(enrollment)}
                                  >
                                    Drop
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {notEnrolledTotalPages > 1 && (
                    <div className={styles.pagination}>
                      <button
                        className={styles.paginationBtn}
                        onClick={() => setNotEnrolledCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={notEnrolledCurrentPage === 1}
                      >
                        Previous
                      </button>
                      <span className={styles.paginationInfo}>
                        Page {notEnrolledCurrentPage} of {notEnrolledTotalPages}
                      </span>
                      <button
                        className={styles.paginationBtn}
                        onClick={() => setNotEnrolledCurrentPage((prev) => Math.min(notEnrolledTotalPages, prev + 1))}
                        disabled={notEnrolledCurrentPage === notEnrolledTotalPages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                  <div className={styles.emptyState}>
                    {notEnrolledSearchTerm ? 'No not enrolled students found matching your search.' : 'No not enrolled students'}
                  </div>
                )}
            </div>
          </div>

          {/* Enrollment Period Management */}
          <EnrollmentPeriodManager />
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

      {/* Edit Enrollment Form Modal */}
      {showEditEnrollmentForm && selectedEnrollment && selectedEnrollmentForEdit && (
        <EditEnrollmentForm
          enrollment={selectedEnrollment}
          onClose={handleEditEnrollmentFormClose}
          onSuccess={handleEditEnrollmentFormSuccess}
        />
      )}

      {/* Drop Student Confirmation Modal */}
      {showDropConfirmModal && enrollmentToDrop && (
        <div className={styles.confirmModal} onClick={() => setShowDropConfirmModal(false)}>
          <div className={styles.confirmModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmModalHeader}>
              <h3 className={styles.confirmModalTitle}>Drop Student?</h3>
            </div>
            <div className={styles.confirmModalBody}>
              <p className={styles.confirmModalMessage}>
                Are you sure you want to drop this student? This will delete their enrollment form and set their account to inactive. This action cannot be undone.
              </p>
            </div>
            <div className={styles.confirmModalActions}>
              <button
                className={styles.confirmModalCancelBtn}
                onClick={() => {
                  setShowDropConfirmModal(false);
                  setEnrollmentToDrop(null);
                }}
              >
                Cancel
              </button>
              <button
                className={styles.confirmModalDropBtn}
                onClick={confirmDropStudent}
              >
                Drop Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      <MessageModal
        show={showMessageModal}
        type={messageModalContent.type}
        message={messageModalContent.message}
        onClose={() => setShowMessageModal(false)}
      />
    </div>
  );
}

export default AdminEnrollment;

