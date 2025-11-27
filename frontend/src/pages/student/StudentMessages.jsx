import { useState } from 'react';
import styles from './StudentMessages.module.css';

function StudentMessages() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    message: '',
  });

  // Sample message data
  const messages = [
    {
      id: 1,
      name: 'Teacher 1',
      avatar: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png',
      message: 'Good morning! I wanted to remind you about the upcoming project submission...',
      time: '2h ago',
    },
    {
      id: 2,
      name: 'Admin',
      avatar: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png',
      message: 'Hello! Please check the recent announcement regarding the upcoming event...',
      time: '3h ago',
    },
    {
      id: 3,
      name: 'Teacher 2',
      avatar: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png',
      message: 'Good afternoon! Can you please submit your homework by tomorrow...',
      time: '5h ago',
    },
    {
      id: 4,
      name: 'Admin',
      avatar: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png',
      message: 'Reminder: The enrollment period is now open. Please complete your enrollment...',
      time: '6h ago',
    },
    {
      id: 5,
      name: 'Teacher 1',
      avatar: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png',
      message: 'Great work on your recent assignment! Keep up the excellent progress...',
      time: '8h ago',
    },
  ];

  // Statistics
  const stats = {
    sent: 12,
    trash: 2,
    viewed: 13,
    unread: 9,
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ recipient: '', subject: '', message: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call here to send message
    console.log('Sending message:', formData);
    handleCloseModal();
    // Show success message or update UI
  };

  const handleModalClick = (e) => {
    if (e.target.id === 'write-message-modal') {
      handleCloseModal();
    }
  };

  return (
    <>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Messages</h1>
        </div>

        <div className={styles.profileCard}>
          <div className={styles.profileInfo}>
            <img
              src="https://cdn-icons-png.flaticon.com/128/3135/3135715.png"
              alt="Profile Picture"
              className={styles.profilePic}
            />
            <h2>Kiana Mae Alvarez</h2>
            <button
              className={styles.writeMessageBtn}
              onClick={handleOpenModal}
            >
              Write a message
            </button>
          </div>

          <div className={styles.messageStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📤</div>
              <div className={styles.statNumber}>{stats.sent}</div>
              <div className={styles.statLabel}>Sent</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🗑️</div>
              <div className={styles.statNumber}>{stats.trash}</div>
              <div className={styles.statLabel}>Trash</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👁️</div>
              <div className={styles.statNumber}>{stats.viewed}</div>
              <div className={styles.statLabel}>Viewed</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📬</div>
              <div className={styles.statNumber}>{stats.unread}</div>
              <div className={styles.statLabel}>Unread</div>
            </div>
          </div>
        </div>

        <div className={styles.messagesContainer}>
          <div className={styles.messagesHeader}>
            <div className={styles.messagesTitle}>Messages</div>
            <div className={styles.messagesSort}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="unread">Unread</option>
              </select>
            </div>
          </div>

          <div className={styles.messagesList}>
            {messages.map((msg) => (
              <div key={msg.id} className={styles.messageItem}>
                <img
                  src={msg.avatar}
                  alt="Avatar"
                  className={styles.studentAvatar}
                />
                <div className={styles.messageContent}>
                  <div className={styles.messageHeader}>
                    <div className={styles.studentName}>{msg.name}</div>
                    <div className={styles.messageTime}>{msg.time}</div>
                  </div>
                  <div className={styles.messageText}>{msg.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write Message Modal */}
      {isModalOpen && (
        <div
          id="write-message-modal"
          className={styles.modal}
          onClick={handleModalClick}
        >
          <div className={styles.modalContent}>
            <h3>New Message</h3>
            <form id="message-form" onSubmit={handleSubmit}>
              <label htmlFor="recipient">To:</label>
              <select
                id="recipient"
                name="recipient"
                value={formData.recipient}
                onChange={handleInputChange}
                required
              >
                <option value="">Select recipient...</option>
                <option value="admin">Administrator</option>
                <option value="teacher-1">Teacher 1</option>
                <option value="teacher-2">Teacher 2</option>
                <option value="teacher-3">Teacher 3</option>
                <option value="class-adviser">Class Adviser</option>
              </select>

              <label htmlFor="subject">Subject:</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                placeholder="Enter subject"
              />

              <label htmlFor="message">Message:</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleInputChange}
                required
                placeholder="Type your message here..."
              />

              <div className={styles.modalButtons}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default StudentMessages;

