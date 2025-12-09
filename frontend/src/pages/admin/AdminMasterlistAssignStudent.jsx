import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminMasterlistAssignStudent.module.css';
import { fetchMasterlists, updateMasterlist, createMasterlist, clearError } from '../../store/slices/masterlistSlice';
import { fetchAllStudents } from '../../store/slices/studentSlice';
import { getAllSections } from '../../store/slices/sectionSlice';
import MessageModal from '../../components/MessageModal';

// Pagination constants
const ITEMS_PER_PAGE = 15;

function AdminMasterlistAssignStudent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [activeTab, setActiveTab] = useState('Students');
  const [searchTerm, setSearchTerm] = useState('');
  const [checkedStudents, setCheckedStudents] = useState(new Set());
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentGrade, setCurrentGrade] = useState(7);
  const [saving, setSaving] = useState(false);
  const [genderFilter, setGenderFilter] = useState('All');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({ type: 'info', message: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const { masterlists, loading: masterlistLoading, error } = useSelector(
    (state) => state.masterlists
  );
  const { students, loading: studentsLoading } = useSelector((state) => state.students);
  const sections = useSelector((state) => state.section.data);

  // Fetch masterlists, students, and sections for current grade
  useEffect(() => {
    dispatch(fetchMasterlists({ grade: currentGrade }));
    dispatch(fetchAllStudents({ gradeLevel: currentGrade }));
    dispatch(getAllSections({ gradeLevel: currentGrade }));
  }, [currentGrade, dispatch]);

  const gradeMasterlists = masterlists.filter((m) => m.grade === currentGrade);
  // Derive sections from API data
  const gradeSections = sections
    .filter((s) => s.gradeLevel === currentGrade)
    .map((s) => s.sectionName)
    .sort();

  // Initialize selected section
  useEffect(() => {
    if (gradeSections.length > 0 && !selectedSection) {
      setSelectedSection(gradeSections[0]);
    }
  }, [gradeSections, selectedSection]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [currentGrade, activeTab, genderFilter, searchTerm, selectedSection]);

  const currentMasterlist = gradeMasterlists.find((m) => {
    // Handle both old format (section as string) and new format (section as object)
    const sectionName = typeof m.section === 'string' ? m.section : m.section?.sectionName;
    return sectionName === selectedSection;
  }) || null;
  const enrolledIds = new Set(
    (currentMasterlist?.students || []).map((s) => (typeof s === 'object' ? s._id : s))
  );

  // Helper function to find which masterlist contains a student
  const findAssignedSectionFromMasterlist = (userId) => {
    for (const masterlist of gradeMasterlists) {
      const masterlistStudentIds = (masterlist.students || []).map((s) =>
        typeof s === 'object' ? s._id : s
      );
      if (masterlistStudentIds.includes(userId)) {
        // Handle both old format (section as string) and new format (section as object)
        return typeof masterlist.section === 'string' ? masterlist.section : masterlist.section?.sectionName;
      }
    }
    return null;
  };

  // Helper function to map sectionId to section name
  const getSectionNameFromId = (sectionId) => {
    if (!sectionId) return null;
    const section = sections.find((s) => s._id === sectionId || s._id?.toString() === sectionId?.toString());
    return section ? section.sectionName : null;
  };

  // Get all students for current grade, mapping Student.userId to User data
  // Use enrolledStatus from student data to determine enrollment status
  const allStudents = students
    .filter((student) => student.gradeLevel === currentGrade && student.userId)
    .map((student) => {
      const user = student.userId;
      // Check if student is enrolled: either in masterlist OR has enrolledStatus = true
      const isEnrolledInSection = enrolledIds.has(user._id);
      const hasEnrolledStatus = student.enrollmentStatus === true;
      const isEnrolled = isEnrolledInSection || hasEnrolledStatus;
      
      // Determine assigned section: check masterlists first, then sectionId
      let assignedSection = findAssignedSectionFromMasterlist(user._id);
      
      if (!assignedSection && student.sectionId) {
        assignedSection = getSectionNameFromId(student.sectionId);
      }
      const hasAssignedSection = assignedSection !== null;
      
      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        learnerReferenceNo: student.lrn || user.learnerReferenceNo || '',
        sex: user.sex || '',
        sectionId: student.sectionId,
        studentId: student._id, // Keep reference to Student document
        enrollmentStatus: isEnrolled, // Use enrolledStatus field
        assignedSection: assignedSection, // Section name if assigned, null otherwise
        hasAssignedSection: hasAssignedSection, // Boolean for quick checks
      };
    });

  // Format student name helper
  const formatStudentName = (student) => {
    if (!student) return '';
    const middleInitial = student.middleName ? ` ${student.middleName.charAt(0)}.` : '';
    return `${student.lastName}, ${student.firstName}${middleInitial}`;
  };

  // Format gender helper
  const formatGender = (student) => {
    if (!student?.sex) return '';
    if (student.sex === 'Male') return 'M';
    if (student.sex === 'Female') return 'F';
    return student.sex;
  };

  // Sort students: girls first, then boys
  const sortedStudents = [...allStudents].sort((a, b) => {
    // First sort by gender (Female first)
    if (a.sex === 'Female' && b.sex !== 'Female') return -1;
    if (a.sex !== 'Female' && b.sex === 'Female') return 1;
    // Then sort by last name
    return (a.lastName || '').localeCompare(b.lastName || '');
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setCheckedStudents(new Set());
    setShowDropdown(false);
  };

  // Handle assigning students to section
  const handleAddStudents = async () => {
    if (!selectedSection || checkedStudents.size === 0) {
      setMessageModalContent({
        type: 'error',
        message: 'Please select at least one student and a section.',
      });
      setShowMessageModal(true);
      return;
    }

    // Find or create masterlist for this section
    let masterlistToUpdate = currentMasterlist;
    
    // Get current school year
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const schoolYear = `${currentYear}-${nextYear}`;

    // If no masterlist exists, create one
    if (!masterlistToUpdate) {
      try {
        setSaving(true);
        // Find the section ID from the sections list
        const sectionObj = sections.find(
          (s) => s.gradeLevel === currentGrade && s.sectionName === selectedSection
        );
        
        if (!sectionObj) {
          setMessageModalContent({
            type: 'error',
            message: `Section "${selectedSection}" not found for grade ${currentGrade}.`,
          });
          setShowMessageModal(true);
          setSaving(false);
          return;
        }

        const newMasterlist = await dispatch(
          createMasterlist({
            grade: currentGrade,
            sectionId: sectionObj._id,
            schoolYear,
            students: Array.from(checkedStudents),
            adviser: null,
            subjectTeachers: [],
          })
        ).unwrap();
        masterlistToUpdate = newMasterlist;
        setCheckedStudents(new Set());
        setMessageModalContent({
          type: 'success',
          message: `Masterlist created and students successfully added to ${selectedSection}!`,
        });
        setShowMessageModal(true);
        // Refresh masterlists and students to update enrolledStatus
        dispatch(fetchMasterlists({ grade: currentGrade }));
        dispatch(fetchAllStudents({ gradeLevel: currentGrade }));
      } catch (err) {
        setMessageModalContent({
          type: 'error',
          message: err || 'Failed to create masterlist and add students',
        });
        setShowMessageModal(true);
        setSaving(false);
        return;
      } finally {
        setSaving(false);
        return;
      }
    }

    const existingIds = masterlistToUpdate.students.map((s) =>
      typeof s === 'object' ? s._id : s
    );
    const toAdd = Array.from(checkedStudents);
    const mergedIds = Array.from(new Set([...existingIds, ...toAdd]));

    try {
      setSaving(true);
      await dispatch(
        updateMasterlist({
          id: masterlistToUpdate._id,
          data: { students: mergedIds },
        })
      ).unwrap();
      setCheckedStudents(new Set());
      setMessageModalContent({
        type: 'success',
        message: `Students successfully added to ${selectedSection}!`,
      });
      setShowMessageModal(true);
      // Refresh data to update enrolledStatus
      dispatch(fetchMasterlists({ grade: currentGrade }));
      dispatch(fetchAllStudents({ gradeLevel: currentGrade }));
    } catch (err) {
      setMessageModalContent({
        type: 'error',
        message: err || 'Failed to add students',
      });
      setShowMessageModal(true);
    } finally {
      setSaving(false);
    }
  };

  // Handle unassigning students from section
  const handleRemoveStudents = async () => {
    if (!selectedSection || checkedStudents.size === 0) {
      setMessageModalContent({
        type: 'error',
        message: 'Please select at least one enrolled student to remove.',
      });
      setShowMessageModal(true);
      return;
    }

    if (!currentMasterlist) {
      setMessageModalContent({
        type: 'error',
        message: 'No masterlist found for this section.',
      });
      setShowMessageModal(true);
      return;
    }

    const existingIds = currentMasterlist.students.map((s) =>
      typeof s === 'object' ? s._id : s
    );
    const toRemove = Array.from(checkedStudents);
    const remainingIds = existingIds.filter((id) => !toRemove.includes(id));

    try {
      setSaving(true);
      await dispatch(
        updateMasterlist({
          id: currentMasterlist._id,
          data: { students: remainingIds },
        })
      ).unwrap();
      setCheckedStudents(new Set());
      setMessageModalContent({
        type: 'success',
        message: `Students successfully removed from ${selectedSection}!`,
      });
      setShowMessageModal(true);
      // Refresh data
      dispatch(fetchMasterlists({ grade: currentGrade }));
      dispatch(fetchAllStudents({ gradeLevel: currentGrade }));
    } catch (err) {
      setMessageModalContent({
        type: 'error',
        message: err || 'Failed to remove students',
      });
      setShowMessageModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCheckboxChange = (studentId, isEnrolled) => {
    // Allow selection based on active tab:
    // - "Enrolled" tab: all enrolled students can be selected (for addition or removal)
    // - "Not Enrolled" tab: only non-enrolled students can be selected (for addition)
    // - "Students" tab: only non-enrolled students can be selected (for addition)
    if (activeTab === 'Enrolled' && !isEnrolled) return;
    if (activeTab === 'Not Enrolled' && isEnrolled) return;
    if (activeTab === 'Students' && isEnrolled) return;

    setCheckedStudents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  // Handle select all on current page
  const handleSelectAll = () => {
    const selectableStudents = paginatedStudents.filter((s) => {
      // Students tab: only non-enrolled students
      if (activeTab === 'Students') return !s.enrollmentStatus;
      // Enrolled tab: only enrolled students
      if (activeTab === 'Enrolled') return s.enrollmentStatus;
      // Not Enrolled tab: only non-enrolled students
      if (activeTab === 'Not Enrolled') return !s.enrollmentStatus;
      return true;
    });
    const selectableIds = new Set(selectableStudents.map((s) => s._id));
    setCheckedStudents((prev) => {
      const newSet = new Set(prev);
      // If all are selected, deselect all; otherwise select all
      const allSelected = selectableIds.size > 0 && Array.from(selectableIds).every((id) => newSet.has(id));
      if (allSelected) {
        selectableIds.forEach((id) => newSet.delete(id));
      } else {
        selectableIds.forEach((id) => newSet.add(id));
      }
      return newSet;
    });
  };

  // Filter students based on active tab, search term, and gender filter
  // All filters work together (combined filtering)
  // "Students" tab shows only non-enrolled students (available to assign)
  // "Enrolled" tab shows only enrolled students
  // "Not Enrolled" tab shows only non-enrolled students (same as Students tab)
  const filteredStudents = useMemo(() => {
    return sortedStudents.filter((student) => {
      // Apply enrollment status filter (tab)
      // Students tab: only show non-enrolled (available to assign)
      if (activeTab === 'Students' && student.enrollmentStatus) return false;
      // Enrolled tab: only show enrolled students
      if (activeTab === 'Enrolled' && !student.enrollmentStatus) return false;
      // Not Enrolled tab: only show non-enrolled students
      if (activeTab === 'Not Enrolled' && student.enrollmentStatus) return false;

      // Apply gender filter
      if (genderFilter !== 'All') {
        if (genderFilter === 'Female' && student.sex !== 'Female') return false;
        if (genderFilter === 'Male' && student.sex !== 'Male') return false;
      }

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const fullName = formatStudentName(student).toLowerCase();
        const lrn = (student.learnerReferenceNo || '').toLowerCase();
        return fullName.includes(term) || lrn.includes(term);
      }

      return true;
    });
  }, [sortedStudents, activeTab, genderFilter, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  const currentSections = gradeSections || [];
  const currentAdviser = currentMasterlist?.adviser?.userId
    ? `${currentMasterlist.adviser.userId.lastName}, ${currentMasterlist.adviser.userId.firstName}`
    : 'N/A';

  // Determine which buttons to show/enable in Enrolled tab
  const getButtonStates = () => {
    if (checkedStudents.size === 0 || !selectedSection) {
      return { canAdd: false, canRemove: false };
    }
    
    if (activeTab === 'Enrolled') {
      // Check which selected students are in/out of current section
      const selectedStudentIds = Array.from(checkedStudents);
      const studentsInCurrentSection = selectedStudentIds.filter((id) => enrolledIds.has(id));
      const studentsNotInCurrentSection = selectedStudentIds.filter((id) => !enrolledIds.has(id));
      
      return {
        canAdd: studentsNotInCurrentSection.length > 0,
        canRemove: studentsInCurrentSection.length > 0,
      };
    }
    
    // For other tabs, only show Add button
    return { canAdd: true, canRemove: false };
  };

  const { canAdd, canRemove } = getButtonStates();

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of table
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = async () => {
    const shareText = `Masterlist - Grade ${currentGrade} - Section ${selectedSection}\n\nName\tLRN\tGender\tStatus\tSection\n${filteredStudents
      .map((student) => {
        const name = formatStudentName(student);
        const lrn = student.learnerReferenceNo || '';
        const gender = formatGender(student);
        let status = 'Not Enrolled';
        if (student.enrollmentStatus && student.hasAssignedSection) {
          status = `Assigned to ${student.assignedSection}`;
        } else if (student.enrollmentStatus) {
          status = 'Enrolled - Unassigned';
        }
        const section = student.assignedSection || '—';
        return `${name}\t${lrn}\t${gender}\t${status}\t${section}`;
      })
      .join('\n')}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Masterlist - Grade ${currentGrade} - Section ${selectedSection}`,
          text: shareText,
        });
      } catch (err) {
        // Fallback to clipboard
        await copyToClipboard(shareText);
      }
    } else {
      await copyToClipboard(shareText);
    }
  };

  const handleDownload = () => {
    const csvContent = `Name,LRN,Gender,Status,Section\n${filteredStudents
      .map((student) => {
        const name = `"${formatStudentName(student).replace(/"/g, '""')}"`;
        const lrn = student.learnerReferenceNo || '';
        const gender = formatGender(student);
        let status = 'Not Enrolled';
        if (student.enrollmentStatus && student.hasAssignedSection) {
          status = `Assigned to ${student.assignedSection}`;
        } else if (student.enrollmentStatus) {
          status = 'Enrolled - Unassigned';
        }
        const section = student.assignedSection || '—';
        return `${name},${lrn},${gender},${status},${section}`;
      })
      .join('\n')}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `masterlist-grade${currentGrade}-section${selectedSection || 'all'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessageModalContent({
        type: 'success',
        message: 'Masterlist copied to clipboard!',
      });
      setShowMessageModal(true);
    } catch (err) {
      setMessageModalContent({
        type: 'error',
        message: 'Failed to copy to clipboard.',
      });
      setShowMessageModal(true);
    }
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <h1>Masterlist - Assign Student</h1>
          {selectedSection && (
            <div className={styles.sectionBadge}>
              Grade {currentGrade} - Section: <strong>{selectedSection}</strong>
            </div>
          )}
        </div>
        <div className={styles.actionButtons}>
          {/* Separate Section Dropdown */}
          <div className={styles.sectionDropdownContainer} ref={dropdownRef}>
            <button
              className={styles.sectionDropdownBtn}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span>{selectedSection || 'Select Section'}</span>
              <span className={styles.dropdownArrow}>▼</span>
            </button>
            {showDropdown && (
              <div className={styles.dropdownMenu}>
                {currentSections.length === 0 ? (
                  <div className={styles.dropdownItem}>No sections available</div>
                ) : (
                  currentSections.map((section) => (
                    <div
                      key={section}
                      className={`${styles.dropdownItem} ${section === selectedSection ? styles.active : ''}`}
                      onClick={() => handleSectionSelect(section)}
                    >
                      {section}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Separate Add/Remove Buttons */}
          {activeTab === 'Enrolled' ? (
            <>
              <button
                className={styles.actionButton}
                onClick={handleAddStudents}
                disabled={saving || !canAdd || !selectedSection}
              >
                {saving ? 'Saving...' : `Add (${checkedStudents.size})`}
              </button>
              <button
                className={`${styles.actionButton} ${styles.removeButton}`}
                onClick={handleRemoveStudents}
                disabled={saving || !canRemove || !selectedSection}
              >
                {saving ? 'Saving...' : `Remove (${checkedStudents.size})`}
              </button>
            </>
          ) : (
            <button
              className={styles.actionButton}
              onClick={handleAddStudents}
              disabled={saving || checkedStudents.size === 0 || !selectedSection}
            >
              {saving ? 'Saving...' : `Add (${checkedStudents.size})`}
            </button>
          )}
        </div>
      </div>

      <div className={styles.gradeTabs}>
        {[7, 8, 9, 10].map((grade) => (
          <button
            key={grade}
            className={`${styles.gradeTab} ${currentGrade === grade ? styles.active : ''}`}
            onClick={() => {
              setCurrentGrade(grade);
              setSelectedSection(null);
              setCheckedStudents(new Set());
            }}
          >
            Grade {grade}
          </button>
        ))}
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'Students' ? styles.active : ''}`}
          onClick={() => setActiveTab('Students')}
        >
          Students
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'Enrolled' ? styles.active : ''}`}
          onClick={() => setActiveTab('Enrolled')}
        >
          Enrolled
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'Not Enrolled' ? styles.active : ''}`}
          onClick={() => setActiveTab('Not Enrolled')}
        >
          Not Enrolled
        </button>
        <div className={styles.genderFilter}>
          <button
            className={`${styles.genderFilterBtn} ${genderFilter === 'All' ? styles.active : ''}`}
            onClick={() => setGenderFilter('All')}
          >
            All
          </button>
          <button
            className={`${styles.genderFilterBtn} ${genderFilter === 'Female' ? styles.active : ''}`}
            onClick={() => setGenderFilter('Female')}
          >
            Female
          </button>
          <button
            className={`${styles.genderFilterBtn} ${genderFilter === 'Male' ? styles.active : ''}`}
            onClick={() => setGenderFilter('Male')}
          >
            Male
          </button>
        </div>
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableInfo}>
            Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
            {filteredStudents.length > 0 && (
              <span className={styles.pageInfo}>
                {' '}
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </div>
          {paginatedStudents.length > 0 && (
            <button className={styles.selectAllBtn} onClick={handleSelectAll}>
              Select All
            </button>
          )}
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={
                      paginatedStudents.length > 0 &&
                      paginatedStudents
                        .filter((s) => {
                          // Students tab: only non-enrolled students
                          if (activeTab === 'Students') return !s.enrollmentStatus;
                          // Enrolled tab: only enrolled students
                          if (activeTab === 'Enrolled') return s.enrollmentStatus;
                          // Not Enrolled tab: only non-enrolled students
                          if (activeTab === 'Not Enrolled') return !s.enrollmentStatus;
                          return true;
                        })
                        .every((s) => checkedStudents.has(s._id))
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Name</th>
                <th>LRN</th>
                <th>Gender</th>
                <th>Status</th>
                <th>Section</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className={styles.emptyState}>
                    {searchTerm || genderFilter !== 'All' || activeTab !== 'Students'
                      ? 'No students match the current filters.'
                      : 'No students found.'}
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => {
                  const isEnrolled = student.enrollmentStatus;
                  const hasAssignedSection = student.hasAssignedSection;
                  
                  // Students tab: only non-enrolled can be selected
                  // Enrolled tab: only enrolled can be selected
                  // Not Enrolled tab: only non-enrolled can be selected
                  const canSelect = 
                    (activeTab === 'Students' && !isEnrolled) ||
                    (activeTab === 'Enrolled' && isEnrolled) ||
                    (activeTab === 'Not Enrolled' && !isEnrolled);
                  
                  // Determine row class based on enrollment and assignment status
                  let rowClass = styles.notEnrolledRow;
                  if (isEnrolled && hasAssignedSection) {
                    rowClass = styles.assignedRow;
                  } else if (isEnrolled && !hasAssignedSection) {
                    rowClass = styles.enrolledUnassignedRow;
                  }
                  
                  // Determine status badge class and text
                  let statusBadgeClass = styles.statusNotEnrolled;
                  let statusText = 'Not Enrolled';
                  if (isEnrolled && hasAssignedSection) {
                    statusBadgeClass = styles.statusAssigned;
                    statusText = `Assigned to ${student.assignedSection}`;
                  } else if (isEnrolled && !hasAssignedSection) {
                    statusBadgeClass = styles.statusEnrolledUnassigned;
                    statusText = 'Enrolled - Unassigned';
                  }
                  
                  return (
                    <tr
                      key={student._id}
                      className={`${rowClass} ${
                        checkedStudents.has(student._id) ? styles.selectedRow : ''
                      }`}
                    >
                      <td>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={checkedStudents.has(student._id)}
                          onChange={() => handleCheckboxChange(student._id, isEnrolled)}
                          disabled={!canSelect}
                        />
                      </td>
                      <td className={styles.studentName}>{formatStudentName(student)}</td>
                      <td>{student.learnerReferenceNo || 'N/A'}</td>
                      <td>{formatGender(student)}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${statusBadgeClass}`}>
                          {statusText}
                        </span>
                      </td>
                      <td>{student.assignedSection || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationBtn}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className={styles.paginationNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages around current
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;
                  
                  return (
                    <span key={page}>
                      {showEllipsis && <span className={styles.paginationEllipsis}>...</span>}
                      <button
                        className={`${styles.paginationNumber} ${
                          currentPage === page ? styles.active : ''
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </span>
                  );
                })}
            </div>
            <button
              className={styles.paginationBtn}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <div className={styles.bottomBar}>
        <button className={styles.shareBtn} onClick={handleShare}>
          <span style={{ marginRight: '8px' }}>📋</span>Share file
        </button>
        <button className={styles.downloadBtn} onClick={handleDownload}>
          <span style={{ marginRight: '8px' }}>⬇</span>Download File
        </button>
        <div className={styles.adviserInfo}>
          Adviser: <b>{currentAdviser}</b>
        </div>
      </div>

      <button className={styles.backButton} onClick={() => navigate('/admin/masterlist')}>
        <svg
          width="32"
          height="32"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <MessageModal
        show={showMessageModal}
        type={messageModalContent.type}
        message={messageModalContent.message}
        onClose={() => setShowMessageModal(false)}
      />
    </div>
  );
}

export default AdminMasterlistAssignStudent;

