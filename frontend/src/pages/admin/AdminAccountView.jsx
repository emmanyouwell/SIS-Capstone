import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './AdminAccountView.module.css';

function AdminAccountView() {
  const navigate = useNavigate();
  const { accountType } = useParams(); // 'teacher' or 'student'
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockAccounts = accountType === 'teacher' 
        ? [
            { id: 1, name: 'Maria Dela Cruz', role: 'Teacher', email: 'm.d@gmail.com', totalLogins: 37, avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
            { id: 2, name: 'Richard Lorenz', role: 'Admin', email: 'rich_lorenz@gmail.com', totalLogins: 45, avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
            { id: 3, name: 'Michael Reyes', role: 'Admin', email: 'm.reyes@gmail.com', totalLogins: 41, avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
            { id: 4, name: 'Shaira Nendez', role: 'Teacher', email: 'shairanendez@gmail.com', totalLogins: 33, avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
          ]
        : [
            { id: 1, name: 'John Doe', role: 'Student', email: 'john.doe@student.com', totalLogins: 25, avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
            { id: 2, name: 'Jane Smith', role: 'Student', email: 'jane.smith@student.com', totalLogins: 30, avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
          ];
      setAccounts(mockAccounts);
      setLoading(false);
    }, 500);
  }, [accountType]);

  const handleBack = () => {
    navigate('/admin/accounts');
  };

  const title = accountType === 'teacher' ? 'Faculty Accounts' : 'Student Accounts';

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <h2>{title}</h2>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <>
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                Active {accountType === 'teacher' ? 'Faculty' : 'Student'} Accounts:
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
            {accountType === 'teacher' ? 'Faculty' : 'Student'} Table
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
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
    </div>
  );
}

export default AdminAccountView;

