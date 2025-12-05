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
          teacherId: [],
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

    // Get current teacher IDs (handle both array and single value, populated and non-populated)
    const currentTeacherIds = Array.isArray(editingSubject.teacherId)
      ? editingSubject.teacherId.map((t) => (typeof t === 'object' ? t._id : t))
      : editingSubject.teacherId
      ? [typeof editingSubject.teacherId === 'object' ? editingSubject.teacherId._id : editingSubject.teacherId]
      : [];

    // Check if teacher is already assigned
    if (currentTeacherIds.includes(selectedTeacherId)) {
      alert('Teacher is already assigned to this subject');
      return;
    }

    // Optimistic local update
    const teacher = teachers.find((t) => t._id === selectedTeacherId);
    if (teacher) {
      const updatedTeacherIds = [...currentTeacherIds, teacher];
      const updatedSubject = {
        ...editingSubject,
        teacherId: updatedTeacherIds,
      };
      setEditingSubject(updatedSubject);
      setLocalSubjects(
        localSubjects.map((s) => (s._id === editingSubject._id ? updatedSubject : s))
      );
    }
    setSelectedTeacherId('');
  };

  const handleRemoveTeacher = (teacherIdToRemove) => {
    if (!editingSubject) return;

    // Get current teacher IDs (handle both array and single value, populated and non-populated)
    const currentTeacherIds = Array.isArray(editingSubject.teacherId)
      ? editingSubject.teacherId
      : editingSubject.teacherId
      ? [editingSubject.teacherId]
      : [];

    // Remove the specific teacher
    const updatedTeacherIds = currentTeacherIds.filter((t) => {
      const tId = typeof t === 'object' ? t._id : t;
      return tId !== teacherIdToRemove;
    });

    // Optimistic local update
    const updatedSubject = {
      ...editingSubject,
      teacherId: updatedTeacherIds,
    };
    setEditingSubject(updatedSubject);
    setLocalSubjects(
      localSubjects.map((s) => (s._id === editingSubject._id ? updatedSubject : s))
    );
  };

  const handleUpdateTeachers = async () => {
    if (!editingSubject) return;

    // Extract teacher IDs as array (handle both populated and non-populated, array and single value)
    let teacherIds = [];
    if (Array.isArray(editingSubject.teacherId)) {
      teacherIds = editingSubject.teacherId.map((t) => (typeof t === 'object' ? t._id : t));
    } else if (editingSubject.teacherId) {
      teacherIds = [typeof editingSubject.teacherId === 'object' ? editingSubject.teacherId._id : editingSubject.teacherId];
    }

    try {
      await dispatch(
        updateSubject({
          id: editingSubject._id,
          data: { teacherId: teacherIds },
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

    // Get current teacher IDs (handle both array and single value, populated and non-populated)
    const currentTeacherIds = Array.isArray(editingSubject.teacherId)
      ? editingSubject.teacherId.map((t) => (typeof t === 'object' ? t._id : t))
      : editingSubject.teacherId
      ? [typeof editingSubject.teacherId === 'object' ? editingSubject.teacherId._id : editingSubject.teacherId]
      : [];

    return teachers.filter((t) => !currentTeacherIds.includes(t._id));
  };

  // Format teacher name for display
  const formatTeacherName = (teacher) => {
    if (!teacher) return 'No teacher assigned';
    
    // Handle string ID (shouldn't happen in normal flow, but handle gracefully)
    if (typeof teacher === 'string') {
      // Try to find the teacher in the teachers array
      const foundTeacher = teachers.find((t) => t._id === teacher);
      if (foundTeacher) {
        return formatTeacherName(foundTeacher);
      }
      return 'Unknown Teacher';
    }
    
    // Handle teacher object
    if (typeof teacher === 'object') {
      // Handle populated teacher with userId (from backend/subjects)
      if (teacher.userId) {
        if (typeof teacher.userId === 'object') {
          const firstName = teacher.userId.firstName || '';
          const lastName = teacher.userId.lastName || '';
          if (firstName || lastName) {
            return `${firstName} ${lastName}`.trim();
          }
        }
      }
      
      // Handle direct teacher object (from Redux teachers array)
      // Teachers from Redux should have userId populated, but handle both cases
      if (teacher.firstName && teacher.lastName) {
        return `${teacher.firstName} ${teacher.lastName}`;
      }
      
      // If we have an _id but no name, try to find it in the teachers array
      if (teacher._id) {
        const foundTeacher = teachers.find((t) => t._id === teacher._id);
        if (foundTeacher) {
          return formatTeacherName(foundTeacher);
        }
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
                      {(() => {
                        // Handle both array and single value, populated and non-populated
                        const teacherIds = Array.isArray(subject.teacherId)
                          ? subject.teacherId
                          : subject.teacherId
                          ? [subject.teacherId]
                          : [];

                        if (teacherIds.length === 0) {
                          return <span style={{ color: '#999', fontStyle: 'italic' }}>No teacher assigned</span>;
                        }

                        return (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {teacherIds.map((teacher, index) => (
                              <button key={index} className={styles.teacherPill}>
                                {formatTeacherName(teacher)}
                              </button>
                            ))}
                          </div>
                        );
                      })()}
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
              <span>Edit Teachers for {editingSubject.subjectName}</span>
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
                    <label>Current Teachers:</label>
                    <div className={styles.teachersPillsContainer}>
                      {(() => {
                        // Handle both array and single value, populated and non-populated
                        const teacherIds = Array.isArray(editingSubject.teacherId)
                          ? editingSubject.teacherId
                          : editingSubject.teacherId
                          ? [editingSubject.teacherId]
                          : [];

                        if (teacherIds.length === 0) {
                          return <p style={{ color: '#999', fontStyle: 'italic' }}>No teachers assigned</p>;
                        }

                        return teacherIds.map((teacher, index) => {
                          const teacherId = typeof teacher === 'object' ? teacher._id : teacher;
                          return (
                            <div key={index} className={styles.teacherPillEdit}>
                              {formatTeacherName(teacher)}
                              <button
                                className={styles.removeTeacherBtn}
                                onClick={() => handleRemoveTeacher(teacherId)}
                              >
                                &#10060;
                              </button>
                            </div>
                          );
                        });
                      })()}
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
