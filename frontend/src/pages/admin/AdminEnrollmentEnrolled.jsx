import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminEnrollmentEnrolled.module.css';

function AdminEnrollmentEnrolled() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);

  // Mock data for enrolled students by grade
  const gradeData = {
    7: {
      total: 106,
      sections: [
        { name: 'Dahlia', count: 22 },
        { name: 'Rose', count: 21 },
        { name: 'Lilac', count: 21 },
        { name: 'Foxglove', count: 21 },
        { name: 'Lily', count: 21 }
      ]
    },
    8: {
      total: 110,
      sections: [
        { name: 'Sunflower', count: 22 },
        { name: 'Tulip', count: 22 },
        { name: 'Orchid', count: 22 },
        { name: 'Peony', count: 22 },
        { name: 'Daisy', count: 22 }
      ]
    },
    9: {
      total: 101,
      sections: [
        { name: 'Jasmine', count: 20 },
        { name: 'Magnolia', count: 20 },
        { name: 'Azalea', count: 20 },
        { name: 'Camellia', count: 21 },
        { name: 'Begonia', count: 20 }
      ]
    },
    10: {
      total: 105,
      sections: [
        { name: 'Iris', count: 21 },
        { name: 'Poppy', count: 21 },
        { name: 'Violet', count: 21 },
        { name: 'Marigold', count: 21 },
        { name: 'Petunia', count: 21 }
      ]
    }
  };

  const totalEnrolled = 422;
  const chartData = {
    labels: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
    data: [106, 110, 101, 105],
    colors: ['#7c4dff', '#42a5f5', '#ffb74d', '#66bb6a'],
    percentages: [25, 26, 24, 25]
  };

  // Initialize Chart.js donut chart
  useEffect(() => {
    if (chartRef.current) {
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
  }, []);

  const handleGradeClick = (grade) => {
    setSelectedGrade(grade);
    setShowGradeModal(true);
  };

  const handleBack = () => {
    navigate('/admin/enrollment');
  };

  const selectedGradeData = selectedGrade ? gradeData[selectedGrade] : null;

  return (
    <div className={styles.mainContent}>
      <div className={styles.enrollmentFlexRow}>
        <div className={`${styles.enrollmentCard} ${styles.donutCard}`}>
          <div className={styles.cardLabel}>Enrolled Students:</div>
          <div className={styles.cardCount}>{totalEnrolled}</div>
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
              <div className={styles.sectionsList}>
                {selectedGradeData.sections.map((section, index) => (
                  <div key={index} className={styles.sectionCard}>
                    <div className={styles.sectionName}>{section.name}</div>
                    <div className={styles.sectionCount}>{section.count}</div>
                    <div className={styles.sectionLabel}>students</div>
                  </div>
                ))}
              </div>
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

