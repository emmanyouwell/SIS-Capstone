import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGrades, updateGrade, createGrade } from '../../store/slices/gradeSlice';
import styles from './AdminGradeView.module.css';
import { fetchAllSubjects } from '../../store/slices/subjectSlice';
import { fetchAllStudents } from '../../store/slices/studentSlice';
import { createMessage } from '../../store/slices/messageSlice';

const ADMIN_PASSWORD = '12345';

function AdminGradeView() {
  const { grade } = useParams(); // here, :grade is a grade level slug e.g. "grade7"
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { grades, loading, error } = useSelector((state) => state.grades);
  const { subjects: subjectList } = useSelector((state) => state.subjects);
  const { students: allStudents } = useSelector((state) => state.students);
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
  const [notifyingStudent, setNotifyingStudent] = useState(false);
  const [notifyingTeacher, setNotifyingTeacher] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const [notificationSuccess, setNotificationSuccess] = useState('');

  const gradeNumber = parseInt(grade.replace('grade', ''), 10);

  useEffect(() => {
    if (!Number.isNaN(gradeNumber)) {
      // Fetch grades, subjects, and all students for this grade level
      dispatch(fetchGrades({ gradeLevel: gradeNumber }));
      dispatch(fetchAllSubjects({ gradeLevel: gradeNumber }));
      dispatch(fetchAllStudents({ gradeLevel: gradeNumber }));
    }
  }, [dispatch, gradeNumber]);

  useEffect(() => {
    if (subjectList) {
      setAvailableSubjects(subjectList);
    }
  }, [subjectList])
 
  // Build a map of student IDs to their grade records for quick lookup
  const gradeMap = useMemo(() => {
    const map = new Map();
    grades.forEach((gradeRecord) => {
      const studentId = gradeRecord.studentId?._id?.toString() || gradeRecord.studentId?.toString();
      if (studentId) {
        map.set(studentId, gradeRecord);
      }
    });
    return map;
  }, [grades]);

  // Build per-student rows: merge all students with their grade records (if any)
  const students = useMemo(() => {
    // Get all students for this grade level
    const studentsForGrade = allStudents.filter(
      (student) => student.gradeLevel === gradeNumber && student.userId
    );

    // Map each student to a row, including grade record if it exists
    return studentsForGrade.map((student) => {
      const studentId = student._id?.toString();
      const gradeRecord = gradeMap.get(studentId) || null;
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
        id: student._id,
        name,
        lrn: student?.lrn || '-',
        grade: gradeLevelValue,
        status,
        finalGrade,
        student,
        gradeRecord,
      };
    });
  }, [allStudents, gradeMap, gradeNumber]);

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
    if (!selectedGrade?.student) return [];

    const student = selectedGrade.student;
    const studentSectionId = student?.sectionId?._id?.toString() || student?.sectionId?.toString();
    const studentGradeLevel = student?.gradeLevel || gradeNumber;

    // Filter subjects by grade level and section (if section is available)
    let relevantSubjects = availableSubjects.filter((subj) => {
      if (subj.gradeLevel !== studentGradeLevel) return false;
      // If student has a section, filter by section; otherwise show all subjects for grade level
      if (studentSectionId && subj.sectionId) {
        const subjectSectionId = subj.sectionId?._id?.toString() || subj.sectionId?.toString();
        return subjectSectionId === studentSectionId;
      }
      // If no section filter, show all subjects for the grade level
      return true;
    });

    // Extract existing grade entries (new structure: grades is array with subjectId)
    const existingGrades = selectedGrade?.gradeRecord?.grades || [];

    // Build a lookup for quick matching by subjectId _id
    const gradeMap = new Map(
      existingGrades.map((g) => [g.subjectId?._id?.toString() || g.subjectId?.toString(), g])
    );

    // Build a set of subject IDs that have grades
    const gradedSubjectIds = new Set(
      existingGrades.map((g) => g.subjectId?._id?.toString() || g.subjectId?.toString())
    );

    // Get all subject IDs from the relevant subjects
    const relevantSubjectIds = new Set(
      relevantSubjects.map((subj) => subj._id?.toString())
    );

    // Find subjects that have grades but are not in the relevant subjects list (from different section)
    // These should be included to show partial grades
    const gradedSubjectsNotInRelevant = existingGrades
      .filter((g) => {
        const subjectId = g.subjectId?._id?.toString() || g.subjectId?.toString();
        return !relevantSubjectIds.has(subjectId);
      })
      .map((g) => {
        const subject = g.subjectId;
        return {
          subject: subject,
          q1: g.q1 ?? 0,
          q2: g.q2 ?? 0,
          q3: g.q3 ?? 0,
          q4: g.q4 ?? 0,
        };
      });

    // Map relevant subjects: merge with grades if they exist, otherwise use placeholder
    const mappedRelevantSubjects = relevantSubjects.map((subj) => {
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

      // Otherwise return a placeholder row for new subjects (default to 0)
      return {
        subject: subj,
        q1: 0,
        q2: 0,
        q3: 0,
        q4: 0,
      };
    });

    // Combine: relevant subjects (with or without grades) + graded subjects from other sections
    return [...mappedRelevantSubjects, ...gradedSubjectsNotInRelevant];
  }, [selectedGrade, availableSubjects, gradeNumber]);


  const handleEditSubject = (index) => {
    const subjectGrade = subjects[index];
    setEditingSubjectIndex(index);
    // Convert to string for input fields, use empty string if null/undefined, but keep 0 as '0'
    setEditGrades({
      q1: subjectGrade?.q1 !== undefined && subjectGrade?.q1 !== null ? String(subjectGrade.q1) : '',
      q2: subjectGrade?.q2 !== undefined && subjectGrade?.q2 !== null ? String(subjectGrade.q2) : '',
      q3: subjectGrade?.q3 !== undefined && subjectGrade?.q3 !== null ? String(subjectGrade.q3) : '',
      q4: subjectGrade?.q4 !== undefined && subjectGrade?.q4 !== null ? String(subjectGrade.q4) : '',
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

  const handleSave = async () => {
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

    try {
      let updatedGradeRecord;
      
      // If there is already a gradeRecord, update it; otherwise create a new one
      if (selectedGrade.gradeRecord) {
        const result = await dispatch(
          updateGrade({
            id: selectedGrade.gradeRecord._id,
            data: {
              grades: gradesPayload,
            },
          })
        ).unwrap();
        updatedGradeRecord = result;
      } else {
        // Create new grade record with studentId
        const result = await dispatch(
          createGrade({
            studentId: selectedGrade.student._id,
            grades: gradesPayload,
          })
        ).unwrap();
        updatedGradeRecord = result;
      }

      // Update the modal with the new grade record
      setSelectedGrade({
        student: selectedGrade.student,
        gradeRecord: updatedGradeRecord,
      });

      setShowEditModal(false);
      setEditingSubjectIndex(null);
      setEditError('');

      // Refresh grades, subjects, and students after saving
      if (!Number.isNaN(gradeNumber)) {
        dispatch(fetchGrades({ gradeLevel: gradeNumber }));
        dispatch(fetchAllSubjects({ gradeLevel: gradeNumber }));
        dispatch(fetchAllStudents({ gradeLevel: gradeNumber }));
      }
    } catch (error) {
      setEditError(error.message || 'Failed to save grades. Please try again.');
    }
  };

  const calculateSubjectFinal = useCallback((subjectGrade) => {
    const values = [subjectGrade.q1, subjectGrade.q2, subjectGrade.q3, subjectGrade.q4].filter(
      (v) => typeof v === 'number'
    );
    if (values.length === 0) return null;
    const sum = values.reduce((acc, v) => acc + v, 0);
    return Math.round(sum / values.length);
  }, []);

  const calculateOverallFinal = () => {
    if (!selectedGrade || !selectedGrade.gradeRecord) return null;
    // Use the saved finalGrade from database if available (it's calculated by backend)
    if (typeof selectedGrade.gradeRecord.finalGrade === 'number') {
      return Math.round(selectedGrade.gradeRecord.finalGrade);
    }
    // Fallback: calculate from current subjects if finalGrade is not set
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

  // Calculate failed subjects (final grade <= 75)
  const getFailedSubjects = useMemo(() => {
    if (!subjects || subjects.length === 0) return [];
    
    return subjects.filter((subjectGrade) => {
      const final = calculateSubjectFinal(subjectGrade);
      return final !== null && final <= 75;
    });
  }, [subjects, calculateSubjectFinal]);

  // Calculate pending grades (subjects with missing quarter grades)
  const getPendingGrades = useMemo(() => {
    if (!subjects || subjects.length === 0) return [];
    
    return subjects.filter((subjectGrade) => {
      // Check if any quarter is missing (null, undefined, or 0)
      // 0 is used as placeholder for missing grades, so we treat it as missing
      const hasMissingQuarter = 
        (subjectGrade.q1 === null || subjectGrade.q1 === undefined || subjectGrade.q1 === 0) ||
        (subjectGrade.q2 === null || subjectGrade.q2 === undefined || subjectGrade.q2 === 0) ||
        (subjectGrade.q3 === null || subjectGrade.q3 === undefined || subjectGrade.q3 === 0) ||
        (subjectGrade.q4 === null || subjectGrade.q4 === undefined || subjectGrade.q4 === 0);
      
      return hasMissingQuarter;
    });
  }, [subjects]);

  // Handle notify student button
  const handleNotifyStudent = async () => {
    if (getFailedSubjects.length === 0) {
      setNotificationError('No failed subjects to notify about.');
      return;
    }

    if (!selectedGrade?.student?.userId) {
      setNotificationError('Student information not available.');
      return;
    }

    setNotifyingStudent(true);
    setNotificationError('');
    setNotificationSuccess('');

    try {
      // Get student userId - handle both object and ID string
      const studentUserId = selectedGrade.student.userId?._id || selectedGrade.student.userId;
      if (!studentUserId) {
        setNotificationError('Student user ID not available.');
        setNotifyingStudent(false);
        return;
      }

      const studentFirstName = selectedGrade.student.userId?.firstName || 'Student';

      const messageText = `Dear ${studentFirstName},

You have failed the following subject(s) with a grade of 75 or below:
${getFailedSubjects.map((sg, idx) => {
  const final = calculateSubjectFinal(sg);
  const subjectName = sg.subject?.subjectName || sg.subject?.name || 'Unknown Subject';
  return `${idx + 1}. ${subjectName} - Final Grade: ${final}`;
}).join('\n')}

Please contact your adviser or the administration office for guidance on how to address these failing grades.

Best regards,
Administration`;

      await dispatch(createMessage({
        receiverId: studentUserId,
        receiverRole: 'Student',
        subject: 'Failed Subjects Notification',
        messageText: messageText,
      })).unwrap();

      setNotificationSuccess(`Successfully notified student about ${getFailedSubjects.length} failed subject(s).`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setNotificationSuccess('');
      }, 3000);
    } catch (error) {
      setNotificationError(error.message || 'Failed to send notification to student.');
    } finally {
      setNotifyingStudent(false);
    }
  };

  // Handle notify teacher button
  const handleNotifyTeacher = async () => {
    if (getPendingGrades.length === 0) {
      setNotificationError('No pending grades to notify about.');
      return;
    }

    setNotifyingTeacher(true);
    setNotificationError('');
    setNotificationSuccess('');

    try {
      // Group pending grades by teacher (using teacher's userId for messaging)
      const teacherPendingMap = new Map();

      for (const pendingGrade of getPendingGrades) {
        const subject = pendingGrade.subject;
        const teacherIds = subject?.teacherId || [];
        
        // If no teacher assigned, skip
        if (!teacherIds || teacherIds.length === 0) {
          continue;
        }

        const subjectName = subject?.subjectName || subject?.name || 'Unknown Subject';
        const missingQuarters = [];
        // Check for missing quarters (null, undefined, or 0)
        if (pendingGrade.q1 === null || pendingGrade.q1 === undefined || pendingGrade.q1 === 0) missingQuarters.push('1st Quarter');
        if (pendingGrade.q2 === null || pendingGrade.q2 === undefined || pendingGrade.q2 === 0) missingQuarters.push('2nd Quarter');
        if (pendingGrade.q3 === null || pendingGrade.q3 === undefined || pendingGrade.q3 === 0) missingQuarters.push('3rd Quarter');
        if (pendingGrade.q4 === null || pendingGrade.q4 === undefined || pendingGrade.q4 === 0) missingQuarters.push('4th Quarter');

        // Handle both array and single teacherId
        // teacherId is populated with Teacher objects that have userId populated
        const teachers = Array.isArray(teacherIds) ? teacherIds : [teacherIds];
        
        teachers.forEach((teacher) => {
          // Get the userId from the teacher object (teacher.userId is populated User object)
          const teacherUserId = teacher?.userId?._id?.toString() || teacher?.userId?.toString();
          if (!teacherUserId) return;

          if (!teacherPendingMap.has(teacherUserId)) {
            teacherPendingMap.set(teacherUserId, []);
          }
          teacherPendingMap.get(teacherUserId).push({
            subjectName,
            missingQuarters: missingQuarters.join(', '),
          });
        });
      }

      if (teacherPendingMap.size === 0) {
        setNotificationError('No teachers assigned to subjects with pending grades.');
        setNotifyingTeacher(false);
        return;
      }

      // Send messages to each teacher
      const studentName = selectedGrade.student?.userId
        ? `${selectedGrade.student.userId.firstName || ''} ${selectedGrade.student.userId.lastName || ''}`.trim() || 'Student'
        : 'Student';

      let successCount = 0;
      let errorCount = 0;

      for (const [teacherUserId, pendingSubjects] of teacherPendingMap.entries()) {
        try {
          const subjectList = pendingSubjects
            .map((ps, idx) => `${idx + 1}. ${ps.subjectName} - Missing: ${ps.missingQuarters}`)
            .join('\n');

          const messageText = `Dear Teacher,

You have pending grades to enter for the following subject(s) for student ${studentName} (LRN: ${selectedGrade.student?.lrn || 'N/A'}):

${subjectList}

Please enter the missing quarter grades as soon as possible.

Best regards,
Administration`;

          await dispatch(createMessage({
            receiverId: teacherUserId,
            receiverRole: 'Teacher',
            subject: 'Pending Grades Notification',
            messageText: messageText,
          })).unwrap();
          
          successCount++;
        } catch (error) {
          console.error(`Failed to notify teacher ${teacherUserId}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        setNotificationSuccess(`Successfully notified ${successCount} teacher(s) about pending grades.`);
      }
      if (errorCount > 0) {
        setNotificationError(`Failed to notify ${errorCount} teacher(s).`);
      }

      // Clear messages after 5 seconds
      setTimeout(() => {
        setNotificationSuccess('');
        setNotificationError('');
      }, 5000);
    } catch (error) {
      setNotificationError(error.message || 'Failed to send notifications to teachers.');
    } finally {
      setNotifyingTeacher(false);
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
                  const subjectName = s.subject?.subjectName || s.subject?.name || 'N/A';
                  // Display 0 as placeholder, '-' only if truly undefined/null
                  const displayQ1 = s.q1 !== undefined && s.q1 !== null ? s.q1 : '-';
                  const displayQ2 = s.q2 !== undefined && s.q2 !== null ? s.q2 : '-';
                  const displayQ3 = s.q3 !== undefined && s.q3 !== null ? s.q3 : '-';
                  const displayQ4 = s.q4 !== undefined && s.q4 !== null ? s.q4 : '-';
                  return (
                    <tr key={s.subject?._id || index}>
                      <td>{subjectName}</td>
                      <td>{displayQ1}</td>
                      <td>{displayQ2}</td>
                      <td>{displayQ3}</td>
                      <td>{displayQ4}</td>
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
                  Failed subjects: <span>{getFailedSubjects.length}</span>{' '}
                  <button 
                    className={styles.notifyBtn}
                    onClick={handleNotifyStudent}
                    disabled={notifyingStudent || getFailedSubjects.length === 0}
                  >
                    {notifyingStudent ? 'Sending...' : 'notify student'}
                  </button>
                </div>
                <div>
                  Pending grades: <span>{getPendingGrades.length}</span>{' '}
                  <button 
                    className={styles.notifyBtn}
                    onClick={handleNotifyTeacher}
                    disabled={notifyingTeacher || getPendingGrades.length === 0}
                  >
                    {notifyingTeacher ? 'Sending...' : 'notify teacher'}
                  </button>
                </div>
              </div>
              {(notificationError || notificationSuccess) && (
                <div className={notificationError ? styles.notificationError : styles.notificationSuccess}>
                  {notificationError || notificationSuccess}
                </div>
              )}
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


