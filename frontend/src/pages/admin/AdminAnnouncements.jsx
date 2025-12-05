import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InfoCard from '../../components/InfoCard';
import styles from './AdminAnnouncements.module.css';
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  clearError,
} from '../../store/slices/announcementSlice';

const calendarIcon = (
  <svg width="32" height="32" fill="none" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const viewedIcon = (
  <svg width="32" height="32" fill="none" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="5" width="18" height="14" rx="2" /><polyline points="3 7 12 13 21 7" />
  </svg>
);

const unreadIcon = (
  <svg width="32" height="32" fill="none" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="5" width="18" height="14" rx="2" /><polyline points="3 7 12 13 21 7" />
  </svg>
);

function AdminAnnouncements() {
  const dispatch = useDispatch();
  const { announcements, loading, error } = useSelector((state) => state.announcements);
  const { user } = useSelector((state) => state.auth);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    audience: 'All',
    content: '',
  });

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        createAnnouncement({
          title: formData.title,
          content: formData.content,
          audience: formData.audience,
        })
      ).unwrap();
      setFormData({ title: '', audience: 'All', content: '' });
      setShowAddModal(false);
    } catch (err) {
      alert(err || 'Failed to create announcement');
    }
  };

  const handleView = (announcement) => {
    setViewingAnnouncement(announcement);
    setShowViewEditModal(true);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      audience: announcement.audience,
      content: announcement.content,
    });
    setShowViewEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await dispatch(deleteAnnouncement(id)).unwrap();
      } catch (err) {
        alert(err || 'Failed to delete announcement');
      }
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingAnnouncement) return;
    try {
      await dispatch(
        updateAnnouncement({
          id: editingAnnouncement._id,
          data: {
            title: formData.title,
            content: formData.content,
            audience: formData.audience,
          },
        })
      ).unwrap();
      setEditingAnnouncement(null);
      setShowViewEditModal(false);
      setFormData({ title: '', audience: 'All', content: '' });
    } catch (err) {
      alert(err || 'Failed to update announcement');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getPosterName = (postedBy) => {
    if (!postedBy) return 'Unknown';
    if (typeof postedBy === 'object') {
      return `${postedBy.firstName || ''} ${postedBy.lastName || ''}`.trim() || 'Admin';
    }
    return 'Admin';
  };

  return (
    <>
      <div className={styles.mainContent}>
        <div className={styles.announcementsLeft}>
          <div className={styles.announcementsHeader}>
            <h2>Announcements</h2>
          </div>
          <div className={styles.infoCards}>
            <InfoCard icon={calendarIcon} title="Events" number="0" subtext="Upcoming" />
            <InfoCard icon={viewedIcon} title="Viewed" number="27" subtext="Today" />
            <InfoCard icon={unreadIcon} title="Unread" number="6" subtext="Messages" />
          </div>
          <button
            className={styles.addAnnouncementBtn}
            onClick={() => setShowAddModal(true)}
          >
            Add Announcement
          </button>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading announcements...</div>
          ) : error ? (
            <div style={{ padding: '1rem', background: '#fee', color: '#c00', marginBottom: '1rem' }}>
              {error}
              <button onClick={() => dispatch(clearError())} style={{ marginLeft: '1rem' }}>
                Dismiss
              </button>
            </div>
          ) : (
            <div className={styles.announcementsList}>
              {announcements.map((announcement) => (
                <div key={announcement._id} className={styles.announcementCard}>
                  <div className={styles.announcementIcons}>
                    <span className={styles.cardBell}>
                      <svg width="28" height="28" fill="none" stroke="#f6c23e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    </span>
                  </div>
                  <div className={styles.announcementHeader}>
                    <div>
                      <div className={styles.announcementSubject}>Title: {announcement.title}</div>
                      <div className={styles.announcementDate}>{formatDate(announcement.datePosted)}</div>
                      <div className={styles.announcementSender}>From: {getPosterName(announcement.postedBy)}</div>
                      <div className={styles.announcementAudience}>To: {announcement.audience}</div>
                    </div>
                    <div className={styles.dropdownContainer}>
                      <button
                        type="button"
                        className={styles.dotsBtn}
                        onClick={(e) => {
                          const menu = e.target.nextElementSibling;
                          document.querySelectorAll(`.${styles.dropdownMenu}`).forEach(m => {
                            if (m !== menu) m.style.display = 'none';
                          });
                          menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                        }}
                      >
                        ⋮
                      </button>
                      <div className={styles.dropdownMenu} style={{ display: 'none' }}>
                        <button type="button" onClick={() => handleView(announcement)}>View</button>
                        <br />
                        <button type="button" onClick={() => handleEdit(announcement)}>Edit</button>
                        <br />
                        <button type="button" onClick={() => handleDelete(announcement._id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                  <div className={styles.announcementMeta}>
                    <span className={styles.announcementType}>
                      {announcement.audience}
                    </span>
                    <span className={styles.announcementSender}>{getPosterName(announcement.postedBy)}</span>
                  </div>
                  <div className={styles.announcementMessage}>{announcement.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.announcementsRight}>
          <div className={styles.locationCard}>
            <h3>LOCATION</h3>
            <div className={styles.mapContainer}>
              <iframe
                src="https://www.google.com/maps?q=Sto.+Ni%C3%B1o+National+High+School&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '240px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
          <div className={styles.missionCard}>
            <h3>MISSION</h3>
            <div className={styles.missionContent}>
              <p>To protect and promote the right of every Filipino to quality, equitable, culture-based, and complete basic education where:</p>
              <div><b>Students</b> learn in a child-friendly, gender-sensitive, safe, and motivating environment.</div>
              <div><b>Teachers</b> facilitate learning and constantly nurture every learner.</div>
              <div><b>Administrators and staff</b>, as stewards of the institution, ensure an enabling and supportive environment for effective learning to happen.</div>
              <div><b>Family, community, and other stakeholders</b> are actively engaged and share responsibility for developing life-long learners.</div>
            </div>
          </div>
          <div className={styles.visionCard}>
            <h3>VISION</h3>
            <div className={styles.visionContent}>
              We dream of Filipinos
              who passionately love their country
              and whose values and competencies
              enable them to realize their full potential
              and contribute meaningfully to building the nation.

              As a learner-centered public institution,
              the Department of Education
              continuously improves itself
              to better serve its stakeholders.
            </div>
          </div>
        </div>
      </div>

      {/* Add Announcement Modal */}
      {showAddModal && (
        <div className={styles.modal} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowAddModal(false)}>&times;</button>
            <h3>Add Announcement</h3>
            <form onSubmit={handleAddAnnouncement}>
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <label htmlFor="audience">Audience</label>
              <select
                id="audience"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                required
              >
                <option value="All">All</option>
                <option value="Students">Students</option>
                <option value="Teachers">Teachers</option>
                <option value="Admin">Admin</option>
              </select>
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                rows="4"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              ></textarea>
              <div className={styles.modalButtons}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View/Edit Modal */}
      {showViewEditModal && (
        <div className={styles.modal} onClick={() => {
          setShowViewEditModal(false);
          setViewingAnnouncement(null);
          setEditingAnnouncement(null);
        }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => {
              setShowViewEditModal(false);
              setViewingAnnouncement(null);
              setEditingAnnouncement(null);
            }}>&times;</button>
            <h3>{editingAnnouncement ? 'Edit Announcement' : 'Announcement Details'}</h3>
            {editingAnnouncement ? (
              <form onSubmit={handleSaveEdit}>
                <label htmlFor="edit-title">Title</label>
                <input
                  type="text"
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <label htmlFor="edit-audience">Audience</label>
                <select
                  id="edit-audience"
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  required
                >
                  <option value="All">All</option>
                  <option value="Students">Students</option>
                  <option value="Teachers">Teachers</option>
                  <option value="Admin">Admin</option>
                </select>
                <label htmlFor="edit-date">Date Posted</label>
                <input
                  type="text"
                  id="edit-date"
                  value={formatDate(editingAnnouncement.datePosted)}
                  readOnly
                />
                <label htmlFor="edit-content">Content</label>
                <textarea
                  id="edit-content"
                  rows="4"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                ></textarea>
                <div className={styles.modalButtons}>
                  <button type="button" className={styles.btnSecondary} onClick={() => {
                    setShowViewEditModal(false);
                    setEditingAnnouncement(null);
                  }}>Cancel</button>
                  <button type="submit" className={styles.btnPrimary}>Save</button>
                </div>
              </form>
            ) : viewingAnnouncement ? (
              <div className={styles.viewDetails}>
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Title:</span> <span>{viewingAnnouncement.title}</span>
                </div>
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Date Posted:</span> <span>{formatDate(viewingAnnouncement.datePosted)}</span>
                </div>
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Posted By:</span> <span>{getPosterName(viewingAnnouncement.postedBy)}</span>
                </div>
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Audience:</span> <span>{viewingAnnouncement.audience}</span>
                </div>
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Content:</span> <span>{viewingAnnouncement.content}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>);
}

export default AdminAnnouncements;

