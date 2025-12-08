import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import InfoCard from '../../components/InfoCard';
import styles from './StudentDashboard.module.css';
import { fetchAnnouncements } from '../../store/slices/announcementSlice';
import { fetchAllMessages } from '../../store/slices/messageSlice';

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

function StudentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { announcements, loading: announcementsLoading } = useSelector((state) => state.announcements);
  const { messages, loading: messagesLoading } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);

  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Fetch announcements and messages on component mount
  useEffect(() => {
    dispatch(fetchAnnouncements());
    dispatch(fetchAllMessages());
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

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'Student';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student';
  };

  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
    setOpenDropdown(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnnouncement(null);
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && dropdownRefs.current[openDropdown] && !dropdownRefs.current[openDropdown].contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  return (
    <>
      <div className={styles.mainContent}>
        <div className={styles.announcementsLeft}>
          <div className={styles.announcementsHeader}>
            <h2>Announcements</h2>
          </div>
          <div className={styles.profileBox}>
            <div className={styles.greeting}>Welcome, {getUserDisplayName()}</div>
            <button onClick={() => navigate('/student/profile')}>View Profile</button>
          </div>
          <div className={styles.infoCards}>
            <InfoCard icon={announcementIcon} title="Announcements" number={stats.announcements.toString()} subtext="Total" />
            <InfoCard icon={viewedIcon} title="Viewed" number={stats.viewed.toString()} subtext="Read Messages" />
            <InfoCard icon={unreadIcon} title="Unread" number={stats.unread.toString()} subtext="Messages" />
          </div>
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
                      {openDropdown === announcement._id && (
                        <div className={styles.dropdownMenu}>
                          <button type="button" onClick={() => handleViewAnnouncement(announcement)}>View</button>
                        </div>
                      )}
                    </div>
                  </div>
                  {announcement.image && (
                    <div className={styles.announcementImage}>
                      <img src={announcement.image} alt="Announcement" />
                    </div>
                  )}
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
                title="School Location"
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

      {/* Announcement View Modal */}
      {isModalOpen && selectedAnnouncement && (
        <div className={styles.modal} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={handleCloseModal}>&times;</button>
            <h3>Announcement Details</h3>
            <div className={styles.viewDetails}>
              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Title:</span> <span>{selectedAnnouncement.title}</span>
              </div>
              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Date Posted:</span> <span>{formatDate(selectedAnnouncement.datePosted)}</span>
              </div>
              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Posted By:</span> <span>{getPosterName(selectedAnnouncement.postedBy)}</span>
              </div>
              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Audience:</span> <span>{selectedAnnouncement.audience}</span>
              </div>
              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Content:</span> <span className={styles.viewMessage}>{selectedAnnouncement.content}</span>
              </div>
              {selectedAnnouncement.image && (
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Image:</span>
                  <img src={selectedAnnouncement.image} alt="Announcement" className={styles.viewImage} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StudentDashboard;
