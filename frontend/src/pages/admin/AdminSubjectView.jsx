import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './AdminSubjectView.module.css';

function AdminSubjectView() {
  const navigate = useNavigate();
  const { grade } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditSubjectsModal, setShowEditSubjectsModal] = useState(false);
  const [showEditTeachersModal, setShowEditTeachersModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [availableTeachers] = useState([
    'Mr. Hermano Puli',
    'Mr. Max Verstappen',
    'Ms. Carla Sainz',
    'Ms. Alexandra Albon',
    'Ms. Ana Palito',
    'Mr. Kim Perez',
    'Ms. Baby Mandaguayon',
    'Mr. Pierre Gasly',
    'Ms. Karylle Samonte',
    'Ms. Yna Clarente',
    'Mr. Kyle Echavez',
    'Ms. Mary Marilag',
    'Mr. John Smith',
    'Ms. Jane Doe',
    'Mr. Michael Johnson',
    'Ms. Sarah Williams',
    'Mr. David Brown',
    'Ms. Emily Davis'
  ]);
  const [selectedTeacher, setSelectedTeacher] = useState('');

  // Mock data - replace with API call
  useEffect(() => {
    setTimeout(() => {
      const mockSubjects = [
        { id: 1, name: 'Mathematics', teachers: ['Mr. Hermano Puli', 'Mr. Max Verstappen', 'Ms. Carla Sainz'] },
        { id: 2, name: 'Science', teachers: ['Ms. Alexandra Albon', 'Ms. Ana Palito'] },
        { id: 3, name: 'English', teachers: ['Mr. Kim Perez'] },
        { id: 4, name: 'MAPEH', teachers: ['Ms. Baby Mandaguayon', 'Mr. Pierre Gasly'] },
        { id: 5, name: 'Filipino', teachers: ['Ms. Karylle Samonte'] },
        { id: 6, name: 'Araling Panlipunan', teachers: ['Ms. Yna Clarente'] },
        { id: 7, name: 'Values Education', teachers: ['Mr. Kyle Echavez', 'Ms. Mary Marilag'] }
      ];
      setSubjects(mockSubjects);
      setLoading(false);
    }, 500);
  }, [grade]);

  const handleBack = () => {
    navigate('/admin/subjects');
  };

  const handleEditSubjects = () => {
    setShowEditSubjectsModal(true);
  };

  const handleAddSubject = () => {
    if (newSubjectName.trim() && !subjects.find(s => s.name === newSubjectName.trim())) {
      setSubjects([...subjects, { id: Date.now(), name: newSubjectName.trim(), teachers: [] }]);
      setNewSubjectName('');
    }
  };

  const handleRemoveSubject = (subjectId) => {
    setSubjects(subjects.filter(s => s.id !== subjectId));
  };

  const handleUpdateSubjectName = (subjectId, newName) => {
    setSubjects(subjects.map(s => s.id === subjectId ? { ...s, name: newName } : s));
  };

  const handleEditTeachers = (subject) => {
    setEditingSubject(subject);
    setShowEditTeachersModal(true);
    setSelectedTeacher('');
  };

  const handleAddTeacher = () => {
    if (selectedTeacher && editingSubject) {
      const updatedSubjects = subjects.map(s => {
        if (s.id === editingSubject.id) {
          if (!s.teachers.includes(selectedTeacher)) {
            return { ...s, teachers: [...s.teachers, selectedTeacher] };
          }
        }
        return s;
      });
      setSubjects(updatedSubjects);
      setEditingSubject(updatedSubjects.find(s => s.id === editingSubject.id));
      setSelectedTeacher('');
    }
  };

  const handleRemoveTeacher = (teacherName) => {
    if (editingSubject) {
      const updatedSubjects = subjects.map(s => {
        if (s.id === editingSubject.id) {
          return { ...s, teachers: s.teachers.filter(t => t !== teacherName) };
        }
        return s;
      });
      setSubjects(updatedSubjects);
      setEditingSubject(updatedSubjects.find(s => s.id === editingSubject.id));
    }
  };

  const handleUpdateTeachers = () => {
    setShowEditTeachersModal(false);
    setEditingSubject(null);
  };

  const handleSaveSubjects = () => {
    setShowEditSubjectsModal(false);
    // TODO: API call to save subjects
  };

  const getGradeDisplay = () => {
    return grade ? grade.charAt(0).toUpperCase() + grade.slice(1).replace(/([A-Z])/g, ' $1') : '';
  };

  const getAvailableTeachersForDropdown = () => {
    if (!editingSubject) return availableTeachers;
    return availableTeachers.filter(t => !editingSubject.teachers.includes(t));
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.pageTitle}>Subject - {getGradeDisplay()}</div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <div className={styles.contentLayout}>
          <div className={styles.subjectsListCard}>
            <div className={styles.listTitle}>Subjects</div>
            <ul className={styles.subjectsList}>
              {subjects.map((subject) => (
                <li key={subject.id}>{subject.name}</li>
              ))}
            </ul>
            <button className={styles.editSubjectsBtn} onClick={handleEditSubjects}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit subjects
            </button>
          </div>

          <div className={styles.tableCard}>
            <table className={styles.subjectsTable}>
              <thead>
                <tr>
                  <th>Subjects</th>
                  <th>Subject Teachers</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td>{subject.name}</td>
                    <td className={styles.teacherCell}>
                      {subject.teachers.map((teacher, idx) => (
                        <button key={idx} className={styles.teacherPill}>
                          {teacher}
                        </button>
                      ))}
                    </td>
                    <td>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEditTeachers(subject)}
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Subjects Modal */}
      {showEditSubjectsModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEditSubjectsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>Edit Subjects</span>
              <button className={styles.modalClose} onClick={() => setShowEditSubjectsModal(false)}>
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.addSubjectSection}>
                <label>Add New Subject:</label>
                <div className={styles.addSubjectInput}>
                  <input
                    type="text"
                    placeholder="Enter subject name"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                  />
                  <button onClick={handleAddSubject}>Add</button>
                </div>
              </div>
              <div className={styles.subjectsListSection}>
                <label>Current Subjects:</label>
                <div className={styles.subjectsListContainer}>
                  {subjects.map((subject) => (
                    <div key={subject.id} className={styles.subjectItem}>
                      <input
                        type="text"
                        value={subject.name}
                        onChange={(e) => handleUpdateSubjectName(subject.id, e.target.value)}
                        className={styles.subjectInput}
                      />
                      <button
                        className={styles.removeBtn}
                        onClick={() => handleRemoveSubject(subject.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveBtn} onClick={handleSaveSubjects}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teachers Modal */}
      {showEditTeachersModal && editingSubject && (
        <div className={styles.modalOverlay} onClick={() => setShowEditTeachersModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>Edit Teachers for {editingSubject.name}</span>
              <button className={styles.modalClose} onClick={() => setShowEditTeachersModal(false)}>
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.addTeacherSection}>
                <label>Add New Teacher:</label>
                <div className={styles.addTeacherInput}>
                  <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                  >
                    <option value="">-- Select a teacher --</option>
                    {getAvailableTeachersForDropdown().map((teacher) => (
                      <option key={teacher} value={teacher}>
                        {teacher}
                      </option>
                    ))}
                  </select>
                  <button onClick={handleAddTeacher}>Add</button>
                </div>
              </div>
              <div className={styles.teachersListSection}>
                <label>Current Teachers:</label>
                <div className={styles.teachersPillsContainer}>
                  {editingSubject.teachers.map((teacher) => (
                    <div key={teacher} className={styles.teacherPillEdit}>
                      {teacher}
                      <button
                        className={styles.removeTeacherBtn}
                        onClick={() => handleRemoveTeacher(teacher)}
                      >
                        &#10060;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveBtn} onClick={handleUpdateTeachers}>
                Update Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <button className={styles.backBtn} title="Back" onClick={handleBack}>
        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
    </div>
  );
}

export default AdminSubjectView;


