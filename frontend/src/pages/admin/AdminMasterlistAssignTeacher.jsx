import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminMasterlistAssignTeacher.module.css';
import { fetchMasterlists, updateMasterlist, createMasterlist, clearError } from '../../store/slices/masterlistSlice';
import { fetchAllUsers } from '../../store/slices/userSlice';
import { fetchAllSubjects } from '../../store/slices/subjectSlice';
import { getAllSections, updateSection } from '../../store/slices/sectionSlice';
import { fetchAllTeachers } from '../../store/slices/teacherSlice';
import { fetchCurrentEnrollmentPeriod } from '../../store/slices/enrollmentPeriodSlice';

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
  const { teachers, loading: teachersLoading } = useSelector((state) => state.teachers);
  const { subjects: allSubjects, loading: subjectsLoading } = useSelector(
    (state) => state.subjects
  );
  const sections = useSelector((state) => state.section.data);
  const { currentPeriod } = useSelector((state) => state.enrollmentPeriod);

  // Derive sections from API data
  const gradeSections = sections
    .filter((s) => s.gradeLevel === currentGrade)
    .map((s) => s.sectionName)
    .sort();

  const currentMasterlist = masterlists.find((m) => {
    if (m.grade !== currentGrade) return false;
    // Handle both old format (section as string) and new format (section as object)
    const sectionName = typeof m.section === 'string' ? m.section : m.section?.sectionName;
    return sectionName === selectedSection;
  });
  
  // Get subjects for current grade level from database
  // Merge with subjects from masterlist.subjectTeachers to ensure all subjects appear
  const masterlistSubjectIds = new Set(
    (currentMasterlist?.subjectTeachers || [])
      .map((st) => st.subject?._id || st.subject)
      .filter(Boolean)
  );
  const subjectsFromDB = allSubjects
    .filter((s) => s.gradeLevel === currentGrade)
    .sort((a, b) => a.subjectName.localeCompare(b.subjectName));

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
          subjectName: fromMasterlist.subject?.subjectName || fromMasterlist.subject?.name || 'Unknown Subject',
          gradeLevel: currentGrade,
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a.subjectName.localeCompare(b.subjectName));
  // Use teachers from Teacher model (not User model)
  const allTeachers = teachers
    .filter((t) => t.userId && t.userId.status === 'Active')
    .map((t) => ({ 
      id: t._id, // Teacher ID, not User ID
      name: `${t.userId?.firstName || ''} ${t.userId?.lastName || ''}`.trim() || 'Unknown Teacher'
    }));
  // Fetch masterlists, teachers, subjects, sections, and enrollment period for current grade
  useEffect(() => {
    dispatch(fetchMasterlists({ grade: currentGrade }));
    dispatch(fetchAllUsers({ role: 'Teacher', status: 'Active' }));
    dispatch(fetchAllTeachers());
    dispatch(fetchAllSubjects({ gradeLevel: currentGrade }));
    dispatch(getAllSections({ gradeLevel: currentGrade }));
    dispatch(fetchCurrentEnrollmentPeriod());
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
      // Handle both populated object and ObjectId string
      const adviserId = typeof currentMasterlist.adviser === 'object' 
        ? (currentMasterlist.adviser._id || currentMasterlist.adviser)
        : currentMasterlist.adviser;
      setAdviserId(adviserId || '');
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

  useEffect(()=>{
    if (subjectTeachers){
      console.log("subjectTeachers: ", subjectTeachers);
    }
  },[subjectTeachers])
  const handleSave = async () => {
    if (!selectedSection) {
      showAlert('Please select a section.', 'error');
      return;
    }

    // Check if either adviser or at least one subject teacher is assigned
    const hasAdviser = adviserId && adviserId !== 'Assign Teacher' && adviserId !== '';
    const subjectTeachersArray = Object.entries(subjectTeachers)
      .filter(([subjectId, teacherId]) => subjectId && teacherId && teacherId !== 'Assign Teacher')
      .map(([subjectId, teacherId]) => ({
        subject: subjectId,
        teacher: teacherId,
      }));
      
    const hasSubjectTeachers = subjectTeachersArray.length > 0;

    if (!hasAdviser && !hasSubjectTeachers) {
      showAlert('Please assign an adviser or at least one subject teacher before saving.', 'error');
      return;
    }

    try {
      setSaving(true);

      // Find the section object based on gradeLevel and sectionName
      const sectionToUpdate = sections.find(
        (s) => s.gradeLevel === currentGrade && s.sectionName === selectedSection
      );

      // Update section's adviserId if section exists
      if (sectionToUpdate && hasAdviser) {
        try {
          await dispatch(
            updateSection({
              id: sectionToUpdate._id,
              data: { adviserId: adviserId },
            })
          ).unwrap();
        } catch (sectionErr) {
          console.error('Failed to update section adviser:', sectionErr);
          // Continue with masterlist update even if section update fails
        }
      } else if (sectionToUpdate && adviserId === '') {
        // Clear adviserId if adviser is cleared
        try {
          await dispatch(
            updateSection({
              id: sectionToUpdate._id,
              data: { adviserId: null },
            })
          ).unwrap();
        } catch (sectionErr) {
          console.error('Failed to clear section adviser:', sectionErr);
          // Continue with masterlist update even if section update fails
        }
      }

      // Refresh sections to update the UI
      if (sectionToUpdate) {
        dispatch(getAllSections({ gradeLevel: currentGrade }));
      }

      // Get school year from enrollment period, fallback to calculated value if not available
      let schoolYear;
      if (currentPeriod?.schoolYear) {
        schoolYear = currentPeriod.schoolYear;
      } else {
        // Fallback: calculate from current date
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        schoolYear = `${currentYear}-${nextYear}`;
      }

      if (!currentMasterlist) {
        // Find the section ID from the sections list
        const sectionObj = sections.find(
          (s) => s.gradeLevel === currentGrade && s.sectionName === selectedSection
        );
        
        if (!sectionObj) {
          showAlert(`Section "${selectedSection}" not found for grade ${currentGrade}.`, 'error');
          setSaving(false);
          return;
        }

        // Create new masterlist when adviser or subject teachers are assigned
        const newMasterlist = await dispatch(
          createMasterlist({
            grade: currentGrade,
            sectionId: sectionObj._id,
            adviser: hasAdviser ? adviserId : null,
            subjectTeachers: subjectTeachersArray,
            schoolYear,
            students: [],
          })
        ).unwrap();
        showAlert('Masterlist created and teachers assigned successfully!', 'success');
        // Refresh masterlists to update the UI
        dispatch(fetchMasterlists({ grade: currentGrade }));
      } else {
        // Update existing masterlist
        const updateData = {};
        if (hasAdviser) {
          updateData.adviser = adviserId;
        } else if (adviserId === '') {
          // Explicitly set to null if cleared
          updateData.adviser = null;
        }
        // Always include subjectTeachers to ensure it replaces the existing array
        updateData.subjectTeachers = subjectTeachersArray;
        
        await dispatch(
          updateMasterlist({
            id: currentMasterlist._id,
            data: updateData,
          })
        ).unwrap();
        showAlert('Adviser and subject teachers updated successfully!', 'success');
        // Refresh masterlists to update the UI
        dispatch(fetchMasterlists({ grade: currentGrade }));
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
              // Get teachers assigned to this subject (backend populates with Teacher objects)
              const subjectTeachersList =
                subject.teacherId && Array.isArray(subject.teacherId)
                  ? subject.teacherId
                    .filter((teacher) => teacher != null)
                    .map((teacher) => {
                      // Handle populated teacher object or ObjectId
                      if (typeof teacher === 'object' && teacher._id) {
                        return {
                          id: teacher._id, // Teacher ID
                          name: `${teacher.userId?.firstName || ''} ${teacher.userId?.lastName || ''}`.trim() || 'Unknown Teacher',
                        };
                      }
                      // If it's just an ObjectId, try to find in teachers list
                      const foundTeacher = teachers.find((t) => t._id === teacher);
                      return {
                        id: typeof teacher === 'object' ? teacher._id : teacher,
                        name: foundTeacher?.userId
                          ? `${foundTeacher.userId.firstName} ${foundTeacher.userId.lastName}`
                          : 'Unknown Teacher',
                      };
                    })
                  : [];

              return (
                <div key={subject._id} className={styles.subjectRow}>
                  <span>{subject.subjectName}</span>
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

    </div>
  );
}

export default AdminMasterlistAssignTeacher;

