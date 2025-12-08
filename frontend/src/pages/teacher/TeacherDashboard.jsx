import { useState, useRef, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InfoCard from '../../components/InfoCard';
import styles from './TeacherDashboard.module.css';
import ConfirmationModal from '../../components/ConfirmationModal';
import { fetchAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../store/slices/announcementSlice';
import { fetchAllMessages } from '../../store/slices/messageSlice';
import { getAllSections } from '../../store/slices/sectionSlice';

const announcementIcon = (
  <svg width="32" height="32" fill="none" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
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

function TeacherDashboard() {
  const dispatch = useDispatch();
  const { announcements, loading: announcementsLoading, error: announcementsError } = useSelector((state) => state.announcements);
  const { messages, loading: messagesLoading } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);
  const sections = useSelector((state) => state.section.data);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    audience: 'All',
    content: '',
  });
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRefs = useRef({});

  // Fetch announcements, messages, and sections on component mount
  useEffect(() => {
    dispatch(fetchAnnouncements());
    dispatch(fetchAllMessages());
    dispatch(getAllSections({ status: 'Active' }));
  }, [dispatch]);

  // Calculate statistics
  const stats = useMemo(() => {
    // Count announcements
    const announcementCount = announcements.length;

    // Filter messages relevant to the current user
    const userMessages = messages.filter((msg) => {
      const isSender = msg.senderId?._id?.toString() === user?.id?.toString();
      const isReceiver = msg.receiverId?._id?.toString() === user?.id?.toString();
      const isRoleReceiver = msg.receiverRole === user?.role || msg.receiverRole === 'All';
      return (isSender || isReceiver || isRoleReceiver) && msg.status !== 'deleted';
    });

    // Count read messages (viewed)
    const readCount = userMessages.filter((m) => m.status === 'read').length;

    // Count unread messages
    const unreadCount = userMessages.filter((m) => m.status === 'sent').length;

    return {
      announcements: announcementCount,
      viewed: readCount,
      unread: unreadCount,
    };
  }, [announcements, messages, user]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get poster name helper
  const getPosterName = (postedBy) => {
    if (!postedBy) return 'Unknown';
    if (typeof postedBy === 'object') {
      return `${postedBy.firstName || ''} ${postedBy.lastName || ''}`.trim() || 'Admin';
    }
    return 'Admin';
  };

  // Group sections by grade level - only include sections from database
  const sectionsByGrade = useMemo(() => {
    const grouped = {};
    // Filter to only include sections that exist in the database and have required fields
    sections
      .filter((section) => 
        section && 
        section.gradeLevel && 
        section.sectionName && 
        (section.status === 'Active' || !section.status) // Include Active sections or sections without status
      )
      .forEach((section) => {
        const grade = section.gradeLevel;
        if (!grouped[grade]) {
          grouped[grade] = [];
        }
        grouped[grade].push(section);
      });
    // Sort sections within each grade
    Object.keys(grouped).forEach((grade) => {
      grouped[grade].sort((a, b) => a.sectionName.localeCompare(b.sectionName));
    });
    return grouped;
  }, [sections]);

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      // If audience is a grade-section format, use "Specific" as the audience value
      let audienceValue = formData.audience;
      
      if (formData.audience.startsWith('Grade ')) {
        audienceValue = 'Specific';
      }

      await dispatch(
        createAnnouncement({
          title: formData.title,
          content: formData.content,
          audience: audienceValue,
        })
      ).unwrap();
      setFormData({ title: '', audience: 'All', content: '' });
      setShowAddModal(false);
      // Refresh announcements list
      dispatch(fetchAnnouncements());
    } catch (error) {
      console.error('Failed to create announcement:', error);
      // You could add error handling UI here if needed
    }
  };

  const handleView = (announcement) => {
    setViewingAnnouncement(announcement);
    setEditingAnnouncement(null);
    setShowViewEditModal(true);
    setDropdownOpen(null);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setViewingAnnouncement(null);
    setFormData({
      title: announcement.title || '',
      audience: announcement.audience || 'All',
      content: announcement.content || '',
    });
    setShowViewEditModal(true);
    setDropdownOpen(null);
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setShowConfirmModal(true);
    setDropdownOpen(null);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await dispatch(deleteAnnouncement(deleteTargetId)).unwrap();
      setShowConfirmModal(false);
      setDeleteTargetId(null);
      // Refresh announcements list
      dispatch(fetchAnnouncements());
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      setShowConfirmModal(false);
      setDeleteTargetId(null);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingAnnouncement) return;
    try {
      // If audience is a grade-section format, use "Specific" as the audience value
      let audienceValue = formData.audience;
      
      if (formData.audience.startsWith('Grade ')) {
        audienceValue = 'Specific';
      }

      await dispatch(
        updateAnnouncement({
          id: editingAnnouncement._id,
          data: {
            title: formData.title,
            content: formData.content,
            audience: audienceValue,
          },
        })
      ).unwrap();
      setEditingAnnouncement(null);
      setShowViewEditModal(false);
      setFormData({ title: '', audience: 'All', content: '' });
      // Refresh announcements list
      dispatch(fetchAnnouncements());
    } catch (error) {
      console.error('Failed to update announcement:', error);
    }
  };

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && dropdownRefs.current[dropdownOpen] && !dropdownRefs.current[dropdownOpen].contains(event.target)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const canEditDelete = (announcement) => {
    if (!announcement.postedBy || !user) return false;
    const posterId = typeof announcement.postedBy === 'object' 
      ? announcement.postedBy._id?.toString() 
      : announcement.postedBy.toString();
    return posterId === user.id?.toString();
  };

  return (
    <>
      <div className={styles.mainContent}>
        <div className={styles.announcementsLeft}>
          <div className={styles.announcementsHeader}>
            <h2>Announcements</h2>
          </div>
          <div className={styles.infoCards}>
            <InfoCard icon={announcementIcon} title="Announcements" number={stats.announcements.toString()} subtext="Total" />
            <InfoCard icon={viewedIcon} title="Viewed" number={stats.viewed.toString()} subtext="Read Messages" />
            <InfoCard icon={unreadIcon} title="Unread" number={stats.unread.toString()} subtext="Messages" />
          </div>
          <button
            className={styles.addAnnouncementBtn}
            onClick={() => setShowAddModal(true)}
          >
            Add Announcement
          </button>
          <div className={styles.announcementsList}>
            {announcementsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading announcements...</div>
            ) : announcements.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>No announcements available</div>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement._id} className={styles.announcementCard}>
                  <div className={styles.announcementHeader}>
                    <div>
                      <div className={styles.announcementSubject}>{announcement.title}</div>
                      <div className={styles.announcementDate}>{formatDate(announcement.datePosted)}</div>
                      <div className={styles.announcementSender}>From: {getPosterName(announcement.postedBy)}</div>
                      <div className={styles.announcementSender}>To: {announcement.audience}</div>
                    </div>
                    <div className={styles.dropdownContainer} ref={el => dropdownRefs.current[announcement._id] = el}>
                      <button
                        type="button"
                        className={styles.dotsBtn}
                        onClick={() => toggleDropdown(announcement._id)}
                        aria-label="More options"
                      >
                        ⋮
                      </button>
                      {dropdownOpen === announcement._id && (
                        <div className={styles.dropdownMenu}>
                          <button type="button" onClick={() => handleView(announcement)}>View</button>
                          {canEditDelete(announcement) && (
                            <>
                              <button type="button" onClick={() => handleEdit(announcement)}>Edit</button>
                              <button type="button" onClick={() => handleDeleteClick(announcement._id)}>Delete</button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.announcementMessage}>
                    {announcement.content.length > 100 
                      ? announcement.content.substring(0, 100) + '...' 
                      : announcement.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className={styles.announcementsRight}>
          <div className={styles.locationCard} tabIndex="0">
            <h3>LOCATION</h3>
            <div className={styles.mapContainer}>
              <iframe
                src="https://www.google.com/maps?q=Sto.+Ni%C3%B1o+National+High+School&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '8px', minHeight: '240px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
          <div className={styles.missionCard} tabIndex="0">
            <h3>MISSION</h3>
            <div className={styles.missionContent}>
              <p>To protect and promote the right of every Filipino to quality, equitable, culture-based, and complete basic education where:</p>
              <div><b>Students</b> learn in a child-friendly, gender-sensitive, safe, and motivating environment.</div>
              <div><b>Teachers</b> facilitate learning and constantly nurture every learner.</div>
              <div><b>Administrators and staff</b>, as stewards of the institution, ensure an enabling and supportive environment for effective learning to happen.</div>
              <div><b>Family, community, and other stakeholders</b> are actively engaged and share responsibility for developing life-long learners.</div>
            </div>
          </div>
          <div className={styles.visionCard} tabIndex="0">
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
              <label htmlFor="audience">To / Audience</label>
              <select
                id="audience"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                required
              >
                <option value="All">All</option>
                <option value="Students">All Students</option>
                <option value="Teachers">All Teachers</option>
                <option value="Admin">All Admins</option>
                {Object.keys(sectionsByGrade).length > 0 && (
                  <>
                    <option value="Specific">Specific Grade/Section</option>
                    {Object.keys(sectionsByGrade)
                      .sort((a, b) => parseInt(a) - parseInt(b))
                      .map((grade) => (
                        <optgroup key={grade} label={`Grade ${grade}`}>
                          {sectionsByGrade[grade].map((section) => (
                            <option key={section._id} value={`Grade ${grade} - ${section.sectionName}`}>
                              Grade {grade} - {section.sectionName}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                  </>
                )}
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
                <label htmlFor="edit-audience">To / Audience</label>
                <select
                  id="edit-audience"
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  required
                >
                  <option value="All">All</option>
                  <option value="Students">All Students</option>
                  <option value="Teachers">All Teachers</option>
                  <option value="Admin">All Admins</option>
                  {Object.keys(sectionsByGrade).length > 0 && (
                    <>
                      <option value="Specific">Specific Grade/Section</option>
                      {Object.keys(sectionsByGrade)
                        .sort((a, b) => parseInt(a) - parseInt(b))
                        .map((grade) => (
                          <optgroup key={grade} label={`Grade ${grade}`}>
                            {sectionsByGrade[grade].map((section) => (
                              <option key={section._id} value={`Grade ${grade} - ${section.sectionName}`}>
                                Grade {grade} - {section.sectionName}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                    </>
                  )}
                </select>
                <label htmlFor="edit-date">Date</label>
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
                  <span className={styles.viewLabel}>Content:</span> <span className={styles.viewMessage}>{viewingAnnouncement.content}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
      <ConfirmationModal
        show={showConfirmModal}
        title="Delete Announcement?"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowConfirmModal(false);
          setDeleteTargetId(null);
        }}
      />
    </>

  );
}

export default TeacherDashboard;

