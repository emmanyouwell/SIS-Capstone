import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminAccounts.module.css';
import { useNavigate } from 'react-router-dom';
import { fetchAllUsers } from '../../store/slices/userSlice';
import { fetchAllStudents } from '../../store/slices/studentSlice';
import { fetchAllTeachers } from '../../store/slices/teacherSlice';
import { fetchAllAdmins } from '../../store/slices/adminSlice';
import { register } from '../../store/slices/authSlice';

function AdminAccounts() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { students, loading: studentsLoading } = useSelector((state) => state.students);
  const { teachers, loading: teachersLoading } = useSelector((state) => state.teachers);
  const { admins, loading: adminsLoading } = useSelector((state) => state.admins);
  const { loading: registerLoading } = useSelector((state) => state.auth);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    password: '',
    role: '',
    status: 'Active',
    contactNumber: '',
    address: '',
    dateOfBirth: '',
    employeeId: '',
    department: '',
    position: '',
    assignedOffice: '', // Admin only
  });
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Calculate counts from role-specific arrays
  // Combine teachers and admins for faculty accounts
  const facultyCount = teachers.filter(t => t.userId?.status === 'Active' || !t.userId).length + 
                       admins.filter(a => a.userId?.status === 'Active' || !a.userId).length;
  const studentCount = students.filter(s => s.userId?.status === 'Active' || !s.userId).length;
  const loading = studentsLoading || teachersLoading || adminsLoading;

  // Fetch role-specific data on mount
  useEffect(() => {
    dispatch(fetchAllStudents());
    dispatch(fetchAllTeachers());
    dispatch(fetchAllAdmins());
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
      // Prepare data for register API (includes role-specific data)
      const registerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        status: formData.status,
        contactNumber: formData.contactNumber,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth || undefined,
        employeeId: formData.employeeId || undefined,
        department: formData.department || undefined,
        position: formData.position || undefined,
        assignedOffice: formData.role === 'Admin' ? (formData.assignedOffice || undefined) : undefined,
      };

      const result = await dispatch(register(registerData));

      if (register.fulfilled.match(result)) {
        setSuccessMessage('Account created successfully!');
        setFormData({
          firstName: '',
          lastName: '',
          middleName: '',
          email: '',
          password: '',
          role: '',
          status: 'Active',
          contactNumber: '',
          address: '',
          dateOfBirth: '',
          employeeId: '',
          department: '',
          position: '',
          assignedOffice: '',
        });
        setShowAddModal(false);
        // Refresh role-specific lists
        dispatch(fetchAllStudents());
        dispatch(fetchAllTeachers());
        dispatch(fetchAllAdmins());
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
        {formError && (
          <div className={styles.errorMessage} style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>
            {formError}
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
                <div className={styles.accountSummaryTitle}>Active Faculty Accounts (Teachers & Admins):</div>
                <div className={styles.accountSummaryCount}>
                  <span>{facultyCount}</span>
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
              <label htmlFor="account-middleName">Middle Name</label>
              <input
                type="text"
                id="account-middleName"
                name="account-middleName"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
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
              <label htmlFor="account-contactNumber">Contact Number</label>
              <input
                type="text"
                id="account-contactNumber"
                name="account-contactNumber"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              />
              <label htmlFor="account-address">Address</label>
                <input
                  type="text"
                  id="account-address"
                  name="account-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              <label htmlFor="account-dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="account-dateOfBirth"
                name="account-dateOfBirth"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
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
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
              </select>
              {/* Role-specific fields */}
              {(formData.role === 'Teacher' || formData.role === 'Admin') && (
                <>
                  <label htmlFor="account-employeeId">Employee ID</label>
                  <input
                    type="text"
                    id="account-employeeId"
                    name="account-employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="Enter employee ID"
                  />
                  <label htmlFor="account-department">Department</label>
                  <input
                    type="text"
                    id="account-department"
                    name="account-department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter department"
                  />
                  <label htmlFor="account-position">Position</label>
                  <input
                    type="text"
                    id="account-position"
                    name="account-position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Enter position"
                  />
                </>
              )}
              {formData.role === 'Admin' && (
                <>
                  <label htmlFor="account-assignedOffice">Assigned Office</label>
                  <input
                    type="text"
                    id="account-assignedOffice"
                    name="account-assignedOffice"
                    value={formData.assignedOffice}
                    onChange={(e) => setFormData({ ...formData, assignedOffice: e.target.value })}
                    placeholder="Enter assigned office"
                  />
                </>
              )}
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
                      middleName: '',
                      email: '',
                      password: '',
                      role: '',
                      status: 'Active',
                      contactNumber: '',
                      address: '',
                      dateOfBirth: '',
                      employeeId: '',
                      department: '',
                      position: '',
                      assignedOffice: '',
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

