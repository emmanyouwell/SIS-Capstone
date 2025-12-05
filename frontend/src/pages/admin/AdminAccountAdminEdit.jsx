import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './AdminAccountEdit.module.css';
import { fetchAllUsers, updateUser, deleteUser } from '../../store/slices/userSlice';
import { register } from '../../store/slices/authSlice';

function AdminAccountAdminEdit() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { users, loading, error } = useSelector((state) => state.users);
  const { loading: registerLoading } = useSelector((state) => state.auth);
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
    role: 'Admin',
    status: 'Active',
    learnerReferenceNo: '',
    birthdate: ''
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Fetch users filtered by role
  useEffect(() => {
    dispatch(fetchAllUsers({ role: 'Admin' }));
  }, [dispatch]);

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
  const roleFilter = 'Admin';
  const accounts = users
    .filter(user => user.role === roleFilter)
    .map(user => ({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      username: user.email.split('@')[0],
      totalLogins: 0,
      role: user.role,
      _id: user._id,
      ...user
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
        console.log('View:', account);
        break;
      case 'edit':
        setEditingUser(account);
        setFormData({
          firstName: account.firstName || '',
          lastName: account.lastName || '',
          middleName: account.middleName || '',
          email: account.email || '',
          password: '',
          role: account.role || 'Admin',
          status: account.status || 'Active',
          learnerReferenceNo: account.learnerReferenceNo || '',
          birthdate: account.birthdate ? new Date(account.birthdate).toISOString().split('T')[0] : ''
        });
        setShowAddModal(true);
        break;
      case 'delete':
        setUserToDelete(account);
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
      if (editingUser) {
        // Update existing user
        const updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          learnerReferenceNo: formData.learnerReferenceNo || undefined,
          birthdate: formData.birthdate || undefined
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        const result = await dispatch(updateUser({ id: editingUser._id, data: updateData }));

        if (updateUser.fulfilled.match(result)) {
          setSuccessMessage('Admin updated successfully!');
          setShowAddModal(false);
          setEditingUser(null);
          dispatch(fetchAllUsers({ role: roleFilter }));
        } else {
          setFormError(result.payload || 'Failed to update admin');
        }
      } else {
        // Create new user
        const registerData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          status: formData.status,
          learnerReferenceNo: formData.learnerReferenceNo || undefined,
          birthdate: formData.birthdate || undefined
        };

        const result = await dispatch(register(registerData));

        if (register.fulfilled.match(result)) {
          setSuccessMessage('Admin created successfully!');
          setShowAddModal(false);
          dispatch(fetchAllUsers({ role: roleFilter }));
        } else {
          setFormError(result.payload || 'Failed to create admin');
        }
      }

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        password: '',
        role: 'Admin',
        status: 'Active',
        learnerReferenceNo: '',
        birthdate: ''
      });
    } catch (err) {
      setFormError('An unexpected error occurred');
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingUser(null);
    setFormError(null);
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      password: '',
      role: 'Admin',
      status: 'Active',
      learnerReferenceNo: '',
      birthdate: ''
    });
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const result = await dispatch(deleteUser(userToDelete._id));
      if (deleteUser.fulfilled.match(result)) {
        setSuccessMessage('Admin deleted successfully!');
        setShowDeleteModal(false);
        setUserToDelete(null);
        dispatch(fetchAllUsers({ role: roleFilter }));
      } else {
        setFormError(result.payload || 'Failed to delete admin');
        setShowDeleteModal(false);
        setUserToDelete(null);
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const title = 'Admin Table';

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
          Add new admin
        </button>
      </div>

      {loading ? (
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
            <h3>{editingUser ? 'Edit Admin' : 'Add New Admin'}</h3>
            {formError && (
              <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px', fontSize: '14px' }}>
                {formError}
              </div>
            )}
            <form onSubmit={handleAddUser}>
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
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="birthdate">Date of Birth</label>
                  <input
                    type="date"
                    id="birthdate"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                  />
                </div>
              </div>

              {/* Admin Information Section */}
              {editingUser && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
                  <h4 style={{ marginBottom: '15px', color: '#333' }}>Admin Information</h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="learnerReferenceNo">Employee ID</label>
                      <input
                        type="text"
                        id="learnerReferenceNo"
                        name="learnerReferenceNo"
                        value={formData.learnerReferenceNo}
                        onChange={(e) => setFormData({ ...formData, learnerReferenceNo: e.target.value })}
                        placeholder="Enter employee ID"
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
                </div>
              )}

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password {editingUser && '(leave blank to keep current)'}</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    minLength="6"
                  />
                </div>
                {!editingUser && (
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
                )}
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
                    ? (editingUser ? 'Updating...' : 'Creating...') 
                    : (editingUser ? 'Update Admin' : 'Add Admin')
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
              Are you sure you want to delete <strong>{userToDelete.name}</strong>?
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

export default AdminAccountAdminEdit;

