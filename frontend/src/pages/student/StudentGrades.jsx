import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './StudentGrades.module.css';
import { fetchGrades } from '../../store/slices/gradeSlice';
import { fetchAllSubjects } from '../../store/slices/subjectSlice';
import { getAllSections } from '../../store/slices/sectionSlice';
import { getMe } from '../../store/slices/authSlice';

const gradingSystem = [
  { range: '90-100', description: 'Outstanding' },
  { range: '85-89', description: 'Very Satisfactory' },
  { range: '80-84', description: 'Satisfactory' },
  { range: '75-79', description: 'Fairly Satisfactory' },
  { range: 'Below 75', description: 'Did Not Meet Expectations' },
];

function StudentGrades() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { grades, loading: gradesLoading } = useSelector((state) => state.grades);
  const { subjects, loading: subjectsLoading } = useSelector((state) => state.subjects);
  const { data: sections, loading: sectionsLoading } = useSelector((state) => state.section);

  // Fetch user data if roleData is missing
  useEffect(() => {
    if (!user?.roleData) {
      dispatch(getMe());
    }
  }, [dispatch, user?.roleData]);

  // Get student's grade level and enrollment status
  const studentGradeLevel = user?.roleData?.sectionId?.gradeLevel || user?.roleData?.gradeLevel;
  const studentSectionId = user?.roleData?.sectionId?._id || user?.roleData?.sectionId;
  const enrollmentStatus = user?.roleData?.enrollmentStatus;

  // Fetch grades, subjects, and sections on mount
  useEffect(() => {
    dispatch(fetchGrades());
    dispatch(getAllSections());
    if (studentGradeLevel) {
      dispatch(fetchAllSubjects({ gradeLevel: studentGradeLevel, status: 'Active' }));
    }
  }, [dispatch, studentGradeLevel]);

  // Get the student's grade record (should be one record per student)
  const studentGradeRecord = useMemo(() => {
    if (!grades || grades.length === 0) return null;
    // The API automatically filters grades for the current student
    return grades[0] || null;
  }, [grades]);

  // Transform grade data to match UI format
  const gradesData = useMemo(() => {
    if (!studentGradeRecord || !studentGradeRecord.grades) return [];

    // Get all subjects for the student's grade level
    const gradeLevelSubjects = subjects.filter(
      (subject) => subject.gradeLevel === studentGradeLevel
    );

    // Create a map of subject grades from the grade record
    const subjectGradesMap = new Map();
    studentGradeRecord.grades.forEach((grade) => {
      const subjectId = grade.subjectId?._id || grade.subjectId;
      if (subjectId) {
        subjectGradesMap.set(subjectId.toString(), {
          q1: grade.q1 !== null && grade.q1 !== undefined ? grade.q1 : '',
          q2: grade.q2 !== null && grade.q2 !== undefined ? grade.q2 : '',
          q3: grade.q3 !== null && grade.q3 !== undefined ? grade.q3 : '',
          q4: grade.q4 !== null && grade.q4 !== undefined ? grade.q4 : '',
        });
      }
    });

    // Combine subjects with their grades
    return gradeLevelSubjects.map((subject) => {
      const subjectId = subject._id.toString();
      const gradeData = subjectGradesMap.get(subjectId) || { q1: '', q2: '', q3: '', q4: '' };
      
      return {
        subject: subject.subjectName,
        q1: gradeData.q1,
        q2: gradeData.q2,
        q3: gradeData.q3,
        q4: gradeData.q4,
        remarks: studentGradeRecord.remarks || '',
      };
    }).sort((a, b) => a.subject.localeCompare(b.subject));
  }, [studentGradeRecord, subjects, studentGradeLevel]);

  // Calculate average grade for each quarter
  const calculateAverage = (quarter) => {
    const quarterGrades = gradesData
      .map((item) => item[quarter])
      .filter((grade) => grade !== '' && grade !== null && grade !== undefined && !isNaN(parseFloat(grade)));
    
    if (quarterGrades.length === 0) return '';
    
    const sum = quarterGrades.reduce((acc, grade) => acc + parseFloat(grade), 0);
    return (sum / quarterGrades.length).toFixed(2);
  };

  // Format student name
  const formatStudentName = () => {
    if (!user) return 'N/A';
    const firstName = user.firstName || '';
    const middleName = user.middleName ? ` ${user.middleName.charAt(0)}.` : '';
    const lastName = user.lastName || '';
    const extensionName = user.extensionName ? ` ${user.extensionName}` : '';
    return `${lastName}, ${firstName}${middleName}${extensionName}`.trim();
  };

  // Get student LRN
  const getStudentLRN = () => {
    return user?.roleData?.lrn || 'N/A';
  };

  // Get grade and section
  const getGradeAndSection = () => {
    const gradeLevel = user?.roleData?.sectionId?.gradeLevel || user?.roleData?.gradeLevel || 'N/A';
    const sectionName = user?.roleData?.sectionId?.sectionName || user?.roleData?.sectionName || 'N/A';
    return `${gradeLevel}-${sectionName}`;
  };

  // Get class adviser from section data
  const getClassAdviser = () => {
    if (!studentSectionId || !sections || sections.length === 0) return 'N/A';
    
    const sectionIdStr = typeof studentSectionId === 'object' 
      ? studentSectionId._id?.toString() || studentSectionId.toString()
      : studentSectionId.toString();
    
    const studentSection = sections.find((section) => {
      const sectionId = section._id?.toString() || section._id;
      return sectionId === sectionIdStr;
    });
    
    if (studentSection?.adviserId?.userId) {
      const adviser = studentSection.adviserId.userId;
      return `${adviser.firstName || ''} ${adviser.lastName || ''}`.trim() || 'N/A';
    }
    
    return 'N/A';
  };

  // Get current school year (could be from enrollment or current date)
  const getSchoolYear = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-11
    
    // If before June, use previous year as start
    const startYear = month < 5 ? currentYear - 1 : currentYear;
    const endYear = startYear + 1;
    
    return `S.Y. ${startYear}-${endYear}`;
  };

  const loading = gradesLoading || subjectsLoading || sectionsLoading;

  if (loading) {
    return (
      <div className={styles.gradesPage}>
        <div className={styles.mainContent}>
          <div className={styles.gradesCard}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading grades...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!enrollmentStatus) {
    return (
      <div className={styles.gradesPage}>
        <div className={styles.mainContent}>
          <div className={styles.gradesCard}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Please complete your enrollment to view grades.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!studentGradeLevel) {
    return (
      <div className={styles.gradesPage}>
        <div className={styles.mainContent}>
          <div className={styles.gradesCard}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading your grade information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <div className={styles.schoolYear}>{getSchoolYear()}</div>
            </div>
          </div>
          <hr className={styles.divider} />
          <div className={styles.reportTitle}>REPORT OF GRADES</div>
          <div className={styles.studentInfoRow}>
            <div><strong>Name:</strong> {formatStudentName()}</div>
            <div><strong>Grade & Section:</strong> {getGradeAndSection()}</div>
            <div><strong>LRN:</strong> {getStudentLRN()}</div>
          </div>
          <hr className={styles.divider} />
          <div className={styles.gradesHeader}>
            <div className={styles.left}></div>
            <div className={styles.right}>
              Class Adviser: <b>{getClassAdviser()}</b>
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
                  {gradesData.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                        No grades available yet.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {gradesData.map((grade, index) => {
                        // Calculate if this subject has any grades
                        const hasGrades = [grade.q1, grade.q2, grade.q3, grade.q4].some(
                          q => q !== '' && q !== null && q !== undefined
                        );
                        
                        // Calculate subject average if there are grades
                        let subjectAverage = '';
                        if (hasGrades) {
                          const validGrades = [grade.q1, grade.q2, grade.q3, grade.q4]
                            .filter(q => q !== '' && q !== null && q !== undefined);
                          if (validGrades.length > 0) {
                            subjectAverage = validGrades.reduce((sum, q) => sum + parseFloat(q), 0) / validGrades.length;
                          }
                        }
                        
                        // Determine remarks: only show if there are grades
                        const remarks = hasGrades && subjectAverage !== '' 
                          ? (subjectAverage >= 75 ? 'PASSED' : 'FAILED')
                          : '';
                        
                        return (
                          <tr key={index}>
                            <td>{grade.subject}</td>
                            <td>{grade.q1 !== '' ? Math.round(grade.q1) : ''}</td>
                            <td>{grade.q2 !== '' ? Math.round(grade.q2) : ''}</td>
                            <td>{grade.q3 !== '' ? Math.round(grade.q3) : ''}</td>
                            <td>{grade.q4 !== '' ? Math.round(grade.q4) : ''}</td>
                            <td className={styles.remarks}>{remarks}</td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Average Grade</td>
                        <td>{calculateAverage('q1') || ''}</td>
                        <td>{calculateAverage('q2') || ''}</td>
                        <td>{calculateAverage('q3') || ''}</td>
                        <td>{calculateAverage('q4') || ''}</td>
                        <td></td>
                      </tr>
                      {studentGradeRecord?.finalGrade !== null && studentGradeRecord?.finalGrade !== undefined && (
                        <tr>
                          <td colSpan="4" style={{ fontWeight: 'bold', textAlign: 'right' }}>
                            Final Grade:
                          </td>
                          <td style={{ fontWeight: 'bold', textAlign: 'center' }}>
                            {Math.round(studentGradeRecord.finalGrade)}
                          </td>
                          <td className={styles.remarks}>
                            {studentGradeRecord.finalGrade >= 75 ? 'PASSED' : 'FAILED'}
                          </td>
                        </tr>
                      )}
                    </>
                  )}
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

