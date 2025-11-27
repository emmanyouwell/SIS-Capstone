import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminMasterlistAssignTeacher.module.css';

function AdminMasterlistAssignTeacher() {
  const navigate = useNavigate();
  const [currentGrade, setCurrentGrade] = useState(7);
  const [selectedSection, setSelectedSection] = useState('');
  const [adviser, setAdviser] = useState('');
  const [subjectTeachers, setSubjectTeachers] = useState({});
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');

  const gradeSections = {
    7: ['Dahlia', 'Rose', 'Lilac', 'Foxglove', 'Lily'],
    8: ['Sunflower', 'Tulip', 'Orchid', 'Peony', 'Daisy'],
    9: ['Jasmine', 'Magnolia', 'Azalea', 'Camellia', 'Begonia'],
    10: ['Iris', 'Poppy', 'Violet', 'Marigold', 'Petunia'],
  };

  const subjects = [
    'Mathematics',
    'Science',
    'English',
    'MAPEH',
    'Filipino',
    'Araling Panlipunan',
    'Values Education',
  ];

  const teachers = [
    'Maria Santos',
    'John Garcia',
    'Anna Reyes',
    'Mark Cruz',
    'Lisa Tan',
    'Paul Lim',
    'Sarah Uy',
  ];

  useEffect(() => {
    if (gradeSections[currentGrade] && gradeSections[currentGrade].length > 0) {
      setSelectedSection(gradeSections[currentGrade][0]);
    }
  }, [currentGrade]);

  const handleGradeChange = (grade) => {
    setCurrentGrade(grade);
    setAdviser('');
    setSubjectTeachers({});
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
    setAdviser('');
    setSubjectTeachers({});
  };

  const handleAdviserChange = (e) => {
    setAdviser(e.target.value);
  };

  const handleSubjectTeacherChange = (subject, teacher) => {
    setSubjectTeachers((prev) => ({
      ...prev,
      [subject]: teacher,
    }));
  };

  const handleSave = () => {
    if (!adviser || adviser === 'Assign Teacher') {
      showAlert('Please assign an adviser and all subject teachers before saving.', 'error');
      return;
    }

    const allSubjectsAssigned = subjects.every(
      (subject) => subjectTeachers[subject] && subjectTeachers[subject] !== 'Assign Teacher'
    );

    if (!allSubjectsAssigned) {
      showAlert('Please assign an adviser and all subject teachers before saving.', 'error');
      return;
    }

    // TODO: Add API call here to save assignments
    showAlert('Teachers assigned successfully!', 'success');
  };

  const handleUndo = () => {
    setAdviser('');
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

  const currentSections = gradeSections[currentGrade] || [];

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
              value={adviser}
              onChange={handleAdviserChange}
            >
              <option>Assign Teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher} value={teacher}>
                  {teacher}
                </option>
              ))}
          </select>
          </div>

          <div className={styles.buttonRow}>
            <button className={styles.undoBtn} onClick={handleUndo}>
              Undo
            </button>
            <button className={styles.saveBtn} onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>

        <div className={styles.subjectsCard}>
          <div className={styles.subjectsTitle}>SUBJECT TEACHERS</div>
          {subjects.map((subject) => (
            <div key={subject} className={styles.subjectRow}>
              <span>{subject}</span>
              <select
                className={styles.select}
                value={subjectTeachers[subject] || 'Assign Teacher'}
                onChange={(e) => handleSubjectTeacherChange(subject, e.target.value)}
              >
                <option>Assign Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher} value={teacher}>
                    {teacher}
                  </option>
                ))}
              </select>
            </div>
          ))}
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

