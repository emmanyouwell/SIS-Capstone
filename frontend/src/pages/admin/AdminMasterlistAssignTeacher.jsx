import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminMasterlistAssignTeacher.module.css';
import { fetchMasterlists, updateMasterlist, createMasterlist, clearError } from '../../store/slices/masterlistSlice';
import { fetchAllUsers } from '../../store/slices/userSlice';
import { fetchAllSubjects } from '../../store/slices/subjectSlice';
import { getAllSections } from '../../store/slices/sectionSlice';

function AdminMasterlistAssignTeacher() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentGrade, setCurrentGrade] = useState(7);
  const [selectedSection, setSelectedSection] = useState('');
  const [adviserId, setAdviserId] = useState('');
  const [subjectTeachers, setSubjectTeachers] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [saving, setSaving] = useState(false);

  const { masterlists, loading: masterlistLoading, error } = useSelector(
    (state) => state.masterlists
  );
  const { users, loading: usersLoading } = useSelector((state) => state.users);
  const { subjects: allSubjects, loading: subjectsLoading } = useSelector(
    (state) => state.subjects
  );
  const sections = useSelector((state) => state.section.data);

  // Derive sections from API data
  const gradeSections = sections
    .filter((s) => s.grade === currentGrade)
    .map((s) => s.name)
    .sort();

    const currentMasterlist = masterlists.find(
      (m) => m.grade === currentGrade && m.section === selectedSection
    );
  // Get subjects for current grade level from database
  // Merge with subjects from masterlist.subjectTeachers to ensure all subjects appear
  const masterlistSubjectIds = new Set(
    (currentMasterlist?.subjectTeachers || [])
      .map((st) => st.subject?._id || st.subject)
      .filter(Boolean)
  );
  const subjectsFromDB = allSubjects
    .filter((s) => s.gradeLevel === currentGrade)
    .sort((a, b) => a.name.localeCompare(b.name));
  
  // Merge: subjects from DB + subjects in masterlist that might not be in DB
  const allSubjectIds = new Set([
    ...subjectsFromDB.map((s) => s._id),
    ...Array.from(masterlistSubjectIds),
  ]);
  
  const subjects = Array.from(allSubjectIds)
    .map((id) => {
      const fromDB = subjectsFromDB.find((s) => s._id === id);
      if (fromDB) return fromDB;
      // If subject is in masterlist but not in DB, create a minimal object
      const fromMasterlist = currentMasterlist?.subjectTeachers?.find(
        (st) => (st.subject?._id || st.subject) === id
      );
      if (fromMasterlist) {
        return {
          _id: id,
          name: fromMasterlist.subject?.name || 'Unknown Subject',
          gradeLevel: currentGrade,
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
  const allTeachers = users
    .filter((u) => u.role === 'Teacher' && u.status === 'Active')
    .map((u) => ({ id: u._id, name: `${u.firstName} ${u.lastName}` }));
  // Fetch masterlists, teachers, subjects, and sections for current grade
  useEffect(() => {
    dispatch(fetchMasterlists({ grade: currentGrade }));
    dispatch(fetchAllUsers({ role: 'Teacher', status: 'Active' }));
    dispatch(fetchAllSubjects({ gradeLevel: currentGrade }));
    dispatch(getAllSections({ grade: currentGrade }));
  }, [currentGrade, dispatch]);

  // Initialize selected section
  useEffect(() => {
    if (gradeSections.length > 0 && !selectedSection) {
      setSelectedSection(gradeSections[0]);
    }
  }, [gradeSections, selectedSection]);


  // Sync adviser and subjectTeachers from current masterlist
  useEffect(() => {
    if (currentMasterlist?.adviser) {
      setAdviserId(currentMasterlist.adviser._id || '');
    } else {
      setAdviserId('');
    }

    // Sync subjectTeachers from masterlist
    if (currentMasterlist?.subjectTeachers && Array.isArray(currentMasterlist.subjectTeachers)) {
      const subjectTeacherMap = {};
      currentMasterlist.subjectTeachers.forEach((st) => {
        if (st.subject && st.teacher) {
          subjectTeacherMap[st.subject._id || st.subject] = st.teacher._id || st.teacher;
        }
      });
      setSubjectTeachers(subjectTeacherMap);
    } else {
      setSubjectTeachers({});
    }
  }, [currentMasterlist]);

  const handleGradeChange = (grade) => {
    setCurrentGrade(grade);
    setSelectedSection('');
    setSubjectTeachers({});
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
    setSubjectTeachers({});
  };

  const handleAdviserChange = (e) => {
    setAdviserId(e.target.value);
  };

  const handleSubjectTeacherChange = (subjectId, teacherId) => {
    setSubjectTeachers((prev) => ({
      ...prev,
      [subjectId]: teacherId,
    }));
  };

  const handleSave = async () => {
    if (!selectedSection) {
      showAlert('Please select a section.', 'error');
      return;
    }

    if (!adviserId || adviserId === 'Assign Teacher') {
      showAlert('Please assign an adviser before saving.', 'error');
      return;
    }

    try {
      setSaving(true);

      // Build subjectTeachers array from state
      const subjectTeachersArray = Object.entries(subjectTeachers)
        .filter(([subjectId, teacherId]) => subjectId && teacherId && teacherId !== 'Assign Teacher')
        .map(([subjectId, teacherId]) => ({
          subject: subjectId,
          teacher: teacherId,
        }));

      // Get current school year (default to current year format)
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      const schoolYear = `${currentYear}-${nextYear}`;

      if (!currentMasterlist) {
        // Create new masterlist
        const newMasterlist = await dispatch(
          createMasterlist({
            grade: currentGrade,
            section: selectedSection,
            adviser: adviserId,
            subjectTeachers: subjectTeachersArray,
            schoolYear,
            students: [],
          })
        ).unwrap();
        showAlert('Masterlist created and teachers assigned successfully!', 'success');
      } else {
        // Update existing masterlist
        await dispatch(
          updateMasterlist({
            id: currentMasterlist._id,
            data: {
              adviser: adviserId,
              subjectTeachers: subjectTeachersArray,
            },
          })
        ).unwrap();
        showAlert('Adviser and subject teachers updated successfully!', 'success');
      }
    } catch (err) {
      showAlert(err || 'Failed to save changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUndo = () => {
    setAdviserId('');
    setSubjectTeachers({});
    showAlert('All selections have been reset.', 'info');
  };

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => {
      setAlertMessage('');
      setAlertType('');
    }, 2000);
  };

  const currentSections = gradeSections || [];

  return (
    <div className={styles.mainContent}>
      <h2 className={styles.pageTitle}>Masterlist - Assign Teacher</h2>

      <div className={styles.gradeTabs}>
        {[7, 8, 9, 10].map((grade) => (
          <button
            key={grade}
            className={`${styles.gradeTab} ${currentGrade === grade ? styles.active : ''}`}
            onClick={() => handleGradeChange(grade)}
          >
            Grade {grade}
          </button>
        ))}
      </div>

      <div className={styles.headerBar}>
        <h2>GRADE {currentGrade}</h2>
      </div>

      <div className={styles.container}>
        <div className={styles.sectionCard}>
          <div className={styles.sectionDropdownRow}>
            <label htmlFor="section-select">Section:</label>
            <select
              id="section-select"
              className={styles.select}
              value={selectedSection}
              onChange={handleSectionChange}
            >
              {currentSections.map((section) => (
                <option key={section} value={section}>
                  Grade {currentGrade} - {section}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.sectionTitle}>SECTION: {selectedSection}</div>

          <div className={styles.adviserRow}>
            <label htmlFor="adviser-select">Adviser:</label>
            <select
              id="adviser-select"
              className={styles.select}
              value={adviserId || ''}
              onChange={handleAdviserChange}
            >
              <option value="">Assign Teacher</option>
              {allTeachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.buttonRow}>
            <button className={styles.undoBtn} onClick={handleUndo}>
              Undo
            </button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className={styles.subjectsCard}>
          <div className={styles.subjectsTitle}>SUBJECT TEACHERS</div>
          {subjectsLoading ? (
            <div style={{ padding: '1rem', textAlign: 'center' }}>Loading subjects...</div>
          ) : subjects.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              No subjects found for Grade {currentGrade}
            </div>
          ) : (
            subjects.map((subject) => {
              // Get teachers assigned to this subject (backend populates with firstName, lastName)
              const subjectTeachersList =
                subject.teachers && Array.isArray(subject.teachers)
                  ? subject.teachers
                    .filter((teacher) => teacher != null)
                    .map((teacher) => {
                      // Handle populated teacher object or ObjectId
                      if (typeof teacher === 'object' && teacher._id) {
                        return {
                          id: teacher._id,
                          name: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Unknown Teacher',
                        };
                      }
                      // If it's just an ObjectId, try to find in users list
                      const foundUser = users.find((u) => u._id === teacher);
                      return {
                        id: typeof teacher === 'object' ? teacher._id : teacher,
                        name: foundUser
                          ? `${foundUser.firstName} ${foundUser.lastName}`
                          : 'Unknown Teacher',
                      };
                    })
                  : [];

              return (
                <div key={subject._id} className={styles.subjectRow}>
                  <span>{subject.name}</span>
                  <select
                    className={styles.select}
                    value={subjectTeachers[subject._id] || ''}
                    onChange={(e) => handleSubjectTeacherChange(subject._id, e.target.value)}
                  >
                    <option value="">Assign Teacher</option>
                    {subjectTeachersList.length === 0 ? (
                      <option disabled>No teachers assigned to this subject</option>
                    ) : (
                      subjectTeachersList.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              );
            })
          )}
        </div>
      </div>

      {alertMessage && (
        <div className={`${styles.alertBox} ${styles[alertType]}`}>{alertMessage}</div>
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

export default AdminMasterlistAssignTeacher;

