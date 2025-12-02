import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminMasterlistGradeView.module.css';
import { fetchMasterlists, clearError } from '../../store/slices/masterlistSlice';
import { getAllSections } from '../../store/slices/sectionSlice';

function AdminMasterlistGradeView() {
  const { grade } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const gradeNumber = parseInt(grade?.replace('grade', '') || '7');
  const [selectedSection, setSelectedSection] = useState('');

  const { masterlists, loading, error } = useSelector((state) => state.masterlists);
  const sections = useSelector((state) => state.section.data);

  // Fetch masterlists and sections for this grade on mount / grade change
  useEffect(() => {
    if (!Number.isNaN(gradeNumber)) {
      dispatch(fetchMasterlists({ grade: gradeNumber }));
      dispatch(getAllSections({ grade: gradeNumber }));
    }
  }, [gradeNumber, dispatch]);

  // Filter masterlists by current grade
  const gradeMasterlists = masterlists.filter((m) => m.grade === gradeNumber);
  
  // Derive sections from API data
  const sectionsList = sections
    .filter((s) => s.grade === gradeNumber)
    .map((s) => s.name)
    .sort();
 
  // Initialize selected section when sections change
  useEffect(() => {
    if (sectionsList.length > 0 && !selectedSection) {
      setSelectedSection(sectionsList[0]);
    }
  }, [sectionsList, selectedSection]);

  const currentSectionName = selectedSection || sectionsList[0] || '';
  const currentMasterlist = gradeMasterlists.find((m) => m.section === currentSectionName) || null;

  const currentStudents = currentMasterlist?.students || [];

  const totalEnrolled = currentStudents.length;
  const activeSections = sectionsList.length;
  const classAverage = 85; // Still a placeholder until backend provides this

  const currentAdviser = currentMasterlist?.adviser
    ? `${currentMasterlist.adviser.lastName}, ${currentMasterlist.adviser.firstName}`
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
      alert('Masterlist copied to clipboard!');
    } catch (err) {
      alert('Failed to copy to clipboard.');
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

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <>
          <div className={styles.infoCards}>
            <div className={styles.card}>
              <div className={styles.number}>{totalEnrolled}</div>
              <div className={styles.subtext}>Enrolled</div>
            </div>
            <div className={styles.card}>
              <div className={styles.number}>{activeSections}</div>
              <div className={styles.subtext}>Active Sections</div>
            </div>
            <div className={styles.card}>
              <div className={styles.number}>{classAverage}</div>
              <div className={styles.subtext}>Class Average</div>
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
                        No students found for this section.
                      </td>
                    </tr>
                  ) : (
                    currentStudents.map((student) => (
                      <tr key={student._id || student.learnerReferenceNo}>
                        <td>{student.learnerReferenceNo || ''}</td>
                        <td>{formatStudentName(student)}</td>
                        <td>{formatGender(student)}</td>
                        <td></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

             
            </div>
          </div>
        </>
      )}

      <button className={styles.backButton} onClick={() => navigate('/admin/masterlist')}>
        <svg
          width="32"
          height="32"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    </div>
  );
}

export default AdminMasterlistGradeView;

