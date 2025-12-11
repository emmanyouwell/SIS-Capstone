import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './AdminAccountStudView.module.css';
import { fetchAllStudents } from '../../store/slices/studentSlice';
import api from '../../utils/api';

function AdminAccountStudView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const chartRef = useRef(null);
  const { students, loading, error } = useSelector((state) => state.students);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
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

  useEffect(() => {
    dispatch(fetchAllStudents());
  }, [dispatch]);

  // Fetch login statistics for students (total counts)
  useEffect(() => {
    const fetchLoginStats = async () => {
      setLoginStatsLoading(true);
      try {
        const response = await api.get('/users/stats/logins', { params: { role: 'Student' } });
        setLoginStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch login stats:', error);
      } finally {
        setLoginStatsLoading(false);
      }
    };

    fetchLoginStats();
  }, []);

  // Fetch daily login statistics for students
  useEffect(() => {
    const fetchDailyLoginStats = async () => {
      setDailyLoginStatsLoading(true);
      try {
        const params = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          role: 'Student',
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

  const handleBack = () => {
    navigate('/admin/accounts');
  };

  const toggleDropdown = (studentId) => {
    setActiveDropdown(activeDropdown === studentId ? null : studentId);
  };

  const handleDropdownAction = (action, student) => {
    setActiveDropdown(null);
    switch (action) {
      case 'view':
        setViewingStudent(student);
        setShowViewModal(true);
        break;
      case 'edit':
        navigate(`/admin/accounts/student/edit`);
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

  // Create a map of userId to totalLogins from loginStats
  const loginMap = useMemo(() => {
    if (!loginStats?.allUsers) return {};
    const map = {};
    loginStats.allUsers.forEach(user => {
      map[user.id] = user.totalLogins || 0;
    });
    return map;
  }, [loginStats]);

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

    const data = dailyLoginStats.dailyStats.map(stat => stat.count || 0);

    return {
      labels,
      datasets: [{
        label: 'Daily Logins',
        data: data,
        borderColor: '#9C27B0',
        backgroundColor: 'rgba(156, 39, 176, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#9C27B0',
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
        if (window.studentLoginChart) {
          window.studentLoginChart.destroy();
        }

        window.studentLoginChart = new Chart(ctx, {
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
      if (window.studentLoginChart) {
        window.studentLoginChart.destroy();
        window.studentLoginChart = null;
      }
    };
  }, [chartData]);

  if (loading || loginStatsLoading) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  const activeCount = students.filter(student => student.userId?.status === 'Active').length;


  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <h2>Student Accounts</h2>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>Active Students Accounts:</div>
          <div className={styles.summaryCount}>{activeCount}</div>
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
                backgroundColor: '#9C27B0',
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

      <h2 className={styles.tableTitle}>Student Table</h2>
      <table className={styles.facultyTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Grade</th>
            <th>Total logins</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const avatar = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
            const fullName = `${student.userId?.firstName || ''} ${student.userId?.lastName || ''}`.trim();
            const grade = student.gradeLevel ?? '';
            const statusLabel = student.userId?.status === 'Active' ? 'Enrolled' : student.userId?.status || 'Inactive';
            const totalLogins = loginMap[student.userId?._id] || 0;
            
            return (
              <tr key={student._id}>
                <td className={styles.facultyNameCell}>
                  <img className={styles.facultyAvatar} src={avatar} alt="Avatar" />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDropdownAction('view', student);
                    }}
                  >
                  {fullName}
                  </a>
                </td>
                <td>{statusLabel}</td>
                <td>{grade}</td>
                <td>{totalLogins}</td>
                <td>
                  <div className={styles.actionCell} data-dropdown>
                    <button
                      className={styles.dotsBtn}
                      title="Actions"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(student._id);
                      }}
                    >
                      <svg width="22" height="22" fill="none" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5"/>
                        <circle cx="12" cy="12" r="1.5"/>
                        <circle cx="12" cy="19" r="1.5"/>
                      </svg>
                    </button>
                    {activeDropdown === student._id && (
                      <div className={styles.dropdownMenu} data-dropdown>
                        <button
                          type="button"
                          className={styles.dropdownItem}
                          onClick={() => handleDropdownAction('view', student)}
                        >
                          View
                        </button>
                  <button
                          type="button"
                          className={styles.dropdownItem}
                          onClick={() => handleDropdownAction('edit', student)}
                        >
                          Edit
                  </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}

        </tbody>
      </table>

      {/* View Student Modal */}
      {showViewModal && viewingStudent && (
        <div className={styles.modal} onClick={() => setShowViewModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className={styles.modalClose} onClick={() => setShowViewModal(false)}>
              &times;
            </button>
            <h3>Student Information</h3>
            <div style={{ padding: '20px 0' }}>
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '10px', color: '#333' }}>Personal Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <strong>Name:</strong>
                    <p>
                      {viewingStudent.userId?.firstName || ''} {viewingStudent.userId?.middleName || ''} {viewingStudent.userId?.lastName || ''} {viewingStudent.userId?.extensionName || ''}
                    </p>
                  </div>
                  <div>
                    <strong>Email:</strong>
                    <p>{viewingStudent.userId?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <strong>LRN:</strong>
                    <p>{viewingStudent.lrn || 'N/A'}</p>
                  </div>
                  <div>
                    <strong>Grade Level:</strong>
                    <p>{viewingStudent.gradeLevel || 'N/A'}</p>
                  </div>
                  <div>
                    <strong>Section:</strong>
                    <p>
                      {viewingStudent.sectionId?.sectionName 
                        ? `${viewingStudent.sectionId.gradeLevel || ''} - ${viewingStudent.sectionId.sectionName}`
                        : 'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <strong>Status:</strong>
                    <p>{viewingStudent.userId?.status || 'N/A'}</p>
                  </div>
                  <div>
                    <strong>Enrollment Status:</strong>
                    <p>{viewingStudent.enrollmentStatus ? 'Enrolled' : 'Not Enrolled'}</p>
                  </div>
                  {viewingStudent.userId?.sex && (
                    <div>
                      <strong>Sex:</strong>
                      <p>{viewingStudent.userId.sex}</p>
                    </div>
                  )}
                  {viewingStudent.userId?.dateOfBirth && (
                    <div>
                      <strong>Date of Birth:</strong>
                      <p>{new Date(viewingStudent.userId.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  )}
                  {viewingStudent.userId?.contactNumber && (
                    <div>
                      <strong>Contact Number:</strong>
                      <p>{viewingStudent.userId.contactNumber}</p>
                    </div>
                  )}
                  {viewingStudent.userId?.address && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>Address:</strong>
                      <p>{viewingStudent.userId.address}</p>
                    </div>
                  )}
                </div>
              </div>
              {viewingStudent.guardianName && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '10px', color: '#333' }}>Guardian Information</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <strong>Guardian Name:</strong>
                      <p>{viewingStudent.guardianName}</p>
                    </div>
                    <div>
                      <strong>Guardian Contact:</strong>
                      <p>{viewingStudent.guardianContact || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
              {viewingStudent.subjects && viewingStudent.subjects.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '10px', color: '#333' }}>Enrolled Subjects</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {viewingStudent.subjects.map((subject, index) => (
                      <div key={index} style={{ padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                        <strong>{subject.subjectId?.subjectName || 'Unknown Subject'}</strong>
                        {subject.dateJoined && (
                          <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>
                            (Joined: {new Date(subject.dateJoined).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.modalButtons} style={{ marginTop: '20px' }}>
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

export default AdminAccountStudView;
