import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './AdminAccountStudEdit.module.css';
import { fetchAllStudents, updateStudent, deleteStudent } from '../../store/slices/studentSlice';
import { fetchAllUsers, updateUser, deleteUser } from '../../store/slices/userSlice';
import { register } from '../../store/slices/authSlice';
import { getAllSections } from '../../store/slices/sectionSlice';

function AdminAccountStudEdit() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { students, loading, error } = useSelector((state) => state.students);
  const { users, loading: usersLoading } = useSelector((state) => state.users);
  const { loading: registerLoading } = useSelector((state) => state.auth);
  const sections = useSelector((state) => state.section.data);

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
    lrn: '',
    gradeLevel: '',
    sectionId: '',
    dateOfBirth: '',
    contactNumber: '',
    address: '',
    guardianName: '',
    guardianContact: ''
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchAllStudents());
    dispatch(getAllSections());
  }, [dispatch]);

  // Get sections for selected grade
  const gradeSections = formData.gradeLevel
    ? sections
        .filter((s) => s.gradeLevel === parseInt(formData.gradeLevel))
        .map((s) => ({ id: s._id, name: s.sectionName }))
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  useEffect(() => {
    if (!id || !students.length) return;
    const found = students.find((s) => s._id === id);
    if (!found) return;

    setEditingStudent(found);
    setShowModal(true);
    setFormData({
      firstName: found.userId?.firstName || '',
      lastName: found.userId?.lastName || '',
      middleName: found.userId?.middleName || '',
      email: found.userId?.email || '',
      password: '',
      status: found.userId?.status || 'Active',
      lrn: found.lrn || '',
      gradeLevel: found.gradeLevel ? found.gradeLevel.toString() : '',
      sectionId: found.sectionId?._id || found.sectionId || '',
      dateOfBirth: found.userId?.dateOfBirth ? new Date(found.userId.dateOfBirth).toISOString().split('T')[0] : '',
      contactNumber: found.userId?.contactNumber || '',
      address: found.userId?.address || '',
      guardianName: found.guardianName || '',
      guardianContact: found.guardianContact || ''
    });
  }, [id, students]);

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

  const accounts = students.map((student) => ({
    id: student._id,
    name: `${student.userId?.firstName || ''} ${student.userId?.lastName || ''}`.trim(),
    email: student.userId?.email || '',
    username: student.userId?.email ? student.userId.email.split('@')[0] : '',
    totalLogins: 0,
    status: student.userId?.status,
    grade: student.gradeLevel,
    lrn: student.lrn,
    _id: student._id,
    student: student
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
      (account.lrn || '').toString().toLowerCase().includes(term)
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
    const student = account.student;
    setEditingStudent(student);
    setShowModal(true);
    setFormError(null);
    setSuccessMessage(null);
    setFormData({
      firstName: student.userId?.firstName || '',
      lastName: student.userId?.lastName || '',
      middleName: student.userId?.middleName || '',
      email: student.userId?.email || '',
      password: '',
      status: student.userId?.status || 'Active',
      lrn: student.lrn || '',
      gradeLevel: student.gradeLevel ? student.gradeLevel.toString() : '',
      sectionId: student.sectionId?._id || student.sectionId || '',
      dateOfBirth: student.userId?.dateOfBirth
        ? new Date(student.userId.dateOfBirth).toISOString().split('T')[0]
        : '',
      contactNumber: student.userId?.contactNumber || '',
      address: student.userId?.address || '',
      guardianName: student.guardianName || '',
      guardianContact: student.guardianContact || ''
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
        setStudentToDelete(account);
        setShowDeleteModal(true);
        break;
      default:
        break;
    }
  };

  const resetForm = () => {
    setEditingStudent(null);
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      password: '',
      status: 'Active',
      lrn: '',
      gradeLevel: '',
      sectionId: '',
      dateOfBirth: '',
      contactNumber: '',
      address: '',
      guardianName: '',
      guardianContact: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    try {
      if (editingStudent) {
        // Update existing student - need to update both User and Student records
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

        const studentUpdateData = {
          lrn: formData.lrn || undefined,
          gradeLevel: formData.gradeLevel ? parseInt(formData.gradeLevel, 10) : undefined,
          sectionId: formData.sectionId || undefined,
          guardianName: formData.guardianName || undefined,
          guardianContact: formData.guardianContact || undefined
        };

        // Update User first
        const userResult = await dispatch(updateUser({ 
          id: editingStudent.userId._id, 
          data: userUpdateData 
        }));

        if (updateUser.fulfilled.match(userResult)) {
          // Then update Student
          const studentResult = await dispatch(updateStudent({ 
            id: editingStudent._id, 
            data: studentUpdateData 
          }));

          if (updateStudent.fulfilled.match(studentResult)) {
            setSuccessMessage('Student updated successfully!');
            setShowModal(false);
            resetForm();
            dispatch(fetchAllStudents());
          } else {
            setFormError(studentResult.payload || 'Failed to update student details');
          }
        } else {
          setFormError(userResult.payload || 'Failed to update user details');
        }
      } else {
        // Create new student - register handles User and Student record creation atomically
        const registerData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          email: formData.email,
          password: formData.password,
          role: 'Student',
          status: formData.status,
          dateOfBirth: formData.dateOfBirth || undefined,
          contactNumber: formData.contactNumber || undefined,
          address: formData.address || undefined,
          // Role-specific data (register controller handles creation of Student document)
          lrn: formData.lrn || undefined,
          gradeLevel: formData.gradeLevel ? parseInt(formData.gradeLevel, 10) : undefined,
          sectionId: formData.sectionId || undefined,
          guardianName: formData.guardianName || undefined,
          guardianContact: formData.guardianContact || undefined
        };

        const result = await dispatch(register(registerData));

        if (register.fulfilled.match(result)) {
          setSuccessMessage('Student created successfully!');
          setShowModal(false);
          resetForm();
          dispatch(fetchAllStudents());
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
    if (!studentToDelete) return;

    try {
      // Delete student record first, then user
      const studentResult = await dispatch(deleteStudent(studentToDelete._id));
      if (deleteStudent.fulfilled.match(studentResult)) {
        // Also delete the associated user
        if (studentToDelete.student?.userId?._id) {
          await dispatch(deleteUser(studentToDelete.student.userId._id));
        }
        setSuccessMessage('Student deleted successfully!');
        setShowDeleteModal(false);
        setStudentToDelete(null);
        dispatch(fetchAllStudents());
      } else {
        setFormError(studentResult.payload || 'Failed to delete student');
        setShowDeleteModal(false);
        setStudentToDelete(null);
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
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

      {loading || usersLoading ? (
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
                  <td>{account.lrn || '—'}</td>
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
            <h3>{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
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
                  <label htmlFor="lrn">Learner Reference No (LRN)</label>
                  <input
                    type="text"
                    id="lrn"
                    name="lrn"
                    value={formData.lrn}
                    onChange={(e) =>
                      setFormData({ ...formData, lrn: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="gradeLevel">Grade Level</label>
                  <select
                    id="gradeLevel"
                    name="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
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
                  <label htmlFor="sectionId">Section</label>
                  <select
                    id="sectionId"
                    name="sectionId"
                    value={formData.sectionId}
                    onChange={(e) =>
                      setFormData({ ...formData, sectionId: e.target.value })
                    }
                    disabled={!formData.gradeLevel}
                  >
                    <option value="">Select Section</option>
                    {gradeSections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
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
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className={styles.formRow}>
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
                  <label htmlFor="guardianName">Guardian Name</label>
                  <input
                    type="text"
                    id="guardianName"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    placeholder="Enter guardian name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="guardianContact">Guardian Contact</label>
                  <input
                    type="text"
                    id="guardianContact"
                    name="guardianContact"
                    value={formData.guardianContact}
                    onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })}
                    placeholder="Enter guardian contact"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                
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
                    Password {editingStudent && '(leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editingStudent}
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
                    ? editingStudent
                      ? 'Updating...'
                      : 'Creating...'
                    : editingStudent
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
              Are you sure you want to delete <strong>{studentToDelete?.name}</strong>?
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
