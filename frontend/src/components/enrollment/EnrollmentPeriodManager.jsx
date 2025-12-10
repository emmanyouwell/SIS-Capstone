import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCurrentEnrollmentPeriod,
  fetchAllEnrollmentPeriods,
  createEnrollmentPeriod,
  updateEnrollmentPeriod,
  clearError,
} from '../../store/slices/enrollmentPeriodSlice';
import MessageModal from '../MessageModal';
import styles from './EnrollmentPeriodManager.module.css';

function EnrollmentPeriodManager() {
  const dispatch = useDispatch();
  const { currentPeriod, isPeriodActive, periods, loading, error } = useSelector(
    (state) => state.enrollmentPeriod
  );

  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({ type: 'info', message: '' });
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    schoolYear: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    dispatch(fetchCurrentEnrollmentPeriod());
    dispatch(fetchAllEnrollmentPeriods());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreatePeriod = async (e) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate) {
      setMessageModalContent({
        type: 'error',
        message: 'Start date and end date are required.',
      });
      setShowMessageModal(true);
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (start >= end) {
      setMessageModalContent({
        type: 'error',
        message: 'End date must be after start date.',
      });
      setShowMessageModal(true);
      return;
    }

    try {
      const result = await dispatch(createEnrollmentPeriod(formData));
      if (createEnrollmentPeriod.fulfilled.match(result)) {
        setMessageModalContent({
          type: 'success',
          message: 'Enrollment period created successfully!',
        });
        setShowMessageModal(true);
        setShowForm(false);
        setFormData({
          startDate: '',
          endDate: '',
          schoolYear: '',
          description: '',
          isActive: true,
        });
        dispatch(fetchCurrentEnrollmentPeriod());
        dispatch(fetchAllEnrollmentPeriods());
      } else {
        setMessageModalContent({
          type: 'error',
          message: result.payload || 'Failed to create enrollment period.',
        });
        setShowMessageModal(true);
      }
    } catch (error) {
      setMessageModalContent({
        type: 'error',
        message: 'Failed to create enrollment period. Please try again.',
      });
      setShowMessageModal(true);
    }
  };

  const handleEditPeriod = (period) => {
    setSelectedPeriod(period);
    setFormData({
      startDate: period.startDate ? new Date(period.startDate).toISOString().split('T')[0] : '',
      endDate: period.endDate ? new Date(period.endDate).toISOString().split('T')[0] : '',
      schoolYear: period.schoolYear || '',
      description: period.description || '',
      isActive: period.isActive !== undefined ? period.isActive : true,
    });
    setShowEditForm(true);
  };

  const handleUpdatePeriod = async (e) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate) {
      setMessageModalContent({
        type: 'error',
        message: 'Start date and end date are required.',
      });
      setShowMessageModal(true);
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (start >= end) {
      setMessageModalContent({
        type: 'error',
        message: 'End date must be after start date.',
      });
      setShowMessageModal(true);
      return;
    }

    try {
      const result = await dispatch(
        updateEnrollmentPeriod({ id: selectedPeriod._id, data: formData })
      );
      if (updateEnrollmentPeriod.fulfilled.match(result)) {
        setMessageModalContent({
          type: 'success',
          message: 'Enrollment period updated successfully!',
        });
        setShowMessageModal(true);
        setShowEditForm(false);
        setSelectedPeriod(null);
        setFormData({
          startDate: '',
          endDate: '',
          schoolYear: '',
          description: '',
          isActive: true,
        });
        dispatch(fetchCurrentEnrollmentPeriod());
        dispatch(fetchAllEnrollmentPeriods());
      } else {
        setMessageModalContent({
          type: 'error',
          message: result.payload || 'Failed to update enrollment period.',
        });
        setShowMessageModal(true);
      }
    } catch (error) {
      setMessageModalContent({
        type: 'error',
        message: 'Failed to update enrollment period. Please try again.',
      });
      setShowMessageModal(true);
    }
  };

  const handleSetInactive = async (period) => {
    try {
      const result = await dispatch(
        updateEnrollmentPeriod({ id: period._id, data: { isActive: false } })
      );
      if (updateEnrollmentPeriod.fulfilled.match(result)) {
        setMessageModalContent({
          type: 'success',
          message: 'Enrollment period set to inactive successfully!',
        });
        setShowMessageModal(true);
        dispatch(fetchCurrentEnrollmentPeriod());
        dispatch(fetchAllEnrollmentPeriods());
      } else {
        setMessageModalContent({
          type: 'error',
          message: result.payload || 'Failed to set enrollment period as inactive.',
        });
        setShowMessageModal(true);
      }
    } catch (error) {
      setMessageModalContent({
        type: 'error',
        message: 'Failed to set enrollment period as inactive. Please try again.',
      });
      setShowMessageModal(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isPeriodCurrentlyActive = (period) => {
    if (!period || !period.isActive) return false;
    const now = new Date();
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    return now >= start && now <= end;
  };

  return (
    <div className={styles.periodManager}>
      <div className={styles.periodManagerHeader}>
        <h3>Enrollment Period Management</h3>
        <button className={styles.newPeriodBtn} onClick={() => setShowForm(true)}>
          + New Enrollment Period
        </button>
      </div>

      {/* Current Period Status */}
      {currentPeriod && isPeriodActive ? (
        <div className={styles.currentPeriodCard}>
          <div className={styles.currentPeriodHeader}>
            <span className={styles.activeBadge}>ACTIVE</span>
            <h4>Current Enrollment Period</h4>
          </div>
          <div className={styles.currentPeriodInfo}>
            <div>
              <strong>Start Date:</strong> {formatDate(currentPeriod.startDate)}
            </div>
            <div>
              <strong>End Date:</strong> {formatDate(currentPeriod.endDate)}
            </div>
            {currentPeriod.schoolYear && (
              <div>
                <strong>School Year:</strong> {currentPeriod.schoolYear}
              </div>
            )}
            {currentPeriod.description && (
              <div>
                <strong>Description:</strong> {currentPeriod.description}
              </div>
            )}
          </div>
          <button
            className={styles.editPeriodBtn}
            onClick={() => handleEditPeriod(currentPeriod)}
          >
            Edit Period
          </button>
        </div>
      ) : (
        <div className={styles.noPeriodCard}>
          <p>No active enrollment period. Students cannot enroll through the portal.</p>
          <button className={styles.newPeriodBtn} onClick={() => setShowForm(true)}>
            Create Enrollment Period
          </button>
        </div>
      )}

      {/* Periods List */}
      {periods.length > 0 && (
        <div className={styles.periodsListCard}>
          <h4>All Enrollment Periods</h4>
          <div className={styles.periodsList}>
            {periods.map((period) => (
              <div key={period._id} className={styles.periodItem}>
                <div className={styles.periodItemInfo}>
                  <div className={styles.periodItemHeader}>
                    <span>
                      {formatDate(period.startDate)} - {formatDate(period.endDate)}
                    </span>
                    <div className={styles.periodItemBadges}>
                      {isPeriodCurrentlyActive(period) && (
                        <span className={styles.activeBadgeSmall}>Active</span>
                      )}
                      {period.isActive && !isPeriodCurrentlyActive(period) && (
                        <span className={styles.inactiveBadgeSmall}>Scheduled</span>
                      )}
                      {!period.isActive && (
                        <span className={styles.disabledBadgeSmall}>Inactive</span>
                      )}
                    </div>
                  </div>
                  {period.schoolYear && (
                    <div className={styles.periodItemMeta}>School Year: {period.schoolYear}</div>
                  )}
                  {period.description && (
                    <div className={styles.periodItemMeta}>{period.description}</div>
                  )}
                </div>
                <div className={styles.periodItemActions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEditPeriod(period)}
                  >
                    Edit
                  </button>
                  {period.isActive && (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleSetInactive(period)}
                    >
                      Set Inactive
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowForm(false)}>
              &times;
            </button>
            <h3>Create Enrollment Period</h3>
            <form onSubmit={handleCreatePeriod}>
              <div className={styles.formGroup}>
                <label>Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>School Year</label>
                <input
                  type="text"
                  name="schoolYear"
                  value={formData.schoolYear}
                  onChange={handleInputChange}
                  placeholder="e.g., 2024-2025"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Optional description"
                />
              </div>
              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {showEditForm && selectedPeriod && (
        <div className={styles.modalOverlay} onClick={() => setShowEditForm(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowEditForm(false)}>
              &times;
            </button>
            <h3>Edit Enrollment Period</h3>
            <form onSubmit={handleUpdatePeriod}>
              <div className={styles.formGroup}>
                <label>Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>School Year</label>
                <input
                  type="text"
                  name="schoolYear"
                  value={formData.schoolYear}
                  onChange={handleInputChange}
                  placeholder="e.g., 2024-2025"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Optional description"
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setSelectedPeriod(null);
                  }}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      <MessageModal
        show={showMessageModal}
        type={messageModalContent.type}
        message={messageModalContent.message}
        onClose={() => setShowMessageModal(false)}
      />
    </div>
  );
}

export default EnrollmentPeriodManager;


