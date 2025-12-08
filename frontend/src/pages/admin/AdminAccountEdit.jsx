import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './AdminAccountEdit.module.css';
import { fetchAllTeachers, updateTeacher, deleteTeacher } from '../../store/slices/teacherSlice';
import { fetchAllAdmins, updateAdmin, deleteAdmin } from '../../store/slices/adminSlice';
import { fetchAllUsers, updateUser, deleteUser } from '../../store/slices/userSlice';
import { register } from '../../store/slices/authSlice';
import { getAllSections } from '../../store/slices/sectionSlice';

function AdminAccountEdit() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { teachers, loading: teachersLoading, error: teachersError } = useSelector((state) => state.teachers);
  const { admins, loading: adminsLoading, error: adminsError } = useSelector((state) => state.admins);
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
    role: '',
    status: 'Active',
    employeeId: '',
    department: '',
    position: '',
    assignedOffice: '', // Admin only
    teachingLoad: '', // Teacher only
    emergencyContactName: '', // Teacher only
    emergencyContactNumber: '', // Teacher only
    dateOfBirth: '',
    contactNumber: '',
    address: '',
    sex: '',
    extensionName: ''
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null); // Can be teacher or admin
  const [editingAccountType, setEditingAccountType] = useState(null); // 'Teacher' or 'Admin'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [accountToDeleteType, setAccountToDeleteType] = useState(null);

  const loading = teachersLoading || adminsLoading;
  const error = teachersError || adminsError;

  // Fetch teachers, admins and sections
  useEffect(() => {
    dispatch(fetchAllTeachers());
    dispatch(fetchAllAdmins());
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

  // Format accounts for display - combine teachers and admins
  const teacherAccounts = teachers.map(teacher => ({
    id: teacher._id,
    name: `${teacher.userId?.firstName || ''} ${teacher.userId?.lastName || ''}`.trim(),
    email: teacher.userId?.email || '',
    username: teacher.userId?.email ? teacher.userId.email.split('@')[0] : '',
    totalLogins: 0,
    role: 'Teacher',
    _id: teacher._id,
    account: teacher,
    accountType: 'Teacher'
  }));

  const adminAccounts = admins.map(admin => ({
    id: admin._id,
    name: `${admin.userId?.firstName || ''} ${admin.userId?.lastName || ''}`.trim(),
    email: admin.userId?.email || '',
    username: admin.userId?.email ? admin.userId.email.split('@')[0] : '',
    totalLogins: 0,
    role: 'Admin',
    _id: admin._id,
    account: admin,
    accountType: 'Admin'
  }));

  // Combine and sort by name
  const accounts = [...teacherAccounts, ...adminAccounts].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

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
        // Populate form with account data for editing (teacher or admin)
        const accountData = account.account;
        setEditingAccount(accountData);
        setEditingAccountType(account.accountType);
        setFormData({
          firstName: accountData.userId?.firstName || '',
          lastName: accountData.userId?.lastName || '',
          middleName: accountData.userId?.middleName || '',
          email: accountData.userId?.email || '',
          password: '', // Don't pre-fill password
          role: account.accountType,
          status: accountData.userId?.status || 'Active',
          employeeId: accountData.employeeId || '',
          department: accountData.department || '',
          position: accountData.position || '',
          assignedOffice: accountData.assignedOffice || '',
          teachingLoad: accountData.teachingLoad || '',
          emergencyContactName: accountData.emergencyContactName || '',
          emergencyContactNumber: accountData.emergencyContactNumber || '',
          dateOfBirth: accountData.userId?.dateOfBirth ? new Date(accountData.userId.dateOfBirth).toISOString().split('T')[0] : '',
          contactNumber: accountData.userId?.contactNumber || '',
          address: accountData.userId?.address || '',
          sex: accountData.userId?.sex || '',
          extensionName: accountData.userId?.extensionName || ''
        });
        setShowAddModal(true);
        break;
      case 'delete':
        setAccountToDelete(account);
        setAccountToDeleteType(account.accountType);
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

    if (!formData.role) {
      setFormError('Please select a role');
      return;
    }

    try {
      if (editingAccount) {
        // Update existing account - need to update both User and role-specific records
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

        // Update User first
        const userResult = await dispatch(updateUser({ 
          id: editingAccount.userId._id, 
          data: userUpdateData 
        }));

        if (updateUser.fulfilled.match(userResult)) {
          // Then update role-specific record
          if (editingAccountType === 'Teacher') {
            const teacherUpdateData = {
              employeeId: formData.employeeId || undefined,
              department: formData.department || undefined,
              position: formData.position || undefined,
              teachingLoad: formData.teachingLoad ? parseInt(formData.teachingLoad, 10) : undefined,
              emergencyContactName: formData.emergencyContactName || undefined,
              emergencyContactNumber: formData.emergencyContactNumber || undefined
            };

            const teacherResult = await dispatch(updateTeacher({ 
              id: editingAccount._id, 
              data: teacherUpdateData 
            }));

            if (updateTeacher.fulfilled.match(teacherResult)) {
              setSuccessMessage('Teacher updated successfully!');
              setShowAddModal(false);
              setEditingAccount(null);
              setEditingAccountType(null);
              dispatch(fetchAllTeachers());
            } else {
              setFormError(teacherResult.payload || 'Failed to update teacher details');
            }
          } else if (editingAccountType === 'Admin') {
            const adminUpdateData = {
              employeeId: formData.employeeId || undefined,
              department: formData.department || undefined,
              position: formData.position || undefined,
              assignedOffice: formData.assignedOffice || undefined
            };

            const adminResult = await dispatch(updateAdmin({ 
              id: editingAccount._id, 
              data: adminUpdateData 
            }));

            if (updateAdmin.fulfilled.match(adminResult)) {
              setSuccessMessage('Admin updated successfully!');
              setShowAddModal(false);
              setEditingAccount(null);
              setEditingAccountType(null);
              dispatch(fetchAllAdmins());
            } else {
              setFormError(adminResult.payload || 'Failed to update admin details');
            }
          }
        } else {
          setFormError(userResult.payload || 'Failed to update user details');
        }
      } else {
        // Create new account - register handles User and role-specific record creation atomically
        const registerData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          status: formData.status,
          dateOfBirth: formData.dateOfBirth || undefined,
          contactNumber: formData.contactNumber || undefined,
          address: formData.address || undefined,
          sex: formData.sex,
          extensionName: formData.extensionName || undefined,
          // Role-specific data (register controller handles creation of Teacher/Admin documents)
          employeeId: formData.employeeId || undefined,
          department: formData.department || undefined,
          position: formData.position || undefined,
          assignedOffice: formData.role === 'Admin' ? (formData.assignedOffice || undefined) : undefined,
          teachingLoad: formData.role === 'Teacher' && formData.teachingLoad ? parseInt(formData.teachingLoad, 10) : undefined,
          emergencyContactName: formData.role === 'Teacher' ? (formData.emergencyContactName || undefined) : undefined,
          emergencyContactNumber: formData.role === 'Teacher' ? (formData.emergencyContactNumber || undefined) : undefined
        };

        const result = await dispatch(register(registerData));

        if (register.fulfilled.match(result)) {
          setSuccessMessage(`${formData.role} created successfully!`);
          setShowAddModal(false);
          // Refresh the appropriate list
          if (formData.role === 'Teacher') {
            dispatch(fetchAllTeachers());
          } else if (formData.role === 'Admin') {
            dispatch(fetchAllAdmins());
          }
        } else {
          setFormError(result.payload || 'Failed to create account');
        }
      }

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        password: '',
        role: '',
        status: 'Active',
        employeeId: '',
        department: '',
        position: '',
        assignedOffice: '',
        teachingLoad: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
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
    setEditingAccount(null);
    setEditingAccountType(null);
    setFormError(null);
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      password: '',
      role: '',
      status: 'Active',
      employeeId: '',
      department: '',
      position: '',
      assignedOffice: '',
      teachingLoad: '',
      emergencyContactName: '',
      emergencyContactNumber: '',
      dateOfBirth: '',
      contactNumber: '',
      address: ''
    });
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;

    try {
      if (accountToDeleteType === 'Teacher') {
        // Delete teacher record first, then user
        const teacherResult = await dispatch(deleteTeacher(accountToDelete._id));
        if (deleteTeacher.fulfilled.match(teacherResult)) {
          // Also delete the associated user
          if (accountToDelete.account?.userId?._id) {
            await dispatch(deleteUser(accountToDelete.account.userId._id));
          }
          setSuccessMessage('Teacher deleted successfully!');
          setShowDeleteModal(false);
          setAccountToDelete(null);
          setAccountToDeleteType(null);
          dispatch(fetchAllTeachers());
        } else {
          setFormError(teacherResult.payload || 'Failed to delete teacher');
          setShowDeleteModal(false);
          setAccountToDelete(null);
          setAccountToDeleteType(null);
        }
      } else if (accountToDeleteType === 'Admin') {
        // Delete admin record first, then user
        const adminResult = await dispatch(deleteAdmin(accountToDelete._id));
        if (deleteAdmin.fulfilled.match(adminResult)) {
          // Also delete the associated user
          if (accountToDelete.account?.userId?._id) {
            await dispatch(deleteUser(accountToDelete.account.userId._id));
          }
          setSuccessMessage('Admin deleted successfully!');
          setShowDeleteModal(false);
          setAccountToDelete(null);
          setAccountToDeleteType(null);
          dispatch(fetchAllAdmins());
        } else {
          setFormError(adminResult.payload || 'Failed to delete admin');
          setShowDeleteModal(false);
          setAccountToDelete(null);
          setAccountToDeleteType(null);
        }
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
      setShowDeleteModal(false);
      setAccountToDelete(null);
      setAccountToDeleteType(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setAccountToDelete(null);
    setAccountToDeleteType(null);
  };

  const title = 'Faculty Table (Teachers & Admins)';

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
          Add new faculty member
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
            <h3>{editingAccount ? `Edit ${editingAccountType}` : 'Add New Faculty Member'}</h3>
            {formError && (
              <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px', fontSize: '14px' }}>
                {formError}
              </div>
            )}
            <form onSubmit={handleAddUser}>
              {!editingAccount && (
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="role">Role</label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
              )}
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
              </div>

              {(formData.role === 'Teacher' || formData.role === 'Admin' || editingAccount) && (
                <>
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
                    <div className={styles.formGroup}>
                      <label htmlFor="teachingLoad">Teaching Load</label>
                      <input
                        type="number"
                        id="teachingLoad"
                        name="teachingLoad"
                        value={formData.teachingLoad}
                        onChange={(e) => setFormData({ ...formData, teachingLoad: e.target.value })}
                        placeholder="Enter teaching load"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="emergencyContactName">Emergency Contact Name</label>
                      <input
                        type="text"
                        id="emergencyContactName"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                        placeholder="Enter emergency contact name"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="emergencyContactNumber">Emergency Contact Number</label>
                      <input
                        type="text"
                        id="emergencyContactNumber"
                        name="emergencyContactNumber"
                        value={formData.emergencyContactNumber}
                        onChange={(e) => setFormData({ ...formData, emergencyContactNumber: e.target.value })}
                        placeholder="Enter emergency contact number"
                      />
                    </div>
                  </div>
                </>
              )}
              {(formData.role === 'Admin' || editingAccountType === 'Admin') && (
                <div className={styles.formRow}>
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
              )}

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
                  <label htmlFor="password">Password {editingAccount && '(leave blank to keep current)'}</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingAccount}
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
                    ? (editingAccount ? 'Updating...' : 'Creating...') 
                    : (editingAccount ? `Update ${editingAccountType}` : 'Add Faculty Member')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && accountToDelete && (
        <div className={styles.modal} onClick={handleCancelDelete}>
          <div className={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete <strong>{accountToDelete?.name}</strong> ({accountToDeleteType})?
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

