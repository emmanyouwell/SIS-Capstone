import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './AdminAccountEdit.module.css';
import { fetchAllTeachers, updateTeacher, deleteTeacher, createTeacher } from '../../store/slices/teacherSlice';
import { fetchAllUsers, updateUser, deleteUser } from '../../store/slices/userSlice';
import { register } from '../../store/slices/authSlice';
import { getAllSections } from '../../store/slices/sectionSlice';

function AdminAccountEdit() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { teachers, loading, error } = useSelector((state) => state.teachers);
  const { users, loading: usersLoading } = useSelector((state) => state.users);
  const { loading: registerLoading } = useSelector((state) => state.auth);
  const sections = useSelector((state) => state.section.data);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    password: '',
    role: 'Teacher',
    status: 'Active',
    employeeId: '',
    department: '',
    position: '',
    dateOfBirth: '',
    contactNumber: '',
    address: ''
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  // Fetch teachers and sections
  useEffect(() => {
    dispatch(fetchAllTeachers());
    dispatch(getAllSections());
  }, [dispatch]);

  // Get sections for selected grade
  const gradeSections = formData.grade
    ? sections
        .filter((s) => s.grade === parseInt(formData.grade))
        .map((s) => s.name)
        .sort()
    : [];

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('[data-dropdown]')) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown]);

  const handleBack = () => {
    navigate('/admin/accounts');
  };

  // Format accounts for display
  const accounts = teachers.map(teacher => ({
    id: teacher._id,
    name: `${teacher.userId?.firstName || ''} ${teacher.userId?.lastName || ''}`.trim(),
    email: teacher.userId?.email || '',
    username: teacher.userId?.email ? teacher.userId.email.split('@')[0] : '',
    totalLogins: 0, // This field doesn't exist in the models
    role: 'Teacher',
    _id: teacher._id,
    teacher: teacher
  }));

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleDropdownAction = async (action, account) => {
    setActiveDropdown(null);
    setFormError(null);
    setSuccessMessage(null);

    switch (action) {
      case 'view':
        // Navigate to view page or show details
        console.log('View:', account);
        break;
      case 'edit':
        // Populate form with teacher data for editing
        const teacher = account.teacher;
        setEditingTeacher(teacher);
        setFormData({
          firstName: teacher.userId?.firstName || '',
          lastName: teacher.userId?.lastName || '',
          middleName: teacher.userId?.middleName || '',
          email: teacher.userId?.email || '',
          password: '', // Don't pre-fill password
          role: 'Teacher',
          status: teacher.userId?.status || 'Active',
          employeeId: teacher.employeeId || '',
          department: teacher.department || '',
          position: teacher.position || '',
          dateOfBirth: teacher.userId?.dateOfBirth ? new Date(teacher.userId.dateOfBirth).toISOString().split('T')[0] : '',
          contactNumber: teacher.userId?.contactNumber || '',
          address: teacher.userId?.address || ''
        });
        setShowAddModal(true);
        break;
      case 'delete':
        setTeacherToDelete(account);
        setShowDeleteModal(true);
        break;
      default:
        break;
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    try {
      if (editingTeacher) {
        // Update existing teacher - need to update both User and Teacher records
        const userUpdateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          email: formData.email,
          status: formData.status,
          dateOfBirth: formData.dateOfBirth || undefined,
          contactNumber: formData.contactNumber || undefined,
          address: formData.address || undefined
        };

        if (formData.password) {
          userUpdateData.password = formData.password;
        }

        const teacherUpdateData = {
          employeeId: formData.employeeId || undefined,
          department: formData.department || undefined,
          position: formData.position || undefined
        };

        // Update User first
        const userResult = await dispatch(updateUser({ 
          id: editingTeacher.userId._id, 
          data: userUpdateData 
        }));

        if (updateUser.fulfilled.match(userResult)) {
          // Then update Teacher
          const teacherResult = await dispatch(updateTeacher({ 
            id: editingTeacher._id, 
            data: teacherUpdateData 
          }));

          if (updateTeacher.fulfilled.match(teacherResult)) {
            setSuccessMessage('Teacher updated successfully!');
            setShowAddModal(false);
            setEditingTeacher(null);
            dispatch(fetchAllTeachers());
          } else {
            setFormError(teacherResult.payload || 'Failed to update teacher details');
          }
        } else {
          setFormError(userResult.payload || 'Failed to update user details');
        }
      } else {
        // Create new teacher - first create User, then Teacher
        const registerData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          email: formData.email,
          password: formData.password,
          role: 'Teacher',
          status: formData.status,
          dateOfBirth: formData.dateOfBirth || undefined,
          contactNumber: formData.contactNumber || undefined,
          address: formData.address || undefined
        };

        const result = await dispatch(register(registerData));

        if (register.fulfilled.match(result)) {
          // Create Teacher record
          const teacherData = {
            userId: result.payload.id,
            employeeId: formData.employeeId || undefined,
            department: formData.department || undefined,
            position: formData.position || undefined
          };

          const createTeacherResult = await dispatch(createTeacher(teacherData));

          if (createTeacherResult.type?.includes('fulfilled')) {
            setSuccessMessage('Teacher created successfully!');
            setShowAddModal(false);
            dispatch(fetchAllTeachers());
          } else {
            setFormError('User created but failed to create teacher record');
          }
        } else {
          setFormError(result.payload || 'Failed to create user');
        }
      }

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        password: '',
        role: 'Teacher',
        status: 'Active',
        employeeId: '',
        department: '',
        position: '',
        dateOfBirth: '',
        contactNumber: '',
        address: ''
      });
    } catch (err) {
      setFormError('An unexpected error occurred');
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingTeacher(null);
    setFormError(null);
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      password: '',
      role: 'Teacher',
      status: 'Active',
      employeeId: '',
      department: '',
      position: '',
      dateOfBirth: '',
      contactNumber: '',
      address: ''
    });
  };

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;

    try {
      // Delete teacher record first, then user
      const teacherResult = await dispatch(deleteTeacher(teacherToDelete._id));
      if (deleteTeacher.fulfilled.match(teacherResult)) {
        // Also delete the associated user
        if (teacherToDelete.teacher?.userId?._id) {
          await dispatch(deleteUser(teacherToDelete.teacher.userId._id));
        }
        setSuccessMessage('Teacher deleted successfully!');
        setShowDeleteModal(false);
        setTeacherToDelete(null);
        dispatch(fetchAllTeachers());
      } else {
        setFormError(teacherResult.payload || 'Failed to delete teacher');
        setShowDeleteModal(false);
        setTeacherToDelete(null);
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
      setShowDeleteModal(false);
      setTeacherToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setTeacherToDelete(null);
  };

  const title = 'Faculty Table';

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

      {/* Success Message */}
      {successMessage && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#efe', color: '#3c3', borderRadius: '4px' }}>
          {successMessage}
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
          />
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <button className={styles.addUserBtn} onClick={() => setShowAddModal(true)}>
          <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Add new user
        </button>
      </div>

      {loading || usersLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.facultyTable}>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>User Name</th>
              <th>Email</th>
              <th>Username</th>
              <th>Total Logins</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((account) => (
              <tr key={account.id}>
                <td><input type="checkbox" /></td>
                <td>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleDropdownAction('view', account); }}>
                    {account.name}
                  </a>
                </td>
                <td>{account.email}</td>
                <td>{account.username}</td>
                <td>{account.totalLogins}</td>
                <td>
                  <span className={`${styles.roleBadge} ${styles[account.role.toLowerCase()]}`}>
                    {account.role}
                  </span>
                </td>
                <td>
                  <div className={styles.actionCell} data-dropdown>
                    <button
                      className={styles.dotsBtn}
                      title="Actions"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(account.id);
                      }}
                    >
                      <svg width="22" height="22" fill="none" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5"/>
                        <circle cx="12" cy="12" r="1.5"/>
                        <circle cx="12" cy="19" r="1.5"/>
                      </svg>
                    </button>
                    {activeDropdown === account.id && (
                      <div className={styles.dropdownMenu} data-dropdown>
                        <button
                          type="button"
                          className={styles.dropdownItem}
                          onClick={() => handleDropdownAction('view', account)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className={styles.dropdownItem}
                          onClick={() => handleDropdownAction('edit', account)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`${styles.dropdownItem} ${styles.delete}`}
                          onClick={() => handleDropdownAction('delete', account)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={handleCloseModal}>
              &times;
            </button>
            <h3>{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h3>
            {formError && (
              <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px', fontSize: '14px' }}>
                {formError}
              </div>
            )}
            <form onSubmit={handleAddUser}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="employeeId">Employee ID</label>
                  <input
                    type="text"
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="Enter employee ID"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter department"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="middleName">Middle Name</label>
                  <input
                    type="text"
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="position">Position</label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Enter position"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="contactNumber">Contact Number</label>
                  <input
                    type="text"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="Enter contact number"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password {editingTeacher && '(leave blank to keep current)'}</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingTeacher}
                    minLength="6"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalButtons}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={handleCloseModal}
                  disabled={registerLoading || loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.btnPrimary}
                  disabled={registerLoading || loading}
                >
                  {registerLoading || loading 
                    ? (editingTeacher ? 'Updating...' : 'Creating...') 
                    : (editingTeacher ? 'Update Teacher' : 'Add Teacher')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className={styles.modal} onClick={handleCancelDelete}>
          <div className={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete <strong>{teacherToDelete?.name}</strong>?
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              This action cannot be undone.
            </p>
            <div className={styles.modalButtons}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={handleCancelDelete}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={handleConfirmDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <button className={styles.fabBtn} title="Back" onClick={handleBack}>
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
    </div>
  );
}

export default AdminAccountEdit;

