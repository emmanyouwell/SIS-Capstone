import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './AdminAccountView.module.css';
import { fetchAllTeachers } from '../../store/slices/teacherSlice';
import { fetchAllAdmins } from '../../store/slices/adminSlice';
import api from '../../utils/api';

function AdminAccountView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const chartRef = useRef(null);

  const { teachers, loading: teachersLoading, error: teachersError } = useSelector((state) => state.teachers);
  const { admins, loading: adminsLoading, error: adminsError } = useSelector((state) => state.admins);
  
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingAccount, setViewingAccount] = useState(null);
  const [loginStats, setLoginStats] = useState(null);
  const [loginStatsLoading, setLoginStatsLoading] = useState(false);
  const [dailyLoginStats, setDailyLoginStats] = useState(null);
  const [dailyLoginStatsLoading, setDailyLoginStatsLoading] = useState(false);
  
  // Date range state - default to last 7 days (including today)
  const getDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6); // 6 days ago + today = 7 days total
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };
  const [dateRange, setDateRange] = useState(getDefaultDateRange());

  // Fetch teachers and admins
  useEffect(() => {
    dispatch(fetchAllTeachers());
    dispatch(fetchAllAdmins());
  }, [dispatch]);

  // Fetch login statistics for total counts
  useEffect(() => {
    const fetchLoginStats = async () => {
      setLoginStatsLoading(true);
      try {
        const response = await api.get('/users/stats/logins');
        setLoginStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch login stats:', error);
      } finally {
        setLoginStatsLoading(false);
      }
    };

    fetchLoginStats();
  }, []);

  // Fetch daily login statistics
  useEffect(() => {
    const fetchDailyLoginStats = async () => {
      setDailyLoginStatsLoading(true);
      try {
        const params = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        };
        const response = await api.get('/users/stats/logins/daily', { params });
        setDailyLoginStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch daily login stats:', error);
      } finally {
        setDailyLoginStatsLoading(false);
      }
    };

    fetchDailyLoginStats();
  }, [dateRange]);

  const loading = teachersLoading || adminsLoading || loginStatsLoading;
  const error = teachersError || adminsError;

  // Create a map of userId to totalLogins from loginStats
  const loginMap = useMemo(() => {
    if (!loginStats?.allUsers) return {};
    const map = {};
    loginStats.allUsers.forEach(user => {
      map[user.id] = user.totalLogins || 0;
    });
    return map;
  }, [loginStats]);

  // Format accounts for display - combine teachers and admins
  const teacherAccounts = teachers
    .filter(teacher => teacher.userId?.status === 'Active')
    .map(teacher => ({
      id: teacher._id,
      name: `${teacher.userId?.firstName || ''} ${teacher.userId?.lastName || ''}`.trim(),
      role: 'Teacher',
      email: teacher.userId?.email || '',
      totalLogins: loginMap[teacher.userId?._id] || 0,
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
      totalLogins: loginMap[admin.userId?._id] || 0,
      avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      account: admin,
      accountType: 'Admin'
    }));

  // Combine and sort by name
  const accounts = [...teacherAccounts, ...adminAccounts].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  // Calculate chart data for daily login statistics
  const chartData = useMemo(() => {
    if (!dailyLoginStats?.dailyStats || dailyLoginStats.dailyStats.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const labels = dailyLoginStats.dailyStats.map(stat => {
      const date = new Date(stat.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // For faculty (Teachers & Admins), combine both roles
    const data = dailyLoginStats.dailyStats.map(stat => {
      if (stat.byRole) {
        const teacherCount = stat.byRole.Teacher || 0;
        const adminCount = stat.byRole.Admin || 0;
        return teacherCount + adminCount;
      }
      return stat.count || 0;
    });

    return {
      labels,
      datasets: [{
        label: 'Daily Logins',
        data: data,
        borderColor: '#39916f',
        backgroundColor: 'rgba(57, 145, 111, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#39916f',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }]
    };
  }, [dailyLoginStats]);

  // Initialize Chart.js for daily login statistics (line chart)
  useEffect(() => {
    if (chartRef.current && chartData.labels.length > 0) {
      import('chart.js/auto').then(({ default: Chart }) => {
        if (!chartRef.current) return;
        
        const ctx = chartRef.current.getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.facultyLoginChart) {
          window.facultyLoginChart.destroy();
        }

        window.facultyLoginChart = new Chart(ctx, {
          type: 'line',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 15,
                  font: {
                    size: 12
                  }
                }
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                  size: 14
                },
                bodyFont: {
                  size: 13
                },
                callbacks: {
                  label: function(context) {
                    return `Logins: ${context.parsed.y}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                  precision: 0
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                },
                title: {
                  display: true,
                  text: 'Number of Logins'
                }
              },
              x: {
                grid: {
                  display: false
                },
                title: {
                  display: true,
                  text: 'Date'
                }
              }
            }
          }
        });
      });
    }

    // Cleanup
    return () => {
      if (window.facultyLoginChart) {
        window.facultyLoginChart.destroy();
        window.facultyLoginChart = null;
      }
    };
  }, [chartData]);

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
              <div className={styles.chartTitle}>Daily Logins</div>
              <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>From:</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    style={{
                      padding: '5px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', color: '#666' }}>To:</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    style={{
                      padding: '5px 8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
                <button
                  onClick={() => setDateRange(getDefaultDateRange())}
                  style={{
                    padding: '5px 12px',
                    backgroundColor: '#39916f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Reset
                </button>
              </div>
              {dailyLoginStatsLoading ? (
                <div className={styles.chartPlaceholder}>Loading chart...</div>
              ) : chartData.labels.length > 0 ? (
                <canvas ref={chartRef} style={{ maxHeight: '200px', width: '100%' }}></canvas>
              ) : (
                <div className={styles.chartPlaceholder}>No login data available for selected date range</div>
              )}
            </div>
          </div>

          <h2 className={styles.tableTitle}>
            Faculty Table (Teachers & Admins)
          </h2>
          <div className={styles.tableWrapper}>
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
                  <td className={styles.facultyNameCell} data-label="Name">
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
                  <td data-label="Role">{account.role}</td>
                  <td data-label="Email">{account.email}</td>
                  <td data-label="Total logins" className={styles.totalLoginsCell}>{account.totalLogins}</td>
                  <td data-label="Actions">
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
          </div>
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

