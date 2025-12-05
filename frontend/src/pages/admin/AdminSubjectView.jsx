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
import { fetchAllTeachers } from '../../store/slices/teacherSlice';
import { getAllSections } from '../../store/slices/sectionSlice';

function AdminSubjectView() {
  const navigate = useNavigate();
  const { grade } = useParams();
  const dispatch = useDispatch();

  // Redux state
  const { subjects, loading, error } = useSelector((state) => state.subjects);
  const { teachers } = useSelector((state) => state.teachers);
  const { data: sections } = useSelector((state) => state.section);

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

  // Fetch teachers and sections when opening the edit teachers modal
  useEffect(() => {
    if (showEditTeachersModal) {
      setTeachersLoading(true);
      Promise.all([
        dispatch(fetchAllTeachers()).unwrap(),
        dispatch(getAllSections()).unwrap(),
      ]).finally(() => setTeachersLoading(false));
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
    if (filteredSubjects.find((s) => s.subjectName.toLowerCase() === subjectName.toLowerCase())) {
      alert('Subject with this name already exists');
      return;
    }

    try {
      await dispatch(
        createSubject({
          subjectName: subjectName,
          gradeLevel,
          status: 'Active',
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
      localSubjects.map((s) => (s._id === subjectId ? { ...s, subjectName: newName } : s))
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
          data: { subjectName: newName.trim() },
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

    // Check if teacher is already assigned
    const currentTeacherId = editingSubject.teacherId?._id || editingSubject.teacherId;
    if (currentTeacherId === selectedTeacherId) {
      alert('Teacher is already assigned to this subject');
      return;
    }

    // Optimistic local update
    const teacher = teachers.find((t) => t._id === selectedTeacherId);
    if (teacher) {
      const updatedSubject = {
        ...editingSubject,
        teacherId: teacher,
      };
      setEditingSubject(updatedSubject);
      setLocalSubjects(
        localSubjects.map((s) => (s._id === editingSubject._id ? updatedSubject : s))
      );
    }
    setSelectedTeacherId('');
  };

  const handleRemoveTeacher = () => {
    if (!editingSubject) return;

    // Optimistic local update - clear teacher
    const updatedSubject = {
      ...editingSubject,
      teacherId: null,
    };
    setEditingSubject(updatedSubject);
    setLocalSubjects(
      localSubjects.map((s) => (s._id === editingSubject._id ? updatedSubject : s))
    );
  };

  const handleUpdateTeachers = async () => {
    if (!editingSubject) return;

    // Extract teacher ID (handle both populated and non-populated)
    const teacherId = editingSubject.teacherId?._id || editingSubject.teacherId || null;

    try {
      await dispatch(
        updateSubject({
          id: editingSubject._id,
          data: { teacherId },
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
      if (originalSubject && originalSubject.subjectName !== localSubject.subjectName) {
        return dispatch(
          updateSubject({
            id: localSubject._id,
            data: { subjectName: localSubject.subjectName },
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
    if (!editingSubject) return teachers;

    const assignedTeacherId = editingSubject.teacherId?._id || editingSubject.teacherId;

    return teachers.filter((t) => t._id !== assignedTeacherId);
  };

  // Format teacher name for display
  const formatTeacherName = (teacher) => {
    if (!teacher) return 'No teacher assigned';
    if (typeof teacher === 'object') {
      // Handle populated teacher with userId
      if (teacher.userId) {
        return `${teacher.userId.firstName} ${teacher.userId.lastName}`;
      }
      // Handle direct teacher object
      if (teacher.firstName && teacher.lastName) {
        return `${teacher.firstName} ${teacher.lastName}`;
      }
    }
    return 'Unknown Teacher';
  };

  // Get teacher ID (handle both populated and non-populated)
  const getTeacherId = (teacher) => {
    if (!teacher) return null;
    if (typeof teacher === 'object') {
      return teacher._id;
    }
    return teacher;
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
                <li key={subject._id}>{subject.subjectName}</li>
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
                    <td>{subject.subjectName}</td>
                    <td className={styles.teacherCell}>
                      {subject.teacherId ? (
                        <button className={styles.teacherPill}>
                          {formatTeacherName(subject.teacherId)}
                        </button>
                      ) : (
                        <span style={{ color: '#999', fontStyle: 'italic' }}>No teacher assigned</span>
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
                        value={subject.subjectName}
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
              <span>Edit Teacher for {editingSubject.subjectName}</span>
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
                            {teacher.userId ? `${teacher.userId.firstName} ${teacher.userId.lastName}` : `Teacher ${teacher._id}`}
                          </option>
                        ))}
                      </select>
                      <button onClick={handleAddTeacher} disabled={loading}>
                        Add
                      </button>
                    </div>
                  </div>
                  <div className={styles.teachersListSection}>
                    <label>Current Teacher:</label>
                    <div className={styles.teachersPillsContainer}>
                      {editingSubject.teacherId ? (
                        <div className={styles.teacherPillEdit}>
                          {formatTeacherName(editingSubject.teacherId)}
                          <button
                            className={styles.removeTeacherBtn}
                            onClick={handleRemoveTeacher}
                          >
                            &#10060;
                          </button>
                        </div>
                      ) : (
                        <p style={{ color: '#999', fontStyle: 'italic' }}>No teacher assigned</p>
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
