import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './StudentMessageView.module.css';
import { fetchMessageById, deleteMessage } from '../../store/slices/messageSlice';

function StudentMessageView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedMessage, loading } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchMessageById(id));
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await dispatch(deleteMessage(id));
        navigate('/student/messages');
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
  };

  const handleBack = () => {
    navigate('/student/messages');
  };

  if (loading) {
    return (
      <div className={styles.mainContent}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading message...</div>
      </div>
    );
  }

  if (!selectedMessage) {
    return (
      <div className={styles.mainContent}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Message not found</div>
        <button onClick={handleBack} className={styles.backButton}>
          Back to Messages
        </button>
      </div>
    );
  }

  const sender = selectedMessage.senderId;
  const receiver = selectedMessage.receiverId;
  const isSentByMe = sender?._id?.toString() === user?.id?.toString();

  let displayName = 'Unknown';
  let displayRole = selectedMessage.senderRole;
  
  if (isSentByMe) {
    if (receiver) {
      displayName = `${receiver.firstName || ''} ${receiver.lastName || ''}`.trim();
    } else if (selectedMessage.receiverRole) {
      displayName = `All ${selectedMessage.receiverRole}s`;
    }
    displayRole = selectedMessage.receiverRole || 'All';
  } else {
    if (sender) {
      displayName = `${sender.firstName || ''} ${sender.lastName || ''}`.trim();
    }
  }

  const dateSent = selectedMessage.dateSent
    ? new Date(selectedMessage.dateSent).toLocaleString()
    : '';

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          ← Back to Messages
        </button>
        <h1>Message Details</h1>
      </div>

      <div className={styles.messageCard}>
        <div className={styles.messageHeader}>
          <div className={styles.messageInfo}>
            <div className={styles.messageSubject}>{selectedMessage.subject}</div>
            <div className={styles.messageMeta}>
              <span className={styles.messageFrom}>
                {isSentByMe ? 'To' : 'From'}: {displayName} ({displayRole})
              </span>
              <span className={styles.messageDate}>{dateSent}</span>
            </div>
          </div>
          {selectedMessage.senderId?._id?.toString() === user?.id?.toString() && (
            <button onClick={handleDelete} className={styles.deleteButton}>
              Delete
            </button>
          )}
        </div>

        <div className={styles.messageBody}>
          <div className={styles.messageText}>{selectedMessage.messageText}</div>
        </div>

        <div className={styles.messageFooter}>
          <div className={styles.messageStatus}>
            Status: <span className={styles.statusBadge}>{selectedMessage.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentMessageView;

