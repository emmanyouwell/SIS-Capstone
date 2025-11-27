import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoCard from '../../components/InfoCard';
import styles from './StudentDashboard.module.css';

const calendarIcon = (
  <svg width="32" height="32" fill="none" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const viewedIcon = (
  <svg width="32" height="32" fill="none" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/>
  </svg>
);

const unreadIcon = (
  <svg width="32" height="32" fill="none" stroke="#276749" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/>
  </svg>
);

// Announcements data
const announcements = [
  {
    id: 1,
    subject: "School Reopening",
    date: "August 1, 2025",
    sender: "Admin",
    recipient: "All",
    message: "Ang Sto. Niño National High School ay magsasagawa ng Early Registration simula Enero 25, 2025 hanggang Pebrero 28, 2025.\n\nMagtungo lamang sa paaralan at dalhin ang mga sumusunod na REQUIREMENTS:\n✅ PSA BIRTH CERTIFICATE (PHOTOCOPY)\n✅ COPY OF SF9 O REPORT CARD (LATEST)\n✅ BALLPEN\nPara sa pagpaparehistro:\n1. Dalhin ang mga requirement sa araw ng pagpapatala.\n2. Hanapin lamang ang mga naka-assign na focal person para maipasa ang inyong mga requirement at para makapagpatala.\n\nFocal Persons:\nMorning:\nMr. Dunstan Glorioso\nMrs. Glaiza Madridano\nAfternoon:\nMrs. Pia Shodhnani\nMr. Rolando Gading\n#EngagingtheHeartof21stCenturyLearners",
    image: ""
  },
  {
    id: 2,
    subject: "Official List of Grade 7 Students",
    date: "June 1, 2025",
    sender: "Admin",
    recipient: "All",
    message: "Official List of Grade 7 Students",
    image: "/images/mamamo.png"
  },
  {
    id: 3,
    subject: "IMPORTANT",
    date: "June 1, 2025",
    sender: "Sir JP",
    recipient: "All",
    message: "Greetings, Admin! I have a student named James Trio. He said he already passed the soft copy of his form 138. Can you please check whether he passed it already?"
  }
];

function StudentDashboard() {
  const navigate = useNavigate();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
    setOpenDropdown(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnnouncement(null);
  };

  const handleToggleDropdown = (id, e) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleViewClick = (announcement, e) => {
    e.stopPropagation();
    handleViewAnnouncement(announcement);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.dropdownContainer}`)) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleModalClick = (e) => {
      if (e.target.classList.contains(styles.modal)) {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('click', handleModalClick);
      return () => document.removeEventListener('click', handleModalClick);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  return (
    <>
    <div className={styles.mainContent}>
        <div style={{ flex: 2, minWidth: 0 }}>
          <h1>Announcements</h1>
          <div className={styles.profileBox}>
            <div className={styles.greeting}>Welcome, Kiana Mae</div>
            <button onClick={() => navigate('/student/profile')}>View Profile</button>
          </div>
          <div className={styles.infoCards}>
            <InfoCard icon={calendarIcon} title="Events" number="0" subtext="Upcoming" />
            <InfoCard icon={viewedIcon} title="Viewed" number="1" subtext="Today" />
            <InfoCard icon={unreadIcon} title="Unread" number="4" subtext="Messages" />
          </div>
          <div className={styles.announcementsList}>
            {announcements.map((announcement) => (
              <div key={announcement.id} className={styles.announcementCard}>
                <div className={styles.announcementHeader}>
                  <div>
                    <div className={styles.announcementSubject}>{announcement.subject}</div>
                    <div className={styles.announcementDate}>{announcement.date}</div>
                    <div className={styles.announcementSender}>From: {announcement.sender}</div>
                  </div>
                  <div className={styles.dropdownContainer}>
                    <button
                      type="button"
                      className={styles.dotsBtn}
                      aria-label="More options"
                      onClick={(e) => handleToggleDropdown(announcement.id, e)}
                    >
                      ⋮
                    </button>
                    {openDropdown === announcement.id && (
                      <div className={styles.dropdownMenu}>
                        <button
                          type="button"
                          className={styles.viewBtn}
                          onClick={(e) => handleViewClick(announcement, e)}
                        >
                          View
                        </button>
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
                  {announcement.message.length > 25
                    ? announcement.message.substring(0, 25) + ' See more...'
                    : announcement.message}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* LOCATION Card */}
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
          {/* MISSION Card */}
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
          {/* VISION Card */}
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
        <div className={`${styles.modal} ${styles.show}`} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={handleCloseModal}>&times;</button>
            <h3>Announcement Details</h3>
            <div className={styles.viewAnnouncementDetails}>
              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Subject:</span>
                <span>{selectedAnnouncement.subject}</span>
              </div>
              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Date:</span>
                <span>{selectedAnnouncement.date}</span>
              </div>
              <div className={styles.viewRow}>
                <span className={styles.viewLabel}>Message:</span>
                <span className={styles.viewMessage}>{selectedAnnouncement.message}</span>
              </div>
              {selectedAnnouncement.image && (
                <div className={styles.viewImageRow}>
                  <span className={styles.viewLabel}>Image:</span>
                  <img src={selectedAnnouncement.image} alt="Announcement" />
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
