import { useState } from 'react';
import styles from './AdminAccounts.module.css';
import { useNavigate } from 'react-router-dom';

function AdminAccounts() {
  const navigate = useNavigate();
  const [teacherCount] = useState(67);
  const [studentCount] = useState(422);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    status: 'Active'
  });

  const handleAddAccount = (e) => {
    e.preventDefault();
    // TODO: Implement API call to add account
    console.log('Adding account:', formData);
    setFormData({ name: '', role: '', email: '', status: 'Active' });
    setShowAddModal(false);
  };

  const handleViewTeachers = () => {
    navigate('/admin/accounts/view/teacher');
  };

  const handleEditTeachers = () => {
    navigate('/admin/accounts/edit/teacher');
  };

  const handleViewStudents = () => {
    navigate('/admin/accounts/view/student');
  };

  const handleEditStudents = () => {
    navigate('/admin/accounts/edit/student');
  };

  return (
    <>
      <div className={styles.mainContent}>
        <div className={styles.accountsHeader}>
          <h2>Accounts</h2>
        </div>
        <div className={styles.accountsSummaryCards}>
          <div className={styles.accountSummaryOuter}>
            <div className={styles.accountSummaryCard}>
              <div className={styles.accountSummaryTop}>
                <div className={styles.accountSummaryTitle}>Active Teacher Accounts:</div>
                <div className={styles.accountSummaryCount}>
                  <span>{teacherCount}</span>
                </div>
              </div>
              <div className={styles.accountSummaryBottom}>
                <button
                  className={`${styles.accountSummaryBtn} ${styles.view}`}
                  onClick={handleViewTeachers}
                >
                  VIEW
                </button>
                <button
                  className={`${styles.accountSummaryBtn} ${styles.edit}`}
                  onClick={handleEditTeachers}
                >
                  EDIT
                </button>
              </div>
            </div>
          </div>
          <div className={styles.accountSummaryOuter}>
            <div className={styles.accountSummaryCard}>
              <div className={styles.accountSummaryTop}>
                <div className={styles.accountSummaryTitle}>Active Student Accounts:</div>
                <div className={styles.accountSummaryCount}>
                  <span>{studentCount}</span>
                </div>
              </div>
              <div className={styles.accountSummaryBottom}>
                <button
                  className={`${styles.accountSummaryBtn} ${styles.view}`}
                  onClick={handleViewStudents}
                >
                  VIEW
                </button>
                <button
                  className={`${styles.accountSummaryBtn} ${styles.edit}`}
                  onClick={handleEditStudents}
                >
                  EDIT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className={styles.modal} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowAddModal(false)}>
              &times;
            </button>
            <h3>Add Account</h3>
            <form onSubmit={handleAddAccount}>
              <label htmlFor="account-name">Name</label>
              <input
                type="text"
                id="account-name"
                name="account-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <label htmlFor="account-role">Role</label>
              <select
                id="account-role"
                name="account-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Teacher">Teacher</option>
              </select>
              <label htmlFor="account-email">Email</label>
              <input
                type="email"
                id="account-email"
                name="account-email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <label htmlFor="account-status">Status</label>
              <select
                id="account-status"
                name="account-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <div className={styles.modalButtons}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminAccounts;

