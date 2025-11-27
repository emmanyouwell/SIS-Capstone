import { useState } from 'react';
import InfoCard from '../../components/InfoCard';
import styles from './AdminAnnouncements.module.css';

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
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      subject: "School Reopening",
      date: "August 1, 2025",
      sender: "Admin",
      message: "BANTOT",
      image: "",
      pinned: true,
      type: "general"
    },
    {
      id: 2,
      subject: "New Classroom Assignm",
      date: "June 1, 2025",
      sender: "Sir Hermie",
      message: "Good day, Admin! Just wanted to ask if the subject materials for my ESP class for grade 7 has been uploaded? I apologize I can't see it on my end.",
      image: "",
      pinned: false,
      type: "message"
    },
    {
      id: 3,
      subject: "IMPORTANT",
      date: "June 1, 2025",
      sender: "Sir JP",
      message: "Greetings, Admin! I have a student named James Trio. He said he already passed the soft copy of his form 138. Can you please check whether he passed it already?",
      image: "",
      pinned: false,
      type: "message"
    }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    recipient: '',
    message: '',
    image: null
  });

  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    const newAnnouncement = {
      id: announcements.length + 1,
      subject: formData.subject,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      sender: "Admin",
      message: formData.message,
      image: formData.image ? URL.createObjectURL(formData.image) : "",
      pinned: false,
      type: "general"
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setFormData({ subject: '', recipient: '', message: '', image: null });
    setShowAddModal(false);
  };

  const handleView = (announcement) => {
    setViewingAnnouncement(announcement);
    setShowViewEditModal(true);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      subject: announcement.subject,
      recipient: '',
      message: announcement.message,
      image: null
    });
    setShowViewEditModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setAnnouncements(announcements.map(a =>
      a.id === editingAnnouncement.id
        ? { ...a, subject: formData.subject, message: formData.message }
        : a
    ));
    setEditingAnnouncement(null);
    setShowViewEditModal(false);
    setFormData({ subject: '', recipient: '', message: '', image: null });
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
          <div className={styles.announcementsList}>
            {announcements.map((announcement) => (
              <div key={announcement.id} className={`${styles.announcementCard} ${announcement.pinned ? styles.pinned : ''}`}>
                <div className={styles.announcementIcons}>
                  {announcement.pinned && (
                    <span className={styles.cardPin}>
                      <svg width="28" height="28" fill="none" stroke="#f6c23e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M17 3a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2l-7 7v5a1 1 0 0 1-2 0v-5l-7-7a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2h8z" />
                      </svg>
                    </span>
                  )}
                  <span className={styles.cardBell}>
                    <svg width="28" height="28" fill="none" stroke="#f6c23e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </span>
                </div>
                <div className={styles.announcementHeader}>
                  <div>
                    <div className={styles.announcementSubject}>Subject: {announcement.subject}</div>
                    <div className={styles.announcementDate}>{announcement.date}</div>
                    <div className={styles.announcementSender}>From: {announcement.sender}</div>
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
                      <button type="button" onClick={() => handleDelete(announcement.id)}>Delete</button>
                    </div>
                  </div>
                </div>
                <div className={styles.announcementMeta}>
                  <span className={`${styles.announcementType} ${styles[announcement.type]}`}>
                    {announcement.type === 'general' ? 'General' : 'Message'}
                  </span>
                  <span className={styles.announcementSender}>{announcement.sender}</span>
                </div>
                <div className={styles.announcementMessage}>{announcement.message}</div>
              </div>
            ))}
          </div>
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
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
              <label htmlFor="recipient">To / Year Level</label>
              <select
                id="recipient"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                required
              >
                <option value="">Select Year Level and Section</option>
                <option value="All">All</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
              </select>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                rows="4"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              ></textarea>
              <label htmlFor="image">Image (optional)</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
              />
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
                <label htmlFor="edit-subject">Subject</label>
                <input
                  type="text"
                  id="edit-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
                <label htmlFor="edit-date">Date</label>
                <input
                  type="text"
                  id="edit-date"
                  value={editingAnnouncement.date}
                  readOnly
                />
                <label htmlFor="edit-message">Message</label>
                <textarea
                  id="edit-message"
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
                  <span className={styles.viewLabel}>Subject:</span> <span>{viewingAnnouncement.subject}</span>
                </div>
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Date:</span> <span>{viewingAnnouncement.date}</span>
                </div>
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Message:</span> <span>{viewingAnnouncement.message}</span>
                </div>
                {viewingAnnouncement.image && (
                  <div className={styles.viewRow}>
                    <span className={styles.viewLabel}>Image:</span><br />
                    <img src={viewingAnnouncement.image} alt="Announcement" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '0.5rem' }} />
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>);
}

export default AdminAnnouncements;

