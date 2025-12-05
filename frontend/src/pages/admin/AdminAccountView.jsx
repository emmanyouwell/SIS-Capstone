import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './AdminAccountView.module.css';
import { fetchAllTeachers } from '../../store/slices/teacherSlice';
import { fetchAllAdmins } from '../../store/slices/adminSlice';

function AdminAccountView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { teachers, loading: teachersLoading, error: teachersError } = useSelector((state) => state.teachers);
  const { admins, loading: adminsLoading, error: adminsError } = useSelector((state) => state.admins);

  // Fetch teachers and admins
  useEffect(() => {
    dispatch(fetchAllTeachers());
    dispatch(fetchAllAdmins());
  }, [dispatch]);

  const loading = teachersLoading || adminsLoading;
  const error = teachersError || adminsError;

  // Format accounts for display - combine teachers and admins
  const teacherAccounts = teachers
    .filter(teacher => teacher.userId?.status === 'Active')
    .map(teacher => ({
      id: teacher._id,
      name: `${teacher.userId?.firstName || ''} ${teacher.userId?.lastName || ''}`.trim(),
      role: 'Teacher',
      email: teacher.userId?.email || '',
      totalLogins: 0, // This field doesn't exist in the models - keeping for UI compatibility
      avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    }));

  const adminAccounts = admins
    .filter(admin => admin.userId?.status === 'Active')
    .map(admin => ({
      id: admin._id,
      name: `${admin.userId?.firstName || ''} ${admin.userId?.lastName || ''}`.trim(),
      role: 'Admin',
      email: admin.userId?.email || '',
      totalLogins: 0,
      avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    }));

  // Combine and sort by name
  const accounts = [...teacherAccounts, ...adminAccounts].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  const handleBack = () => {
    navigate('/admin/accounts');
  };

  const title = 'Faculty Accounts (Teachers & Admins)';

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <h2>{title}</h2>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <>
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                Active Faculty Accounts (Teachers & Admins):
              </div>
              <div className={styles.summaryCount}>{accounts.length}</div>
            </div>
            <div className={styles.chartBox}>
              <div className={styles.chartTitle}>Total Logins</div>
              <div className={styles.chartPlaceholder}>
                Chart visualization would go here
              </div>
            </div>
          </div>

          <h2 className={styles.tableTitle}>
            Faculty Table (Teachers & Admins)
          </h2>
          <table className={styles.facultyTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Total logins</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td className={styles.facultyNameCell}>
                    <img
                      className={styles.facultyAvatar}
                      src={account.avatar}
                      alt="Avatar"
                    />
                    {account.name}
                  </td>
                  <td>{account.role}</td>
                  <td>{account.email}</td>
                  <td>{account.totalLogins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <button className={styles.fabBtn} title="Back" onClick={handleBack}>
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    </div>
  );
}

export default AdminAccountView;

