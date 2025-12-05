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

function AdminSchedule() {
  const dispatch = useDispatch();

  // Redux state
  const { schedules: allSchedules, loading, error } = useSelector((state) => state.schedules);
  const { subjects } = useSelector((state) => state.subjects);
  const { students } = useSelector((state) => state.students);
  const { data: sections } = useSelector((state) => state.section);

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

  // Get schedules for current section students
  const sectionSchedules = useMemo(() => {
    if (!currentSectionId || sectionStudents.length === 0) return [];
    const studentIds = sectionStudents.map((s) => s._id.toString());
    return allSchedules.filter((schedule) => {
      const scheduleStudentId = schedule.studentId?._id?.toString() || schedule.studentId?.toString();
      const scheduleSectionId = schedule.sectionId?._id?.toString() || schedule.sectionId?.toString();
      return (
        studentIds.includes(scheduleStudentId) &&
        scheduleSectionId === currentSectionId.toString()
      );
    });
  }, [allSchedules, sectionStudents, currentSectionId]);

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
          const teacher = subject?.teacherId?.userId;
          uiStructure[time][day] = {
            subjectId: subject?._id || '',
            subjectName: subject?.subjectName || '',
            teacherId: teacher?._id || '',
            teacherName: teacher ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() : '',
            scheduleIds: sectionSchedules
              .filter((s) => {
                const scheduleDay = s.day;
                const scheduleTime = `${s.startTime}-${s.endTime}`;
                const timeMatch = time.includes(s.startTime) || scheduleTime === time;
                return (
                  scheduleDay === day &&
                  timeMatch &&
                  (s.subjectId?._id?.toString() === subject?._id?.toString() || !s.subjectId)
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
  }, [sectionSchedules, times, days]);

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
    }
  }, [dispatch, currentGrade]);

  // Fetch schedules when section changes
  useEffect(() => {
    if (currentSectionId && sectionStudents.length > 0) {
      const studentIds = sectionStudents.map((s) => s._id);
      // Fetch schedules for all students in section
      dispatch(fetchAllSchedules({ sectionId: currentSectionId }));
    }
  }, [dispatch, currentSectionId, sectionStudents.length]);

  // Update UI schedules when transformed schedules change (only when not in edit mode)
  useEffect(() => {
    // Only update if we're not in edit mode and sectionSchedules changed
    if (!editMode) {
      setUiSchedules(transformSchedulesToUI);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionSchedules, editMode]); // Depend on sectionSchedules, not the memoized object

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Get available subjects for current grade
  const availableSubjects = useMemo(() => {
    return subjects.filter((subject) => subject.gradeLevel === currentGrade);
  }, [subjects, currentGrade]);

  // Get available teachers from subjects
  const availableTeachers = useMemo(() => {
    const teacherMap = new Map();
    availableSubjects.forEach((subject) => {
      if (subject.teacherId?.userId) {
        const teacher = subject.teacherId.userId;
        const teacherId = teacher._id;
        if (!teacherMap.has(teacherId)) {
          teacherMap.set(teacherId, {
            id: teacherId,
            name: `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim(),
          });
        }
      }
    });
    return Array.from(teacherMap.values());
  }, [availableSubjects]);

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
      const teacher = subject?.teacherId?.userId;
      updatedSchedules[time][day] = {
        ...updatedSchedules[time][day],
        subjectId: subjectId || '',
        subjectName: subject?.subjectName || '',
        teacherId: teacher?._id || '',
        teacherName: teacher ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() : '',
      };
      setUiSchedules(updatedSchedules);
    }
  };

  // Transform UI structure to backend format and save
  const handleSave = async () => {
    if (!currentSectionId || sectionStudents.length === 0) {
      alert('Please select a section with students');
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

          // Update or create schedules for all students in section
          sectionStudents.forEach((student) => {
            // Check if schedule already exists for this student/time/day
            const existingSchedule = sectionSchedules.find((s) => {
              const scheduleStudentId = s.studentId?._id?.toString() || s.studentId?.toString();
              const scheduleDay = s.day;
              const scheduleTime = `${s.startTime}-${s.endTime}`;
              const timeMatch = time.includes(s.startTime) || scheduleTime === time;
              return (
                scheduleStudentId === student._id.toString() &&
                scheduleDay === day &&
                timeMatch
              );
            });

            const scheduleData = {
              studentId: student._id,
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
      });

      // Wait for all operations to complete
      await Promise.all(operations);

      // Refresh schedules
      await dispatch(fetchAllSchedules({ sectionId: currentSectionId }));

      setEditMode(false);
      alert('Schedule successfully updated!');
    } catch (error) {
      alert(error || 'Failed to save schedule');
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

      // Subject row
      const subjectRow = (
        <tr key={`subject-${time}`}>
          <td className={styles.timeCol} rowSpan="2">
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
                </td>
              );
            }
            return (
              <td key={`subject-${time}-${day}`}>{scheduleData.subjectName || ''}</td>
            );
          })}
        </tr>
      );
      rows.push(subjectRow);

      // Teacher row
      const teacherRow = (
        <tr key={`teacher-${time}`}>
          {days.map((day) => {
            const scheduleData = uiSchedules[time]?.[day] || {
              subjectId: '',
              subjectName: '',
              teacherId: '',
              teacherName: '',
            };
            return (
              <td key={`teacher-${time}-${day}`}>{scheduleData.teacherName || ''}</td>
            );
          })}
        </tr>
      );
      rows.push(teacherRow);
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
    </div>
  );
}

export default AdminSchedule;
