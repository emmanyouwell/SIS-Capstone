import styles from './ConfirmationModal.module.css';

/**
 * Reusable message modal component for success/error/info messages
 * @param {boolean} show - Whether to show the modal
 * @param {string} type - Message type: 'success', 'error', 'info', or 'warning'
 * @param {string} title - Modal title (optional, defaults based on type)
 * @param {string} message - Modal message
 * @param {string} buttonText - Text for OK button (default: "OK")
 * @param {function} onClose - Callback when OK is clicked or modal is closed
 * @param {boolean} disabled - Whether button should be disabled
 */
function MessageModal({
  show,
  type = 'info',
  title,
  message,
  buttonText = 'OK',
  onClose,
  disabled = false,
}) {
  if (!show) return null;

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      default:
        return 'Information';
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'success':
        return styles.confirmModalAcceptBtn;
      case 'error':
        return styles.confirmModalDeclineBtn;
      case 'warning':
        return styles.confirmModalWarningBtn;
      default:
        return styles.confirmModalAcceptBtn;
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !disabled) {
      onClose?.();
    }
  };

  return (
    <div className={styles.confirmModal} onClick={handleBackdropClick}>
      <div className={styles.confirmModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.confirmModalHeader}>
          <h3 className={styles.confirmModalTitle}>{getTitle()}</h3>
        </div>
        <div className={styles.confirmModalBody}>
          <p className={styles.confirmModalMessage}>{message}</p>
        </div>
        <div className={styles.confirmModalActions}>
          <button
            type="button"
            className={getButtonClass()}
            onClick={onClose}
            disabled={disabled}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageModal;

