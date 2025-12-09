import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './AdminAccountView.module.css';
import { fetchAllAdmins } from '../../store/slices/adminSlice';

function AdminAccountAdminView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { admins, loading, error } = useSelector((state) => state.admins);

  // Fetch admins
  useEffect(() => {
    dispatch(fetchAllAdmins());
  }, [dispatch]);

  // Format accounts for display
  const accounts = admins
    .filter(admin => admin.userId?.status === 'Active')
    .map(admin => ({
      id: admin._id,
      name: `${admin.userId?.firstName || ''} ${admin.userId?.lastName || ''}`.trim(),
      role: 'Admin',
      email: admin.userId?.email || '',
      totalLogins: 0, // This field doesn't exist in the models - keeping for UI compatibility
      avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    }));

  const handleBack = () => {
    navigate('/admin/accounts');
  };

  const title = 'Admin Accounts';

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
                Active Admin Accounts:
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
            Admin Table
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

     
    </div>
  );
}

export default AdminAccountAdminView;

