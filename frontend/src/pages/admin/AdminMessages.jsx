import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './AdminMessages.module.css';
import { fetchAllMessages, createMessage } from '../../store/slices/messageSlice';
import { fetchAllStudents } from '../../store/slices/studentSlice';
import { fetchAllTeachers } from '../../store/slices/teacherSlice';
import { fetchAllAdmins } from '../../store/slices/adminSlice';

function AdminMessages() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { messages, loading } = useSelector((state) => state.messages);
  const { students } = useSelector((state) => state.students);
  const { teachers } = useSelector((state) => state.teachers);
  const { admins } = useSelector((state) => state.admins);
  const { user } = useSelector((state) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    receiverId: '',
    receiverRole: '',
    subject: '',
    messageText: '',
  });

  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    dispatch(fetchAllMessages());
    dispatch(fetchAllStudents());
    dispatch(fetchAllTeachers());
    dispatch(fetchAllAdmins());
  }, [dispatch]);

  // Filter and format messages for display
  const formattedMessages = useMemo(() => {
    let filtered = messages.filter((msg) => {
      // Show messages where user is sender or receiver
      const isSender = msg.senderId?._id?.toString() === user?.id?.toString();
      const isReceiver = msg.receiverId?._id?.toString() === user?.id?.toString();
      const isRoleReceiver = msg.receiverRole === user?.role || msg.receiverRole === 'All';
      
      return (isSender || isReceiver || isRoleReceiver) && msg.status !== 'deleted';
    });

    // Apply sorting
    if (sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.dateSent) - new Date(a.dateSent));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.dateSent) - new Date(b.dateSent));
    } else if (sortBy === 'unread') {
      filtered = filtered.filter((msg) => msg.status === 'sent');
      filtered.sort((a, b) => new Date(b.dateSent) - new Date(a.dateSent));
    }

    return filtered.map((msg) => {
      const sender = msg.senderId;
      const receiver = msg.receiverId;
      const isSentByMe = sender?._id?.toString() === user?.id?.toString();
      
      // Determine display name
      let displayName = 'Unknown';
      if (isSentByMe) {
        // If I sent it, show receiver name
        if (receiver) {
          displayName = `${receiver.firstName || ''} ${receiver.lastName || ''}`.trim();
        } else if (msg.receiverRole) {
          displayName = `All ${msg.receiverRole}s`;
        }
      } else {
        // If someone sent it to me, show sender name
        if (sender) {
          displayName = `${sender.firstName || ''} ${sender.lastName || ''}`.trim();
        }
      }

      const timeAgo = msg.dateSent ? new Date(msg.dateSent).toLocaleString() : '';
      
      return {
        id: msg._id,
        name: displayName,
        avatar: 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png',
        message: msg.messageText?.substring(0, 50) + (msg.messageText?.length > 50 ? '...' : '') || '',
        time: timeAgo,
        status: msg.status,
        senderRole: msg.senderRole,
        subject: msg.subject,
        fullMessage: msg,
      };
    });
  }, [messages, user, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const userMessages = messages.filter((msg) => {
      const isSender = msg.senderId?._id?.toString() === user?.id?.toString();
      const isReceiver = msg.receiverId?._id?.toString() === user?.id?.toString();
      const isRoleReceiver = msg.receiverRole === user?.role || msg.receiverRole === 'All';
      return (isSender || isReceiver || isRoleReceiver) && msg.status !== 'deleted';
    });

    return {
      sent: userMessages.filter((m) => m.senderId?._id?.toString() === user?.id?.toString()).length,
      trash: messages.filter((m) => m.status === 'deleted').length,
      viewed: userMessages.filter((m) => m.status === 'read').length,
      unread: userMessages.filter((m) => m.status === 'sent').length,
    };
  }, [messages, user]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ receiverId: '', receiverRole: '', subject: '', messageText: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const messageData = {
        receiverId: formData.receiverId || undefined,
        receiverRole: formData.receiverRole || undefined,
        subject: formData.subject,
        messageText: formData.messageText
      };

      await dispatch(createMessage(messageData));
      await dispatch(fetchAllMessages()); // Refresh messages
      handleCloseModal();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleModalClick = (e) => {
    if (e.target.id === 'write-message-modal') {
      handleCloseModal();
    }
  };

  const handleMessageClick = (messageId) => {
    navigate(`/admin/message/${messageId}`);
  };

  return (
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
          <h2>{user?.firstName} {user?.lastName}</h2>
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
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading messages...</div>
          ) : formattedMessages.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>No messages</div>
          ) : (
            formattedMessages.map((msg) => (
              <div
                key={msg.id}
                className={styles.messageItem}
                onClick={() => handleMessageClick(msg.id)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={msg.avatar}
                  alt="Avatar"
                  className={styles.studentAvatar}
                />
                <div className={styles.messageContent}>
                  <div className={styles.messageHeader}>
                    <div className={styles.studentName}>
                      {msg.name} ({msg.senderRole}) {msg.status === 'sent' && <span style={{ color: '#4c7a67', fontSize: '0.75rem' }}>(Unread)</span>}
                    </div>
                    <div className={styles.messageTime}>{msg.time}</div>
                  </div>
                  <div className={styles.messageText}>
                    <strong>{msg.subject}:</strong> {msg.message}
                  </div>
                </div>
              </div>
            ))
          )}
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
              <label htmlFor="receiverRole">To (Role):</label>
              <select
                id="receiverRole"
                name="receiverRole"
                value={formData.receiverRole}
                onChange={handleInputChange}
                required
              >
                <option value="">Select recipient type...</option>
                <option value="All">All Users</option>
                <option value="Student">All Students</option>
                <option value="Teacher">All Teachers</option>
                <option value="Admin">All Admins</option>
              </select>

              <label htmlFor="receiverId">To (Specific User - Optional):</label>
              <select
                id="receiverId"
                name="receiverId"
                value={formData.receiverId}
                onChange={handleInputChange}
              >
                <option value="">Select specific user (optional)...</option>
                {students.map((student) => (
                  <option key={student._id} value={student.userId?._id}>
                    {student.userId?.firstName} {student.userId?.lastName} (Student)
                  </option>
                ))}
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher.userId?._id}>
                    {teacher.userId?.firstName} {teacher.userId?.lastName} (Teacher)
                  </option>
                ))}
                {admins.map((admin) => (
                  <option key={admin._id} value={admin.userId?._id}>
                    {admin.userId?.firstName} {admin.userId?.lastName} (Admin)
                  </option>
                ))}
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

              <label htmlFor="messageText">Message:</label>
              <textarea
                id="messageText"
                name="messageText"
                rows="5"
                value={formData.messageText}
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
    </div>
  );
}

export default AdminMessages;

