import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './AdminGradeView.module.css';

// Sample data - in production, this would come from an API
const sampleStudents = {
  grade7: [
    { id: 1, name: 'Kiana Mae Alvarez', status: 'completed', lrn: '00000000', finalGrade: 92, grade: 7 },
    { id: 2, name: 'Jerica May Galve', status: 'completed', lrn: '00000000', finalGrade: 93, grade: 7 },
    { id: 3, name: 'Haven Joy DAyola', status: 'incomplete', lrn: '00000000', finalGrade: null, grade: 7 },
    { id: 4, name: 'Khaleed James Forteza', status: 'completed', lrn: '00000000', finalGrade: 88, grade: 7 },
    { id: 5, name: 'Jandel Grower', status: 'failed', lrn: '00000000', finalGrade: 74, grade: 7 },
  ],
  grade8: [
    { id: 1, name: 'Maria Cristina Bautista', status: 'completed', lrn: '100000001', finalGrade: 90, grade: 8 },
    { id: 2, name: 'John Michael Cruz', status: 'completed', lrn: '100000002', finalGrade: 89, grade: 8 },
    { id: 3, name: 'Sarah Jane Dela Rosa', status: 'incomplete', lrn: '100000003', finalGrade: null, grade: 8 },
    { id: 4, name: 'Mark Anthony Fernandez', status: 'completed', lrn: '100000004', finalGrade: 87, grade: 8 },
    { id: 5, name: 'Patricia Ann Garcia', status: 'failed', lrn: '100000005', finalGrade: 73, grade: 8 },
  ],
  grade9: [
    { id: 1, name: 'Anna Marie Santos', status: 'completed', lrn: '200000001', finalGrade: 91, grade: 9 },
    { id: 2, name: 'Robert James Torres', status: 'completed', lrn: '200000002', finalGrade: 88, grade: 9 },
    { id: 3, name: 'Jennifer Lynn Villanueva', status: 'incomplete', lrn: '200000003', finalGrade: null, grade: 9 },
    { id: 4, name: 'Michael Angelo Reyes', status: 'completed', lrn: '200000004', finalGrade: 85, grade: 9 },
    { id: 5, name: 'Catherine Rose Mendoza', status: 'failed', lrn: '200000005', finalGrade: 72, grade: 9 },
  ],
  grade10: [
    { id: 1, name: 'Daniel Paul Aquino', status: 'completed', lrn: '300000001', finalGrade: 94, grade: 10 },
    { id: 2, name: 'Maria Isabel Ramos', status: 'completed', lrn: '300000002', finalGrade: 90, grade: 10 },
    { id: 3, name: 'Christian Mark Lopez', status: 'incomplete', lrn: '300000003', finalGrade: null, grade: 10 },
    { id: 4, name: 'Angela Grace Morales', status: 'completed', lrn: '300000004', finalGrade: 86, grade: 10 },
    { id: 5, name: 'Kevin John Rivera', status: 'failed', lrn: '300000005', finalGrade: 71, grade: 10 },
  ],
};

// Sample subject grades for each student
const sampleSubjectGrades = {
  1: [
    { subject: 'Mathematics', q1: 88, q2: 88, q3: 88, q4: 88 },
    { subject: 'Science', q1: 91, q2: 91, q3: 91, q4: 91 },
    { subject: 'English', q1: 95, q2: 95, q3: 95, q4: 95 },
    { subject: 'Filipino', q1: 93, q2: 93, q3: 93, q4: 93 },
    { subject: 'Araling Panlipunan', q1: 91, q2: 91, q3: 91, q4: 91 },
    { subject: 'MAPEH', q1: 91, q2: 91, q3: 91, q4: 91 },
    { subject: 'TLE', q1: 93, q2: 93, q3: 93, q4: 93 },
  ],
};

const ADMIN_PASSWORD = '12345';

function AdminGradeView() {
  const { grade } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editGrades, setEditGrades] = useState({ q1: '', q2: '', q3: '', q4: '' });
  const [editError, setEditError] = useState('');

  // Handle both "grade7" and "7" formats
  const gradeKey = grade.startsWith('grade') ? grade : `grade${grade}`;
  const students = sampleStudents[gradeKey] || [];
  const gradeNumber = parseInt(grade.replace('grade', ''));

  // Filter students based on active tab and search term
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Filter by tab
    if (activeTab !== 'students') {
      filtered = filtered.filter(student => student.status === activeTab);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(term) ||
        student.lrn.toLowerCase().includes(term) ||
        (student.finalGrade !== null && student.finalGrade.toString().includes(term)) ||
        student.status.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [students, activeTab, searchTerm]);

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
  };

  const handleCloseViewModal = () => {
    setSelectedStudent(null);
  };

  const handleEditGrade = (subjectGrade) => {
    setEditingSubject(subjectGrade);
    setEditGrades({
      q1: subjectGrade.q1 || '',
      q2: subjectGrade.q2 || '',
      q3: subjectGrade.q3 || '',
      q4: subjectGrade.q4 || '',
    });
    setShowPasswordModal(true);
    setPassword('');
    setPasswordError(false);
  };

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setShowPasswordModal(false);
      setShowEditModal(true);
      setPassword('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPassword('');
    }
  };

  const handleSaveGrade = () => {
    const q1 = parseInt(editGrades.q1);
    const q2 = parseInt(editGrades.q2);
    const q3 = parseInt(editGrades.q3);
    const q4 = parseInt(editGrades.q4);

    // Validation
    if (isNaN(q1) || isNaN(q2) || isNaN(q3) || isNaN(q4)) {
      setEditError('Please enter valid numbers for all quarters.');
      return;
    }

    if (q1 < 0 || q1 > 100 || q2 < 0 || q2 > 100 || q3 < 0 || q3 > 100 || q4 < 0 || q4 > 100) {
      setEditError('Grades must be between 0 and 100.');
      return;
    }

    // Calculate final grade
    const finalGrade = Math.round((q1 + q2 + q3 + q4) / 4);

    // Update the subject grade (in production, this would be an API call)
    if (editingSubject && selectedStudent) {
      const subjectIndex = sampleSubjectGrades[selectedStudent.id]?.findIndex(
        s => s.subject === editingSubject.subject
      );
      if (subjectIndex !== undefined && subjectIndex !== -1) {
        sampleSubjectGrades[selectedStudent.id][subjectIndex] = {
          ...editingSubject,
          q1,
          q2,
          q3,
          q4,
          final: finalGrade,
        };
      }
    }

    // Recalculate GWA and final grade
    if (selectedStudent) {
      const studentGrades = sampleSubjectGrades[selectedStudent.id] || [];
      const totalFinal = studentGrades.reduce((sum, sg) => sum + (sg.final || Math.round((sg.q1 + sg.q2 + sg.q3 + sg.q4) / 4)), 0);
      const gwa = studentGrades.length > 0 ? Math.round(totalFinal / studentGrades.length) : 0;
      
      // Update student's final grade
      const studentIndex = students.findIndex(s => s.id === selectedStudent.id);
      if (studentIndex !== -1) {
        students[studentIndex].finalGrade = gwa;
      }
    }

    setShowEditModal(false);
    setEditingSubject(null);
    setEditError('');
    alert('Grades updated successfully!');
  };

  const getStudentSubjectGrades = (studentId) => {
    return sampleSubjectGrades[studentId] || sampleSubjectGrades[1] || [];
  };

  const calculateGWA = (subjectGrades) => {
    if (!subjectGrades || subjectGrades.length === 0) return 0;
    const total = subjectGrades.reduce((sum, sg) => {
      const final = sg.final || Math.round((sg.q1 + sg.q2 + sg.q3 + sg.q4) / 4);
      return sum + final;
    }, 0);
    return (total / subjectGrades.length).toFixed(2);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return styles.statusCompleted;
      case 'incomplete':
        return styles.statusIncomplete;
      case 'failed':
        return styles.statusFailed;
      default:
        return '';
    }
  };

  return (
    <div className={styles.mainContent}>
      <h2 className={styles.pageTitle}>Grades - Grade {gradeNumber}</h2>

      <div className={styles.gradeCard}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'students' ? styles.active : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Students
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'incomplete' ? styles.active : ''}`}
            onClick={() => setActiveTab('incomplete')}
          >
            Incomplete
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'completed' ? styles.active : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'failed' ? styles.active : ''}`}
            onClick={() => setActiveTab('failed')}
          >
            Failed
          </button>
          <div className={styles.search}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>Grade</th>
              <th>Name</th>
              <th>Status</th>
              <th>LRN</th>
              <th>Final Grade</th>
              <th>Edit Grades</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} data-status={student.status}>
                <td style={{ textAlign: 'center' }}>{gradeNumber}</td>
                <td>{student.name}</td>
                <td className={getStatusClass(student.status)}>
                  {student.status.toUpperCase()}
                </td>
                <td>{student.lrn}</td>
                <td>{student.finalGrade !== null ? student.finalGrade : '-'}</td>
                <td>
                  <button
                    className={styles.viewBtn}
                    onClick={() => handleViewStudent(student)}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <circle cx="12" cy="12" r="4"/>
                    </svg>
                    view
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Grade Modal */}
      {selectedStudent && (
        <div className={styles.modalOverlay} onClick={handleCloseViewModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={handleCloseViewModal}>
              &times;
            </button>
            <div className={styles.modalHeader}>
              <div className={styles.modalName}>{selectedStudent.name}</div>
              <div className={styles.modalLrn}>{selectedStudent.lrn}</div>
            </div>
            <table className={styles.modalTable}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>1st Quarter</th>
                  <th>2nd Quarter</th>
                  <th>3rd Quarter</th>
                  <th>4th Quarter</th>
                  <th>Final Grades</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {getStudentSubjectGrades(selectedStudent.id).map((subjectGrade, index) => {
                  const final = subjectGrade.final || Math.round((subjectGrade.q1 + subjectGrade.q2 + subjectGrade.q3 + subjectGrade.q4) / 4);
                  return (
                    <tr key={index}>
                      <td>{subjectGrade.subject}</td>
                      <td>{subjectGrade.q1}</td>
                      <td>{subjectGrade.q2}</td>
                      <td>{subjectGrade.q3}</td>
                      <td>{subjectGrade.q4}</td>
                      <td>{final.toFixed(2)}</td>
                      <td>
                        <button
                          className={styles.modalEditBtn}
                          onClick={() => handleEditGrade(subjectGrade)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className={styles.modalGWA}>
              GWA: <span>{calculateGWA(getStudentSubjectGrades(selectedStudent.id))}</span>
            </div>
            <div className={styles.modalBottom}>
              <div className={styles.modalNotify}>
                <div>
                  Failed subjects: <span>0</span>{' '}
                  <button className={styles.notifyBtn}>notify student</button>
                </div>
                <div>
                  Pending grades: <span>0</span>{' '}
                  <button className={styles.notifyBtn}>notify teacher</button>
                </div>
              </div>
              <div className={styles.modalSummary}>
                <div>
                  FINAL GRADE: <span className={styles.finalGrade}>{selectedStudent.finalGrade || '-'}</span>
                </div>
                <div>
                  STATUS:{' '}
                  <span className={styles.statusPassed}>
                    {selectedStudent.status === 'failed' ? 'FAILED' : selectedStudent.status === 'completed' ? 'PASSED' : 'PENDING'}
                  </span>
                </div>
                <div>
                  <button className={styles.retainBtn}>Retain</button>
                  <button className={styles.promoteBtn}>Promote</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className={styles.passwordModalOverlay} onClick={() => setShowPasswordModal(false)}>
          <div className={styles.passwordModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.passwordModalClose} onClick={() => setShowPasswordModal(false)}>
              &times;
            </button>
            <h3>Admin Authentication Required</h3>
            <p>Please enter your admin password to edit grades:</p>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit();
                }
              }}
            />
            {passwordError && (
              <div className={styles.passwordError}>Incorrect password. Please try again.</div>
            )}
            <div className={styles.passwordModalButtons}>
              <button onClick={() => setShowPasswordModal(false)}>Cancel</button>
              <button onClick={handlePasswordSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Grade Modal */}
      {showEditModal && editingSubject && (
        <div className={styles.editModalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.editModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.editModalClose} onClick={() => setShowEditModal(false)}>
              &times;
            </button>
            <h3>Edit Grades - {editingSubject.subject}</h3>
            <div className={styles.editForm}>
              <div className={styles.editField}>
                <label>1st Quarter</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={editGrades.q1}
                  onChange={(e) => setEditGrades({ ...editGrades, q1: e.target.value })}
                />
              </div>
              <div className={styles.editField}>
                <label>2nd Quarter</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={editGrades.q2}
                  onChange={(e) => setEditGrades({ ...editGrades, q2: e.target.value })}
                />
              </div>
              <div className={styles.editField}>
                <label>3rd Quarter</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={editGrades.q3}
                  onChange={(e) => setEditGrades({ ...editGrades, q3: e.target.value })}
                />
              </div>
              <div className={styles.editField}>
                <label>4th Quarter</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={editGrades.q4}
                  onChange={(e) => setEditGrades({ ...editGrades, q4: e.target.value })}
                />
              </div>
            </div>
            {editError && <div className={styles.editError}>{editError}</div>}
            <div className={styles.editModalButtons}>
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button onClick={handleSaveGrade}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button className={styles.backBtn} onClick={() => navigate('/admin/grades')} title="Back">
        <svg width="32" height="32" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
    </div>
  );
}

export default AdminGradeView;

