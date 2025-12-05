import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGrades, updateGrade, createGrade } from '../../store/slices/gradeSlice';
import styles from './AdminGradeView.module.css';
import { fetchAllSubjects } from '../../store/slices/subjectSlice';

const ADMIN_PASSWORD = '12345';

function AdminGradeView() {
  const { grade } = useParams(); // here, :grade is a grade level slug e.g. "grade7"
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { grades, loading, error } = useSelector((state) => state.grades);
  const { subjects: subjectList } = useSelector((state) => state.subjects);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  // selectedGrade will hold one entry from the grades array: { student, gradeRecord }
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [editingSubjectIndex, setEditingSubjectIndex] = useState(null);
  const [editGrades, setEditGrades] = useState({ q1: '', q2: '', q3: '', q4: '' });
  const [editError, setEditError] = useState('');

  const gradeNumber = parseInt(grade.replace('grade', ''), 10);

  useEffect(() => {
    if (!Number.isNaN(gradeNumber)) {
      // Backend getGrades now returns an array of { student, gradeRecord }
      dispatch(fetchGrades({ gradeLevel: gradeNumber }));
      dispatch(fetchAllSubjects({ gradeLevel: gradeNumber }))
    }
  }, [dispatch, gradeNumber]);

  useEffect(() => {
    if (subjectList) {
      setAvailableSubjects(subjectList);
    }
  }, [subjectList])
 
  // Build per-student rows from grades array (new structure: grade has studentId ref)
  const students = useMemo(() => {
    return grades.map((gradeRecord) => {
      const student = gradeRecord.studentId;
      const studentUser = student?.userId || {};

      const name = studentUser.firstName && studentUser.lastName
        ? `${studentUser.firstName} ${studentUser.lastName} ${studentUser.middleName || ''}`.trim()
        : 'Unknown Student';

      const finalGrade =
        gradeRecord && typeof gradeRecord.finalGrade === 'number'
          ? Math.round(gradeRecord.finalGrade)
          : null;

      const status = gradeRecord?.remarks || 'incomplete';
      const gradeLevelValue = student?.gradeLevel || gradeNumber;

      return {
        id: student?._id || gradeRecord?._id,
        name,
        lrn: student?.lrn || '-',
        grade: gradeLevelValue,
        status,
        finalGrade,
        student,
        gradeRecord,
      };
    });
  }, [grades, gradeNumber]);

  const filteredStudents = useMemo(() => {
    let list = students;

    if (activeTab !== 'students') {
      list = list.filter((student) => student.status === activeTab);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((student) =>
        student.name.toLowerCase().includes(term) ||
        student.lrn.toLowerCase().includes(term) ||
        (student.finalGrade !== null && student.finalGrade.toString().includes(term)) ||
        student.status.toLowerCase().includes(term)
      );
    }

    return list;
  }, [students, activeTab, searchTerm]);

  const handleViewStudent = (studentRow) => {
    setSelectedGrade({
      student: studentRow.student,
      gradeRecord: studentRow.gradeRecord || null,
    });
  };
  const subjects = useMemo(() => {
    // Extract existing grade entries (new structure: grades is array with subjectId)
    const existingGrades = selectedGrade?.gradeRecord?.grades || [];

    // Build a lookup for quick matching by subjectId _id
    const gradeMap = new Map(
      existingGrades.map((g) => [g.subjectId?._id?.toString() || g.subjectId?.toString(), g])
    );

    // Always return ALL available subjects
    return availableSubjects.map((subj) => {
      const id = subj._id?.toString();

      // If this subject already has a grade entry, merge it
      if (gradeMap.has(id)) {
        const record = gradeMap.get(id);
        return {
          subject: subj,
          q1: record.q1 ?? 0,
          q2: record.q2 ?? 0,
          q3: record.q3 ?? 0,
          q4: record.q4 ?? 0,
        };
      }

      // Otherwise return a placeholder row for new subjects
      return {
        subject: subj,
        q1: 0,
        q2: 0,
        q3: 0,
        q4: 0,
      };
    });
  }, [selectedGrade, availableSubjects]);


  const handleEditSubject = (index) => {
    const subjectGrade = subjects[index];
    setEditingSubjectIndex(index);
    setEditGrades({
      q1: subjectGrade?.q1 ?? '',
      q2: subjectGrade?.q2 ?? '',
      q3: subjectGrade?.q3 ?? '',
      q4: subjectGrade?.q4 ?? '',
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

  const handleSave = () => {
    const q1 = parseInt(editGrades.q1, 10);
    const q2 = parseInt(editGrades.q2, 10);
    const q3 = parseInt(editGrades.q3, 10);
    const q4 = parseInt(editGrades.q4, 10);

    if ([q1, q2, q3, q4].some((q) => Number.isNaN(q))) {
      setEditError('Please enter valid numbers for all quarters.');
      return;
    }

    if (
      q1 < 0 || q1 > 100 ||
      q2 < 0 || q2 > 100 ||
      q3 < 0 || q3 > 100 ||
      q4 < 0 || q4 > 100
    ) {
      setEditError('Grades must be between 0 and 100.');
      return;
    }

    if (editingSubjectIndex === null || !selectedGrade) {
      setEditError('No subject selected to update.');
      return;
    }

    const updatedSubjects = subjects.map((s, idx) =>
      idx === editingSubjectIndex
        ? { ...s, q1, q2, q3, q4 }
        : s
    );

    // Normalize subjects for payload: subjectId must be an ObjectId (new structure)
    const gradesPayload = updatedSubjects
      .filter((s) => s.q1 || s.q2 || s.q3 || s.q4) // Only include subjects with at least one grade
      .map((s) => ({
        subjectId: s.subject?._id || s.subject,
        q1: s.q1,
        q2: s.q2,
        q3: s.q3,
        q4: s.q4,
      }));

    // If there is already a gradeRecord, update it; otherwise create a new one
    if (selectedGrade.gradeRecord) {
      dispatch(
        updateGrade({
          id: selectedGrade.gradeRecord._id,
          data: {
            grades: gradesPayload,
          },
        })
      );
    } else {
      // Create new grade record with studentId
      dispatch(
        createGrade({
          studentId: selectedGrade.student._id,
          grades: gradesPayload,
        })
      );
    }

    setShowEditModal(false);
    setEditingSubjectIndex(null);
    setEditError('');
    if (!Number.isNaN(gradeNumber)) {
      // Backend getGrades now returns an array of { student, gradeRecord }
      dispatch(fetchGrades({ gradeLevel: gradeNumber }));
      dispatch(fetchAllSubjects({ gradeLevel: gradeNumber }))
    }
  };

  const calculateSubjectFinal = (subjectGrade) => {
    const values = [subjectGrade.q1, subjectGrade.q2, subjectGrade.q3, subjectGrade.q4].filter(
      (v) => typeof v === 'number'
    );
    if (values.length === 0) return null;
    const sum = values.reduce((acc, v) => acc + v, 0);
    return Math.round(sum / values.length);
  };

  const calculateOverallFinal = () => {
    if (!selectedGrade || !selectedGrade.gradeRecord) return null;
    if (typeof selectedGrade.gradeRecord.finalGrade === 'number') {
      return Math.round(selectedGrade.gradeRecord.finalGrade);
    }
    const finals = subjects
      .map((s) => calculateSubjectFinal(s))
      .filter((v) => typeof v === 'number');
    if (finals.length === 0) return null;
    const sum = finals.reduce((acc, v) => acc + v, 0);
    return Math.round(sum / finals.length);
  };

  const calculateGWA = () => {
    const overall = calculateOverallFinal();
    if (overall === null) return '-';
    return overall.toFixed(2);
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

      {loading && <div className={styles.statusMessage}>Loading grade...</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}
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
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
                <td style={{ textAlign: 'center' }}>{student.grade}</td>
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
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                    view
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedGrade && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedGrade(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              onClick={() => setSelectedGrade(null)}
            >
              &times;
            </button>
            <div className={styles.modalHeader}>
              <div className={styles.modalName}>
                {selectedGrade.student?.userId
                  ? `${selectedGrade.student.userId.firstName || ''} ${selectedGrade.student.userId.lastName || ''}`.trim() || 'Unknown Student'
                  : 'Unknown Student'}
              </div>
              <div className={styles.modalLrn}>
                {selectedGrade.student?.lrn || '-'}
              </div>
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
                {subjects.map((s, index) => {
                  const final = calculateSubjectFinal(s);
                  return (
                    <tr key={s._id || index}>
                      <td>{s.subject?.name || 'N/A'}</td>
                      <td>{s.q1 ?? '-'}</td>
                      <td>{s.q2 ?? '-'}</td>
                      <td>{s.q3 ?? '-'}</td>
                      <td>{s.q4 ?? '-'}</td>
                      <td>{final !== null ? final : '-'}</td>
                      <td>
                        <button
                          className={styles.modalEditBtn}
                          onClick={() => handleEditSubject(index)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {subjects.length === 0 && (
                  <tr>
                    <td colSpan="7" className={styles.emptyMessage}>
                      No subject grades available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className={styles.modalGWA}>
              GWA: <span>{calculateGWA()}</span>
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
                  FINAL GRADE:{' '}
                  <span className={styles.finalGrade}>
                    {calculateOverallFinal() ?? '-'}
                  </span>
                </div>
                <div>
                  STATUS:{' '}
                  <span className={styles.statusPassed}>
                    {selectedGrade.gradeRecord?.remarks === 'failed'
                      ? 'FAILED'
                      : selectedGrade.gradeRecord?.remarks === 'completed'
                        ? 'PASSED'
                        : 'PENDING'}
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

      {
        showPasswordModal && (
          <div className={styles.passwordModalOverlay} onClick={() => setShowPasswordModal(false)}>
            <div className={styles.passwordModalContent} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.passwordModalClose}
                onClick={() => setShowPasswordModal(false)}
              >
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
                <div className={styles.passwordError}>
                  Incorrect password. Please try again.
                </div>
              )}
              <div className={styles.passwordModalButtons}>
                <button onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button onClick={handlePasswordSubmit}>Submit</button>
              </div>
            </div>
          </div>
        )
      }

      {
        showEditModal && editingSubjectIndex !== null && (
          <div className={styles.editModalOverlay} onClick={() => setShowEditModal(false)}>
            <div className={styles.editModalContent} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.editModalClose}
                onClick={() => setShowEditModal(false)}
              >
                &times;
              </button>
              <h3>Edit Subject Grades</h3>
              <div className={styles.editForm}>
                <div className={styles.editField}>
                  <label>1st Quarter</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={editGrades.q1}
                    onChange={(e) =>
                      setEditGrades({ ...editGrades, q1: e.target.value })
                    }
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
                    onChange={(e) =>
                      setEditGrades({ ...editGrades, q2: e.target.value })
                    }
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
                    onChange={(e) =>
                      setEditGrades({ ...editGrades, q3: e.target.value })
                    }
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
                    onChange={(e) =>
                      setEditGrades({ ...editGrades, q4: e.target.value })
                    }
                  />
                </div>
              </div>
              {editError && <div className={styles.editError}>{editError}</div>}
              <div className={styles.editModalButtons}>
                <button onClick={() => setShowEditModal(false)}>Cancel</button>
                <button onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        )
      }

      <button
        className={styles.backBtn}
        onClick={() => navigate('/admin/grades')}
        title="Back"
      >
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
    </div >
  );
}

export default AdminGradeView;

