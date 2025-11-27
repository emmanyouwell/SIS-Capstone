import { useState, useEffect } from 'react';
import styles from './AdminSchedule.module.css';

function AdminSchedule() {
  // Data for grades, sections, advisers
  const gradeSections = {
    7: ['Dahlia', 'Rose', 'Lilac', 'Foxglove', 'Lily'],
    8: ['Sunflower', 'Tulip', 'Orchid', 'Peony', 'Daisy'],
    9: ['Jasmine', 'Magnolia', 'Azalea', 'Camellia', 'Begonia'],
    10: ['Iris', 'Poppy', 'Violet', 'Marigold', 'Petunia'],
  };

  const advisers = {
    Dahlia: 'Flores, Mariah J.',
    Rose: 'Santos, Ana M.',
    Lilac: 'Reyes, John P.',
    Foxglove: 'Garcia, Liza S.',
    Lily: 'Torres, Mark D.',
    Sunflower: 'Cruz, Bella R.',
    Tulip: 'Lopez, Carla S.',
    Orchid: 'Lim, Peter Q.',
    Peony: 'Tan, Grace L.',
    Daisy: 'Uy, Henry T.',
    Jasmine: 'Dela Cruz, Maria F.',
    Magnolia: 'Sison, Paul G.',
    Azalea: 'Chua, Linda V.',
    Camellia: 'Go, Steven H.',
    Begonia: 'Yu, Anna K.',
    Iris: 'Reyes, Carla M.',
    Poppy: 'Santos, John D.',
    Violet: 'Lim, Sarah P.',
    Marigold: 'Tan, Michael S.',
    Petunia: 'Uy, Lisa C.',
  };

  const subjects = ['Math', 'Science', 'English', 'MAPEH', 'Filipino', 'A.P.', 'TLE', 'ESP'];
  const teachers = [
    'Hermano Puli',
    'Carla Sainz',
    'Kim Perez',
    'Baby Mandaguayon',
    'Yna Clarente',
    'Karylle Samonte',
    'Kyle Echavez',
    'Mary Marilag',
  ];

  const times = [
    '7:00-8:00 AM',
    '8:00-9:00 AM',
    'BREAK',
    '9:15-10:15 AM',
    '10:15-11:15 AM',
    '11:15-12:15 PM',
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Initialize schedules state
  const initializeSchedules = () => {
    const initialSchedules = {};
    Object.values(gradeSections)
      .flat()
      .forEach((section) => {
        initialSchedules[section] = {};
        times.forEach((time) => {
          if (time !== 'BREAK') {
            initialSchedules[section][time] = {};
            days.forEach((day) => {
              initialSchedules[section][time][day] = { subject: '', teacher: '' };
            });
          }
        });
      });
    return initialSchedules;
  };

  // State
  const [currentGrade, setCurrentGrade] = useState(7);
  const [currentSection, setCurrentSection] = useState('Dahlia');
  const [editMode, setEditMode] = useState(false);
  const [schedules, setSchedules] = useState(initializeSchedules);

  // Update section when grade changes
  useEffect(() => {
    if (gradeSections[currentGrade] && gradeSections[currentGrade].length > 0) {
      setCurrentSection(gradeSections[currentGrade][0]);
    }
  }, [currentGrade]);

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

  // Save changes
  const handleSave = () => {
    // State is already updated via onChange handlers, so we just exit edit mode
    // TODO: Add API call here to persist schedule changes
    setEditMode(false);
    alert('Schedule successfully updated!');
  };

  // Handle subject change in edit mode
  const handleSubjectChange = (time, day, value) => {
    const updatedSchedules = { ...schedules };
    if (updatedSchedules[currentSection] && updatedSchedules[currentSection][time]) {
      updatedSchedules[currentSection][time][day] = {
        ...updatedSchedules[currentSection][time][day],
        subject: value,
      };
      setSchedules(updatedSchedules);
    }
  };

  // Handle teacher change in edit mode
  const handleTeacherChange = (time, day, value) => {
    const updatedSchedules = { ...schedules };
    if (updatedSchedules[currentSection] && updatedSchedules[currentSection][time]) {
      updatedSchedules[currentSection][time][day] = {
        ...updatedSchedules[currentSection][time][day],
        teacher: value,
      };
      setSchedules(updatedSchedules);
    }
  };

  // Render schedule table
  const renderTableRows = () => {
    const rows = [];
    const timeSlots = times.filter((t) => t !== 'BREAK');

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
            const scheduleData =
              schedules[currentSection]?.[time]?.[day] || { subject: '', teacher: '' };
            if (editMode) {
              return (
                <td key={`subject-${time}-${day}`}>
                  <select
                    className={styles.subjectDropdown}
                    value={scheduleData.subject}
                    onChange={(e) => handleSubjectChange(time, day, e.target.value)}
                  >
                    <option value="">Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </td>
              );
            }
            return (
              <td key={`subject-${time}-${day}`}>{scheduleData.subject || ''}</td>
            );
          })}
        </tr>
      );
      rows.push(subjectRow);

      // Teacher row
      const teacherRow = (
        <tr key={`teacher-${time}`}>
          {days.map((day) => {
            const scheduleData =
              schedules[currentSection]?.[time]?.[day] || { subject: '', teacher: '' };
            if (editMode) {
              return (
                <td key={`teacher-${time}-${day}`}>
                  <select
                    className={styles.teacherDropdown}
                    value={scheduleData.teacher}
                    onChange={(e) => handleTeacherChange(time, day, e.target.value)}
                  >
                    <option value="">Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher} value={teacher}>
                        {teacher}
                      </option>
                    ))}
                  </select>
                </td>
              );
            }
            return (
              <td key={`teacher-${time}-${day}`}>{scheduleData.teacher || ''}</td>
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

      <select
        id="grade-select"
        className={styles.gradeSelect}
        value={currentGrade}
        onChange={handleGradeChange}
      >
        {Object.keys(gradeSections).map((grade) => (
          <option key={grade} value={grade}>
            Grade {grade}
          </option>
        ))}
      </select>

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
                onClick={() => handleSectionClick(section)}
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
                Adviser: <b id="adviser-title">{advisers[currentSection] || ''}</b>
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
                <button className={`${styles.schedBtn} ${styles.saveBtn}`} onClick={handleSave}>
                  Save Changes
                </button>
              ) : (
                <button className={`${styles.schedBtn} ${styles.editBtn}`} onClick={handleEdit}>
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

