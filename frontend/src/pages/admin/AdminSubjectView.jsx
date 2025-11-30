import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminSubjectView.module.css';
import {
  fetchAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  clearError,
} from '../../store/slices/subjectSlice';
import { fetchAllUsers } from '../../store/slices/userSlice';

function AdminSubjectView() {
  const navigate = useNavigate();
  const { grade } = useParams();
  const dispatch = useDispatch();

  // Redux state
  const { subjects, loading, error } = useSelector((state) => state.subjects);
  const { users } = useSelector((state) => state.users);

  // Local state
  const [showEditSubjectsModal, setShowEditSubjectsModal] = useState(false);
  const [showEditTeachersModal, setShowEditTeachersModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [localSubjects, setLocalSubjects] = useState([]); // For optimistic updates in modals
  const [teachersLoading, setTeachersLoading] = useState(false);

  // Map grade param to gradeLevel number
  const getGradeLevel = () => {
    const gradeMap = {
      grade7: 7,
      grade8: 8,
      grade9: 9,
      grade10: 10,
    };
    return gradeMap[grade] || null;
  };

  // Filter subjects by grade level
  const filteredSubjects = subjects.filter(
    (subject) => subject.gradeLevel === getGradeLevel()
  );

  // Fetch subjects on mount and when grade changes
  useEffect(() => {
    const gradeLevel = getGradeLevel();
    if (gradeLevel) {
      dispatch(fetchAllSubjects({ gradeLevel }));
    }
  }, [grade, dispatch]);

  // Sync localSubjects with filteredSubjects when they change
  useEffect(() => {
    setLocalSubjects(filteredSubjects);
  }, [filteredSubjects]);

  // Fetch teachers when opening the edit teachers modal
  useEffect(() => {
    if (showEditTeachersModal) {
      setTeachersLoading(true);
      dispatch(fetchAllUsers({ role: 'Teacher' }))
        .unwrap()
        .finally(() => setTeachersLoading(false));
    }
  }, [showEditTeachersModal, dispatch]);

  const handleBack = () => {
    navigate('/admin/subjects');
  };

  const handleEditSubjects = () => {
    setShowEditSubjectsModal(true);
  };

  const handleAddSubject = async () => {
    const subjectName = newSubjectName.trim();
    if (!subjectName) return;

    const gradeLevel = getGradeLevel();
    if (!gradeLevel) return;

    // Check if subject already exists
    if (filteredSubjects.find((s) => s.name.toLowerCase() === subjectName.toLowerCase())) {
      alert('Subject with this name already exists');
      return;
    }

    try {
      await dispatch(
        createSubject({
          name: subjectName,
          gradeLevel,
          teachers: [],
          
        })
      ).unwrap();

      setNewSubjectName('');
    } catch (error) {
      alert(error || 'Failed to create subject');
    }
  };

  const handleRemoveSubject = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    try {
      await dispatch(deleteSubject(subjectId)).unwrap();
    } catch (error) {
      alert(error || 'Failed to delete subject');
    }
  };

  const handleUpdateSubjectName = (subjectId, newName) => {
    // Optimistic local update
    setLocalSubjects(
      localSubjects.map((s) => (s._id === subjectId ? { ...s, name: newName } : s))
    );
  };

  const handleSaveSubjectName = async (subjectId, newName) => {
    if (!newName.trim()) {
      alert('Subject name cannot be empty');
      return;
    }

    try {
      await dispatch(
        updateSubject({
          id: subjectId,
          data: { name: newName.trim() },
        })
      ).unwrap();
    } catch (error) {
      alert(error || 'Failed to update subject name');
      // Revert local change on error
      const originalSubject = filteredSubjects.find((s) => s._id === subjectId);
      if (originalSubject) {
        setLocalSubjects(
          localSubjects.map((s) =>
            s._id === subjectId ? originalSubject : s
          )
        );
      }
    }
  };

  const handleEditTeachers = (subject) => {
    setEditingSubject(subject);
    setShowEditTeachersModal(true);
    setSelectedTeacherId('');
  };

  const handleAddTeacher = () => {
    if (!selectedTeacherId || !editingSubject) return;

    const teacherIds = editingSubject.teachers.map((t) =>
      typeof t === 'object' ? t._id : t
    );

    if (teacherIds.includes(selectedTeacherId)) {
      alert('Teacher is already assigned to this subject');
      return;
    }

    // Optimistic local update
    const teacher = users.find((u) => u._id === selectedTeacherId);
    if (teacher) {
      const updatedSubject = {
        ...editingSubject,
        teachers: [...editingSubject.teachers, teacher],
      };
      setEditingSubject(updatedSubject);
      setLocalSubjects(
        localSubjects.map((s) => (s._id === editingSubject._id ? updatedSubject : s))
      );
    }
    setSelectedTeacherId('');
  };

  const handleRemoveTeacher = (teacherId) => {
    if (!editingSubject) return;

    const teacherIds = editingSubject.teachers.map((t) =>
      typeof t === 'object' ? t._id : t
    );

    // Optimistic local update
    const updatedSubject = {
      ...editingSubject,
      teachers: editingSubject.teachers.filter(
        (t) => (typeof t === 'object' ? t._id : t) !== teacherId
      ),
    };
    setEditingSubject(updatedSubject);
    setLocalSubjects(
      localSubjects.map((s) => (s._id === editingSubject._id ? updatedSubject : s))
    );
  };

  const handleUpdateTeachers = async () => {
    if (!editingSubject) return;

    // Extract teacher IDs (handle both populated and non-populated)
    const teacherIds = editingSubject.teachers.map((t) =>
      typeof t === 'object' ? t._id : t
    );

    try {
      await dispatch(
        updateSubject({
          id: editingSubject._id,
          data: { teachers: teacherIds },
        })
      ).unwrap();

      setShowEditTeachersModal(false);
      setEditingSubject(null);
    } catch (error) {
      alert(error || 'Failed to update teachers');
      // Revert to original on error
      const originalSubject = filteredSubjects.find((s) => s._id === editingSubject._id);
      if (originalSubject) {
        setEditingSubject(originalSubject);
        setLocalSubjects(
          localSubjects.map((s) =>
            s._id === editingSubject._id ? originalSubject : s
          )
        );
      }
    }
  };

  const handleSaveSubjects = () => {
    // Save all pending name changes
    const promises = localSubjects.map((localSubject) => {
      const originalSubject = filteredSubjects.find((s) => s._id === localSubject._id);
      if (originalSubject && originalSubject.name !== localSubject.name) {
        return dispatch(
          updateSubject({
            id: localSubject._id,
            data: { name: localSubject.name },
          })
        ).unwrap();
      }
      return Promise.resolve();
    });

    Promise.all(promises)
      .then(() => {
        setShowEditSubjectsModal(false);
      })
      .catch((error) => {
        alert(error || 'Failed to save some changes');
      });
  };

  const handleCloseEditSubjectsModal = () => {
    // Revert local changes when closing without saving
    setLocalSubjects(filteredSubjects);
    setShowEditSubjectsModal(false);
  };

  const handleCloseEditTeachersModal = () => {
    // Revert to original when closing without saving
    if (editingSubject) {
      const originalSubject = filteredSubjects.find((s) => s._id === editingSubject._id);
      if (originalSubject) {
        setEditingSubject(originalSubject);
        setLocalSubjects(
          localSubjects.map((s) =>
            s._id === editingSubject._id ? originalSubject : s
          )
        );
      }
    }
    setShowEditTeachersModal(false);
    setEditingSubject(null);
  };

  const getGradeDisplay = () => {
    return grade ? grade.charAt(0).toUpperCase() + grade.slice(1).replace(/([A-Z])/g, ' $1') : '';
  };

  // Get available teachers (filter out already assigned)
  const getAvailableTeachers = () => {
    if (!editingSubject) return users.filter((u) => u.role === 'Teacher');

    const assignedTeacherIds = editingSubject.teachers.map((t) =>
      typeof t === 'object' ? t._id : t
    );

    return users.filter(
      (u) => u.role === 'Teacher' && !assignedTeacherIds.includes(u._id)
    );
  };

  // Format teacher name for display
  const formatTeacherName = (teacher) => {
    if (typeof teacher === 'object' && teacher.firstName && teacher.lastName) {
      return `${teacher.firstName} ${teacher.lastName}`;
    }
    return teacher;
  };

  // Get teacher ID (handle both populated and non-populated)
  const getTeacherId = (teacher) => {
    return typeof teacher === 'object' ? teacher._id : teacher;
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.pageTitle}>Subject - {getGradeDisplay()}</div>

      {error && (
        <div style={{ padding: '1rem', background: '#fee', color: '#c00', marginBottom: '1rem' }}>
          {error}
          <button
            onClick={() => dispatch(clearError())}
            style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : filteredSubjects.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>No subjects found for {getGradeDisplay()}.</p>
          <button
            onClick={handleEditSubjects}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
          >
            Add Subjects
          </button>
        </div>
      ) : (
        <div className={styles.contentLayout}>
          <div className={styles.subjectsListCard}>
            <div className={styles.listTitle}>Subjects</div>
            <ul className={styles.subjectsList}>
              {localSubjects.map((subject) => (
                <li key={subject._id}>{subject.name}</li>
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
                {localSubjects.map((subject) => (
                  <tr key={subject._id}>
                    <td>{subject.name}</td>
                    <td className={styles.teacherCell}>
                      {subject.teachers && subject.teachers.length > 0 ? (
                        subject.teachers.map((teacher, idx) => (
                          <button key={idx} className={styles.teacherPill}>
                            {formatTeacherName(teacher)}
                          </button>
                        ))
                      ) : (
                        <span style={{ color: '#999', fontStyle: 'italic' }}>No teachers assigned</span>
                      )}
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
        <div className={styles.modalOverlay} onClick={handleCloseEditSubjectsModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>Edit Subjects</span>
              <button className={styles.modalClose} onClick={handleCloseEditSubjectsModal}>
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
                  <button onClick={handleAddSubject} disabled={loading}>
                    Add
                  </button>
                </div>
                
              </div>
              <div className={styles.subjectsListSection}>
                <label>Current Subjects:</label>
                <div className={styles.subjectsListContainer}>
                  {localSubjects.map((subject) => (
                    <div key={subject._id} className={styles.subjectItem}>
                      <input
                        type="text"
                        value={subject.name}
                        onChange={(e) => handleUpdateSubjectName(subject._id, e.target.value)}
                        onBlur={(e) => handleSaveSubjectName(subject._id, e.target.value)}
                        className={styles.subjectInput}
                      />
                      <button
                        className={styles.removeBtn}
                        onClick={() => handleRemoveSubject(subject._id)}
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveBtn} onClick={handleSaveSubjects} disabled={loading}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teachers Modal */}
      {showEditTeachersModal && editingSubject && (
        <div className={styles.modalOverlay} onClick={handleCloseEditTeachersModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>Edit Teachers for {editingSubject.name}</span>
              <button className={styles.modalClose} onClick={handleCloseEditTeachersModal}>
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              {teachersLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading teachers...</div>
              ) : (
                <>
                  <div className={styles.addTeacherSection}>
                    <label>Add New Teacher:</label>
                    <div className={styles.addTeacherInput}>
                      <select
                        value={selectedTeacherId}
                        onChange={(e) => setSelectedTeacherId(e.target.value)}
                      >
                        <option value="">-- Select a teacher --</option>
                        {getAvailableTeachers().map((teacher) => (
                          <option key={teacher._id} value={teacher._id}>
                            {teacher.firstName} {teacher.lastName}
                          </option>
                        ))}
                      </select>
                      <button onClick={handleAddTeacher} disabled={loading}>
                        Add
                      </button>
                    </div>
                  </div>
                  <div className={styles.teachersListSection}>
                    <label>Current Teachers:</label>
                    <div className={styles.teachersPillsContainer}>
                      {editingSubject.teachers && editingSubject.teachers.length > 0 ? (
                        editingSubject.teachers.map((teacher) => {
                          const teacherId = getTeacherId(teacher);
                          return (
                            <div key={teacherId} className={styles.teacherPillEdit}>
                              {formatTeacherName(teacher)}
                              <button
                                className={styles.removeTeacherBtn}
                                onClick={() => handleRemoveTeacher(teacherId)}
                              >
                                &#10060;
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <p style={{ color: '#999', fontStyle: 'italic' }}>No teachers assigned</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.saveBtn}
                onClick={handleUpdateTeachers}
                disabled={loading || teachersLoading}
              >
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
