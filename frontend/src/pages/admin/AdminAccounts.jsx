import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminAccounts.module.css';
import { useNavigate } from 'react-router-dom';
import { fetchAllUsers } from '../../store/slices/userSlice';
import { register } from '../../store/slices/authSlice';

function AdminAccounts() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);
  const { loading: registerLoading } = useSelector((state) => state.auth);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    status: 'Active'
  });
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Calculate counts from users array
  const teacherCount = users.filter(user => user.role === 'Teacher' && user.status === 'Active').length;
  const studentCount = users.filter(user => user.role === 'Student' && user.status === 'Active').length;

  // Fetch users on mount
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    try {
      // Prepare data for register API
      const registerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        status: formData.status
      };

      const result = await dispatch(register(registerData));

      if (register.fulfilled.match(result)) {
        setSuccessMessage('Account created successfully!');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: '',
          status: 'Active'
        });
        setShowAddModal(false);
        // Refresh users list
        dispatch(fetchAllUsers());
      } else {
        setFormError(result.payload || 'Failed to create account');
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
    }
  };

  const handleViewTeachers = () => {
    navigate('/admin/accounts/teacher/view');
  };

  const handleEditTeachers = () => {
    navigate('/admin/accounts/teacher/edit');
  };

  const handleViewStudents = () => {
    navigate('/admin/accounts/student/view');
  };

  const handleEditStudents = () => {
    navigate('/admin/accounts/student/edit');
  };

  if (loading) {
    return (
      <div className={styles.mainContent}>
        {/* Loading State */}
        {loading && (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading users...</div>
        )}
      </div>
    )
  }
  return (
    <>
      <div className={styles.mainContent}>
        <div className={styles.accountsHeader}>
          <h2>Accounts</h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage} style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className={styles.successMessage} style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#efe', color: '#3c3', borderRadius: '4px' }}>
            {successMessage}
          </div>
        )}



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
            {formError && (
              <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px', fontSize: '14px' }}>
                {formError}
              </div>
            )}
            <form onSubmit={handleAddAccount}>
              <label htmlFor="account-firstName">First Name</label>
              <input
                type="text"
                id="account-firstName"
                name="account-firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <label htmlFor="account-lastName">Last Name</label>
              <input
                type="text"
                id="account-lastName"
                name="account-lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
              <label htmlFor="account-email">Email</label>
              <input
                type="email"
                id="account-email"
                name="account-email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <label htmlFor="account-password">Password</label>
              <input
                type="password"
                id="account-password"
                name="account-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength="6"
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
                <option value="Student">Student</option>
              </select>
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
                  onClick={() => {
                    setShowAddModal(false);
                    setFormError(null);
                    setFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      password: '',
                      role: '',
                      status: 'Active'
                    });
                  }}
                  disabled={registerLoading}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={registerLoading}>
                  {registerLoading ? 'Creating...' : 'Save'}
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

