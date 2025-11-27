import { useState } from 'react';
import styles from './TeacherMessage.module.css';

function TeacherMessage() {
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
      name: 'Erwin Acorda',
      avatar: 'https://cdn-icons-png.flaticon.com/128/1154/1154455.png',
      message: 'Hey Sir Hermie! When is the submission of our project?',
      time: '2h ago',
    },
    {
      id: 2,
      name: 'Andrew Spenser',
      avatar: 'https://cdn-icons-png.flaticon.com/128/1154/1154455.png',
      message: 'Please send me the class list. ASAP.',
      time: '3h ago',
    },
    {
      id: 3,
      name: 'Arthur Fleck',
      avatar: 'https://cdn-icons-png.flaticon.com/128/1154/1154455.png',
      message: 'Good Day Sir! Hope to see you around today :)',
      time: '5h ago',
    },
    {
      id: 4,
      name: 'Jessica Simpson',
      avatar: 'https://cdn-icons-png.flaticon.com/128/1154/1154455.png',
      message: 'Sir Hermie did you change our homework? Is this what you wrote on the board: [board_photo.jpg].',
      time: '6h ago',
    },
    {
      id: 5,
      name: 'Angela Spenser',
      avatar: 'https://cdn-icons-png.flaticon.com/128/1154/1154455.png',
      message: 'Sorry Sir, I cant come to school today, I\'m very sick :(',
      time: '8h ago',
    },
  ];

  // Statistics
  const stats = {
    sent: 0,
    trash: 2,
    viewed: 5,
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
            <h2>Angelica Nanas</h2>
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
                  alt="Student Avatar"
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
                <option value="all">All Students</option>
                <option value="8-lilac">Grade 8 - Lilac</option>
                <option value="8-tulip">Grade 8 - Tulip</option>
                <option value="9-daisy">Grade 9 - Daisy</option>
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

export default TeacherMessage;

