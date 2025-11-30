import { useState, useEffect } from 'react';
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
import { fetchAllUsers } from '../../store/slices/userSlice';

function AdminSchedule() {
  const dispatch = useDispatch();

  // Redux state
  const { schedules: allSchedules, loading, error } = useSelector((state) => state.schedules);
  const { subjects } = useSelector((state) => state.subjects);
  const { users } = useSelector((state) => state.users);

  // Grade sections mapping (static - part of system structure)
  const gradeSections = {
    7: ['Dahlia', 'Rose', 'Lilac', 'Foxglove', 'Lily'],
    8: ['Sunflower', 'Tulip', 'Orchid', 'Peony', 'Daisy'],
    9: ['Jasmine', 'Magnolia', 'Azalea', 'Camellia', 'Begonia'],
    10: ['Iris', 'Poppy', 'Violet', 'Marigold', 'Petunia'],
  };

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
  const [currentSection, setCurrentSection] = useState('Dahlia');
  const [editMode, setEditMode] = useState(false);
  const [uiSchedules, setUiSchedules] = useState({});
  const [schoolYear, setSchoolYear] = useState(() => {
    // Default to current school year (e.g., 2024-2025)
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    return `${currentYear}-${nextYear}`;
  });
  const [saving, setSaving] = useState(false);

  // Get current year schedules filtered by grade, section, and schoolYear
  const getFilteredSchedules = () => {
    return allSchedules.filter(
      (schedule) =>
        schedule.grade === currentGrade &&
        schedule.section === currentSection &&
        schedule.schoolYear === schoolYear
    );
  };

  // Transform backend schedule array to UI structure
  const transformSchedulesToUI = (schedules) => {
    const uiStructure = {};
    schedules.forEach((schedule) => {
      const { section, timeSlot, day, subject, teacher } = schedule;
      if (!uiStructure[section]) {
        uiStructure[section] = {};
      }
      if (!uiStructure[section][timeSlot]) {
        uiStructure[section][timeSlot] = {};
      }
      uiStructure[section][timeSlot][day] = {
        subject: subject?._id || '',
        subjectName: subject?.name || '',
        teacher: teacher?._id || '',
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : '',
        scheduleId: schedule._id,
      };
    });
    return uiStructure;
  };

  // Initialize UI structure with empty values
  const initializeUIStructure = () => {
    const structure = {};
    gradeSections[currentGrade]?.forEach((section) => {
      structure[section] = {};
      times.forEach((time) => {
        if (time !== 'BREAK') {
          structure[section][time] = {};
          days.forEach((day) => {
            structure[section][time][day] = {
              subject: '',
              subjectName: '',
              teacher: '',
              teacherName: '',
              scheduleId: null,
            };
          });
        }
      });
    });
    return structure;
  };

  // Update section when grade changes
  useEffect(() => {
    if (gradeSections[currentGrade] && gradeSections[currentGrade].length > 0) {
      setCurrentSection(gradeSections[currentGrade][0]);
    }
  }, [currentGrade]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    dispatch(fetchAllSchedules({ grade: currentGrade, section: currentSection, schoolYear }));
    dispatch(fetchAllSubjects({ gradeLevel: currentGrade }));
    dispatch(fetchAllUsers());
  }, [dispatch, currentGrade, currentSection, schoolYear]);

  // Transform schedules to UI structure when schedules or filters change
  useEffect(() => {
    const filteredSchedules = getFilteredSchedules();
    const transformed = transformSchedulesToUI(filteredSchedules);
    const initialized = initializeUIStructure();
    
    // Merge transformed schedules with initialized structure
    const merged = { ...initialized };
    Object.keys(transformed).forEach((section) => {
      if (merged[section]) {
        Object.keys(transformed[section]).forEach((time) => {
          if (merged[section][time]) {
            Object.keys(transformed[section][time]).forEach((day) => {
              merged[section][time][day] = transformed[section][time][day];
            });
          }
        });
      }
    });
    
    setUiSchedules(merged);
  }, [allSchedules, currentGrade, currentSection, schoolYear]);

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
  const availableSubjects = subjects.filter((subject) => subject.gradeLevel === currentGrade);

  // Get available teachers
  const availableTeachers = users
    .filter((user) => user.role === 'Teacher' && user.status === 'Active')
    .map((user) => ({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
    }));

  // Get adviser for current section (from schedules or users)
  const getAdviser = () => {
    const filteredSchedules = getFilteredSchedules();
    const scheduleWithAdviser = filteredSchedules.find((s) => s.adviser);
    if (scheduleWithAdviser?.adviser) {
      return `${scheduleWithAdviser.adviser.firstName} ${scheduleWithAdviser.adviser.lastName}`;
    }
    return '';
  };

  // Handle grade change
  const handleGradeChange = (e) => {
    const newGrade = parseInt(e.target.value);
    setCurrentGrade(newGrade);
  };

  // Handle section click
  const handleSectionClick = (section) => {
    setCurrentSection(section);
  };

  // Enable edit mode
  const handleEdit = () => {
    setEditMode(true);
  };

  // Handle subject change in edit mode
  const handleSubjectChange = (time, day, subjectId) => {
    const updatedSchedules = { ...uiSchedules };
    if (updatedSchedules[currentSection] && updatedSchedules[currentSection][time]) {
      const subject = availableSubjects.find((s) => s._id === subjectId);
      updatedSchedules[currentSection][time][day] = {
        ...updatedSchedules[currentSection][time][day],
        subject: subjectId,
        subjectName: subject?.name || '',
      };
      setUiSchedules(updatedSchedules);
    }
  };

  // Handle teacher change in edit mode
  const handleTeacherChange = (time, day, teacherId) => {
    const updatedSchedules = { ...uiSchedules };
    if (updatedSchedules[currentSection] && updatedSchedules[currentSection][time]) {
      const teacher = availableTeachers.find((t) => t.id === teacherId);
      updatedSchedules[currentSection][time][day] = {
        ...updatedSchedules[currentSection][time][day],
        teacher: teacherId,
        teacherName: teacher?.name || '',
      };
      setUiSchedules(updatedSchedules);
    }
  };

  // Transform UI structure to backend format and save
  const handleSave = async () => {
    setSaving(true);
    try {
      const sectionData = uiSchedules[currentSection] || {};
      const operations = [];

      // Process each time slot and day
      times.forEach((time) => {
        if (time === 'BREAK') return;
        
        days.forEach((day) => {
          const cellData = sectionData[time]?.[day];
          if (!cellData) return;

          const { subject, teacher, scheduleId } = cellData;

          // Skip if both subject and teacher are empty
          if (!subject && !teacher) {
            // If there's an existing schedule, delete it
            if (scheduleId) {
              operations.push(dispatch(deleteSchedule(scheduleId)));
            }
            return;
          }

          // Validate required fields
          if (!subject || !teacher) {
            alert(`Please select both subject and teacher for ${time} - ${day}`);
            setSaving(false);
            return;
          }

          const scheduleData = {
            grade: currentGrade,
            section: currentSection,
            timeSlot: time,
            day: day,
            subject: subject,
            teacher: teacher,
            schoolYear: schoolYear,
          };

          if (scheduleId) {
            // Update existing schedule
            operations.push(dispatch(updateSchedule({ id: scheduleId, data: scheduleData })));
          } else {
            // Create new schedule
            operations.push(dispatch(createSchedule(scheduleData)));
          }
        });
      });

      // Wait for all operations to complete
      await Promise.all(operations);
      
      // Refresh schedules
      await dispatch(fetchAllSchedules({ grade: currentGrade, section: currentSection, schoolYear }));
      
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
    // Reload schedules to reset UI state
    const filteredSchedules = getFilteredSchedules();
    const transformed = transformSchedulesToUI(filteredSchedules);
    const initialized = initializeUIStructure();
    
    const merged = { ...initialized };
    Object.keys(transformed).forEach((section) => {
      if (merged[section]) {
        Object.keys(transformed[section]).forEach((time) => {
          if (merged[section][time]) {
            Object.keys(transformed[section][time]).forEach((day) => {
              merged[section][time][day] = transformed[section][time][day];
            });
          }
        });
      }
    });
    
    setUiSchedules(merged);
    setEditMode(false);
  };

  // Render schedule table
  const renderTableRows = () => {
    const rows = [];
    const sectionData = uiSchedules[currentSection] || {};

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
            const scheduleData = sectionData[time]?.[day] || {
              subject: '',
              subjectName: '',
              teacher: '',
              teacherName: '',
            };
            if (editMode) {
              return (
                <td key={`subject-${time}-${day}`}>
                  <select
                    className={styles.subjectDropdown}
                    value={scheduleData.subject || ''}
                    onChange={(e) => handleSubjectChange(time, day, e.target.value)}
                    disabled={saving}
                  >
                    <option value="">Subject</option>
                    {availableSubjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
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
            const scheduleData = sectionData[time]?.[day] || {
              subject: '',
              subjectName: '',
              teacher: '',
              teacherName: '',
            };
            if (editMode) {
              return (
                <td key={`teacher-${time}-${day}`}>
                  <select
                    className={styles.teacherDropdown}
                    value={scheduleData.teacher || ''}
                    onChange={(e) => handleTeacherChange(time, day, e.target.value)}
                    disabled={saving}
                  >
                    <option value="">Teacher</option>
                    {availableTeachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </td>
              );
            }
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
          {Object.keys(gradeSections).map((grade) => (
            <option key={grade} value={grade}>
              Grade {grade}
            </option>
          ))}
        </select>

        <select
          className={styles.gradeSelect}
          value={schoolYear}
          onChange={(e) => setSchoolYear(e.target.value)}
          disabled={editMode}
          style={{ width: '180px' }}
        >
          <option value="2023-2024">2023-2024</option>
          <option value="2024-2025">2024-2025</option>
          <option value="2025-2026">2025-2026</option>
        </select>
      </div>

      {error && (
        <div style={{ 
          padding: '12px', 
          marginBottom: '16px', 
          backgroundColor: '#fee', 
          color: '#c33', 
          borderRadius: '8px' 
        }}>
          {error}
        </div>
      )}

      {loading && !allSchedules.length && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Loading schedules...
        </div>
      )}

      <div className={styles.contentLayout}>
        <div className={styles.sectionListCard}>
          <div className={styles.sectionListTitle}>Sections</div>
          <ul className={styles.sectionList}>
            {gradeSections[currentGrade]?.map((section) => (
              <li
                key={section}
                className={`${styles.sectionItem} ${
                  section === currentSection ? styles.active : ''
                }`}
                onClick={() => !editMode && handleSectionClick(section)}
                style={{ cursor: editMode ? 'not-allowed' : 'pointer' }}
              >
                {section}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.scheduleContainer}>
          <div className={styles.schedContainer}>
            <div className={styles.schedHeader}>
              <div className={styles.schedTitle}>
                Grade and Section: <b id="section-title">{currentGrade} - {currentSection}</b>
              </div>
              <div className={styles.schedTitle}>
                Adviser: <b id="adviser-title">{getAdviser() || 'Not assigned'}</b>
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
                  disabled={loading}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSchedule;
