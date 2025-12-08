import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InfoCard from '../../components/InfoCard';
import styles from './TeacherMasterlist.module.css';
import MessageModal from '../../components/MessageModal';
import { fetchMasterlists } from '../../store/slices/masterlistSlice';

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
  
  const [selectedMasterlistId, setSelectedMasterlistId] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    grade: '',
    note: ''
  });
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({ type: 'info', message: '' });

  // Fetch masterlists on component mount
  useEffect(() => {
    dispatch(fetchMasterlists());
  }, [dispatch]);

  // Set default selected masterlist when data loads
  useEffect(() => {
    if (masterlists.length > 0 && !selectedMasterlistId) {
      setSelectedMasterlistId(masterlists[0]._id);
    }
  }, [masterlists, selectedMasterlistId]);

  // Get current masterlist and students
  const currentMasterlist = masterlists.find(m => m._id === selectedMasterlistId);
  const currentStudents = currentMasterlist?.students || [];

  // Calculate totals
  const totalStudents = masterlists.reduce((sum, ml) => sum + (ml.students?.length || 0), 0);
  const totalSections = masterlists.length;

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
    return `Grade ${masterlist.grade} - ${masterlist.section}`;
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

  if (masterlists.length === 0) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Masterlist</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No masterlists assigned to you yet.</p>
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
            title="Total Students" 
            number={totalStudents.toString()} 
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
            title="Average" 
            number="85" 
            subtext="Class Average" 
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
                {masterlists.map((masterlist) => (
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
                      <td>{student.section || currentMasterlist?.section || 'N/A'}</td>
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

