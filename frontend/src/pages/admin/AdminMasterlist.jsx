import { useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './AdminMasterlist.module.css';
import {
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
} from '../../store/slices/sectionSlice';

function AdminMasterlist() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showSectionsModal, setShowSectionsModal] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const [sectionForm, setSectionForm] = useState(null);

  const { data: sections, loading: sectionsLoading } = useSelector((state) => state.section);

  // Fetch sections on mount
  useEffect(() => {
    dispatch(getAllSections());
  }, [dispatch]);

  // Group sections by grade
  const gradeSections = useMemo(() => {
    const grouped = { 7: [], 8: [], 9: [], 10: [] };
    sections.forEach((section) => {
      if (grouped[section.gradeLevel]) {
        grouped[section.gradeLevel].push(section.sectionName);
      }
    });
    // Sort each grade's sections
    Object.keys(grouped).forEach((grade) => {
      grouped[grade].sort();
    });
    return grouped;
  }, [sections]);

  const handleGradeClick = (grade) => {
    navigate(`/admin/masterlist/grade${grade}`);
  };

  const handleAssignTeacherClick = () => {
    navigate('/admin/masterlist/assign-teacher');
  };

  const handleAssignStudentClick = () => {
    navigate('/admin/masterlist/assign-student');
  };

  const handleEditSectionsClick = () => {
    setShowSectionsModal(true);
  };

  const closeSectionsModal = () => {
    setShowSectionsModal(false);
  };

  const openAddSectionForm = (grade) => {
    setSectionForm({
      mode: 'add',
      grade: parseInt(grade),
      value: '',
    });
  };

  const openEditSectionForm = (grade, sectionName) => {
    const section = sections.find((s) => s.gradeLevel === parseInt(grade) && s.sectionName === sectionName);
    if (section) {
      setSectionForm({
        mode: 'edit',
        grade: parseInt(grade),
        sectionId: section._id,
        value: section.sectionName,
      });
    }
  };

  const closeSectionForm = () => {
    setSectionForm(null);
  };

  const handleSectionFormChange = (value) => {
    setSectionForm((prev) => (prev ? { ...prev, value } : prev));
  };

  const handleSectionFormSubmit = async (event) => {
    event.preventDefault();
    if (!sectionForm) return;
    const trimmed = sectionForm.value.trim();
    if (!trimmed) return;

    try {
      if (sectionForm.mode === 'add') {
        await dispatch(
          createSection({
            sectionName: trimmed,
            gradeLevel: sectionForm.grade,
          })
        ).unwrap();
      } else if (sectionForm.mode === 'edit' && sectionForm.sectionId) {
        await dispatch(
          updateSection({
            id: sectionForm.sectionId,
            data: { sectionName: trimmed },
          })
        ).unwrap();
      }
      closeSectionForm();
    } catch (error) {
      alert(error || 'Failed to save section');
    }
  };

  const requestRemoveSection = (grade, sectionName) => {
    setPendingRemoval({
      grade,
      sectionName,
    });
  };

  const confirmRemoveSection = async () => {
    if (!pendingRemoval) return;
    const { grade, sectionName } = pendingRemoval;
    const section = sections.find((s) => s.gradeLevel === parseInt(grade) && s.sectionName === sectionName);
    if (section) {
      try {
        await dispatch(deleteSection(section._id)).unwrap();
        setPendingRemoval(null);
      } catch (error) {
        alert(error || 'Failed to delete section');
      }
    }
  };

  const cancelRemoveSection = () => {
    setPendingRemoval(null);
  };

  return (
    <div className={styles.mainContent}>
      <h2 className={styles.pageTitle}>Masterlist</h2>

      {/* Top Card: View & Edit Lists */}
      <div className={styles.topCard}>
        <div className={styles.topHeader}>View & Edit Lists</div>
        <div className={styles.gradeButtons}>
          <div className={styles.gradeButtonRow}>
            <button
              className={`${styles.gradeButton} ${styles.grade7}`}
              onClick={() => handleGradeClick(7)}
            >
              Grade 7
            </button>
            <button
              className={`${styles.gradeButton} ${styles.grade9}`}
              onClick={() => handleGradeClick(9)}
            >
              Grade 9
            </button>
          </div>
          <div className={styles.gradeButtonRow}>
            <button
              className={`${styles.gradeButton} ${styles.grade8}`}
              onClick={() => handleGradeClick(8)}
            >
              Grade 8
            </button>
            <button
              className={`${styles.gradeButton} ${styles.grade10}`}
              onClick={() => handleGradeClick(10)}
            >
              Grade 10
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Cards: Assign Teachers/Students/Sections */}
      <div className={styles.bottomCards}>
        <div className={styles.bottomCard}>
          <div className={styles.bottomTitle}>Assign Teachers</div>
          <div className={styles.bottomGreen}>
            <button className={styles.viewButton} onClick={handleAssignTeacherClick}>
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="21" y1="12" x2="17" y2="12" />
              </svg>
              View
            </button>
          </div>
        </div>
        <div className={styles.bottomCard}>
          <div className={styles.bottomTitle}>Assign Students</div>
          <div className={styles.bottomGreen}>
            <button className={styles.viewButton} onClick={handleAssignStudentClick}>
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="21" y1="12" x2="17" y2="12" />
              </svg>
              View
            </button>
          </div>
        </div>
        <div className={styles.bottomCard}>
          <div className={styles.bottomTitle}>Edit Sections</div>
          <div className={styles.bottomGreen}>
            <button className={styles.viewButton} onClick={handleEditSectionsClick}>
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <rect x="5" y="5" width="14" height="14" rx="3" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="12" y1="8" x2="12" y2="16" />
              </svg>
              View
            </button>
          </div>
        </div>
      </div>
      {showSectionsModal && (
        <div className={styles.modalOverlay} onClick={closeSectionsModal}>
          <div
            className={styles.sectionsModal}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className={styles.modalHeader}>
              <h3>Edit Sections</h3>
              <button className={styles.closeButton} onClick={closeSectionsModal}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              {[7, 8, 9, 10].map((grade) => (
                <div key={grade} className={styles.gradeSectionGroup}>
                  <div className={styles.gradeSectionHeader}>
                    <h4>Grade {grade}</h4>
                    <button
                      className={styles.addSectionButton}
                      onClick={() => openAddSectionForm(grade)}
                    >
                      <span>+</span> Add
                    </button>
                  </div>
                  <ul className={styles.sectionList}>
                    {gradeSections[grade].map((sectionName) => (
                      <li key={sectionName} className={styles.sectionListItem}>
                        <span>{sectionName}</span>
                        <div className={styles.sectionActions}>
                          <button
                            className={styles.actionButton}
                            onClick={() => openEditSectionForm(grade, sectionName)}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.actionButtonDanger}
                            onClick={() => requestRemoveSection(grade, sectionName)}
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {pendingRemoval && (
        <div className={styles.modalOverlay} onClick={cancelRemoveSection}>
          <div
            className={styles.confirmModal}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h4>Remove Section?</h4>
            <p>
              You are about to remove <strong>{pendingRemoval.sectionName}</strong> from Grade{' '}
              {pendingRemoval.grade}. This action cannot be undone.
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelButton} onClick={cancelRemoveSection}>
                Keep Section
              </button>
              <button className={styles.confirmButton} onClick={confirmRemoveSection}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      {sectionForm && (
        <div className={styles.modalOverlay} onClick={closeSectionForm}>
          <form
            className={styles.formModal}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSectionFormSubmit}
          >
            <h4>{sectionForm.mode === 'add' ? 'Add Section' : 'Edit Section'}</h4>
            <p>
              Grade {sectionForm.grade}{' '}
              {sectionForm.mode === 'add' ? 'will get a new section.' : 'section name can be updated.'}
            </p>
            <label htmlFor="sectionNameInput">Section Name</label>
            <input
              id="sectionNameInput"
              type="text"
              value={sectionForm.value}
              onChange={(e) => handleSectionFormChange(e.target.value)}
              placeholder="e.g., Lily"
            />
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelButton} onClick={closeSectionForm}>
                Cancel
              </button>
              <button type="submit" className={styles.primaryButton}>
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminMasterlist;

