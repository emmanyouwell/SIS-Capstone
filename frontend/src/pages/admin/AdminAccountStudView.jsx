import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './AdminAccountStudView.module.css';
import { fetchAllStudents } from '../../store/slices/studentSlice';

function AdminAccountStudView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { students, loading, error } = useSelector((state) => state.students);

  useEffect(() => {
    dispatch(fetchAllStudents());
  }, [dispatch]);

  const handleBack = () => {
    navigate('/admin/accounts');
  };

  if (loading) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  const activeCount = students.filter(student => student.userId?.status === 'Active').length;


  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <h2>Student Accounts</h2>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>Active Students Accounts:</div>
          <div className={styles.summaryCount}>{activeCount}</div>
        </div>
        <div className={styles.chartBox}>
          <div className={styles.chartTitle}>Total Logins</div>
          <div className={styles.chartPlaceholder}>Chart visualization would go here</div>
        </div>
      </div>

      <h2 className={styles.tableTitle}>Student Table</h2>
      <table className={styles.facultyTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Grade</th>
            <th>Total logins</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const avatar = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
            const fullName = `${student.userId?.firstName || ''} ${student.userId?.lastName || ''}`.trim();
            const grade = student.gradeLevel ?? '';
            const statusLabel = student.userId?.status === 'Active' ? 'Enrolled' : student.userId?.status || 'Inactive';
            const totalLogins = 0;
            
            return (
              <tr key={student._id}>
                <td className={styles.facultyNameCell}>
                  <img className={styles.facultyAvatar} src={avatar} alt="Avatar" />
                  {fullName}
                </td>
                <td>{statusLabel}</td>
                <td>{grade}</td>
                <td>{totalLogins}</td>
              </tr>
            )
          })}

        </tbody>
      </table>

      <button className={styles.fabBtn} title="Back" onClick={handleBack}>
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    </div>
  );
}

export default AdminAccountStudView;
