import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminEnrollmentPending.module.css';
import {
  fetchAllEnrollments,
  updateEnrollment,
  clearError,
} from '../../store/slices/enrollmentSlice';

function AdminEnrollmentPending() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const { enrollments, loading, error } = useSelector((state) => state.enrollments);

  useEffect(() => {
    dispatch(fetchAllEnrollments({ status: 'pending' }));
  }, [dispatch]);

  // Get pending enrollments
  const pendingEnrollments = useMemo(() => {
    return enrollments.filter((e) => e.status === 'pending');
  }, [enrollments]);

  // Group pending enrollments by grade
  const pendingGradeData = useMemo(() => {
    const grouped = { 7: [], 8: [], 9: [], 10: [] };
    
    pendingEnrollments.forEach((enrollment) => {
      const grade = enrollment.gradeLevelToEnroll;
      if (grade >= 7 && grade <= 10) {
        const student = enrollment.student;
        const studentName = student
          ? `${student.firstName || ''} ${student.lastName || ''}`.trim()
          : 'Unknown Student';
        
        grouped[grade].push({
          id: enrollment._id,
          name: studentName,
          currentGrade: `Grade ${enrollment.gradeLevelToEnroll}`,
          enrollingTo: `Grade ${enrollment.gradeLevelToEnroll}`,
          lrn: student?.learnerReferenceNo || enrollment.learnerReferenceNo || 'N/A',
          enrollment,
        });
      }
    });

    const result = {};
    [7, 8, 9, 10].forEach((grade) => {
      result[grade] = {
        total: grouped[grade].length,
        students: grouped[grade],
      };
    });

    return result;
  }, [pendingEnrollments]);

  const handleViewForm = (enrollmentId) => {
    const enrollment = pendingEnrollments.find((e) => e._id === enrollmentId);
    setSelectedEnrollment(enrollment);
    setNotes(enrollment?.notes || '');
    setShowEnrollModal(true);
  };

  const handleAccept = async () => {
    if (!selectedEnrollment) return;
    
    setProcessing(true);
    try {
      await dispatch(
        updateEnrollment({
          id: selectedEnrollment._id,
          data: {
            status: 'enrolled',
            notes: notes || selectedEnrollment.notes,
          },
        })
      ).unwrap();
      
    alert('Student was successfully enrolled!');
    setShowEnrollModal(false);
      setSelectedEnrollment(null);
      setNotes('');
      // Refresh enrollments
      dispatch(fetchAllEnrollments({ status: 'pending' }));
    } catch (err) {
      alert(`Error: ${err || 'Failed to enroll student'}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!selectedEnrollment) return;
    
    if (!confirm('Are you sure you want to decline this enrollment?')) {
      return;
    }

    setProcessing(true);
    try {
      await dispatch(
        updateEnrollment({
          id: selectedEnrollment._id,
          data: {
            status: 'declined',
            notes: notes || selectedEnrollment.notes,
          },
        })
      ).unwrap();
      
    alert('Enrollment declined.');
    setShowEnrollModal(false);
      setSelectedEnrollment(null);
      setNotes('');
      // Refresh enrollments
      dispatch(fetchAllEnrollments({ status: 'pending' }));
    } catch (err) {
      alert(`Error: ${err || 'Failed to decline enrollment'}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleGradeClick = (grade) => {
    setSelectedGrade(grade);
    setShowGradeModal(true);
  };

  const handleBack = () => {
    navigate('/admin/enrollment');
  };

  const formatAddress = (address) => {
    if (typeof address === 'string') return address;
    if (!address) return '';
    const parts = [
      address.houseNo,
      address.barangay,
      address.municipality,
      address.province,
      address.zipCode,
    ].filter(Boolean);
    return parts.join(', ') || '';
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const enrollment = selectedEnrollment;
  const gradeData = selectedGrade ? pendingGradeData[selectedGrade] : null;

  if (error) {
    return (
      <div className={styles.mainContent}>
        <div style={{ color: 'red', padding: '1rem' }}>
          Error: {error}
          <button onClick={() => dispatch(clearError())} style={{ marginLeft: '1rem' }}>
            Dismiss
          </button>
        </div>
        <button
          className={styles.backFabBtn}
          onClick={handleBack}
          title="Back"
        >
          <svg width="32" height="32" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.mainContent}>
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      ) : (
      <div className={styles.pendingCard}>
          {pendingEnrollments.length > 0 ? (
            <>
        <table className={styles.pendingTable}>
          <tbody>
                  {pendingEnrollments.slice(0, 10).map((enrollment) => {
                    const student = enrollment.student;
                    const studentName = student
                      ? `${student.firstName || ''} ${student.lastName || ''}`.trim()
                      : 'Unknown Student';
                    return (
                      <tr key={enrollment._id}>
                        <td>{studentName}</td>
                        <td>Grade {enrollment.gradeLevelToEnroll}</td>
                <td>
                  <button
                    className={styles.pendingViewBtn}
                            onClick={() => handleViewForm(enrollment._id)}
                  >
                    View form
                  </button>
                </td>
              </tr>
                    );
                  })}
          </tbody>
        </table>
              {pendingEnrollments.length > 10 && (
        <div className={styles.pendingViewall}>
          <a href="#" onClick={(e) => { e.preventDefault(); }}>
                    &raquo; view all ({pendingEnrollments.length} total)
                  </a>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
              No pending enrollments
            </div>
          )}
        </div>
      )}

      <div className={styles.pendingCard} style={{ marginTop: '24px' }}>
        <div className={styles.pendingUpcomingLabel}>
          View pending enrollment for upcoming:
        </div>
        <div className={styles.pendingGradeBtnRow}>
          <button
            className={`${styles.pendingGradeBtn} ${styles.grade8}`}
            onClick={() => handleGradeClick(8)}
          >
            Grade 8
          </button>
          <button
            className={`${styles.pendingGradeBtn} ${styles.grade9}`}
            onClick={() => handleGradeClick(9)}
          >
            Grade 9
          </button>
          <button
            className={`${styles.pendingGradeBtn} ${styles.grade10}`}
            onClick={() => handleGradeClick(10)}
          >
            Grade 10
          </button>
        </div>
      </div>

      <button
        className={styles.backFabBtn}
        onClick={handleBack}
        title="Back"
      >
        <svg width="32" height="32" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      {/* Enrollment Form Modal */}
      {showEnrollModal && enrollment && (
        <div className={styles.enrollModal} onClick={() => setShowEnrollModal(false)}>
          <div className={styles.enrollModalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => setShowEnrollModal(false)}
            >
              &times;
            </button>
            <div className={styles.enrollmentForm}>
              <div className={styles.formHeader}>
                <div>
                  <div>
                    Name:{' '}
                    {enrollment.student
                      ? `${enrollment.student.firstName || ''} ${enrollment.student.lastName || ''}`.trim()
                      : `${enrollment.firstName || ''} ${enrollment.lastName || ''}`.trim()}
                  </div>
                  <div>
                    LRN:{' '}
                    {enrollment.student?.learnerReferenceNo ||
                      enrollment.learnerReferenceNo ||
                      'N/A'}
                  </div>
                </div>
                <div>
                  <div>Grade to Enroll: {enrollment.gradeLevelToEnroll}</div>
                  <div>School Year: {enrollment.schoolYear || 'N/A'}</div>
                </div>
              </div>

              <form className={styles.enrollForm}>
                <div className={styles.formSection}>
                  <div className={styles.formRow}>
                    <label>
                      <strong>School Year</strong>
                      <input type="text" value={enrollment.schoolYear || ''} readOnly />
                    </label>
                    <label>
                      <strong>Grade level to Enroll</strong>
                      <input type="text" value={enrollment.gradeLevelToEnroll || ''} readOnly />
                    </label>
                    <div className={styles.checkboxGroup}>
                      <span>With LRN?</span>
                      <label>
                        <input type="checkbox" checked={enrollment.withLRN || false} readOnly />
                        Yes
                      </label>
                      <label>
                        <input type="checkbox" checked={!enrollment.withLRN} readOnly />
                        No
                      </label>
                    </div>
                    <div className={styles.checkboxGroup}>
                      <span>Returning (Balik-Aral)?</span>
                      <label>
                        <input
                          type="checkbox"
                          checked={enrollment.returningBalikAral || false}
                          readOnly
                        />
                        Yes
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={!enrollment.returningBalikAral}
                          readOnly
                        />
                        No
                      </label>
                    </div>
                  </div>
                </div>

                <div className={styles.sectionHeader}>LEARNER INFORMATION</div>

                <div className={styles.formRow}>
                  <label>
                    PSA Certificate No.
                    <input type="text" value={enrollment.psaCertificateNo || ''} readOnly />
                  </label>
                  <label>
                    Learner Reference No. (LRN)
                    <input
                      type="text"
                      value={
                        enrollment.student?.learnerReferenceNo ||
                        enrollment.learnerReferenceNo ||
                        ''
                      }
                      readOnly
                    />
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label>
                    Last Name
                    <input type="text" value={enrollment.lastName || ''} readOnly />
                  </label>
                  <label>
                    First Name
                    <input type="text" value={enrollment.firstName || ''} readOnly />
                  </label>
                  <label>
                    Middle Name
                    <input type="text" value={enrollment.middleName || ''} readOnly />
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label>
                    Sex
                    <div className={styles.radioGroup}>
                      <label>
                        <input type="radio" checked={enrollment.sex === 'Female'} readOnly />
                        Female
                      </label>
                      <label>
                        <input type="radio" checked={enrollment.sex === 'Male'} readOnly />
                        Male
                      </label>
                    </div>
                  </label>
                  <label>
                    Birthdate
                    <input type="text" value={formatDate(enrollment.birthdate)} readOnly />
                  </label>
                  <label>
                    Age
                    <input type="text" value={enrollment.age || ''} readOnly />
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label>
                    Place of Birth
                    <input type="text" value={enrollment.placeOfBirth || ''} readOnly />
                  </label>
                  <label>
                    Mother Tongue
                    <input type="text" value={enrollment.motherTongue || ''} readOnly />
                  </label>
                  <label>
                    Religion
                    <input type="text" value={enrollment.religion || ''} readOnly />
                  </label>
                </div>

                <label>
                  Extension Name (if any)
                  <input type="text" value={enrollment.extensionName || ''} readOnly />
                </label>

                <div className={styles.checkboxGroup}>
                  <span>Belonging to any Indigenous Peoples?</span>
                  <label>
                    <input
                      type="checkbox"
                      checked={enrollment.indigenousPeoples || false}
                      readOnly
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={!enrollment.indigenousPeoples}
                      readOnly
                    />
                    No
                  </label>
                </div>

                <div className={styles.checkboxGroup}>
                  <span>Is your family beneficiary of 4Ps?</span>
                  <label>
                    <input type="checkbox" checked={enrollment.family4Ps || false} readOnly />
                    Yes
                  </label>
                  <label>
                    <input type="checkbox" checked={!enrollment.family4Ps} readOnly />
                    No
                  </label>
                </div>

                <label>
                  Current Address
                  <input
                    type="text"
                    value={formatAddress(enrollment.currentAddress)}
                    readOnly
                  />
                </label>

                <label>
                  Permanent Address
                  <input
                    type="text"
                    value={formatAddress(enrollment.permanentAddress)}
                    readOnly
                  />
                </label>

                <div className={styles.sectionHeader}>PARENT'S/GUARDIAN'S INFORMATION</div>

                <div className={styles.formRow}>
                  <label>
                    Father's Name
                    <input
                      type="text"
                      value={
                        enrollment.fatherInfo
                          ? `${enrollment.fatherInfo.firstName || ''} ${enrollment.fatherInfo.lastName || ''}`.trim()
                          : ''
                      }
                      readOnly
                    />
                  </label>
                  <label>
                    Contact Number
                    <input
                      type="text"
                      value={enrollment.fatherInfo?.contact || ''}
                      readOnly
                    />
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label>
                    Mother's Name
                    <input
                      type="text"
                      value={
                        enrollment.motherInfo
                          ? `${enrollment.motherInfo.firstName || ''} ${enrollment.motherInfo.lastName || ''}`.trim()
                          : ''
                      }
                      readOnly
                    />
                  </label>
                  <label>
                    Contact Number
                    <input
                      type="text"
                      value={enrollment.motherInfo?.contact || ''}
                      readOnly
                    />
                  </label>
                </div>

                <div className={styles.formRow}>
                  <label>
                    Guardian's Name
                    <input
                      type="text"
                      value={
                        enrollment.guardianInfo
                          ? `${enrollment.guardianInfo.firstName || ''} ${enrollment.guardianInfo.lastName || ''}`.trim()
                          : ''
                      }
                      readOnly
                    />
                  </label>
                  <label>
                    Contact Number
                    <input
                      type="text"
                      value={enrollment.guardianInfo?.contact || ''}
                      readOnly
                    />
                  </label>
                </div>

                {enrollment.attachments && enrollment.attachments.length > 0 && (
                <div className={styles.attachedFile}>
                    Attached Files:{' '}
                    {enrollment.attachments.map((file, idx) => (
                      <span key={idx}>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          {file.name}
                        </a>
                        {idx < enrollment.attachments.length - 1 && ', '}
                      </span>
                    ))}
                </div>
                )}

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.declineBtn}
                    onClick={handleDecline}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Decline'}
                  </button>
                  <button
                    type="button"
                    className={styles.acceptBtn}
                    onClick={handleAccept}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Accept'}
                  </button>
                </div>

                <div className={styles.notesSection}>
                  <label>
                    Notes:
                    <input
                      type="text"
                      placeholder="(Optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </label>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Grade Details Modal */}
      {showGradeModal && gradeData && (
        <div className={styles.gradeModal} onClick={() => setShowGradeModal(false)}>
          <div className={styles.gradeModalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => setShowGradeModal(false)}
            >
              &times;
            </button>
            <h3 className={styles.modalTitle}>
              Grade {selectedGrade} - Pending Enrollment
            </h3>
            <div className={styles.modalStats}>
              <div className={styles.modalStatsLabel}>Total Pending Students</div>
              <div className={styles.modalStatsCount}>{gradeData.total}</div>
            </div>
            <div className={styles.modalSection}>
              <div className={styles.modalSectionTitle}>Pending Students List:</div>
              <div className={styles.pendingStudentsList}>
                {gradeData.students.length === 0 ? (
                  <div className={styles.emptyState}>
                    No pending enrollments for this grade.
                  </div>
                ) : (
                  gradeData.students.map((student) => (
                    <div key={student.id} className={styles.studentCard}>
                      <div className={styles.studentInfo}>
                        <div className={styles.studentName}>{student.name}</div>
                        <div className={styles.studentDetails}>LRN: {student.lrn}</div>
                        <div className={styles.studentDetails}>
                          Enrolling to: {student.enrollingTo}
                        </div>
                        <button
                          className={styles.pendingViewBtn}
                          onClick={() => handleViewForm(student.id)}
                          style={{ marginTop: '0.5rem' }}
                        >
                          View Form
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => setShowGradeModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEnrollmentPending;

