import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './StudentSubjects.module.css';
import { fetchAllSubjects } from '../../store/slices/subjectSlice';
import { getMe } from '../../store/slices/authSlice';

// Helper function to map subject names to CSS classes and icons
function getSubjectStyle(subjectName) {
  const name = subjectName.toLowerCase();
  
  if (name.includes('math') || name.includes('mathematics')) {
    return { class: 'math', icon: '🧮' };
  } else if (name.includes('science')) {
    return { class: 'science', icon: '🔬' };
  } else if (name.includes('english')) {
    return { class: 'english', icon: '📚' };
  } else if (name.includes('mapeh')) {
    return { class: 'mapeh', icon: '🎨' };
  } else if (name.includes('filipino')) {
    return { class: 'filipino', icon: '📝' };
  } else if (name.includes('araling panlipunan') || name.includes('ap')) {
    return { class: 'ap', icon: '🌏' };
  } else if (name.includes('values') || name.includes('education')) {
    return { class: 'values', icon: '💡' };
  }
  
  // Default style for unknown subjects
  return { class: 'math', icon: '📖' };
}


function StudentSubjects() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { subjects, loading: subjectsLoading } = useSelector((state) => state.subjects);

  // Fetch user data if roleData is missing
  useEffect(() => {
    if (!user?.roleData) {
      dispatch(getMe());
    }
  }, [dispatch, user?.roleData]);

  // Get student's grade level and enrollment status
  const studentGradeLevel = user?.roleData?.sectionId?.gradeLevel || user?.roleData?.gradeLevel;
  const enrollmentStatus = user?.roleData?.enrollmentStatus;

  // Fetch subjects for student's grade level
  useEffect(() => {
    if (studentGradeLevel) {
      dispatch(fetchAllSubjects({ gradeLevel: studentGradeLevel, status: 'Active' }));
    }
  }, [dispatch, studentGradeLevel]);

  const handleSubjectClick = (subject) => {
    navigate(`/student/subjects/${subject._id}/materials`);
  };

  // Map fetched subjects to display format
  const displaySubjects = subjects.map((subject) => {
    const style = getSubjectStyle(subject.subjectName);
    return {
      ...subject,
      name: subject.subjectName,
      class: style.class,
      icon: style.icon,
    };
  });

  return (
    <div className={styles.mainContent}>
      {subjectsLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading subjects...</p>
        </div>
      ) : !enrollmentStatus ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Please complete your enrollment to view subjects.</p>
        </div>
      ) : !studentGradeLevel ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading your grade information...</p>
        </div>
      ) : displaySubjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No subjects available for your grade level.</p>
        </div>
      ) : (
        <div className={styles.subjectsGrid}>
          {displaySubjects.map((subject) => (
            <div
              key={subject._id}
              className={`${styles.subjectCard} ${styles[subject.class]}`}
              onClick={() => handleSubjectClick(subject)}
            >
              {subject.name}
              <span className={styles.subjectIcon}>{subject.icon}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentSubjects;

