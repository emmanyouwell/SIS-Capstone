import styles from './StudentGrades.module.css';

// Sample grades data - in a real app, this would come from an API
const gradesData = [
  { subject: 'Mathematics', q1: '', q2: '', q3: '', q4: '', remarks: '' },
  { subject: 'Science', q1: '', q2: '', q3: '', q4: '', remarks: '' },
  { subject: 'English', q1: '', q2: '', q3: '', q4: '', remarks: '' },
  { subject: 'MAPEH', q1: '', q2: '', q3: '', q4: '', remarks: '' },
  { subject: 'Filipino', q1: '', q2: '', q3: '', q4: '', remarks: '' },
  { subject: 'Araling Panlipunan', q1: '', q2: '', q3: '', q4: '', remarks: '' },
  { subject: 'Values Education', q1: '', q2: '', q3: '', q4: '', remarks: '' },
];

const gradingSystem = [
  { range: '90-100', description: 'Outstanding' },
  { range: '85-89', description: 'Very Satisfactory' },
  { range: '80-84', description: 'Satisfactory' },
  { range: '75-79', description: 'Fairly Satisfactory' },
  { range: 'Below 75', description: 'Did Not Meet Expectations' },
];

function StudentGrades() {
  // Calculate average grade for each quarter
  const calculateAverage = (quarter) => {
    const grades = gradesData
      .map((item) => item[quarter])
      .filter((grade) => grade !== '' && !isNaN(parseFloat(grade)));
    
    if (grades.length === 0) return '';
    
    const sum = grades.reduce((acc, grade) => acc + parseFloat(grade), 0);
    return (sum / grades.length).toFixed(2);
  };

  return (
    <div className={styles.gradesPage}>
        <div className={styles.mainContent}>
          <div className={styles.gradesCard}>
            <div className={styles.transcriptHeader}>
              <div className={styles.schoolInfo}>
                <img src="/images/logo.jpg" alt="School Logo" className={styles.headerLogo} />
                <div className={styles.schoolName}>Sto. Niño National High School</div>
                <div className={styles.schoolAddress}>
                  S5064 Col De Leon, Paranaque City, 1704 Metro Manila, Philippines
                </div>
                <div className={styles.schoolYear}>S.Y. 2025-2026</div>
              </div>
            </div>
            <hr className={styles.divider} />
            <div className={styles.reportTitle}>REPORT OF GRADES</div>
            <div className={styles.studentInfoRow}>
              <div><strong>Name:</strong> Kiana Mae L. Alvarez</div>
              <div><strong>Grade & Section:</strong> 8-Lilac</div>
              <div><strong>LRN:</strong> 823194756201</div>
            </div>
            <hr className={styles.divider} />
            <div className={styles.gradesHeader}>
              <div className={styles.left}></div>
              <div className={styles.right}>
                Class Adviser: <b>Angelica Nanas</b>
              </div>
            </div>
            <div className={styles.gradesFlexRow}>
              <div className={styles.gradesTableContainer}>
                <table>
                  <thead>
                    <tr>
                      <th>Subjects</th>
                      <th>1st</th>
                      <th>2nd</th>
                      <th>3rd</th>
                      <th>4th</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradesData.map((grade, index) => (
                      <tr key={index}>
                        <td>{grade.subject}</td>
                        <td>{grade.q1 || ''}</td>
                        <td>{grade.q2 || ''}</td>
                        <td>{grade.q3 || ''}</td>
                        <td>{grade.q4 || ''}</td>
                        <td className={styles.remarks}>{grade.remarks || ''}</td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>Average Grade</td>
                      <td>{calculateAverage('q1')}</td>
                      <td>{calculateAverage('q2')}</td>
                      <td>{calculateAverage('q3')}</td>
                      <td>{calculateAverage('q4')}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className={styles.simpleGradingSystem}>
                <div className={styles.gradingSystemTitle}>Grading System</div>
                <table className={styles.gradingSystemTableSimple}>
                  <tbody>
                    {gradingSystem.map((item, index) => (
                      <tr key={index}>
                        <td>{item.range}</td>
                        <td>{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default StudentGrades;

