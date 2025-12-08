import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminSchedule.module.css';
import {
  fetchAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  clearError,
} from '../../store/slices/scheduleSlice';
import { fetchAllSubjects } from '../../store/slices/subjectSlice';
import { fetchAllStudents } from '../../store/slices/studentSlice';
import { getAllSections } from '../../store/slices/sectionSlice';
import { fetchMasterlists } from '../../store/slices/masterlistSlice';
import MessageModal from '../../components/MessageModal';

function AdminSchedule() {
  const dispatch = useDispatch();

  // Redux state
  const { schedules: allSchedules, loading, error } = useSelector((state) => state.schedules);
  const { subjects } = useSelector((state) => state.subjects);
  const { students } = useSelector((state) => state.students);
  const { data: sections } = useSelector((state) => state.section);
  const { masterlists } = useSelector((state) => state.masterlists);

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

  // Get students in current section
  const sectionStudents = useMemo(() => {
    if (!currentSectionId) return [];
    return students.filter((s) => s.sectionId?._id?.toString() === currentSectionId.toString());
  }, [students, currentSectionId]);

  // Get current section object
  const currentSection = useMemo(() => {
    return sections.find((s) => s._id?.toString() === currentSectionId?.toString());
  }, [sections, currentSectionId]);

  // Get masterlist for current section
  const currentMasterlist = useMemo(() => {
    if (!currentSection) return null;
    return masterlists.find(
      (m) => m.grade === currentGrade && m.section === currentSection.sectionName
    );
  }, [masterlists, currentGrade, currentSection]);

  // Get schedules for current section
  const sectionSchedules = useMemo(() => {
    if (!currentSectionId) return [];
    return allSchedules.filter((schedule) => {
      const scheduleSectionId = schedule.sectionId?._id?.toString() || schedule.sectionId?.toString();
      return scheduleSectionId === currentSectionId.toString();
    });
  }, [allSchedules, currentSectionId]);

  // Transform schedules to UI structure (grouped by time and day)
  const transformSchedulesToUI = useMemo(() => {
    const uiStructure = {};
    
    times.forEach((time) => {
      if (time === 'BREAK') return;
      uiStructure[time] = {};
      days.forEach((day) => {
        // Find a representative schedule for this time/day (all students should have the same)
        const matchingSchedule = sectionSchedules.find((s) => {
          const scheduleDay = s.day;
          const scheduleTime = `${s.startTime}-${s.endTime}`;
          // Try to match time format
          const timeMatch = time.includes(s.startTime) || scheduleTime === time;
          return scheduleDay === day && timeMatch;
        });

        if (matchingSchedule) {
          const subject = matchingSchedule.subjectId;
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
            scheduleIds: sectionSchedules
              .filter((s) => {
                const scheduleDay = s.day;
                const scheduleTime = `${s.startTime}-${s.endTime}`;
                const timeMatch = time.includes(s.startTime) || scheduleTime === time;
                const scheduleSubjectId = s.subjectId?._id?.toString() || s.subjectId?.toString();
                return (
                  scheduleDay === day &&
                  timeMatch &&
                  scheduleSubjectId === (subjectId?.toString() || '')
                );
              })
              .map((s) => s._id),
            startTime: matchingSchedule.startTime,
            endTime: matchingSchedule.endTime,
          };
        } else {
          uiStructure[time][day] = {
            subjectId: '',
            subjectName: '',
            teacherId: '',
            teacherName: '',
            scheduleIds: [],
            startTime: time.split('-')[0]?.trim() || '',
            endTime: time.split('-')[1]?.trim() || '',
          };
        }
      });
    });

    return uiStructure;
  }, [sectionSchedules, times, days, currentMasterlist]);

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

  // Fetch schedules when section changes
  useEffect(() => {
    if (currentSectionId) {
      // Fetch schedules for the section (even if no students yet)
      dispatch(fetchAllSchedules({ sectionId: currentSectionId }));
    }
  }, [dispatch, currentSectionId]);

  // Update UI schedules when transformed schedules change (only when not in edit mode)
  useEffect(() => {
    // Only update if we're not in edit mode and sectionSchedules changed
    if (!editMode && currentSectionId) {
      setUiSchedules(transformSchedulesToUI);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionSchedules, editMode, currentSectionId]); // Depend on sectionSchedules, not the memoized object

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
    if (!currentMasterlist?.subjectTeachers) {
      // Fallback to subjects if no masterlist
      return subjects.filter((subject) => subject.gradeLevel === currentGrade);
    }
    
    // Use subjects from masterlist.subjectTeachers
    return currentMasterlist.subjectTeachers
      .map((st) => {
        const subject = st.subject;
        if (!subject) return null;
        return {
          _id: subject._id || subject,
          subjectName: subject.subjectName || subject.name || 'Unknown Subject',
          gradeLevel: subject.gradeLevel || currentGrade,
          teacher: st.teacher, // Teacher from masterlist
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.subjectName.localeCompare(b.subjectName));
  }, [currentMasterlist, subjects, currentGrade]);

  // Get available teachers from masterlist
  const availableTeachers = useMemo(() => {
    if (!currentMasterlist?.subjectTeachers) {
      return [];
    }
    
    const teacherMap = new Map();
    currentMasterlist.subjectTeachers.forEach((st) => {
      if (st.teacher) {
        const teacher = st.teacher;
        // Handle populated teacher object
        const teacherId = teacher._id || teacher;
        const userId = teacher.userId;
        if (userId && !teacherMap.has(teacherId)) {
          teacherMap.set(teacherId, {
            id: teacherId,
            name: `${userId.firstName || ''} ${userId.lastName || ''}`.trim() || 'Unknown Teacher',
          });
        }
      }
    });
    return Array.from(teacherMap.values());
  }, [currentMasterlist]);

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
      const subject = availableSubjects.find((s) => s._id === subjectId);
      
      // Get teacher from masterlist for this subject
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
      
      updatedSchedules[time][day] = {
        ...updatedSchedules[time][day],
        subjectId: subjectId || '',
        subjectName: subject?.subjectName || '',
        teacherId: teacherId || '',
        teacherName: teacherName,
      };
      setUiSchedules(updatedSchedules);
    }
  };

  // Transform UI structure to backend format and save
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
      const operations = [];

      // Process each time slot and day
      times.forEach((time) => {
        if (time === 'BREAK') return;

        days.forEach((day) => {
          const cellData = uiSchedules[time]?.[day];
          if (!cellData) return;

          const { subjectId, scheduleIds, startTime, endTime } = cellData;

          // If no subject selected, delete all existing schedules for this time/day
          if (!subjectId) {
            scheduleIds.forEach((scheduleId) => {
              operations.push(dispatch(deleteSchedule(scheduleId)));
            });
            return;
          }

          // Check if schedule already exists for this section/subject/time/day
          const existingSchedule = sectionSchedules.find((s) => {
            const scheduleDay = s.day;
            const scheduleTime = `${s.startTime}-${s.endTime}`;
            const timeMatch = time.includes(s.startTime) || scheduleTime === time;
            const scheduleSubjectId = s.subjectId?._id?.toString() || s.subjectId?.toString();
            return (
              scheduleSubjectId === subjectId &&
              scheduleDay === day &&
              timeMatch
            );
          });

          const scheduleData = {
            sectionId: currentSectionId,
            subjectId: subjectId,
            day: day,
            startTime: startTime,
            endTime: endTime,
          };

          if (existingSchedule) {
            // Update existing schedule
            operations.push(
              dispatch(updateSchedule({ id: existingSchedule._id, data: scheduleData }))
            );
          } else {
            // Create new schedule
            operations.push(dispatch(createSchedule(scheduleData)));
          }
        });
      });

      // Wait for all operations to complete
      await Promise.all(operations);

      // Refresh schedules
      await dispatch(fetchAllSchedules({ sectionId: currentSectionId }));

      setEditMode(false);
      setMessageModalContent({
        type: 'success',
        message: 'Schedule successfully updated!',
      });
      setShowMessageModal(true);
    } catch (error) {
      setMessageModalContent({
        type: 'error',
        message: error || 'Failed to save schedule',
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
          <td className={styles.timeCol}>
            {time}
          </td>
          {days.map((day) => {
            const scheduleData = uiSchedules[time]?.[day] || {
              subjectId: '',
              subjectName: '',
              teacherId: '',
              teacherName: '',
            };
            if (editMode) {
              return (
                <td key={`subject-${time}-${day}`}>
                  <select
                    className={styles.subjectDropdown}
                    value={scheduleData.subjectId || ''}
                    onChange={(e) => handleSubjectChange(time, day, e.target.value)}
                    disabled={saving}
                  >
                    <option value="">Subject</option>
                    {availableSubjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.subjectName}
                      </option>
                    ))}
                  </select>
                  {scheduleData.subjectId && scheduleData.teacherName && (
                    <div className={styles.teacherName}>
                      {scheduleData.teacherName}
                    </div>
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
      <div className={styles.scheduleTitle}>
        Schedule - Grade {currentGrade}
      </div>

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

      {loading && !allSchedules.length && (
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
