import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminMasterlistAssignStudent.module.css';
import { fetchMasterlists, updateMasterlist, clearError } from '../../store/slices/masterlistSlice';
import { fetchAllUsers } from '../../store/slices/userSlice';
import { getAllSections } from '../../store/slices/sectionSlice';

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

  const { masterlists, loading: masterlistLoading, error } = useSelector(
    (state) => state.masterlists
  );
  const { users, loading: usersLoading } = useSelector((state) => state.users);
  const sections = useSelector((state) => state.section.data);

  // Fetch masterlists, students, and sections for current grade
  useEffect(() => {
    dispatch(fetchMasterlists({ grade: currentGrade }));
    dispatch(fetchAllUsers({ role: 'Student', grade: currentGrade }));
    dispatch(getAllSections({ grade: currentGrade }));
  }, [currentGrade, dispatch]);

  const gradeMasterlists = masterlists.filter((m) => m.grade === currentGrade);
  // Derive sections from API data
  const gradeSections = sections
    .filter((s) => s.grade === currentGrade)
    .map((s) => s.name)
    .sort();

  // Initialize selected section
  useEffect(() => {
    if (gradeSections.length > 0 && !selectedSection) {
      setSelectedSection(gradeSections[0]);
    }
  }, [gradeSections, selectedSection]);

  const currentMasterlist = gradeMasterlists.find((m) => m.section === selectedSection) || null;
  const enrolledIds = new Set(
    (currentMasterlist?.students || []).map((s) => (typeof s === 'object' ? s._id : s))
  );

  const allStudents = users.filter((u) => u.role === 'Student' && u.grade === currentGrade);

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

  const handleAddStudents = async () => {
    if (!selectedSection || checkedStudents.size === 0) {
      alert('Please select at least one student and a section.');
      return;
    }

    // Find or create masterlist for this section
    let masterlistToUpdate = currentMasterlist;
    
    // If no masterlist exists, we need to create one or handle it
    if (!masterlistToUpdate) {
      alert('Masterlist not found for this section. Please ensure the section exists.');
      return;
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
      alert(`Students successfully added to ${selectedSection}!`);
    } catch (err) {
      alert(err || 'Failed to add students');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckboxChange = (studentId) => {
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

  // Filter students based on active tab, search term, and gender filter
  const filteredStudents = sortedStudents.filter((student) => {
    const isEnrolled = enrolledIds.has(student._id);
    if (activeTab === 'Enrolled' && !isEnrolled) return false;
    if (activeTab === 'Not Enrolled' && isEnrolled) return false;

    // Apply gender filter
    if (genderFilter !== 'All') {
      if (genderFilter === 'Female' && student.sex !== 'Female') return false;
      if (genderFilter === 'Male' && student.sex !== 'Male') return false;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const fullName = formatStudentName(student).toLowerCase();
      return (
        fullName.includes(term) ||
        (student.learnerReferenceNo || '').toLowerCase().includes(term)
      );
    }

    return true;
  });

  const currentSections = gradeSections || [];
  const currentAdviser = currentMasterlist?.adviser
    ? `${currentMasterlist.adviser.lastName}, ${currentMasterlist.adviser.firstName}`
    : 'N/A';

  const handleShare = async () => {
    const shareText = `Masterlist - Grade ${currentGrade} - Section ${selectedSection}\n\nName\tLRN\tGender\n${filteredStudents
      .map((student) => {
        const name = formatStudentName(student);
        const lrn = student.learnerReferenceNo || '';
        const gender = formatGender(student);
        return `${name}\t${lrn}\t${gender}`;
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
    const csvContent = `Name,LRN,Gender\n${filteredStudents
      .map((student) => {
        const name = `"${formatStudentName(student).replace(/"/g, '""')}"`;
        const lrn = student.learnerReferenceNo || '';
        const gender = formatGender(student);
        return `${name},${lrn},${gender}`;
      })
      .join('\n')}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `masterlist-grade${currentGrade}-section${selectedSection}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Masterlist copied to clipboard!');
    } catch (err) {
      alert('Failed to copy to clipboard.');
    }
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.headerBar}>
        <div className={styles.addStudentContainer} ref={dropdownRef}>
          <button className={styles.addStudentMain} onClick={handleAddStudents} disabled={saving}>
            {saving ? 'Saving...' : 'Add Student'}
          </button>
          <button
            className={styles.addStudentArrow}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            ▼
          </button>
          {showDropdown && (
            <div className={styles.dropdownMenu}>
              {currentSections.map((section) => (
                <div
                  key={section}
                  className={styles.dropdownItem}
                  onClick={() => handleSectionSelect(section)}
                >
                  {section}
                </div>
              ))}
            </div>
          )}
        </div>
        <h1>Masterlist - Assign Student</h1>
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

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>LRN</th>
              <th>Gender</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '1rem' }}>
                  No students found.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const isEnrolled = enrolledIds.has(student._id);
                return (
                  <tr key={student._id}>
                    <td>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={checkedStudents.has(student._id)}
                        onChange={() => handleCheckboxChange(student._id)}
                        disabled={isEnrolled}
                      />
                    </td>
                    <td
                      className={`${styles.studentName} ${isEnrolled ? styles.greyedOut : ''}`}
                    >
                      {formatStudentName(student)}
                    </td>
                    <td className={isEnrolled ? styles.greyedOut : ''}>
                      {student.learnerReferenceNo || ''}
                    </td>
                    <td className={isEnrolled ? styles.greyedOut : ''}>
                      {formatGender(student)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
    </div>
  );
}

export default AdminMasterlistAssignStudent;

