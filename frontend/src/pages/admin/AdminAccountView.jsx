import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './AdminAccountView.module.css';
import { fetchAllTeachers } from '../../store/slices/teacherSlice';
import { fetchAllAdmins } from '../../store/slices/adminSlice';

function AdminAccountView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { teachers, loading: teachersLoading, error: teachersError } = useSelector((state) => state.teachers);
  const { admins, loading: adminsLoading, error: adminsError } = useSelector((state) => state.admins);
  
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingAccount, setViewingAccount] = useState(null);

  // Fetch teachers and admins
  useEffect(() => {
    dispatch(fetchAllTeachers());
    dispatch(fetchAllAdmins());
  }, [dispatch]);

  const loading = teachersLoading || adminsLoading;
  const error = teachersError || adminsError;

  // Format accounts for display - combine teachers and admins
  const teacherAccounts = teachers
    .filter(teacher => teacher.userId?.status === 'Active')
    .map(teacher => ({
      id: teacher._id,
      name: `${teacher.userId?.firstName || ''} ${teacher.userId?.lastName || ''}`.trim(),
      role: 'Teacher',
      email: teacher.userId?.email || '',
      totalLogins: 0, // This field doesn't exist in the models - keeping for UI compatibility
      avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      account: teacher,
      accountType: 'Teacher'
    }));

  const adminAccounts = admins
    .filter(admin => admin.userId?.status === 'Active')
    .map(admin => ({
      id: admin._id,
      name: `${admin.userId?.firstName || ''} ${admin.userId?.lastName || ''}`.trim(),
      role: 'Admin',
      email: admin.userId?.email || '',
      totalLogins: 0,
      avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      account: admin,
      accountType: 'Admin'
    }));

  // Combine and sort by name
  const accounts = [...teacherAccounts, ...adminAccounts].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  const handleBack = () => {
    navigate('/admin/accounts');
  };

  const toggleDropdown = (accountId) => {
    setActiveDropdown(activeDropdown === accountId ? null : accountId);
  };

  const handleDropdownAction = (action, account) => {
    setActiveDropdown(null);
    switch (action) {
      case 'view':
        setViewingAccount(account);
        setShowViewModal(true);
        break;
      case 'edit':
        navigate('/admin/accounts/teacher/edit');
        break;
      default:
        break;
    }
  };

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

  const title = 'Faculty Accounts (Teachers & Admins)';

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

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <>
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                Active Faculty Accounts (Teachers & Admins):
              </div>
              <div className={styles.summaryCount}>{accounts.length}</div>
            </div>
            <div className={styles.chartBox}>
              <div className={styles.chartTitle}>Total Logins</div>
              <div className={styles.chartPlaceholder}>
                Chart visualization would go here
              </div>
            </div>
          </div>

          <h2 className={styles.tableTitle}>
            Faculty Table (Teachers & Admins)
          </h2>
          <table className={styles.facultyTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Total logins</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td className={styles.facultyNameCell}>
                    <img
                      className={styles.facultyAvatar}
                      src={account.avatar}
                      alt="Avatar"
                    />
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
                  <td>{account.role}</td>
                  <td>{account.email}</td>
                  <td>{account.totalLogins}</td>
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
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* View Account Modal */}
      {showViewModal && viewingAccount && (
        <div className={styles.modal} onClick={() => setShowViewModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className={styles.modalClose} onClick={() => setShowViewModal(false)}>
              &times;
            </button>
            <h3>{viewingAccount.accountType} Information</h3>
            <div style={{ padding: '20px 0' }}>
              {viewingAccount.accountType === 'Teacher' && (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px', color: '#333' }}>Personal Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <strong>Name:</strong>
                        <p>{viewingAccount.name}</p>
                      </div>
                      <div>
                        <strong>Email:</strong>
                        <p>{viewingAccount.email}</p>
                      </div>
                      <div>
                        <strong>Employee ID:</strong>
                        <p>{viewingAccount.account.employeeId || 'N/A'}</p>
                      </div>
                      <div>
                        <strong>Department:</strong>
                        <p>{viewingAccount.account.department || 'N/A'}</p>
                      </div>
                      <div>
                        <strong>Position:</strong>
                        <p>{viewingAccount.account.position || 'N/A'}</p>
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <p>{viewingAccount.account.userId?.status || 'N/A'}</p>
                      </div>
                      {viewingAccount.account.userId?.contactNumber && (
                        <div>
                          <strong>Contact Number:</strong>
                          <p>{viewingAccount.account.userId.contactNumber}</p>
                        </div>
                      )}
                      {viewingAccount.account.userId?.address && (
                        <div>
                          <strong>Address:</strong>
                          <p>{viewingAccount.account.userId.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px', color: '#333' }}>Emergency Contact</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <strong>Contact Name:</strong>
                        <p>{viewingAccount.account.emergencyContactName || 'N/A'}</p>
                      </div>
                      <div>
                        <strong>Contact Number:</strong>
                        <p>{viewingAccount.account.emergencyContactNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px', color: '#333' }}>Teaching Load</h4>
                    <div style={{ 
                      padding: '15px', 
                      borderRadius: '8px',
                      backgroundColor: viewingAccount.account.calculatedTeachingLoad >= 25 
                        ? '#fff3cd' 
                        : viewingAccount.account.calculatedTeachingLoad >= 30
                        ? '#f8d7da'
                        : '#d1ecf1',
                      border: `2px solid ${
                        viewingAccount.account.calculatedTeachingLoad >= 30
                          ? '#dc3545'
                          : viewingAccount.account.calculatedTeachingLoad >= 25
                          ? '#ffc107'
                          : '#0dcaf0'
                      }`
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                          <strong>Daily Teaching Load:</strong>
                          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '5px 0' }}>
                            {viewingAccount.account.calculatedTeachingLoad?.toFixed(2) || viewingAccount.account.teachingLoad || 0} hours/day
                          </p>
                        </div>
                        <div>
                          <strong>Weekly Teaching Load:</strong>
                          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '5px 0' }}>
                            {viewingAccount.account.weeklyTeachingLoad?.toFixed(2) || 'N/A'} hours/week
                          </p>
                        </div>
                      </div>
                      {viewingAccount.account.calculatedTeachingLoad >= 30 && (
                        <div style={{ 
                          padding: '10px', 
                          backgroundColor: '#f8d7da', 
                          color: '#721c24', 
                          borderRadius: '4px',
                          marginTop: '10px',
                          fontWeight: 'bold'
                        }}>
                          ⚠️ WARNING: Teacher has reached the maximum teaching load limit (30 hours/day). Cannot assign additional load.
                        </div>
                      )}
                      {viewingAccount.account.calculatedTeachingLoad >= 25 && viewingAccount.account.calculatedTeachingLoad < 30 && (
                        <div style={{ 
                          padding: '10px', 
                          backgroundColor: '#fff3cd', 
                          color: '#856404', 
                          borderRadius: '4px',
                          marginTop: '10px',
                          fontWeight: 'bold'
                        }}>
                          ⚠️ WARNING: Teacher is approaching the maximum teaching load limit (30 hours/day). Current load: {viewingAccount.account.calculatedTeachingLoad?.toFixed(2)} hours/day.
                        </div>
                      )}
                      {viewingAccount.account.dailyBreakdown && (
                        <div style={{ marginTop: '15px' }}>
                          <strong>Daily Breakdown:</strong>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '10px' }}>
                            {Object.entries(viewingAccount.account.dailyBreakdown).map(([day, hours]) => (
                              <div key={day} style={{ fontSize: '14px' }}>
                                <strong>{day}:</strong> {hours.toFixed(2)} hrs
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              {viewingAccount.accountType === 'Admin' && (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '10px', color: '#333' }}>Personal Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <strong>Name:</strong>
                        <p>{viewingAccount.name}</p>
                      </div>
                      <div>
                        <strong>Email:</strong>
                        <p>{viewingAccount.email}</p>
                      </div>
                      <div>
                        <strong>Employee ID:</strong>
                        <p>{viewingAccount.account.employeeId || 'N/A'}</p>
                      </div>
                      <div>
                        <strong>Department:</strong>
                        <p>{viewingAccount.account.department || 'N/A'}</p>
                      </div>
                      <div>
                        <strong>Position:</strong>
                        <p>{viewingAccount.account.position || 'N/A'}</p>
                      </div>
                      <div>
                        <strong>Assigned Office:</strong>
                        <p>{viewingAccount.account.assignedOffice || 'N/A'}</p>
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <p>{viewingAccount.account.userId?.status || 'N/A'}</p>
                      </div>
                      {viewingAccount.account.userId?.contactNumber && (
                        <div>
                          <strong>Contact Number:</strong>
                          <p>{viewingAccount.account.userId.contactNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className={styles.modalButtons}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

     
    </div>
  );
}

export default AdminAccountView;

