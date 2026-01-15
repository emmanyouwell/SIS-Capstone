import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminMasterlistGradeView.module.css';
import { fetchMasterlists, clearError } from '../../store/slices/masterlistSlice';
import { fetchAllStudents } from '../../store/slices/studentSlice';
import { getAllSections } from '../../store/slices/sectionSlice';
import { fetchAllEnrollments } from '../../store/slices/enrollmentSlice';
import MessageModal from '../../components/MessageModal';

function AdminMasterlistGradeView() {
  const { grade } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const gradeNumber = parseInt(grade?.replace('grade', '') || '7');
  const [selectedSection, setSelectedSection] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({ type: 'info', message: '' });

  const { masterlists, loading, error } = useSelector((state) => state.masterlists);
  const { students, loading: studentsLoading } = useSelector((state) => state.students);
  const sections = useSelector((state) => state.section.data);
  const { enrollments } = useSelector((state) => state.enrollments);

  // Fetch masterlists, students, sections, and enrollments for this grade on mount / grade change
  useEffect(() => {
    if (!Number.isNaN(gradeNumber)) {
      dispatch(fetchMasterlists({ grade: gradeNumber }));
      dispatch(fetchAllStudents({ gradeLevel: gradeNumber }));
      dispatch(getAllSections({ gradeLevel: gradeNumber }));
    }
    // Fetch all enrollments to calculate total enrolled students across all grades
    dispatch(fetchAllEnrollments());
  }, [gradeNumber, dispatch]);

  // Filter masterlists by current grade
  const gradeMasterlists = masterlists.filter((m) => m.grade === gradeNumber);
  
  // Derive sections from API data
  const sectionsList = sections
    .filter((s) => s.gradeLevel === gradeNumber)
    .map((s) => s.sectionName)
    .sort();
 
  // Initialize selected section when sections change
  useEffect(() => {
    if (sectionsList.length > 0 && !selectedSection) {
      setSelectedSection(sectionsList[0]);
    }
  }, [sectionsList, selectedSection]);

  const currentSectionName = selectedSection || sectionsList[0] || '';
  const currentMasterlist = gradeMasterlists.find((m) => {
    // Handle both old format (section as string) and new format (section as object)
    const sectionName = typeof m.section === 'string' ? m.section : m.section?.sectionName;
    return sectionName === currentSectionName;
  }) || null;

  // Get enrolled student IDs from masterlist
  const enrolledIds = new Set(
    (currentMasterlist?.students || []).map((s) => (typeof s === 'object' ? s._id : s))
  );

  // Get all students for current grade and section, mapping Student.userId to User data
  const currentSectionObj = sections.find(
    (s) => s.gradeLevel === gradeNumber && s.sectionName === currentSectionName
  );
  
  // Display only enrolled students for the grade
  const allStudentsForGrade = students
    .filter((student) => student.gradeLevel === gradeNumber && student.userId)
    .map((student) => {
      const user = student.userId;
      const isEnrolled = enrolledIds.has(user._id);
      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        learnerReferenceNo: student.lrn || user.learnerReferenceNo || '',
        sex: user.sex || '',
        isEnrolled,
        sectionId: student.sectionId,
        userStatus: user.status || 'Active', // User status (Active/Inactive)
      };
    })
    .filter((student) => student.isEnrolled) // Filter out not enrolled students
    .sort((a, b) => {
      // Sort by gender (Female first), then by last name
      if (a.sex === 'Female' && b.sex !== 'Female') return -1;
      if (a.sex !== 'Female' && b.sex === 'Female') return 1;
      return (a.lastName || '').localeCompare(b.lastName || '');
    });

  const currentStudents = allStudentsForGrade;
  
  // Calculate enrolled students in current section
  const enrolledInSection = enrolledIds.size;
  
  // Calculate active sections for this grade
  const activeSections = sectionsList.length;
  
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

  const currentAdviser = currentMasterlist?.adviser?.userId
    ? `${currentMasterlist.adviser.userId.lastName}, ${currentMasterlist.adviser.userId.firstName}`
    : 'N/A';

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  const formatGender = (student) => {
    if (!student?.sex) return '';
    if (student.sex === 'Male') return 'M';
    if (student.sex === 'Female') return 'F';
    return student.sex;
  };

  const formatStudentName = (student) => {
    if (!student) return '';
    const middleInitial = student.middleName ? ` ${student.middleName.charAt(0)}.` : '';
    return `${student.lastName}, ${student.firstName}${middleInitial}`;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessageModalContent({
        type: 'success',
        message: 'Masterlist copied to clipboard!',
      });
      setShowMessageModal(true);
    } catch (err) {
      setMessageModalContent({
        type: 'error',
        message: 'Failed to copy to clipboard.',
      });
      setShowMessageModal(true);
    }
  };


  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <h1>Masterlist - Grade {gradeNumber}</h1>
      </div>

      {error && (
        <div
          style={{ padding: '1rem', background: '#fee', color: '#c00', marginBottom: '1rem' }}
        >
          {error}
          <button
            onClick={() => dispatch(clearError())}
            style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {loading || studentsLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <>
          <div className={styles.infoCards}>
            <div className={styles.card}>
              <div className={styles.number}>{enrolledInSection}</div>
              <div className={styles.subtext}>Enrolled</div>
            </div>
            <div className={styles.card}>
              <div className={styles.number}>{activeSections}</div>
              <div className={styles.subtext}>Active Sections</div>
            </div>
            <div className={styles.card}>
              <div className={styles.number}>{totalEnrolledStudents}</div>
              <div className={styles.subtext}>Total Enrolled Students</div>
            </div>
          </div>

          <div className={styles.masterlistContainer}>
            <div className={styles.masterlistCard}>
              <div className={styles.sectionSelect}>
                <select id="sectionSelect" value={currentSectionName} onChange={handleSectionChange}>
                  {sectionsList.map((section) => (
                    <option key={section} value={section}>
                      {section}
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
                    <th>Enrollment</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                        No students found for this grade.
                      </td>
                    </tr>
                  ) : (
                    currentStudents.map((student) => {
                      const isInactive = student.userStatus === 'Inactive';
                      return (
                        <tr 
                          key={student._id || student.learnerReferenceNo}
                          style={isInactive ? {
                            opacity: 0.6,
                            backgroundColor: '#f5f5f5',
                            textDecoration: 'line-through'
                          } : {}}
                        >
                          <td data-label="LRN">{student.learnerReferenceNo || ''}</td>
                          <td data-label="Name">
                            {formatStudentName(student)}
                            {isInactive && (
                              <span style={{
                                marginLeft: '8px',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontSize: '10px',
                                fontWeight: '600',
                                backgroundColor: '#e74c3c',
                                color: '#fff',
                                textDecoration: 'none',
                                display: 'inline-block'
                              }}>
                                INACTIVE
                              </span>
                            )}
                          </td>
                          <td data-label="Gender">{formatGender(student)}</td>
                          <td data-label="Enrollment">
                            {student.isEnrolled ? 'Enrolled' : 'Not Enrolled'}
                            {isInactive && (
                              <span style={{
                                marginLeft: '8px',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontSize: '10px',
                                fontWeight: '600',
                                backgroundColor: '#95a5a6',
                                color: '#fff',
                                display: 'inline-block'
                              }}>
                                Account Inactive
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

             
            </div>
          </div>
        </>
      )}

      <MessageModal
        show={showMessageModal}
        type={messageModalContent.type}
        message={messageModalContent.message}
        onClose={() => setShowMessageModal(false)}
      />
    </div>
  );
}

export default AdminMasterlistGradeView;

