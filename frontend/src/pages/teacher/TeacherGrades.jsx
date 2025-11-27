import { useState, useEffect } from 'react';
import styles from './TeacherGrades.module.css';

function TeacherGrades() {
  // Sample students for each section
  const studentsBySection = {
    'g7-dahlia': [
      { grade: 7, name: 'Kiana Mae Alvarez', status: '', lrn: '00000001', final: null, comment: '' },
      { grade: 7, name: 'Jerica May Galve', status: '', lrn: '00000002', final: null, comment: '' },
      { grade: 7, name: 'Haven Joy Dayola', status: '', lrn: '00000003', final: null, comment: '' },
      { grade: 7, name: 'Khaleed James Forteza', status: '', lrn: '00000004', final: null, comment: '' },
      { grade: 7, name: 'Jandel Grower', status: '', lrn: '00000005', final: null, comment: '' },
    ],
    'g8-lilac': [
      { grade: 8, name: 'Maria Santos', status: '', lrn: '00000006', final: null, comment: '' },
      { grade: 8, name: 'John Dela Cruz', status: '', lrn: '00000007', final: null, comment: '' },
      { grade: 8, name: 'Sarah Johnson', status: '', lrn: '00000008', final: null, comment: '' },
      { grade: 8, name: 'Michael Tan', status: '', lrn: '00000009', final: null, comment: '' },
      { grade: 8, name: 'Lisa Wong', status: '', lrn: '00000010', final: null, comment: '' },
    ],
    'g8-tulip': [
      { grade: 8, name: 'David Lee', status: '', lrn: '00000011', final: null, comment: '' },
      { grade: 8, name: 'Anna Garcia', status: '', lrn: '00000012', final: null, comment: '' },
      { grade: 8, name: 'Robert Chen', status: '', lrn: '00000013', final: null, comment: '' },
      { grade: 8, name: 'Emily Martinez', status: '', lrn: '00000014', final: null, comment: '' },
      { grade: 8, name: 'James Wilson', status: '', lrn: '00000015', final: null, comment: '' },
    ],
    'g9-daisy': [
      { grade: 9, name: 'Sophia Kim', status: '', lrn: '00000016', final: null, comment: '' },
      { grade: 9, name: 'Daniel Park', status: '', lrn: '00000017', final: null, comment: '' },
      { grade: 9, name: 'Olivia Brown', status: '', lrn: '00000018', final: null, comment: '' },
      { grade: 9, name: 'William Davis', status: '', lrn: '00000019', final: null, comment: '' },
      { grade: 9, name: 'Emma Taylor', status: '', lrn: '00000020', final: null, comment: '' },
    ],
  };

  // Function to clone students for each quarter
  const cloneStudents = (students) => {
    return students.map(s => ({ ...s }));
  };

  // Initialize gradesData with students from the default section
  const initializeGradesData = (sectionKey) => {
    const students = studentsBySection[sectionKey] || [];
    return {
      q1: cloneStudents(students),
      q2: cloneStudents(students),
      q3: cloneStudents(students),
      q4: cloneStudents(students),
    };
  };

  const [currentSection, setCurrentSection] = useState('g7-dahlia');
  const [gradesData, setGradesData] = useState(() => initializeGradesData('g7-dahlia'));
  const [currentTab, setCurrentTab] = useState('q1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGradeInputModal, setShowGradeInputModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [currentStudentName, setCurrentStudentName] = useState('');
  const [gradeInput, setGradeInput] = useState('');
  const [gradeComment, setGradeComment] = useState('');
  const [gradeInputError, setGradeInputError] = useState('');
  const [pendingGrade, setPendingGrade] = useState(null);
  const [pendingComment, setPendingComment] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [fadeClass, setFadeClass] = useState('');

  // Update gradesData when section changes
  useEffect(() => {
    setGradesData(initializeGradesData(currentSection));
    setSearchQuery('');
  }, [currentSection]);

  // Get section display name
  const getSectionDisplayName = () => {
    const sectionMap = {
      'g7-dahlia': 'Grade 7 - Dahlia',
      'g8-lilac': 'Grade 8 - Lilac',
      'g8-tulip': 'Grade 8 - Tulip',
      'g9-daisy': 'Grade 9 - Daisy',
    };
    return sectionMap[currentSection] || 'Grade 7 - Dahlia';
  };

  // Handle section change
  const handleSectionChange = (e) => {
    setCurrentSection(e.target.value);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setFadeClass('fadeOut');
    setTimeout(() => {
      setCurrentTab(tab);
      setFadeClass('fadeIn');
      setTimeout(() => {
        setFadeClass('');
      }, 300);
    }, 150);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Open grade input modal
  const handleViewGrade = (studentName) => {
    setCurrentStudentName(studentName);
    setGradeInput('');
    setGradeComment('');
    setGradeInputError('');
    setShowGradeInputModal(true);
  };

  // Close grade input modal
  const closeGradeInputModal = () => {
    setShowGradeInputModal(false);
    setGradeInput('');
    setGradeComment('');
    setGradeInputError('');
  };

  // Open confirmation modal
  const openConfirmationModal = () => {
    const gradeValue = gradeInput.trim();
    const commentValue = gradeComment.trim();

    if (gradeValue === '') {
      setPendingGrade('');
      setPendingComment(commentValue);
    } else {
      const gradeNum = parseInt(gradeValue);
      if (isNaN(gradeNum) || gradeNum < 60 || gradeNum > 100) {
        setGradeInputError('Please enter a grade between 60 and 100.');
        return;
      }
      setPendingGrade(gradeNum);
      setPendingComment(commentValue);
    }

    setGradeInputError('');
    setShowConfirmationModal(true);
  };

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  // Submit grade
  const submitGrade = () => {
    const student = gradesData[currentTab].find(row => row.name === currentStudentName);
    if (student) {
      if (pendingGrade === '') {
        student.final = null;
        student.status = '';
        student.comment = pendingComment;
      } else if (pendingGrade >= 75) {
        student.final = pendingGrade;
        student.status = 'PASSED';
        student.comment = pendingComment;
      } else if (pendingGrade >= 60 && pendingGrade <= 74) {
        student.final = pendingGrade;
        student.status = 'FAILED';
        student.comment = pendingComment;
      }
    }

    setGradesData({ ...gradesData });
    closeConfirmationModal();
    closeGradeInputModal();
    setToastMessage(`Grade posted successfully for ${currentStudentName}.`);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 2200);
  };

  // Handle Enter key in grade input
  const handleGradeInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      openConfirmationModal();
    }
  };

  // Handle Enter key in comment input
  const handleCommentKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      openConfirmationModal();
    }
  };

  // Get filtered students
  const getFilteredStudents = () => {
    return gradesData[currentTab].filter(row =>
      row.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Get status display
  const getStatusDisplay = (status) => {
    if (status === 'PASSED') {
      return { text: status, style: { fontWeight: 700, color: '#184d27' } };
    } else if (status === 'FAILED') {
      return { text: status, style: { fontWeight: 700, color: '#c53030' } };
    }
    return { text: '', style: {} };
  };

  // Get confirmation summary
  const getConfirmationSummary = () => {
    const gradeValue = gradeInput.trim() || '-';
    const status = pendingGrade === '' ? '' : (pendingGrade >= 75 ? 'PASSED' : 'FAILED');
    const statusColor = status === 'PASSED' ? '#184d27' : status === 'FAILED' ? '#c53030' : '';
    
    return { gradeValue, status, statusColor };
  };

  // Get student info HTML
  const getStudentInfo = () => {
    const student = gradesData[currentTab].find(row => row.name === currentStudentName);
    if (student) {
      return `Name: <b>${student.name}</b><br>LRN: <b>${student.lrn}</b><br>Grade: <b>${student.grade}</b>`;
    }
    return '';
  };

  const filteredStudents = getFilteredStudents();

  return (
      <div className={styles.mainContent}>
        <h1 className={styles.gradesTitle}>Grades - {getSectionDisplayName()}</h1>
        
        <div className={styles.sectionSelect}>
          <select
            id="sectionSelect"
            value={currentSection}
            onChange={handleSectionChange}
            className={styles.sectionSelectInput}
          >
            <option value="g7-dahlia">Grade 7 - Dahlia</option>
            <option value="g8-lilac">Grade 8 - Lilac</option>
            <option value="g8-tulip">Grade 8 - Tulip</option>
            <option value="g9-daisy">Grade 9 - Daisy</option>
          </select>
        </div>

        <div className={styles.gradesCard}>
          <div className={styles.gradesTabs}>
            <button
              className={`${styles.gradesTab} ${currentTab === 'q1' ? styles.active : ''}`}
              onClick={() => handleTabChange('q1')}
            >
              First Quarter
            </button>
            <button
              className={`${styles.gradesTab} ${currentTab === 'q2' ? styles.active : ''}`}
              onClick={() => handleTabChange('q2')}
            >
              Second Quarter
            </button>
            <button
              className={`${styles.gradesTab} ${currentTab === 'q3' ? styles.active : ''}`}
              onClick={() => handleTabChange('q3')}
            >
              Third Quarter
            </button>
            <button
              className={`${styles.gradesTab} ${currentTab === 'q4' ? styles.active : ''}`}
              onClick={() => handleTabChange('q4')}
            >
              Fourth Quarter
            </button>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                className={styles.gradesSearch}
              />
            </div>
          </div>

          <div className={`${styles.gradesTableContainer} ${fadeClass ? styles[fadeClass] : ''}`}>
            <table className={styles.gradesTable}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>Grade</th>
                  <th>Subject</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>LRN</th>
                  <th>Final Grade</th>
                  <th>Edit Grades</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((row, index) => {
                  const status = getStatusDisplay(row.status);
                  return (
                    <tr
                      key={index}
                      style={{
                        background: row.status === 'INCOMPLETE' || row.status === 'FAILED' ? '#f8fafc' : '',
                      }}
                    >
                      <td style={{ textAlign: 'center' }}>{row.grade}</td>
                      <td style={{ textAlign: 'center' }}>Math</td>
                      <td>{row.name}</td>
                      <td style={status.style}>{status.text}</td>
                      <td>{row.lrn}</td>
                      <td>{row.final !== null ? row.final : '-'}</td>
                      <td>
                        <button
                          onClick={() => handleViewGrade(row.name)}
                          className={styles.viewButton}
                        >
                          <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="4" />
                            <line x1="21" y1="12" x2="17" y2="12" />
                          </svg>
                          view
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grade Input Modal */}
        {showGradeInputModal && (
          <div
            className={styles.gradeInputModal}
            onClick={closeGradeInputModal}
          >
            <div
              className={styles.gradeInputModalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src="/images/logo.jpg"
                alt="School Logo"
                className={styles.modalLogo}
              />
              <div className={styles.studentInfoContainer}>
                <div className={styles.studentInfoTitle}>Student Information</div>
                <div
                  className={styles.studentInfo}
                  dangerouslySetInnerHTML={{ __html: getStudentInfo() }}
                />
              </div>
              <h3 className={styles.modalTitle}>
                Insert Grade for <span>{currentStudentName}</span>
              </h3>
              <input
                type="number"
                id="gradeInput"
                placeholder="Enter grade (60-100) or leave blank"
                min="60"
                max="100"
                value={gradeInput}
                onChange={(e) => {
                  setGradeInput(e.target.value);
                  setGradeInputError('');
                }}
                onKeyPress={handleGradeInputKeyPress}
                className={styles.modalInput}
              />
              <textarea
                id="gradeComment"
                placeholder="Add a comment (optional)"
                rows="2"
                value={gradeComment}
                onChange={(e) => setGradeComment(e.target.value)}
                onKeyPress={handleCommentKeyPress}
                className={styles.modalTextarea}
              />
              {gradeInputError && (
                <div className={styles.errorMessage}>{gradeInputError}</div>
              )}
              <div className={styles.modalButtons}>
                <button
                  className={styles.cancelBtn}
                  onClick={closeGradeInputModal}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitBtn}
                  onClick={openConfirmationModal}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmationModal && (
          <div
            className={styles.confirmationModal}
            onClick={closeConfirmationModal}
          >
            <div
              className={styles.confirmationModalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src="/images/logo.jpg"
                alt="School Logo"
                className={styles.modalLogo}
              />
              <div className={styles.studentInfoContainer}>
                <div className={styles.studentInfoTitle}>Student Information</div>
                <div
                  className={styles.studentInfo}
                  dangerouslySetInnerHTML={{ __html: getStudentInfo() }}
                />
              </div>
              <div className={styles.confirmationSummary}>
                {(() => {
                  const summary = getConfirmationSummary();
                  return (
                    <div style={{ fontSize: '1.1rem', marginBottom: '1.2rem' }}>
                      You are about to post grade <b>{summary.gradeValue}</b>{' '}
                      {summary.status && (
                        <span style={{ color: summary.statusColor, fontWeight: 700 }}>
                          {summary.status}
                        </span>
                      )}{' '}
                      for <b>{currentStudentName}</b>.
                      <br />
                      {pendingComment && (
                        <>
                          Comment: <i>{pendingComment}</i>
                        </>
                      )}
                      <br />
                      Proceed?
                    </div>
                  );
                })()}
              </div>
              <div className={styles.confirmationModalButtons}>
                <button
                  className={styles.cancelBtn}
                  onClick={closeConfirmationModal}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmBtn}
                  onClick={submitGrade}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {showSuccessToast && (
          <div className={styles.successToast}>{toastMessage}</div>
        )}
      </div>
  );
}

export default TeacherGrades;

