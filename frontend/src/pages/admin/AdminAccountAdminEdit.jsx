import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './AdminAccountEdit.module.css';
import { fetchAllAdmins, updateAdmin, deleteAdmin } from '../../store/slices/adminSlice';
import { fetchAllUsers, updateUser, deleteUser } from '../../store/slices/userSlice';
import { register } from '../../store/slices/authSlice';

function AdminAccountAdminEdit() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { admins, loading, error } = useSelector((state) => state.admins);
  const { users, loading: usersLoading } = useSelector((state) => state.users);
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
    employeeId: '',
    position: '',
    department: '',
    assignedOffice: '',
    dateOfBirth: '',
    contactNumber: '',
    address: '',
    sex: '',
    extensionName: ''
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  // Fetch admins
  useEffect(() => {
    dispatch(fetchAllAdmins());
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
  const accounts = admins.map(admin => ({
    id: admin._id,
    name: `${admin.userId?.firstName || ''} ${admin.userId?.lastName || ''}`.trim(),
    email: admin.userId?.email || '',
    username: admin.userId?.email ? admin.userId.email.split('@')[0] : '',
    totalLogins: 0,
    role: 'Admin',
    _id: admin._id,
    admin: admin
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
        const admin = account.admin;
        setEditingAdmin(admin);
        setFormData({
          firstName: admin.userId?.firstName || '',
          lastName: admin.userId?.lastName || '',
          middleName: admin.userId?.middleName || '',
          email: admin.userId?.email || '',
          password: '',
          role: 'Admin',
          status: admin.userId?.status || 'Active',
          employeeId: admin.employeeId || '',
          position: admin.position || '',
          department: admin.department || '',
          assignedOffice: admin.assignedOffice || '',
          dateOfBirth: admin.userId?.dateOfBirth ? new Date(admin.userId.dateOfBirth).toISOString().split('T')[0] : '',
          contactNumber: admin.userId?.contactNumber || '',
          address: admin.userId?.address || '',
          sex: admin.userId?.sex || '',
          extensionName: admin.userId?.extensionName || ''
        });
        setShowAddModal(true);
        break;
      case 'delete':
        setAdminToDelete(account);
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
      if (editingAdmin) {
        // Update existing admin - need to update both User and Admin records
        const userUpdateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          email: formData.email,
          status: formData.status,
          dateOfBirth: formData.dateOfBirth || undefined,
          contactNumber: formData.contactNumber || undefined,
          address: formData.address || undefined,
          sex: formData.sex,
          extensionName: formData.extensionName || undefined
        };

        if (formData.password) {
          userUpdateData.password = formData.password;
        }

        const adminUpdateData = {
          employeeId: formData.employeeId || undefined,
          position: formData.position || undefined,
          department: formData.department || undefined,
          assignedOffice: formData.assignedOffice || undefined
        };

        // Update User first
        const userResult = await dispatch(updateUser({ 
          id: editingAdmin.userId._id, 
          data: userUpdateData 
        }));

        if (updateUser.fulfilled.match(userResult)) {
          // Then update Admin
          const adminResult = await dispatch(updateAdmin({ 
            id: editingAdmin._id, 
            data: adminUpdateData 
          }));

          if (updateAdmin.fulfilled.match(adminResult)) {
            setSuccessMessage('Admin updated successfully!');
            setShowAddModal(false);
            setEditingAdmin(null);
            dispatch(fetchAllAdmins());
          } else {
            setFormError(adminResult.payload || 'Failed to update admin details');
          }
        } else {
          setFormError(userResult.payload || 'Failed to update user details');
        }
      } else {
        // Create new admin - register handles User and Admin record creation atomically
        const registerData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          email: formData.email,
          password: formData.password,
          role: 'Admin',
          status: formData.status,
          dateOfBirth: formData.dateOfBirth || undefined,
          contactNumber: formData.contactNumber || undefined,
          address: formData.address || undefined,
          sex: formData.sex,
          extensionName: formData.extensionName || undefined,
          // Role-specific data (register controller handles creation of Admin document)
          employeeId: formData.employeeId || undefined,
          position: formData.position || undefined,
          department: formData.department || undefined,
          assignedOffice: formData.assignedOffice || undefined
        };

        const result = await dispatch(register(registerData));

        if (register.fulfilled.match(result)) {
          setSuccessMessage('Admin created successfully!');
          setShowAddModal(false);
          dispatch(fetchAllAdmins());
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
        employeeId: '',
        position: '',
        department: '',
        assignedOffice: '',
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
    setEditingAdmin(null);
    setFormError(null);
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      password: '',
      role: 'Admin',
      status: 'Active',
      employeeId: '',
      position: '',
      department: '',
      assignedOffice: '',
      dateOfBirth: '',
      contactNumber: '',
      address: ''
    });
  };

  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;

    try {
      // Delete admin record first, then user
      const adminResult = await dispatch(deleteAdmin(adminToDelete._id));
      if (deleteAdmin.fulfilled.match(adminResult)) {
        // Also delete the associated user
        if (adminToDelete.admin?.userId?._id) {
          await dispatch(deleteUser(adminToDelete.admin.userId._id));
        }
        setSuccessMessage('Admin deleted successfully!');
        setShowDeleteModal(false);
        setAdminToDelete(null);
        dispatch(fetchAllAdmins());
      } else {
        setFormError(adminResult.payload || 'Failed to delete admin');
        setShowDeleteModal(false);
        setAdminToDelete(null);
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
      setShowDeleteModal(false);
      setAdminToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setAdminToDelete(null);
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
            <h3>{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</h3>
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
                  <label htmlFor="extensionName">Extension Name (e.g. Jr., III)</label>
                  <input
                    type="text"
                    id="extensionName"
                    name="extensionName"
                    value={formData.extensionName}
                    onChange={(e) => setFormData({ ...formData, extensionName: e.target.value })}
                    placeholder="Leave blank if not applicable"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="sex">Sex</label>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    required
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
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
                <div className={styles.formGroup}>
                  <label htmlFor="assignedOffice">Assigned Office</label>
                  <input
                    type="text"
                    id="assignedOffice"
                    name="assignedOffice"
                    value={formData.assignedOffice}
                    onChange={(e) => setFormData({ ...formData, assignedOffice: e.target.value })}
                    placeholder="Enter assigned office"
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
                  <label htmlFor="password">Password {editingAdmin && '(leave blank to keep current)'}</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingAdmin}
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
                    ? (editingAdmin ? 'Updating...' : 'Creating...') 
                    : (editingAdmin ? 'Update Admin' : 'Add Admin')
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
              Are you sure you want to delete <strong>{adminToDelete?.name}</strong>?
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

     
    </div>
  );
}

export default AdminAccountAdminEdit;

