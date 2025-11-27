import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminMasterlistAssignStudent.module.css';

function AdminMasterlistAssignStudent() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [activeTab, setActiveTab] = useState('Students');
  const [searchTerm, setSearchTerm] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState(new Set());
  const [checkedStudents, setCheckedStudents] = useState(new Set());
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentGrade, setCurrentGrade] = useState(7);

  const gradeSections = {
    7: ['Dahlia', 'Rose', 'Lilac', 'Foxglove', 'Lily'],
    8: ['Sunflower', 'Tulip', 'Orchid', 'Peony', 'Daisy'],
    9: ['Jasmine', 'Magnolia', 'Azalea', 'Camellia', 'Begonia'],
    10: ['Iris', 'Poppy', 'Violet', 'Marigold', 'Petunia'],
  };

  const sectionAdvisers = {
    Dahlia: 'Santos, Maria L.',
    Rose: 'Garcia, John P.',
    Lilac: 'Reyes, Anna M.',
    Foxglove: 'Cruz, Mark D.',
    Lily: 'Torres, Sophia G.',
    Sunflower: 'Flores, Mariah J.',
    Tulip: 'Santos, Ana M.',
    Orchid: 'Reyes, John P.',
    Peony: 'Garcia, Liza S.',
    Daisy: 'Torres, Mark D.',
    Jasmine: 'Dela Cruz, Maria F.',
    Magnolia: 'Sison, Paul G.',
    Azalea: 'Chua, Linda V.',
    Camellia: 'Go, Steven H.',
    Begonia: 'Yu, Anna K.',
    Iris: 'Reyes, Carla M.',
    Poppy: 'Santos, John D.',
    Violet: 'Lim, Sarah P.',
    Marigold: 'Tan, Michael S.',
    Petunia: 'Uy, Lisa C.',
  };

  // Sample student data
  const sampleStudents = [
    { id: 1, name: 'Aquino, Trisha Nicole B.', lrn: '000000001', gender: 'F' },
    { id: 2, name: 'Cruz, Alyssa Marie T.', lrn: '000000002', gender: 'F' },
    { id: 3, name: 'Domingo, Lea Catherine R.', lrn: '000000003', gender: 'F' },
    { id: 4, name: 'Flores, Ana Beatrix C.', lrn: '000000004', gender: 'F' },
    { id: 5, name: 'Francisco, Danica Rose H.', lrn: '000000005', gender: 'F' },
    { id: 6, name: 'Gomez, Kristina Mae L.', lrn: '000000006', gender: 'F' },
    { id: 7, name: 'Herrera, Joanna Faith P.', lrn: '000000007', gender: 'F' },
    { id: 8, name: 'Morales, Maria Angelica V.', lrn: '000000008', gender: 'F' },
    { id: 9, name: 'Alonzo, Nathaniel James F.', lrn: '000000009', gender: 'M' },
    { id: 10, name: 'Baustista, Gabriel Luis C.', lrn: '000000010', gender: 'M' },
    { id: 11, name: 'Dela Cruz, John Carlo M.', lrn: '000000011', gender: 'M' },
    { id: 12, name: 'Navarro, Elijah Rey B.', lrn: '000000012', gender: 'M' },
    { id: 13, name: 'Ramirez, Miguel Angelo S.', lrn: '000000013', gender: 'M' },
    { id: 14, name: 'Santos, Fei Veston E.', lrn: '000000014', gender: 'M' },
    { id: 15, name: 'Torres, Arvin John L.', lrn: '000000015', gender: 'M' },
    { id: 16, name: 'Villanueva, Carlo Emmanuel D.', lrn: '000000016', gender: 'M' },
  ];

  const girls = sampleStudents.filter((s) => s.gender === 'F');
  const boys = sampleStudents.filter((s) => s.gender === 'M');

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
    setShowDropdown(false);
  };

  const handleAddStudents = () => {
    if (!selectedSection || checkedStudents.size === 0) {
      alert('Please select at least one student and a section.');
      return;
    }

    setEnrolledStudents((prev) => {
      const newSet = new Set(prev);
      checkedStudents.forEach((id) => newSet.add(id));
      return newSet;
    });

    setCheckedStudents(new Set());
    alert(`Students successfully added to ${selectedSection}!`);
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

  const filterStudents = (students) => {
    return students.filter((student) => {
      const isEnrolled = enrolledStudents.has(student.id);
      if (activeTab === 'Enrolled' && !isEnrolled) return false;
      if (activeTab === 'Not Enrolled' && isEnrolled) return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          student.name.toLowerCase().includes(term) ||
          student.lrn.toLowerCase().includes(term)
        );
      }

      return true;
    });
  };

  const filteredGirls = filterStudents(girls);
  const filteredBoys = filterStudents(boys);

  const maxRows = Math.max(filteredGirls.length, filteredBoys.length);
  const tableRows = [];
  for (let i = 0; i < maxRows; i++) {
    tableRows.push({
      girl: filteredGirls[i] || null,
      boy: filteredBoys[i] || null,
    });
  }

  const currentSections = gradeSections[currentGrade] || [];
  const currentAdviser = selectedSection ? sectionAdvisers[selectedSection] : 'N/A';

  const handleShare = async () => {
    const shareText = `Masterlist - Grade ${currentGrade}\n\n${tableRows
      .map((row) => {
        const girlName = row.girl ? row.girl.name : '';
        const girlLRN = row.girl ? row.girl.lrn : '';
        const boyName = row.boy ? row.boy.name : '';
        const boyLRN = row.boy ? row.boy.lrn : '';
        return `${girlName}\t${girlLRN}\t${boyName}\t${boyLRN}`;
      })
      .join('\n')}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Masterlist - Grade ${currentGrade}`,
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
    const csvContent = `Girls,LRN,Boys,LRN\n${tableRows
      .map((row) => {
        const girlName = row.girl ? `"${row.girl.name.replace(/"/g, '""')}"` : '';
        const girlLRN = row.girl ? row.girl.lrn : '';
        const boyName = row.boy ? `"${row.boy.name.replace(/"/g, '""')}"` : '';
        const boyLRN = row.boy ? row.boy.lrn : '';
        return `${girlName},${girlLRN},${boyName},${boyLRN}`;
      })
      .join('\n')}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `masterlist-grade${currentGrade}.csv`);
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
          <button className={styles.addStudentMain} onClick={handleAddStudents}>
            Add Student
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
              <th>Girls</th>
              <th>LRN</th>
              <th></th>
              <th>Boys</th>
              <th>LRN</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, index) => (
              <tr key={index}>
                <td>
                  {row.girl && (
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={checkedStudents.has(row.girl.id)}
                      onChange={() => handleCheckboxChange(row.girl.id)}
                      disabled={enrolledStudents.has(row.girl.id)}
                    />
                  )}
                </td>
                <td
                  className={`${styles.studentName} ${
                    row.girl && enrolledStudents.has(row.girl.id) ? styles.greyedOut : ''
                  }`}
                >
                  {row.girl ? row.girl.name : ''}
                </td>
                <td
                  className={
                    row.girl && enrolledStudents.has(row.girl.id) ? styles.greyedOut : ''
                  }
                >
                  {row.girl ? row.girl.lrn : ''}
                </td>
                <td>
                  {row.boy && (
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={checkedStudents.has(row.boy.id)}
                      onChange={() => handleCheckboxChange(row.boy.id)}
                      disabled={enrolledStudents.has(row.boy.id)}
                    />
                  )}
                </td>
                <td
                  className={`${styles.studentName} ${
                    row.boy && enrolledStudents.has(row.boy.id) ? styles.greyedOut : ''
                  }`}
                >
                  {row.boy ? row.boy.name : ''}
                </td>
                <td
                  className={
                    row.boy && enrolledStudents.has(row.boy.id) ? styles.greyedOut : ''
                  }
                >
                  {row.boy ? row.boy.lrn : ''}
                </td>
              </tr>
            ))}
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

