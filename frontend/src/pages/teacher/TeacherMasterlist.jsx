import { useState } from 'react';
import InfoCard from '../../components/InfoCard';
import styles from './TeacherMasterlist.module.css';

const studentsIcon = (
  <img 
    src="https://cdn-icons-png.flaticon.com/128/3426/3426653.png" 
    alt="Students Icon"
    style={{ width: '32px', height: '32px' }}
  />
);

const sectionsIcon = (
  <img 
    src="https://cdn-icons-png.flaticon.com/128/3388/3388614.png" 
    alt="Sections Icon"
    style={{ width: '32px', height: '32px' }}
  />
);

const averageIcon = (
  <img 
    src="https://cdn-icons-png.flaticon.com/128/3487/3487761.png" 
    alt="Average Icon"
    style={{ width: '32px', height: '32px' }}
  />
);

function TeacherMasterlist() {
  const [selectedSection, setSelectedSection] = useState('7-dahlia');
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    grade: '',
    note: ''
  });

  // Student data for each section
  const sectionStudents = {
    '7-dahlia': [
      { lrn: '117283040001', name: 'Alonzo, Bam Carlo', gender: 'M', enrollment: '08/25/2023' },
      { lrn: '117283040002', name: 'Alvarez, Kiana Mae', gender: 'F', enrollment: '08/25/2023' },
      { lrn: '117283040003', name: 'Bautista, John Michael', gender: 'M', enrollment: '08/25/2023' },
      { lrn: '117283040004', name: 'Cruz, Maria Angela', gender: 'F', enrollment: '08/25/2023' },
      { lrn: '117283040005', name: 'Dela Cruz, Juan Paolo', gender: 'M', enrollment: '08/25/2023' },
      { lrn: '117283040006', name: 'Garcia, Sofia Marie', gender: 'F', enrollment: '08/25/2023' },
      { lrn: '117283040007', name: 'Lopez, Miguel Antonio', gender: 'M', enrollment: '08/25/2023' },
      { lrn: '117283040008', name: 'Mendoza, Andrea Nicole', gender: 'F', enrollment: '08/25/2023' },
      { lrn: '117283040009', name: 'Reyes, Gabriel James', gender: 'M', enrollment: '08/25/2023' },
      { lrn: '117283040010', name: 'Santos, Isabella Marie', gender: 'F', enrollment: '08/25/2023' }
    ],
    '8-tulip': [
      { lrn: '117283040011', name: 'Aquino, Rafael Miguel', gender: 'M', enrollment: '08/25/2023' },
      { lrn: '117283040012', name: 'Castro, Patricia Ann', gender: 'F', enrollment: '08/25/2023' },
      { lrn: '117283040013', name: 'Domingo, Christian Paul', gender: 'M', enrollment: '08/25/2023' },
      { lrn: '117283040014', name: 'Fernandez, Diana Rose', gender: 'F', enrollment: '08/25/2023' },
      { lrn: '117283040015', name: 'Gonzales, Marco Luis', gender: 'M', enrollment: '08/25/2023' },
      { lrn: '117283040016', name: 'Hernandez, Angela Mae', gender: 'F', enrollment: '08/25/2023' },
      { lrn: '117283040017', name: 'Lim, Joshua David', gender: 'M', enrollment: '08/25/2023' },
      { lrn: '117283040018', name: 'Morales, Christine Joy', gender: 'F', enrollment: '08/25/2023' },
      { lrn: '117283040019', name: 'Ramos, Daniel Joseph', gender: 'M', enrollment: '08/25/2023' },
      { lrn: '117283040020', name: 'Torres, Michelle Anne', gender: 'F', enrollment: '08/25/2023' }
    ],
    '9-daisy': [
      { lrn: '117283040021', name: 'Aguilar, Adrian James', gender: 'M', enrollment: '08/25/2023' },
      { lrn: '117283040022', name: 'Borja, Catherine Mae', gender: 'F', enrollment: '08/25/2023' },
      { lrn: '117283040023', name: 'Chua, Matthew Vincent', gender: 'M', enrollment: '08/25/2023' },
      { lrn: '117283040024', name: 'Delos Santos, Emma Louise', gender: 'F', enrollment: '08/25/2023' },
      { lrn: '117283040025', name: 'Enriquez, Francis John', gender: 'M', enrollment: '08/25/2023' },
      { lrn: '117283040026', name: 'Flores, Hannah Grace', gender: 'F', enrollment: '08/25/2023' },
      { lrn: '117283040027', name: 'Ignacio, Kyle Patrick', gender: 'M', enrollment: '08/25/2023' },
      { lrn: '117283040028', name: 'Martinez, Sarah Jane', gender: 'F', enrollment: '08/25/2023' },
      { lrn: '117283040029', name: 'Pascual, Andre Miguel', gender: 'M', enrollment: '08/25/2023' },
      { lrn: '117283040030', name: 'Villanueva, Rachel Anne', gender: 'F', enrollment: '08/25/2023' }
    ]
  };

  const currentStudents = sectionStudents[selectedSection] || [];
  const totalStudents = Object.values(sectionStudents).reduce((sum, students) => sum + students.length, 0);
  const totalSections = Object.keys(sectionStudents).length;

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  const handleGradeSubmit = (e) => {
    e.preventDefault();
    const grade = Number(gradeForm.grade.trim());
    
    if (isNaN(grade) || grade < 60 || grade > 100) {
      alert('Please enter a valid grade between 60 and 100.');
      return;
    }

    // Here you would typically update the student's grade in your state/backend
    // For now, we'll just close the modal
    setShowGradeModal(false);
    setCurrentRow(null);
    setGradeForm({ grade: '', note: '' });
  };

  const handleModalClose = () => {
    setShowGradeModal(false);
    setCurrentRow(null);
    setGradeForm({ grade: '', note: '' });
  };

  return (
    <>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Masterlist</h1>
        </div>
        
        <div className={styles.infoCards}>
          <InfoCard 
            icon={studentsIcon} 
            title="Total Students" 
            number={totalStudents.toString()} 
            subtext="Enrolled" 
          />
          <InfoCard 
            icon={sectionsIcon} 
            title="Sections" 
            number={totalSections.toString()} 
            subtext="Active Sections" 
          />
          <InfoCard 
            icon={averageIcon} 
            title="Average" 
            number="85" 
            subtext="Class Average" 
          />
        </div>
        
        <div className={styles.masterlistContainer}>
          <div className={styles.masterlistCard}>
            <div className={styles.sectionSelect}>
              <select 
                id="sectionSelect" 
                value={selectedSection}
                onChange={handleSectionChange}
              >
                <option value="7-dahlia">Grade 7 - Dahlia</option>
                <option value="8-tulip">Grade 8 - Tulip</option>
                <option value="9-daisy">Grade 9 - Daisy</option>
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
                  <tr key={student.lrn} data-row={index + 1}>
                    <td>{student.lrn}</td>
                    <td>{student.name}</td>
                    <td>{student.gender}</td>
                    <td>{student.enrollment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grade & Note Edit Modal */}
      {showGradeModal && (
        <div 
          className={styles.modal} 
          onClick={handleModalClose}
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-title"
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 id="modal-title">Enter Grade & Note</h3>
            <form id="grade-form" onSubmit={handleGradeSubmit}>
              <label htmlFor="grade-input">Grade (60-100)</label>
              <input 
                type="number" 
                id="grade-input" 
                min="60" 
                max="100" 
                required 
                placeholder="Enter grade (e.g. 85)"
                value={gradeForm.grade}
                onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
              />
              <label htmlFor="note-input">Note (optional)</label>
              <textarea 
                id="note-input" 
                rows="3" 
                placeholder="Add a note..."
                value={gradeForm.note}
                onChange={(e) => setGradeForm({ ...gradeForm, note: e.target.value })}
              />
              <div className={styles.modalButtons}>
                <button 
                  type="button" 
                  className={styles.btnSecondary}
                  onClick={handleModalClose}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
  );
}

export default TeacherMasterlist;

