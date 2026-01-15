import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminEnrollmentEnrolled.module.css';
import { fetchAllEnrollments, updateEnrollment, clearError } from '../../store/slices/enrollmentSlice';
import { getAllSections } from '../../store/slices/sectionSlice';
import MessageModal from '../../components/MessageModal';

const ITEMS_PER_PAGE = 15;

function AdminEnrollmentEnrolled() {
  const dispatch = useDispatch();
  const chartRef = useRef(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({ type: 'info', message: '' });

  const { enrollments, loading: enrollmentsLoading, error } = useSelector(
    (state) => state.enrollments
  );
  const sections = useSelector((state) => state.section.data);

  useEffect(() => {
    dispatch(fetchAllEnrollments({ status: 'enrolled' }));
    dispatch(getAllSections());
  }, [dispatch]);

  // Process enrolled students data
  const enrolledEnrollments = useMemo(() => {
    return enrollments.filter((e) => e.status === 'enrolled');
  }, [enrollments]);

  // Group enrolled students by grade and section
  const gradeData = useMemo(() => {
    const grouped = { 7: {}, 8: {}, 9: {}, 10: {} };
    
    enrolledEnrollments.forEach((enrollment) => {
      const grade = enrollment.gradeToEnroll;
      if (grade >= 7 && grade <= 10) {
        // Get section from studentId (which is populated with Student model)
        const student = enrollment.studentId;
        const section = student?.sectionId?.sectionName || 'Unassigned';
        
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
  }, [enrolledEnrollments]);

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
        // Double-check chartRef is still available after async import
        if (!chartRef.current) return;
        
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

  // Get unique sections from enrolled students
  const availableSections = useMemo(() => {
    const sectionSet = new Set();
    enrolledEnrollments.forEach((enrollment) => {
      const section = enrollment.studentId?.sectionId?.sectionName || 'Unassigned';
      sectionSet.add(section);
    });
    return Array.from(sectionSet).sort();
  }, [enrolledEnrollments]);

  // Filter enrollments by section and search term
  const filteredEnrollments = useMemo(() => {
    return enrolledEnrollments.filter((enrollment) => {
      // Section filter
      if (selectedSection !== 'All') {
        const section = enrollment.studentId?.sectionId?.sectionName || 'Unassigned';
        if (section !== selectedSection) return false;
      }

      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const student = enrollment.studentId;
        const studentUser = student?.userId || {};
        const name = enrollment.firstName && enrollment.lastName
          ? `${enrollment.firstName} ${enrollment.middleName || ''} ${enrollment.lastName} ${enrollment.extensionName || ''}`.trim().toLowerCase()
          : studentUser.firstName && studentUser.lastName
            ? `${studentUser.firstName} ${studentUser.middleName || ''} ${studentUser.lastName} ${studentUser.extensionName || ''}`.trim().toLowerCase()
            : 'unknown student';
        const lrn = (enrollment.lrn || student?.lrn || '').toLowerCase();
        const section = (enrollment.studentId?.sectionId?.sectionName || 'Unassigned').toLowerCase();
        
        if (!name.includes(term) && !lrn.includes(term) && !section.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [enrolledEnrollments, selectedSection, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredEnrollments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedEnrollments = filteredEnrollments.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSection, searchTerm]);

  // Format student name
  const formatStudentName = (enrollment) => {
    if (enrollment.firstName && enrollment.lastName) {
      return `${enrollment.firstName} ${enrollment.middleName || ''} ${enrollment.lastName} ${enrollment.extensionName || ''}`.trim();
    }
    const student = enrollment.studentId;
    const studentUser = student?.userId || {};
    if (studentUser.firstName && studentUser.lastName) {
      return `${studentUser.firstName} ${studentUser.middleName || ''} ${studentUser.lastName} ${studentUser.extensionName || ''}`.trim();
    }
    return 'Unknown Student';
  };

  // Handle edit button click
  const handleEdit = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setEditFormData({
      firstName: enrollment.firstName || '',
      middleName: enrollment.middleName || '',
      lastName: enrollment.lastName || '',
      extensionName: enrollment.extensionName || '',
      sex: enrollment.sex || '',
      dateOfBirth: enrollment.dateOfBirth ? new Date(enrollment.dateOfBirth).toISOString().split('T')[0] : '',
      lrn: enrollment.lrn || '',
      psaCertificateNo: enrollment.psaCertificateNo || '',
      placeOfBirth: enrollment.placeOfBirth || '',
      motherTongue: enrollment.motherTongue || '',
      religion: enrollment.religion || '',
      indigenousPeople: enrollment.indigenousPeople || false,
      beneficiaryOf4Ps: enrollment.beneficiaryOf4Ps || false,
      fourPsHouseholdId: enrollment.fourPsHouseholdId || '',
      learnerWithDisability: enrollment.learnerWithDisability || false,
      typeOfDisability: enrollment.typeOfDisability || [],
      currentAddress: enrollment.currentAddress || '',
      permanentAddress: enrollment.permanentAddress || '',
      fatherName: enrollment.fatherName || '',
      fatherContact: enrollment.fatherContact || '',
      motherName: enrollment.motherName || '',
      motherContact: enrollment.motherContact || '',
      guardianName: enrollment.guardianName || '',
      guardianContact: enrollment.guardianContact || '',
    });
    setShowEditModal(true);
  };

  // Handle edit form input change
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle disability type change
  const handleDisabilityChange = (disabilityType) => {
    setEditFormData((prev) => {
      const currentTypes = prev.typeOfDisability || [];
      const updatedTypes = currentTypes.includes(disabilityType)
        ? currentTypes.filter(t => t !== disabilityType)
        : [...currentTypes, disabilityType];
      return {
        ...prev,
        typeOfDisability: updatedTypes,
      };
    });
  };

  // Handle edit form submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        ...editFormData,
        dateOfBirth: editFormData.dateOfBirth ? new Date(editFormData.dateOfBirth) : null,
      };

      await dispatch(
        updateEnrollment({
          id: selectedEnrollment._id,
          data: updateData,
        })
      ).unwrap();

      setMessageModalContent({
        type: 'success',
        message: 'Enrollment information updated successfully!',
      });
      setShowMessageModal(true);
      setShowEditModal(false);
      setSelectedEnrollment(null);
      setEditFormData(null);
      // Refresh enrollments
      dispatch(fetchAllEnrollments({ status: 'enrolled' }));
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : err?.message || 'Failed to update enrollment information';
      setMessageModalContent({
        type: 'error',
        message: errorMessage,
      });
      setShowMessageModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedGradeData = selectedGrade ? gradeData[selectedGrade] : null;
  const loading = enrollmentsLoading;

  if (error) {
    return (
      <div className={styles.mainContent}>
        <div style={{ color: 'red', padding: '1rem' }}>
          Error: {error}
          <button onClick={() => dispatch(clearError())} style={{ marginLeft: '1rem' }}>
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainContent}>
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      ) : (
        <div className={styles.enrollmentGrid}>
          {/* Header Section */}
          <div className={styles.headerSection}>
            <h2 className={styles.pageTitle}>Enrolled Students</h2>
            <p className={styles.pageSubtitle}>Overview and management of enrolled students</p>
          </div>

          {/* Top Section: Left Container (Stats + Grade Buttons) and Right Container (Chart) */}
          <div className={styles.topSection}>
            {/* Left Container: Total Enrolled + Grade Buttons */}
            <div className={styles.leftContainer}>
              {/* Total Enrolled Card */}
              <div className={`${styles.statsCard} ${styles.totalCard}`}>
                <div className={styles.statsCardIcon}>
                  <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <div className={styles.statsCardContent}>
                  <div className={styles.statsCardLabel}>Total Enrolled Students</div>
                  <div className={styles.statsCardValue}>{totalEnrolled}</div>
                </div>
              </div>

              {/* Grade Buttons Card */}
              <div className={styles.gradeCard}>
                <div className={styles.gradeCardHeader}>
                  <h3 className={styles.gradeCardTitle}>View by Grade Level</h3>
                </div>
                <div className={styles.gradeButtonsGrid}>
                  <button
                    className={`${styles.gradeBtn} ${styles.grade7}`}
                    onClick={() => handleGradeClick(7)}
                  >
                    <div className={styles.gradeBtnContent}>
                      <div className={styles.gradeBtnLabel}>Grade 7</div>
                      <div className={styles.gradeBtnCount}>{gradeData[7]?.total || 0} students</div>
                    </div>
                  </button>
                  <button
                    className={`${styles.gradeBtn} ${styles.grade8}`}
                    onClick={() => handleGradeClick(8)}
                  >
                    <div className={styles.gradeBtnContent}>
                      <div className={styles.gradeBtnLabel}>Grade 8</div>
                      <div className={styles.gradeBtnCount}>{gradeData[8]?.total || 0} students</div>
                    </div>
                  </button>
                  <button
                    className={`${styles.gradeBtn} ${styles.grade9}`}
                    onClick={() => handleGradeClick(9)}
                  >
                    <div className={styles.gradeBtnContent}>
                      <div className={styles.gradeBtnLabel}>Grade 9</div>
                      <div className={styles.gradeBtnCount}>{gradeData[9]?.total || 0} students</div>
                    </div>
                  </button>
                  <button
                    className={`${styles.gradeBtn} ${styles.grade10}`}
                    onClick={() => handleGradeClick(10)}
                  >
                    <div className={styles.gradeBtnContent}>
                      <div className={styles.gradeBtnLabel}>Grade 10</div>
                      <div className={styles.gradeBtnCount}>{gradeData[10]?.total || 0} students</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Container: Chart */}
            <div className={styles.rightContainer}>
              <div className={`${styles.statsCard} ${styles.chartCard}`}>
                <div className={styles.chartCardHeader}>
                  <div className={styles.chartCardTitle}>Distribution by Grade</div>
                </div>
                {totalEnrolled > 0 ? (
                  <div className={styles.chartCardContent}>
                    <canvas
                      ref={chartRef}
                      id="enrollDonut"
                      width="200"
                      height="200"
                      className={styles.chartCanvas}
                    ></canvas>
                    <div className={styles.enrollLegend}>
                      {chartData.labels.map((label, index) => (
                        <div key={label} className={styles.legendItem}>
                          <span
                            className={styles.legendDot}
                            style={{ background: chartData.colors[index] }}
                          ></span>
                          <span className={styles.legendLabel}>{label}</span>
                          <span className={styles.legendPct}>{chartData.percentages[index]}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={styles.chartEmptyState}>
                    No enrolled students
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enrolled Students Table Card */}
          <div className={styles.tableCard}>
            <div className={styles.tableCardHeader}>
              <h3 className={styles.tableCardTitle}>Enrolled Students</h3>
            </div>
            <div className={styles.tableFilters}>
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search by name, LRN, or section..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <div className={styles.filterContainer}>
                <label htmlFor="sectionFilter" className={styles.filterLabel}>Filter by Section:</label>
                <select
                  id="sectionFilter"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="All">All Sections</option>
                  {availableSections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.tableInfo}>
              Showing {filteredEnrollments.length} student{filteredEnrollments.length !== 1 ? 's' : ''}
              {filteredEnrollments.length > 0 && (
                <span className={styles.pageInfo}>
                  {' '}
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </div>
            <div className={styles.tableContainer}>
              {paginatedEnrollments.length > 0 ? (
                <table className={styles.enrolledTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th className={styles.mobileHide}>LRN</th>
                      <th>Grade</th>
                      <th>Section</th>
                      <th className={styles.mobileHide}>Sex</th>
                      <th className={styles.mobileHide}>School Year</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEnrollments.map((enrollment) => (
                      <tr key={enrollment._id}>
                        <td data-label="Name">{formatStudentName(enrollment)}</td>
                        <td data-label="LRN" className={styles.mobileHide}>{enrollment.lrn || enrollment.studentId?.lrn || 'N/A'}</td>
                        <td data-label="Grade">Grade {enrollment.gradeToEnroll || enrollment.gradeLevelToEnroll}</td>
                        <td data-label="Section">{enrollment.studentId?.sectionId?.sectionName || 'Unassigned'}</td>
                        <td data-label="Sex" className={styles.mobileHide}>{enrollment.sex || enrollment.studentId?.userId?.sex || 'N/A'}</td>
                        <td data-label="School Year" className={styles.mobileHide}>{enrollment.schoolYear || 'N/A'}</td>
                        <td data-label="Actions">
                          <button
                            className={styles.editBtn}
                            onClick={() => handleEdit(enrollment)}
                            title="Edit Enrollment Information"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={styles.emptyState}>
                  {searchTerm || selectedSection !== 'All'
                    ? 'No students found matching your filters.'
                    : 'No enrolled students found.'}
                </div>
              )}
            </div>
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationBtn}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className={styles.paginationInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className={styles.paginationBtn}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Edit Enrollment Modal */}
      {showEditModal && selectedEnrollment && editFormData && (
        <div className={styles.editModal} onClick={() => setShowEditModal(false)}>
          <div className={styles.editModalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalClose}
              onClick={() => {
                setShowEditModal(false);
                setSelectedEnrollment(null);
                setEditFormData(null);
              }}
            >
              &times;
            </button>
            <h3 className={styles.modalTitle}>Edit Enrollment Information</h3>
            <form onSubmit={handleEditSubmit} className={styles.editForm}>
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>PERSONAL INFORMATION</div>
                <div className={styles.formGrid}>
                  <div className={styles.formRow}>
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={editFormData.firstName}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>Middle Name</label>
                    <input
                      type="text"
                      name="middleName"
                      value={editFormData.middleName}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={editFormData.lastName}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>Extension Name</label>
                    <input
                      type="text"
                      name="extensionName"
                      value={editFormData.extensionName}
                      onChange={handleEditInputChange}
                      placeholder="e.g., Jr., III"
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>Sex *</label>
                    <select
                      name="sex"
                      value={editFormData.sex}
                      onChange={handleEditInputChange}
                      required
                    >
                      <option value="">Select Sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className={styles.formRow}>
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={editFormData.dateOfBirth}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>LRN</label>
                    <input
                      type="text"
                      name="lrn"
                      value={editFormData.lrn}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>PSA Birth Certificate No.</label>
                    <input
                      type="text"
                      name="psaCertificateNo"
                      value={editFormData.psaCertificateNo}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>Place of Birth</label>
                    <input
                      type="text"
                      name="placeOfBirth"
                      value={editFormData.placeOfBirth}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>Mother Tongue</label>
                    <input
                      type="text"
                      name="motherTongue"
                      value={editFormData.motherTongue}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>Religion</label>
                    <input
                      type="text"
                      name="religion"
                      value={editFormData.religion}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className={styles.checkboxRow}>
                    <label>
                      <input
                        type="checkbox"
                        name="indigenousPeople"
                        checked={editFormData.indigenousPeople}
                        onChange={handleEditInputChange}
                      />
                      Belonging to any Indigenous Peoples?
                    </label>
                  </div>
                  <div className={styles.checkboxRow}>
                    <label>
                      <input
                        type="checkbox"
                        name="beneficiaryOf4Ps"
                        checked={editFormData.beneficiaryOf4Ps}
                        onChange={handleEditInputChange}
                      />
                      Is your family beneficiary of 4Ps?
                    </label>
                    {editFormData.beneficiaryOf4Ps && (
                      <div className={styles.formRow} style={{ marginTop: '8px' }}>
                        <label>4Ps Household ID number</label>
                        <input
                          type="text"
                          name="fourPsHouseholdId"
                          value={editFormData.fourPsHouseholdId}
                          onChange={handleEditInputChange}
                        />
                      </div>
                    )}
                  </div>
                  <div className={styles.checkboxRow}>
                    <label>
                      <input
                        type="checkbox"
                        name="learnerWithDisability"
                        checked={editFormData.learnerWithDisability}
                        onChange={handleEditInputChange}
                      />
                      Learner with Disability?
                    </label>
                    {editFormData.learnerWithDisability && (
                      <div style={{ marginTop: '8px', marginLeft: '20px' }}>
                        <label>Type of Disability (check all that apply):</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
                          {['Visual', 'Hearing', 'Learning', 'Physical', 'Intellectual', 'Speech', 'Emotional', 'Other'].map((type) => (
                            <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="checkbox"
                                checked={editFormData.typeOfDisability.includes(type)}
                                onChange={() => handleDisabilityChange(type)}
                              />
                              {type}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={styles.formRow}>
                    <label>Current Address</label>
                    <input
                      type="text"
                      name="currentAddress"
                      value={editFormData.currentAddress}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>Permanent Address</label>
                    <input
                      type="text"
                      name="permanentAddress"
                      value={editFormData.permanentAddress}
                      onChange={handleEditInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>PARENT'S/GUARDIAN'S INFORMATION</div>
                <div className={styles.formGrid}>
                  <div className={styles.formRow}>
                    <label>Father's Name</label>
                    <input
                      type="text"
                      name="fatherName"
                      value={editFormData.fatherName}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>Father's Contact Number</label>
                    <input
                      type="text"
                      name="fatherContact"
                      value={editFormData.fatherContact}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>Mother's Name</label>
                    <input
                      type="text"
                      name="motherName"
                      value={editFormData.motherName}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>Mother's Contact Number</label>
                    <input
                      type="text"
                      name="motherContact"
                      value={editFormData.motherContact}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>Guardian Name</label>
                    <input
                      type="text"
                      name="guardianName"
                      value={editFormData.guardianName}
                      onChange={handleEditInputChange}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>Guardian Contact</label>
                    <input
                      type="text"
                      name="guardianContact"
                      value={editFormData.guardianContact}
                      onChange={handleEditInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedEnrollment(null);
                    setEditFormData(null);
                  }}
                  className={styles.btnCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Modal */}
      <MessageModal
        show={showMessageModal}
        type={messageModalContent.type}
        message={messageModalContent.message}
        onClose={() => setShowMessageModal(false)}
      />
    </div>
  );
}

export default AdminEnrollmentEnrolled;

