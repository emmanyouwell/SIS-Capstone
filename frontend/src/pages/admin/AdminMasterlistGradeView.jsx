import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './AdminMasterlistGradeView.module.css';

function AdminMasterlistGradeView() {
  const { grade } = useParams();
  const navigate = useNavigate();
  const gradeNumber = parseInt(grade?.replace('grade', '') || '7');
  const [selectedSection, setSelectedSection] = useState('');

  // Grade sections mapping
  const gradeSections = {
    7: ['Dahlia', 'Rose', 'Lilac', 'Foxglove', 'Lily'],
    8: ['Sunflower', 'Tulip', 'Orchid', 'Peony', 'Daisy'],
    9: ['Jasmine', 'Magnolia', 'Azalea', 'Camellia', 'Begonia'],
    10: ['Iris', 'Poppy', 'Violet', 'Marigold', 'Petunia'],
  };

  // Section advisers mapping
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

  // Sample student data organized by section (matching grade7.html structure)
  const sectionStudents = {
    7: {
      dahlia: [
        { lrn: '000000001', name: 'Aquino, Trisha Nicole B.', gender: 'F' },
        { lrn: '000000002', name: 'Cruz, Alyssa Marie T.', gender: 'F' },
        { lrn: '000000003', name: 'Domingo, Lea Catherine R.', gender: 'F' },
        { lrn: '000000004', name: 'Flores, Ana Beatrix C.', gender: 'F' },
        { lrn: '000000017', name: 'Santos, Maria L.', gender: 'F' },
        { lrn: '000000018', name: 'Reyes, Anna M.', gender: 'F' },
        { lrn: '000000019', name: 'Garcia, John P.', gender: 'M' },
      ],
      rose: [
        { lrn: '000000005', name: 'Francisco, Danica Rose H.', gender: 'F' },
        { lrn: '000000006', name: 'Gomez, Kristina Mae L.', gender: 'F' },
        { lrn: '000000007', name: 'Herrera, Joanna Faith P.', gender: 'F' },
        { lrn: '000000008', name: 'Morales, Maria Angelica V.', gender: 'F' },
        { lrn: '000000020', name: 'Cruz, Mark D.', gender: 'M' },
        { lrn: '000000021', name: 'Torres, Sophia G.', gender: 'F' },
      ],
      lilac: [
        { lrn: '000000009', name: 'Baustista, Gabriel Luis C.', gender: 'M' },
        { lrn: '000000010', name: 'Dela Cruz, John Carlo M.', gender: 'M' },
        { lrn: '000000011', name: 'Navarro, Elijah Rey B.', gender: 'M' },
        { lrn: '000000012', name: 'Ramirez, Miguel Angelo S.', gender: 'M' },
        { lrn: '000000022', name: 'Villanueva, Carlo Emmanuel D.', gender: 'M' },
        { lrn: '000000023', name: 'Santos, Fei Veston E.', gender: 'M' },
      ],
      foxglove: [
        { lrn: '000000013', name: 'Santos, Fei Veston E.', gender: 'M' },
        { lrn: '000000014', name: 'Torres, Arvin John L.', gender: 'M' },
        { lrn: '000000015', name: 'Villanueva, Carlo Emmanuel D.', gender: 'M' },
        { lrn: '000000024', name: 'Navarro, Elijah Rey B.', gender: 'M' },
        { lrn: '000000025', name: 'Ramirez, Miguel Angelo S.', gender: 'M' },
      ],
      lily: [
        { lrn: '000000016', name: 'Alonzo, Nathaniel James F.', gender: 'M' },
        { lrn: '000000026', name: 'Garcia, John P.', gender: 'M' },
        { lrn: '000000027', name: 'Reyes, Anna M.', gender: 'F' },
      ],
    },
    8: {
      sunflower: [
        { lrn: '100000001', name: 'Alvarez, Kiana Mae L.', gender: 'F' },
        { lrn: '100000002', name: 'Bautista, Maria Cristina P.', gender: 'F' },
        { lrn: '100000003', name: 'Cruz, John Michael D.', gender: 'M' },
        { lrn: '100000004', name: 'Dela Rosa, Sarah Jane M.', gender: 'F' },
      ],
      tulip: [
        { lrn: '100000005', name: 'Javier, Robert Vincent V.', gender: 'M' },
        { lrn: '100000006', name: 'Lopez, Michelle Anne W.', gender: 'F' },
        { lrn: '100000007', name: 'Martinez, Christian Paul X.', gender: 'M' },
        { lrn: '100000008', name: 'Nunez, Jennifer Rose Y.', gender: 'F' },
      ],
      orchid: [
        { lrn: '100000009', name: 'Ramos, Stephanie Grace C.', gender: 'F' },
        { lrn: '100000010', name: 'Santos, Kevin Bryan D.', gender: 'M' },
        { lrn: '100000011', name: 'Torres, Nicole Anne E.', gender: 'F' },
        { lrn: '100000012', name: 'Villanueva, Ryan Christopher F.', gender: 'M' },
      ],
      peony: [
        { lrn: '100000013', name: 'Castro, Andrea Nicole K.', gender: 'F' },
        { lrn: '100000014', name: 'Dizon, Paolo Miguel L.', gender: 'M' },
        { lrn: '100000015', name: 'Espiritu, Rachel Anne M.', gender: 'F' },
        { lrn: '100000016', name: 'Flores, Adrian Paul N.', gender: 'M' },
      ],
      daisy: [
        { lrn: '100000017', name: 'Gonzales, Mary Grace O.', gender: 'F' },
        { lrn: '100000018', name: 'Ibarra, John Carlo P.', gender: 'M' },
        { lrn: '100000019', name: 'Javier, Kristine Mae Q.', gender: 'F' },
        { lrn: '100000020', name: 'Lim, Vincent Paul R.', gender: 'M' },
      ],
    },
    9: {
      jasmine: [
        { lrn: '200000001', name: 'Abad, Maria Sofia A.', gender: 'F' },
        { lrn: '200000002', name: 'Bautista, Christian Paul B.', gender: 'M' },
        { lrn: '200000003', name: 'Castro, Angela Marie C.', gender: 'F' },
        { lrn: '200000004', name: 'Dela Cruz, Joshua Miguel D.', gender: 'M' },
      ],
      magnolia: [
        { lrn: '200000005', name: 'Javier, Robert Vincent J.', gender: 'M' },
        { lrn: '200000006', name: 'Lopez, Michelle Anne K.', gender: 'F' },
        { lrn: '200000007', name: 'Martinez, Christian Paul L.', gender: 'M' },
        { lrn: '200000008', name: 'Nunez, Jennifer Rose M.', gender: 'F' },
      ],
      azalea: [
        { lrn: '200000009', name: 'Torres, Nicole Anne S.', gender: 'F' },
        { lrn: '200000010', name: 'Villanueva, Ryan Christopher T.', gender: 'M' },
        { lrn: '200000011', name: 'Yap, Kimberly Ann U.', gender: 'F' },
        { lrn: '200000012', name: 'Zamora, Joshua David V.', gender: 'M' },
      ],
      camellia: [
        { lrn: '200000013', name: 'Flores, Adrian Paul B.', gender: 'M' },
        { lrn: '200000014', name: 'Gonzales, Mary Grace C.', gender: 'F' },
        { lrn: '200000015', name: 'Ibarra, John Carlo D.', gender: 'M' },
        { lrn: '200000016', name: 'Javier, Kristine Mae E.', gender: 'F' },
      ],
      begonia: [
        { lrn: '200000017', name: 'Lim, Vincent Paul F.', gender: 'M' },
        { lrn: '200000018', name: 'Mendoza, Angelica Rose G.', gender: 'F' },
        { lrn: '200000019', name: 'Navarro, Bryan Joseph H.', gender: 'M' },
        { lrn: '200000020', name: 'Ong, Catherine Ann I.', gender: 'F' },
      ],
    },
    10: {
      iris: [
        { lrn: '300000001', name: 'Alvarez, Maria Elena A.', gender: 'F' },
        { lrn: '300000002', name: 'Bautista, John Michael B.', gender: 'M' },
        { lrn: '300000003', name: 'Cruz, Sarah Jane C.', gender: 'F' },
        { lrn: '300000004', name: 'Dela Rosa, Mark Anthony D.', gender: 'M' },
      ],
      poppy: [
        { lrn: '300000005', name: 'Javier, Christian Paul J.', gender: 'M' },
        { lrn: '300000006', name: 'Lopez, Jennifer Rose K.', gender: 'F' },
        { lrn: '300000007', name: 'Martinez, Daniel Joseph L.', gender: 'M' },
        { lrn: '300000008', name: 'Nunez, Christine Joy M.', gender: 'F' },
      ],
      violet: [
        { lrn: '300000009', name: 'Torres, Kimberly Ann S.', gender: 'F' },
        { lrn: '300000010', name: 'Villanueva, Joshua David T.', gender: 'M' },
        { lrn: '300000011', name: 'Yap, Maria Isabel U.', gender: 'F' },
        { lrn: '300000012', name: 'Zamora, Carlo Emmanuel V.', gender: 'M' },
      ],
      marigold: [
        { lrn: '300000013', name: 'Flores, John Carlo B.', gender: 'M' },
        { lrn: '300000014', name: 'Gonzales, Kristine Mae C.', gender: 'F' },
        { lrn: '300000015', name: 'Ibarra, Vincent Paul D.', gender: 'M' },
        { lrn: '300000016', name: 'Javier, Angelica Rose E.', gender: 'F' },
      ],
      petunia: [
        { lrn: '300000017', name: 'Lim, Bryan Joseph F.', gender: 'M' },
        { lrn: '300000018', name: 'Mendoza, Catherine Ann G.', gender: 'F' },
        { lrn: '300000019', name: 'Navarro, Mark Daniel H.', gender: 'M' },
        { lrn: '300000020', name: 'Ong, Patricia Joy I.', gender: 'F' },
      ],
    },
  };

  const sections = gradeSections[gradeNumber] || [];

  // Initialize with first section
  useEffect(() => {
    if (sections.length > 0 && !selectedSection) {
      setSelectedSection(sections[0].toLowerCase());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradeNumber]);

  const currentSectionKey = selectedSection || (sections.length > 0 ? sections[0].toLowerCase() : '');
  const currentStudents = sectionStudents[gradeNumber]?.[currentSectionKey] || [];
  const currentSectionName = sections.find((s) => s.toLowerCase() === currentSectionKey) || sections[0] || '';
  const currentAdviser = currentSectionName ? sectionAdvisers[currentSectionName] : 'N/A';

  // Calculate stats
  const totalEnrolled = currentStudents.length;
  const activeSections = sections.length;
  const classAverage = 85; // Placeholder - would come from actual data

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  const handleDownload = () => {
    const csvContent = `LRN,Name,Gender,Enrollment\n${currentStudents
      .map((s) => `"${s.lrn}","${s.name}",${s.gender},08/25/2023`)
      .join('\n')}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `masterlist-grade${gradeNumber}-${currentSectionKey}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    const shareText = `Masterlist - Grade ${gradeNumber} - ${currentSectionName}\n\n${currentStudents
      .map((s) => `${s.lrn}\t${s.name}\t${s.gender}\t08/25/2023`)
      .join('\n')}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Masterlist - Grade ${gradeNumber}`,
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
      <div className={styles.header}>
        <h1>Masterlist - Grade {gradeNumber}</h1>
      </div>

      <div className={styles.infoCards}>
        <div className={styles.card}>
          <div className={styles.number}>{totalEnrolled}</div>
          <div className={styles.subtext}>Enrolled</div>
        </div>
        <div className={styles.card}>
          <div className={styles.number}>{activeSections}</div>
          <div className={styles.subtext}>Active Sections</div>
        </div>
        <div className={styles.card}>
          <div className={styles.number}>{classAverage}</div>
          <div className={styles.subtext}>Class Average</div>
        </div>
      </div>

      <div className={styles.masterlistContainer}>
        <div className={styles.masterlistCard}>
          <div className={styles.sectionSelect}>
            <select
              id="sectionSelect"
              value={selectedSection}
              onChange={handleSectionChange}
            >
              {sections.map((section) => (
                <option key={section} value={section.toLowerCase()}>
                  {section}
                </option>
              ))}
            </select>
          </div>
          <table className={styles.masterlistTable}>
          <thead>
            <tr>
              <th>LRN</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Enrollment</th>
            </tr>
          </thead>
          <tbody>
              {currentStudents.map((student, index) => (
              <tr key={index}>
                  <td>{student.lrn}</td>
                  <td>{student.name}</td>
                  <td>{student.gender}</td>
                  <td>08/25/2023</td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default AdminMasterlistGradeView;

