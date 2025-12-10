import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminSchedule.module.css';
import {
  getScheduleBySection,
  setFullSchedule,
  clearError,
} from '../../store/slices/scheduleSlice';
import { fetchAllSubjects } from '../../store/slices/subjectSlice';
import { fetchAllStudents } from '../../store/slices/studentSlice';
import { getAllSections } from '../../store/slices/sectionSlice';
import { fetchMasterlists } from '../../store/slices/masterlistSlice';
import { fetchAllEnrollmentPeriods } from '../../store/slices/enrollmentPeriodSlice';
import MessageModal from '../../components/MessageModal';

function AdminSchedule() {
  const dispatch = useDispatch();

  // Redux state
  const { schedule: scheduleEntries, selectedSchedule, loading, error } = useSelector(
    (state) => state.schedules
  );
  const { subjects } = useSelector((state) => state.subjects);
  const { students } = useSelector((state) => state.students);
  const { data: sections } = useSelector((state) => state.section);
  const { masterlists } = useSelector((state) => state.masterlists);
  const { periods: enrollmentPeriods } = useSelector((state) => state.enrollmentPeriod);

  const times = [
    '7:00-8:00 AM',
    '8:00-9:00 AM',
    'BREAK',
    '9:15-10:15 AM',
    '10:15-11:15 AM',
    '11:15-12:15 PM',
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Local state
  const [currentGrade, setCurrentGrade] = useState(7);
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [uiSchedules, setUiSchedules] = useState({});
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({ type: 'info', message: '' });
  const [saving, setSaving] = useState(false);

  // Get sections for current grade
  const gradeSections = useMemo(() => {
    return sections.filter((s) => s.gradeLevel === currentGrade);
  }, [sections, currentGrade]);

  // Get current section object
  const currentSection = useMemo(() => {
    return sections.find((s) => s._id?.toString() === currentSectionId?.toString());
  }, [sections, currentSectionId]);

  // Get masterlist for current section
  const currentMasterlist = useMemo(() => {
    if (!currentSection) return null;
    return masterlists.find((m) => {
      if (m.grade !== currentGrade) return false;
      // Handle both old format (section as string) and new format (section as object)
      const sectionName = typeof m.section === 'string' ? m.section : m.section?.sectionName;
      return sectionName === currentSection.sectionName;
    });
  }, [masterlists, currentGrade, currentSection]);

  // Transform schedule array to UI structure (grouped by time and day)
  const transformSchedulesToUI = useMemo(() => {
    const uiStructure = {};

    times.forEach((time) => {
      if (time === 'BREAK') return;
      uiStructure[time] = {};
      days.forEach((day) => {
        // Find matching schedule entry for this time/day
        const matchingEntry = scheduleEntries.find((entry) => {
          const entryDay = entry.day;
          const [timeStart, timeEnd] = time.replace(' AM', '').replace(' PM', '').split('-');
          const normalizeTime = (t) => t.replace(/AM|PM|am|pm/gi, '').trim();
          const normalizedTimeStart = normalizeTime(timeStart);
          const normalizedTimeEnd = normalizeTime(timeEnd);
          const normalizedEntryStart = normalizeTime(entry.startTime);
          const normalizedEntryEnd = normalizeTime(entry.endTime);

          const timeMatch =
            normalizedEntryStart === normalizedTimeStart &&
            normalizedEntryEnd === normalizedTimeEnd;
          return entryDay === day && timeMatch;
        });

        if (matchingEntry && matchingEntry.subjectId) {
          const subject = matchingEntry.subjectId;
          const subjectId = subject?._id || subject;

          // Find teacher from masterlist for this subject
          let teacherName = '';
          let teacherId = '';
          if (currentMasterlist?.subjectTeachers && subjectId) {
            const subjectTeacher = currentMasterlist.subjectTeachers.find(
              (st) => (st.subject?._id || st.subject)?.toString() === subjectId.toString()
            );
            if (subjectTeacher?.teacher?.userId) {
              const teacher = subjectTeacher.teacher.userId;
              teacherName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
              teacherId = subjectTeacher.teacher._id || subjectTeacher.teacher;
            }
          }

          uiStructure[time][day] = {
            subjectId: subjectId || '',
            subjectName: subject?.subjectName || '',
            teacherId: teacherId || '',
            teacherName: teacherName,
            startTime: matchingEntry.startTime,
            endTime: matchingEntry.endTime,
          };
        } else {
          const [startTime, endTime] = time.replace(' AM', '').replace(' PM', '').split('-');
          uiStructure[time][day] = {
            subjectId: '',
            subjectName: '',
            teacherId: '',
            teacherName: '',
            startTime: startTime?.trim() || '',
            endTime: endTime?.trim() || '',
          };
        }
      });
    });

    return uiStructure;
  }, [scheduleEntries, times, days, currentMasterlist]);

  // Update section when grade changes
  useEffect(() => {
    if (gradeSections.length > 0 && !currentSectionId) {
      setCurrentSectionId(gradeSections[0]._id);
    }
  }, [currentGrade, gradeSections, currentSectionId]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    if (currentGrade) {
      dispatch(fetchAllSubjects({ gradeLevel: currentGrade }));
      dispatch(fetchAllStudents({ gradeLevel: currentGrade }));
      dispatch(getAllSections({ gradeLevel: currentGrade }));
      dispatch(fetchMasterlists({ grade: currentGrade }));
    }
  }, [dispatch, currentGrade]);

  // Fetch enrollment periods on mount to get latest school year
  useEffect(() => {
    dispatch(fetchAllEnrollmentPeriods());
  }, [dispatch]);

  // Fetch schedule when section changes
  useEffect(() => {
    if (currentSectionId) {
      dispatch(getScheduleBySection(currentSectionId));
    }
  }, [dispatch, currentSectionId]);

  // Update UI schedules when transformed schedules change (only when not in edit mode)
  useEffect(() => {
    if (!editMode && currentSectionId) {
      setUiSchedules(transformSchedulesToUI);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleEntries, editMode, currentSectionId]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Get available subjects from masterlist for current section
  const availableSubjects = useMemo(() => {
    if (!currentMasterlist?.subjectTeachers || currentMasterlist.subjectTeachers.length === 0) {
      // Fallback to subjects if no masterlist or empty subjectTeachers
      return subjects
        .filter((subject) => {
          const grade = subject.gradeLevel || subject.grade;
          return grade === currentGrade;
        })
        .map((subject) => {
          const subjectId = subject._id?.toString() || subject._id;
          return {
            _id: subjectId,
            subjectName: subject.subjectName || subject.name || 'Unknown Subject',
            gradeLevel: subject.gradeLevel || subject.grade || currentGrade,
          };
        })
        .filter((s) => s._id) // Filter out any without valid ID
        .sort((a, b) => a.subjectName.localeCompare(b.subjectName));
    }

    // Use subjects from masterlist.subjectTeachers
    return currentMasterlist.subjectTeachers
      .map((st) => {
        const subject = st.subject;
        if (!subject) return null;
        
        // Normalize subject ID to string - handle both populated and unpopulated cases
        let subjectId;
        if (typeof subject === 'string' || subject instanceof String) {
          // Unpopulated - just an ID string
          subjectId = subject.toString();
        } else if (subject._id) {
          // Populated - has _id property
          subjectId = subject._id.toString();
        } else {
          // Fallback
          subjectId = subject.toString();
        }
        
        if (!subjectId) return null;
        
        return {
          _id: subjectId,
          subjectName: subject.subjectName || subject.name || 'Unknown Subject',
          gradeLevel: subject.gradeLevel || currentGrade,
          teacher: st.teacher, // Teacher from masterlist
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.subjectName.localeCompare(b.subjectName));
  }, [currentMasterlist, subjects, currentGrade]);

  // Handle grade change
  const handleGradeChange = (e) => {
    const newGrade = parseInt(e.target.value);
    setCurrentGrade(newGrade);
    setCurrentSectionId(null);
    setEditMode(false);
  };

  // Handle section click
  const handleSectionClick = (sectionId) => {
    setCurrentSectionId(sectionId);
    setEditMode(false);
  };

  // Enable edit mode
  const handleEdit = () => {
    setEditMode(true);
  };

  // Handle subject change in edit mode
  const handleSubjectChange = (time, day, subjectId) => {
    const updatedSchedules = { ...uiSchedules };
    if (updatedSchedules[time] && updatedSchedules[time][day]) {
      // Normalize subjectId for comparison
      const normalizedSubjectId = subjectId?.toString();
      const subject = availableSubjects.find(
        (s) => s._id?.toString() === normalizedSubjectId
      );

      // Get teacher from masterlist for this subject
      let teacherName = '';
      let teacherId = '';
      if (currentMasterlist?.subjectTeachers && subjectId) {
        const subjectTeacher = currentMasterlist.subjectTeachers.find((st) => {
          const stSubjectId = st.subject?._id?.toString() || st.subject?.toString() || st.subject;
          return stSubjectId === normalizedSubjectId;
        });
        if (subjectTeacher?.teacher?.userId) {
          const teacher = subjectTeacher.teacher.userId;
          teacherName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
          teacherId = subjectTeacher.teacher._id || subjectTeacher.teacher;
        }
      }

      updatedSchedules[time][day] = {
        ...updatedSchedules[time][day],
        subjectId: normalizedSubjectId || '',
        subjectName: subject?.subjectName || '',
        teacherId: teacherId || '',
        teacherName: teacherName,
      };
      setUiSchedules(updatedSchedules);
    }
  };

  // Transform UI structure to schedule array and save
  const handleSave = async () => {
    if (!currentSectionId) {
      setMessageModalContent({
        type: 'error',
        message: 'Please select a section',
      });
      setShowMessageModal(true);
      return;
    }

    setSaving(true);
    try {
      const scheduleArray = [];

      // Process each time slot and day
      times.forEach((time) => {
        if (time === 'BREAK') return;

        days.forEach((day) => {
          const cellData = uiSchedules[time]?.[day];
          if (!cellData) return;

          const { subjectId, startTime, endTime } = cellData;

          // Only add entry if subject is selected
          if (subjectId) {
            scheduleArray.push({
              subjectId: subjectId,
              day: day,
              startTime: startTime,
              endTime: endTime,
            });
          }
        });
      });

      // Get the latest enrollment period's school year
      const latestEnrollmentPeriod = enrollmentPeriods && enrollmentPeriods.length > 0
        ? enrollmentPeriods[0] // Already sorted by createdAt: -1 from backend
        : null;
      const schoolYear = latestEnrollmentPeriod?.schoolYear || null;

      // Save the entire schedule array with school year
      const result = await dispatch(setFullSchedule({ 
        sectionId: currentSectionId, 
        schedule: scheduleArray,
        schoolYear: schoolYear,
      }));

      // Check if the action was rejected (e.g., teaching load exceeded)
      if (setFullSchedule.rejected.match(result)) {
        setMessageModalContent({
          type: 'error',
          message: result.payload || 'Failed to save schedule. Please check that no teacher exceeds 30 hours/day of teaching load.',
        });
        setShowMessageModal(true);
        return;
      }

      // Refresh schedule
      await dispatch(getScheduleBySection(currentSectionId));

      setEditMode(false);
      setMessageModalContent({
        type: 'success',
        message: 'Schedule successfully updated!',
      });
      setShowMessageModal(true);
    } catch (error) {
      setMessageModalContent({
        type: 'error',
        message: error?.message || error || 'Failed to save schedule. Please check that no teacher exceeds 30 hours/day of teaching load.',
      });
      setShowMessageModal(true);
    } finally {
      setSaving(false);
    }
  };

  // Cancel edit mode
  const handleCancel = () => {
    setUiSchedules(transformSchedulesToUI);
    setEditMode(false);
  };

  // Render schedule table
  const renderTableRows = () => {
    const rows = [];

    times.forEach((time, timeIndex) => {
      if (time === 'BREAK') {
        rows.push(
          <tr key={`break-${timeIndex}`} className={styles.breakRow}>
            <td className={styles.timeCol} colSpan="6">
              BREAK
            </td>
          </tr>
        );
        return;
      }

      // Subject row with teacher displayed below
      const subjectRow = (
        <tr key={`subject-${time}`}>
          <td className={styles.timeCol}>{time}</td>
          {days.map((day) => {
            const scheduleData = uiSchedules[time]?.[day] || {
              subjectId: '',
              subjectName: '',
              teacherId: '',
              teacherName: '',
            };
            if (editMode) {
              // Normalize the current value for comparison
              const currentValue = scheduleData.subjectId?.toString() || scheduleData.subjectId || '';
              
              return (
                <td key={`subject-${time}-${day}`}>
                  <select
                    className={styles.subjectDropdown}
                    value={currentValue}
                    onChange={(e) => handleSubjectChange(time, day, e.target.value)}
                    disabled={saving}
                  >
                    <option value="">Subject</option>
                    {availableSubjects.length > 0 ? (
                      availableSubjects.map((subject) => {
                        const subjectId = subject._id?.toString() || subject._id;
                        return (
                          <option key={subjectId} value={subjectId}>
                            {subject.subjectName}
                          </option>
                        );
                      })
                    ) : (
                      <option value="" disabled>
                        No subjects available
                      </option>
                    )}
                  </select>
                  {scheduleData.subjectId && scheduleData.teacherName && (
                    <div className={styles.teacherName}>{scheduleData.teacherName}</div>
                  )}
                </td>
              );
            }
            return (
              <td key={`subject-${time}-${day}`}>
                {scheduleData.subjectName && (
                  <>
                    <div className={styles.subjectName}>{scheduleData.subjectName}</div>
                    {scheduleData.teacherName && (
                      <div className={styles.teacherName}>{scheduleData.teacherName}</div>
                    )}
                  </>
                )}
              </td>
            );
          })}
        </tr>
      );
      rows.push(subjectRow);
    });

    return rows;
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.scheduleTitle}>Schedule - Grade {currentGrade}</div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <select
          id="grade-select"
          className={styles.gradeSelect}
          value={currentGrade}
          onChange={handleGradeChange}
          disabled={editMode}
        >
          {[7, 8, 9, 10].map((grade) => (
            <option key={grade} value={grade}>
              Grade {grade}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div
          style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '8px',
          }}
        >
          {error}
        </div>
      )}

      {loading && !scheduleEntries.length && (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading schedules...</div>
      )}

      <div className={styles.contentLayout}>
        <div className={styles.sectionListCard}>
          <div className={styles.sectionListTitle}>Sections</div>
          <ul className={styles.sectionList}>
            {gradeSections.map((section) => (
              <li
                key={section._id}
                className={`${styles.sectionItem} ${
                  section._id?.toString() === currentSectionId?.toString() ? styles.active : ''
                }`}
                onClick={() => !editMode && handleSectionClick(section._id)}
                style={{ cursor: editMode ? 'not-allowed' : 'pointer' }}
              >
                {section.sectionName}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.scheduleContainer}>
          {currentSection ? (
            <div className={styles.schedContainer}>
              <div className={styles.schedHeader}>
                <div className={styles.schedTitle}>
                  Grade and Section: <b id="section-title">
                    {currentGrade} - {currentSection.sectionName}
                  </b>
                </div>
                <div className={styles.schedTitle}>
                  Adviser: <b id="adviser-title">
                    {currentSection.adviserId?.userId
                      ? `${currentSection.adviserId.userId.firstName || ''} ${currentSection.adviserId.userId.lastName || ''}`.trim()
                      : 'Not assigned'}
                  </b>
                </div>
              </div>

              <table className={styles.schedTable}>
                <thead>
                  <tr>
                    <th className={styles.timeCol}>TIME</th>
                    <th>Monday</th>
                    <th>Tuesday</th>
                    <th>Wednesday</th>
                    <th>Thursday</th>
                    <th>Friday</th>
                  </tr>
                </thead>
                <tbody>{renderTableRows()}</tbody>
              </table>

              <div className={styles.schedActions}>
                {editMode ? (
                  <>
                    <button
                      className={`${styles.schedBtn} ${styles.saveBtn}`}
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      className={`${styles.schedBtn}`}
                      onClick={handleCancel}
                      disabled={saving}
                      style={{ marginLeft: '12px', backgroundColor: '#ccc', color: '#333' }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className={`${styles.schedBtn} ${styles.editBtn}`}
                    onClick={handleEdit}
                    disabled={loading || !currentSection}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              Please select a section to view schedules
            </div>
          )}
        </div>
      </div>
      <MessageModal
        show={showMessageModal}
        type={messageModalContent.type}
        message={messageModalContent.message}
        onClose={() => setShowMessageModal(false)}
      />
    </div>
  );
}

export default AdminSchedule;
