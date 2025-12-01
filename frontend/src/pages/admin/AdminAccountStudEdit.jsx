import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './AdminAccountStudEdit.module.css';
import { fetchAllUsers, updateUser, deleteUser } from '../../store/slices/userSlice';
import { register } from '../../store/slices/authSlice';

function AdminAccountStudEdit() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { users, loading, error } = useSelector((state) => state.users);
  const { loading: registerLoading } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    password: '',
    status: 'Active',
    learnerReferenceNo: '',
    grade: '',
    section: '',
    birthdate: '',
    sex: '',
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchAllUsers({ role: 'Student' }));
  }, [dispatch]);

  useEffect(() => {
    if (!id || !users.length) return;
    const found = users.find((u) => u._id === id && u.role === 'Student');
    if (!found) return;

    setEditingUser(found);
    setShowModal(true);
    setFormData({
      firstName: found.firstName || '',
      lastName: found.lastName || '',
      middleName: found.middleName || '',
      email: found.email || '',
      password: '',
      status: found.status || 'Active',
      learnerReferenceNo: found.learnerReferenceNo || '',
      grade: found.grade ? found.grade.toString() : '',
      section: found.section || '',
      birthdate: found.birthdate ? new Date(found.birthdate).toISOString().split('T')[0] : '',
      sex: found.sex || '',
    });
  }, [id, users]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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

  const accounts = users
    .filter((user) => user.role === 'Student')
    .map((user) => ({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      username: user.email ? user.email.split('@')[0] : '',
      totalLogins: 0,
      status: user.status,
      grade: user.grade,
      learnerReferenceNo: user.learnerReferenceNo,
      _id: user._id,
      ...user,
    }));

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const matchesSearch = (account) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      account.name.toLowerCase().includes(term) ||
      account.email.toLowerCase().includes(term) ||
      account.username.toLowerCase().includes(term) ||
      (account.learnerReferenceNo || '').toString().toLowerCase().includes(term)
    );
  };

  const matchesGrade = (account) => {
    if (!gradeFilter) return true;
    return (account.grade || '').toString() === gradeFilter;
  };

  const filteredAccounts = accounts.filter(
    (account) => matchesSearch(account) && matchesGrade(account)
  );

  const toggleDropdown = (rowId) => {
    setActiveDropdown(activeDropdown === rowId ? null : rowId);
  };

  const openEditForAccount = (account) => {
    setEditingUser(account);
    setShowModal(true);
    setFormError(null);
    setSuccessMessage(null);
    setFormData({
      firstName: account.firstName || '',
      lastName: account.lastName || '',
      middleName: account.middleName || '',
      email: account.email || '',
      password: '',
      status: account.status || 'Active',
      learnerReferenceNo: account.learnerReferenceNo || '',
      grade: account.grade ? account.grade.toString() : '',
      section: account.section || '',
      birthdate: account.birthdate
        ? new Date(account.birthdate).toISOString().split('T')[0]
        : '',
      sex: account.sex || '',
    });
  };

  const handleDropdownAction = async (action, account) => {
    setActiveDropdown(null);
    setFormError(null);
    setSuccessMessage(null);

    switch (action) {
      case 'view':
        navigate(`/admin/accounts/student/view/${account.id}`);
        break;
      case 'edit':
        openEditForAccount(account);
        break;
      case 'delete':
        setUserToDelete(account);
        setShowDeleteModal(true);
        break;
      default:
        break;
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      password: '',
      status: 'Active',
      learnerReferenceNo: '',
      grade: '',
      section: '',
      birthdate: '',
      sex: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    try {
      if (editingUser) {
        const updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          email: formData.email,
          role: 'Student',
          status: formData.status,
          learnerReferenceNo: formData.learnerReferenceNo,
          grade: formData.grade ? parseInt(formData.grade, 10) : undefined,
          section: formData.section,
          birthdate: formData.birthdate || undefined,
          sex: formData.sex || undefined,
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        const result = await dispatch(updateUser({ id: editingUser._id, data: updateData }));

        if (updateUser.fulfilled.match(result)) {
          setSuccessMessage('Student updated successfully!');
          setShowModal(false);
          resetForm();
          dispatch(fetchAllUsers({ role: 'Student' }));
        } else {
          setFormError(result.payload || 'Failed to update student');
        }
      } else {
        const registerData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          email: formData.email,
          password: formData.password,
          role: 'Student',
          status: formData.status,
          learnerReferenceNo: formData.learnerReferenceNo,
          grade: formData.grade ? parseInt(formData.grade, 10) : undefined,
          section: formData.section,
          birthdate: formData.birthdate || undefined,
          sex: formData.sex || undefined,
        };

        const result = await dispatch(register(registerData));

        if (register.fulfilled.match(result)) {
          setSuccessMessage('Student created successfully!');
          setShowModal(false);
          resetForm();
          dispatch(fetchAllUsers({ role: 'Student' }));
        } else {
          setFormError(result.payload || 'Failed to create student');
        }
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormError(null);
    resetForm();
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const result = await dispatch(deleteUser(userToDelete._id));
      if (deleteUser.fulfilled.match(result)) {
        setSuccessMessage('Student deleted successfully!');
        setShowDeleteModal(false);
        setUserToDelete(null);
        dispatch(fetchAllUsers({ role: 'Student' }));
      } else {
        setFormError(result.payload || 'Failed to delete student');
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

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <h2>Students Table</h2>
      </div>

      {error && (
        <div
          style={{
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: '#efe',
            color: '#3c3',
            borderRadius: '4px',
          }}
        >
          {successMessage}
        </div>
      )}

      <div className={styles.topRow}>
        <div className={styles.gradeTabs}>
          <button
            type="button"
            className={`${styles.gradeTab} ${gradeFilter === '7' ? styles.active : ''}`}
            onClick={() => setGradeFilter('7')}
          >
            Grade 7
          </button>
          <button
            type="button"
            className={`${styles.gradeTab} ${gradeFilter === '8' ? styles.active : ''}`}
            onClick={() => setGradeFilter('8')}
          >
            Grade 8
          </button>
          <button
            type="button"
            className={`${styles.gradeTab} ${gradeFilter === '9' ? styles.active : ''}`}
            onClick={() => setGradeFilter('9')}
          >
            Grade 9
          </button>
          <button
            type="button"
            className={`${styles.gradeTab} ${gradeFilter === '10' ? styles.active : ''}`}
            onClick={() => setGradeFilter('10')}
          >
            Grade 10
          </button>
          <button
            type="button"
            className={`${styles.gradeTab} ${gradeFilter === '' ? styles.active : ''}`}
            onClick={() => setGradeFilter('')}
          >
            All
          </button>
        </div>
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
            />
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <button
            className={styles.addUserBtn}
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="#222"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Add new student
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.facultyTable}>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" />
                </th>
                <th>User Name</th>
                <th>LRN</th>
                <th>Grade</th>
                <th>Total Logins</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <tr key={account.id}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDropdownAction('view', account);
                      }}
                    >
                      {account.name}
                    </a>
                  </td>
                  <td>{account.learnerReferenceNo || '—'}</td>
                  <td>{account.grade ?? '—'}</td>
                  <td>{account.totalLogins}</td>
                  <td>{account.status === 'Active' ? 'Enrolled' : account.status}</td>
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
                        <svg
                          width="22"
                          height="22"
                          fill="none"
                          stroke="#222"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="5" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="19" r="1.5" />
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

      {showModal && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={handleCloseModal}>
              &times;
            </button>
            <h3>{editingUser ? 'Edit Student' : 'Add New Student'}</h3>
            {formError && (
              <div
                style={{
                  padding: '10px',
                  marginBottom: '15px',
                  backgroundColor: '#fee',
                  color: '#c33',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="learnerReferenceNo">Learner Reference No (LRN)</label>
                  <input
                    type="text"
                    id="learnerReferenceNo"
                    name="learnerReferenceNo"
                    value={formData.learnerReferenceNo}
                    onChange={(e) =>
                      setFormData({ ...formData, learnerReferenceNo: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="grade">Grade Level</label>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  >
                    <option value="">Select Grade</option>
                    <option value="7">Grade 7</option>
                    <option value="8">Grade 8</option>
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                  </select>
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
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, middleName: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="section">Section</label>
                  <input
                    type="text"
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={(e) =>
                      setFormData({ ...formData, section: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="birthdate">Date of Birth</label>
                  <input
                    type="date"
                    id="birthdate"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthdate: e.target.value })
                    }
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
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="password">
                    Password {editingUser && '(leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editingUser}
                    minLength={6}
                  />
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
                    ? editingUser
                      ? 'Updating...'
                      : 'Creating...'
                    : editingUser
                    ? 'Update Student'
                    : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && userToDelete && (
        <div className={styles.modal} onClick={handleCancelDelete}>
          <div className={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete <strong>{userToDelete.name}</strong>?
            </p>
            <p
              style={{
                color: '#666',
                fontSize: '0.9rem',
                marginTop: '0.5rem',
              }}
            >
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
        <svg
          width="28"
          height="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    </div>
  );
}

export default AdminAccountStudEdit;
