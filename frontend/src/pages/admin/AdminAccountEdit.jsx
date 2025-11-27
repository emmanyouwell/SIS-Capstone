import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './AdminAccountEdit.module.css';

function AdminAccountEdit() {
  const navigate = useNavigate();
  const { accountType } = useParams(); // 'teacher' or 'student'
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    employee_id: '',
    teacher_id: '',
    admin_id: '',
    employee_number: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    full_name: '',
    email: '',
    date_of_birth: '',
    contact_number: '',
    address: '',
    department: '',
    position: '',
    teaching_load: '',
    assigned_office: '',
    guardian_name: '',
    guardian_contact: '',
    password: '',
    status: 'Active'
  });
  const [activeDropdown, setActiveDropdown] = useState(null);

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

  // Mock data - replace with API call
  useEffect(() => {
    setTimeout(() => {
      const mockAccounts = accountType === 'teacher'
        ? [
            { id: 1, name: 'Maria Dela Cruz', email: 'm.d@gmail.com', username: 'Maria_DelaCruz', totalLogins: 37, role: 'Teacher' },
            { id: 2, name: 'Richard Lorenz', email: 'rich_lorenz@gmail.com', username: 'Richard_Lorenz', totalLogins: 45, role: 'Admin' },
            { id: 3, name: 'Michael Reyes', email: 'm.reyes@gmail.com', username: 'Mich_Reyes', totalLogins: 41, role: 'Admin' },
            { id: 4, name: 'Shaira Nendez', email: 'shairanendez@gmail.com', username: 'Shai_Nendez', totalLogins: 33, role: 'Teacher' },
            { id: 5, name: 'James Mendoza', email: 'jamesmendoza@gmail.com', username: 'James_Mendoza', totalLogins: 41, role: 'Teacher' },
            { id: 6, name: 'Lyka Manon', email: 'lykamanoon@gmail.com', username: 'Lyka_Manon', totalLogins: 33, role: 'Teacher' },
            { id: 7, name: 'Bea Sarah Coles', email: 'beasarah.c@gmail.com', username: 'BeaSarah_Coles', totalLogins: 41, role: 'Teacher' },
          ]
        : [
            { id: 1, name: 'John Doe', email: 'john.doe@student.com', username: 'John_Doe', totalLogins: 25, role: 'Student' },
            { id: 2, name: 'Jane Smith', email: 'jane.smith@student.com', username: 'Jane_Smith', totalLogins: 30, role: 'Student' },
          ];
      setAccounts(mockAccounts);
      setLoading(false);
    }, 500);
  }, [accountType]);

  const handleBack = () => {
    navigate('/admin/accounts');
  };

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

  const handleDropdownAction = (action, account) => {
    setActiveDropdown(null);
    switch (action) {
      case 'view':
        // Navigate to view page or show details
        console.log('View:', account);
        break;
      case 'edit':
        // Open edit modal or navigate
        console.log('Edit:', account);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${account.name}?`)) {
          setAccounts(accounts.filter(a => a.id !== account.id));
        }
        break;
      default:
        break;
    }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    // TODO: Implement API call to add user
    console.log('Adding user:', formData);
    setFormData({
      role: '',
      employee_id: '',
      teacher_id: '',
      admin_id: '',
      employee_number: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      full_name: '',
      email: '',
      date_of_birth: '',
      contact_number: '',
      address: '',
      department: '',
      position: '',
      teaching_load: '',
      assigned_office: '',
      guardian_name: '',
      guardian_contact: '',
      password: '',
      status: 'Active'
    });
    setShowAddModal(false);
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData({ ...formData, role });
  };

  const title = accountType === 'teacher' ? 'Faculty Table' : 'Student Table';

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <h2>{title}</h2>
      </div>

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

      {/* Add User Modal */}
      {showAddModal && (
        <div className={styles.modal} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowAddModal(false)}>
              &times;
            </button>
            <h3>Add New User</h3>
            <form onSubmit={handleAddUser}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleRoleChange}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="employee_id">Employee ID</label>
                  <input
                    type="text"
                    id="employee_id"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    required
                  />
                </div>
              </div>

              {formData.role && (
                <div className={styles.formRow}>
                  {formData.role === 'Teacher' && (
                    <div className={styles.formGroup}>
                      <label htmlFor="teacher_id">Teacher ID</label>
                      <input
                        type="text"
                        id="teacher_id"
                        name="teacher_id"
                        value={formData.teacher_id}
                        onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                      />
                    </div>
                  )}
                  {formData.role === 'Admin' && (
                    <div className={styles.formGroup}>
                      <label htmlFor="admin_id">Admin ID</label>
                      <input
                        type="text"
                        id="admin_id"
                        name="admin_id"
                        value={formData.admin_id}
                        onChange={(e) => setFormData({ ...formData, admin_id: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="middle_name">Middle Name</label>
                  <input
                    type="text"
                    id="middle_name"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
                {formData.role === 'Admin' && (
                  <div className={styles.formGroup}>
                    <label htmlFor="full_name">Full Name (Admin)</label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                )}
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
                  <label htmlFor="date_of_birth">Date of Birth</label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="contact_number">Contact Number</label>
                  <input
                    type="tel"
                    id="contact_number"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    required
                  />
                </div>
                {formData.role === 'Admin' && (
                  <div className={styles.formGroup}>
                    <label htmlFor="employee_number">Employee Number</label>
                    <input
                      type="text"
                      id="employee_number"
                      name="employee_number"
                      value={formData.employee_number}
                      onChange={(e) => setFormData({ ...formData, employee_number: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
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
                    required
                  />
                </div>
              </div>

              {formData.role === 'Teacher' && (
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="teaching_load">Teaching Load</label>
                    <input
                      type="text"
                      id="teaching_load"
                      name="teaching_load"
                      value={formData.teaching_load}
                      onChange={(e) => setFormData({ ...formData, teaching_load: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {formData.role === 'Admin' && (
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="assigned_office">Assigned Office</label>
                    <input
                      type="text"
                      id="assigned_office"
                      name="assigned_office"
                      value={formData.assigned_office}
                      onChange={(e) => setFormData({ ...formData, assigned_office: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
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
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Add User
                </button>
              </div>
            </form>
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

