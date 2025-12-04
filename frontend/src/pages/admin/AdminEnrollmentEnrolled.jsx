import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminEnrollmentEnrolled.module.css';
import { fetchAllEnrollments, clearError } from '../../store/slices/enrollmentSlice';
import { fetchAllUsers } from '../../store/slices/userSlice';

function AdminEnrollmentEnrolled() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const chartRef = useRef(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);

  const { enrollments, loading: enrollmentsLoading, error } = useSelector(
    (state) => state.enrollments
  );
  const { users, loading: usersLoading } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchAllEnrollments({ status: 'enrolled' }));
    dispatch(fetchAllUsers({ role: 'Student' }));
  }, [dispatch]);

  // Process enrolled students data
  const enrolledEnrollments = useMemo(() => {
    return enrollments.filter((e) => e.status === 'enrolled');
  }, [enrollments]);

  // Group enrolled students by grade and section
  const gradeData = useMemo(() => {
    const grouped = { 7: {}, 8: {}, 9: {}, 10: {} };
    
    enrolledEnrollments.forEach((enrollment) => {
      const grade = enrollment.gradeLevelToEnroll;
      if (grade >= 7 && grade <= 10) {
        // Find the student's section from users
        const student = users.find((u) => u._id === enrollment.student?._id || u._id === enrollment.student);
        const section = student?.section || 'Unassigned';
        
        if (!grouped[grade][section]) {
          grouped[grade][section] = 0;
        }
        grouped[grade][section]++;
      }
    });

    // Convert to array format
    const result = {};
    [7, 8, 9, 10].forEach((grade) => {
      const sections = Object.entries(grouped[grade])
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      result[grade] = {
        total: sections.reduce((sum, s) => sum + s.count, 0),
        sections,
      };
    });

    return result;
  }, [enrolledEnrollments, users]);

  // Calculate chart data
  const chartData = useMemo(() => {
    const data = [7, 8, 9, 10].map((grade) => gradeData[grade]?.total || 0);
    const total = data.reduce((sum, val) => sum + val, 0);
    const percentages = total > 0 ? data.map((val) => Math.round((val / total) * 100)) : [0, 0, 0, 0];
    
    return {
      labels: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
      data,
      colors: ['#7c4dff', '#42a5f5', '#ffb74d', '#66bb6a'],
      percentages,
    };
  }, [gradeData]);

  const totalEnrolled = enrolledEnrollments.length;

  // Initialize Chart.js donut chart
  useEffect(() => {
    if (chartRef.current && chartData.data.some((val) => val > 0)) {
      // Dynamically import Chart.js
      import('chart.js/auto').then(({ default: Chart }) => {
        const ctx = chartRef.current.getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.enrollChart) {
          window.enrollChart.destroy();
        }

        window.enrollChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: chartData.labels,
            datasets: [{
              data: chartData.data,
              backgroundColor: chartData.colors,
              borderWidth: 2,
              borderColor: '#fff'
            }]
          },
          options: {
            cutout: '70%',
            plugins: {
              legend: {
                display: false
              }
            },
            responsive: false,
            maintainAspectRatio: false
          }
        });
      });
    }

    // Cleanup
    return () => {
      if (window.enrollChart) {
        window.enrollChart.destroy();
        window.enrollChart = null;
      }
    };
  }, [chartData]);

  const handleGradeClick = (grade) => {
    setSelectedGrade(grade);
    setShowGradeModal(true);
  };

  const handleBack = () => {
    navigate('/admin/enrollment');
  };

  const selectedGradeData = selectedGrade ? gradeData[selectedGrade] : null;
  const loading = enrollmentsLoading || usersLoading;

  if (error) {
    return (
      <div className={styles.mainContent}>
        <div style={{ color: 'red', padding: '1rem' }}>
          Error: {error}
          <button onClick={() => dispatch(clearError())} style={{ marginLeft: '1rem' }}>
            Dismiss
          </button>
        </div>
        <button
          className={styles.backFabBtn}
          onClick={handleBack}
          title="Back"
        >
          <svg width="32" height="32" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.mainContent}>
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      ) : (
        <div className={styles.enrollmentFlexRow}>
          <div className={`${styles.enrollmentCard} ${styles.donutCard}`}>
            <div className={styles.cardLabel}>Enrolled Students:</div>
            <div className={styles.cardCount}>{totalEnrolled}</div>
            {totalEnrolled > 0 ? (
              <>
                <canvas
                  ref={chartRef}
                  id="enrollDonut"
                  width="220"
                  height="220"
                  className={styles.chartCanvas}
                ></canvas>
                <div className={styles.enrollLegend}>
                  {chartData.labels.map((label, index) => (
                    <div key={label} className={styles.legendItem}>
                      <span
                        className={styles.legendDot}
                        style={{ background: chartData.colors[index] }}
                      ></span>
                      {label}
                      <span className={styles.legendPct}>{chartData.percentages[index]}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                No enrolled students
              </div>
            )}
          </div>

          <div className={styles.enrollmentCol}>
            <div className={`${styles.enrollmentCard} ${styles.totalCard}`}>
              <div className={styles.totalLabel}>ENROLLED STUDENTS:</div>
              <div className={styles.totalCount}>{totalEnrolled}</div>
            </div>

            <div className={`${styles.enrollmentCard} ${styles.gradeBtnCard}`}>
              <div className={styles.gradeBtnRow}>
                <button
                  className={`${styles.gradeBtn} ${styles.grade7}`}
                  onClick={() => handleGradeClick(7)}
                >
                  Grade 7
                </button>
                <button
                  className={`${styles.gradeBtn} ${styles.grade9}`}
                  onClick={() => handleGradeClick(9)}
                >
                  Grade 9
                </button>
              </div>
              <div className={styles.gradeBtnRow}>
                <button
                  className={`${styles.gradeBtn} ${styles.grade8}`}
                  onClick={() => handleGradeClick(8)}
                >
                  Grade 8
                </button>
                <button
                  className={`${styles.gradeBtn} ${styles.grade10}`}
                  onClick={() => handleGradeClick(10)}
                >
                  Grade 10
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        className={styles.backFabBtn}
        onClick={handleBack}
        title="Back"
      >
        <svg width="32" height="32" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      {/* Grade Details Modal */}
      {showGradeModal && selectedGradeData && (
        <div className={styles.gradeModal} onClick={() => setShowGradeModal(false)}>
          <div className={styles.gradeModalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => setShowGradeModal(false)}
            >
              &times;
            </button>
            <h3 className={styles.modalTitle}>
              Grade {selectedGrade} Details
            </h3>
            <div className={styles.modalStats}>
              <div className={styles.modalStatsLabel}>Total Students</div>
              <div className={styles.modalStatsCount}>{selectedGradeData.total}</div>
            </div>
            <div className={styles.modalSection}>
              <div className={styles.modalSectionTitle}>Students per Section:</div>
              {selectedGradeData.sections.length > 0 ? (
                <div className={styles.sectionsList}>
                  {selectedGradeData.sections.map((section, index) => (
                    <div key={index} className={styles.sectionCard}>
                      <div className={styles.sectionName}>{section.name}</div>
                      <div className={styles.sectionCount}>{section.count}</div>
                      <div className={styles.sectionLabel}>students</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                  No students enrolled in this grade
                </div>
              )}
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => setShowGradeModal(false)}
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

export default AdminEnrollmentEnrolled;

