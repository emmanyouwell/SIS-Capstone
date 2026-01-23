import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InfoCard from '../../components/InfoCard';
import styles from './TeacherMasterlist.module.css';
import MessageModal from '../../components/MessageModal';
import { fetchMasterlists } from '../../store/slices/masterlistSlice';
import { fetchAllEnrollments } from '../../store/slices/enrollmentSlice';

const studentsIcon = (
  <img 
    src="https://cdn-icons-png.flaticon.com/128/3426/3426653.png" 
    alt="Students Icon"
    style={{ width: '32px', height: '32px' }}
  />
);

const sectionsIcon = (
  <img 
    src="https://cdn-icons-png.flaticon.com/128/3388/3388614.png" 
    alt="Sections Icon"
    style={{ width: '32px', height: '32px' }}
  />
);

const averageIcon = (
  <img 
    src="https://cdn-icons-png.flaticon.com/128/3487/3487761.png" 
    alt="Average Icon"
    style={{ width: '32px', height: '32px' }}
  />
);

function TeacherMasterlist() {
  const dispatch = useDispatch();
  const { masterlists, loading, error } = useSelector((state) => state.masterlists);
  const { user } = useSelector((state) => state.auth);
  const { enrollments } = useSelector((state) => state.enrollments);
  
  const [selectedMasterlistId, setSelectedMasterlistId] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    grade: '',
    note: ''
  });
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({ type: 'info', message: '' });

  // Fetch masterlists and enrollments on component mount
  useEffect(() => {
    dispatch(fetchMasterlists());
    dispatch(fetchAllEnrollments());
  }, [dispatch]);

  // Filter masterlists to only those assigned to the current teacher
  const assignedMasterlists = useMemo(() => {
    if (!user?.id) return [];
    const teacherUserId = (user.id || user._id)?.toString();
    return (masterlists || []).filter((ml) => {
      const adviserUserId = ml.adviser?.userId?._id?.toString();
      const isAdviser = adviserUserId && adviserUserId === teacherUserId;
      const isSubjectTeacher = Array.isArray(ml.subjectTeachers) && ml.subjectTeachers.some((st) => {
        const stUserId = st.teacher?.userId?._id?.toString();
        return stUserId && stUserId === teacherUserId;
      });
      return isAdviser || isSubjectTeacher;
    });
  }, [masterlists, user]);

  // Set default selected masterlist when assigned data loads
  useEffect(() => {
    if (assignedMasterlists.length > 0 && !selectedMasterlistId) {
      setSelectedMasterlistId(assignedMasterlists[0]._id);
    }
    // Reset selection if current selection is no longer in filtered list
    if (
      selectedMasterlistId &&
      assignedMasterlists.length > 0 &&
      !assignedMasterlists.find((m) => m._id === selectedMasterlistId)
    ) {
      setSelectedMasterlistId(assignedMasterlists[0]._id);
    }
  }, [assignedMasterlists, selectedMasterlistId]);

  // Get current masterlist and students
  const currentMasterlist = assignedMasterlists.find(m => m._id === selectedMasterlistId);
  const currentStudents = currentMasterlist?.students || [];

  // Calculate enrolled students in current section
  const enrolledInSection = currentStudents.length;
  
  // Calculate active sections (total number of assigned masterlists/sections)
  const totalSections = assignedMasterlists.length;
  
  // Calculate total enrolled students across all grades for the school year
  const totalEnrolledStudents = useMemo(() => {
    // Count unique students with status 'enrolled' across all grades
    const enrolledEnrollments = enrollments.filter((e) => e.status === 'enrolled');
    // Get unique student IDs to avoid double counting
    const uniqueStudentIds = new Set(
      enrolledEnrollments.map((e) => {
        const studentId = e.studentId?._id?.toString() || e.studentId?.toString();
        return studentId;
      })
    );
    return uniqueStudentIds.size;
  }, [enrollments]);

  // Format student name
  const formatStudentName = (student) => {
    if (!student) return '';
    const lastName = student.lastName || '';
    const firstName = student.firstName || '';
    const middleName = student.middleName || '';
    const extensionName = student.extensionName || '';
    
    let name = lastName;
    if (firstName) name += `, ${firstName}`;
    if (middleName) name += ` ${middleName.charAt(0)}.`;
    if (extensionName) name += ` ${extensionName}`;
    return name;
  };

  // Format section display name
  const getSectionDisplayName = (masterlist) => {
    // Handle both old format (section as string) and new format (section as object)
    const sectionName = typeof masterlist.section === 'string' ? masterlist.section : masterlist.section?.sectionName;
    return `Grade ${masterlist.grade} - ${sectionName || 'N/A'}`;
  };

  const handleSectionChange = (e) => {
    const masterlistId = e.target.value;
    setSelectedMasterlistId(masterlistId);
  };

  const handleGradeSubmit = (e) => {
    e.preventDefault();
    const grade = Number(gradeForm.grade.trim());
    
    if (isNaN(grade) || grade < 60 || grade > 100) {
      setMessageModalContent({
        type: 'error',
        message: 'Please enter a valid grade between 60 and 100.',
      });
      setShowMessageModal(true);
      return;
    }

    // Here you would typically update the student's grade in your state/backend
    // For now, we'll just close the modal
    setShowGradeModal(false);
    setCurrentRow(null);
    setGradeForm({ grade: '', note: '' });
  };

  const handleModalClose = () => {
    setShowGradeModal(false);
    setCurrentRow(null);
    setGradeForm({ grade: '', note: '' });
  };

  if (loading) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Masterlist</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading masterlist data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Masterlist</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'red' }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (assignedMasterlists.length === 0) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Masterlist</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No assigned sections found for your account.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Masterlist</h1>
        </div>
        
        <div className={styles.infoCards}>
          <InfoCard 
            icon={studentsIcon} 
            title="Enrolled" 
            number={enrolledInSection.toString()} 
            subtext="Enrolled" 
          />
          <InfoCard 
            icon={sectionsIcon} 
            title="Sections" 
            number={totalSections.toString()} 
            subtext="Active Sections" 
          />
          <InfoCard 
            icon={averageIcon} 
            title="Total Enrolled Students" 
            number={totalEnrolledStudents.toString()} 
            subtext="Total Enrolled Students" 
          />
        </div>
        
        <div className={styles.masterlistContainer}>
          <div className={styles.masterlistCard}>
            <div className={styles.sectionSelect}>
              <select 
                id="sectionSelect" 
                value={selectedMasterlistId || ''}
                onChange={handleSectionChange}
              >
                {assignedMasterlists.map((masterlist) => (
                  <option key={masterlist._id} value={masterlist._id}>
                    {getSectionDisplayName(masterlist)}
                  </option>
                ))}
              </select>
            </div>
            <table className={styles.masterlistTable}>
              <thead>
                <tr>
                  <th>LRN</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Grade</th>
                  <th>Section</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>
                      No students in this section yet.
                    </td>
                  </tr>
                ) : (
                  currentStudents.map((student, index) => (
                    <tr key={student._id || student.learnerReferenceNo || index} data-row={index + 1}>
                      <td>{student.learnerReferenceNo || 'N/A'}</td>
                      <td>{formatStudentName(student)}</td>
                      <td>{student.sex || 'N/A'}</td>
                      <td>{student.grade || currentMasterlist?.grade || 'N/A'}</td>
                      <td>
                        {(() => {
                          // Handle both old format (section as string) and new format (section as object)
                          const sectionName = typeof currentMasterlist?.section === 'string' 
                            ? currentMasterlist.section 
                            : currentMasterlist?.section?.sectionName;
                          return student.section || sectionName || 'N/A';
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grade & Note Edit Modal */}
      {showGradeModal && (
        <div 
          className={styles.modal} 
          onClick={handleModalClose}
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-title"
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 id="modal-title">Enter Grade & Note</h3>
            <form id="grade-form" onSubmit={handleGradeSubmit}>
              <label htmlFor="grade-input">Grade (60-100)</label>
              <input 
                type="number" 
                id="grade-input" 
                min="60" 
                max="100" 
                required 
                placeholder="Enter grade (e.g. 85)"
                value={gradeForm.grade}
                onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
              />
              <label htmlFor="note-input">Note (optional)</label>
              <textarea 
                id="note-input" 
                rows="3" 
                placeholder="Add a note..."
                value={gradeForm.note}
                onChange={(e) => setGradeForm({ ...gradeForm, note: e.target.value })}
              />
              <div className={styles.modalButtons}>
                <button 
                  type="button" 
                  className={styles.btnSecondary}
                  onClick={handleModalClose}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <MessageModal
        show={showMessageModal}
        type={messageModalContent.type}
        message={messageModalContent.message}
        onClose={() => setShowMessageModal(false)}
      />
      </>
  );
}

export default TeacherMasterlist;

