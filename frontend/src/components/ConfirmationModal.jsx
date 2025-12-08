import styles from './ConfirmationModal.module.css';

/**
 * Reusable confirmation modal component
 * @param {boolean} show - Whether to show the modal
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {string} confirmText - Text for confirm button (default: "Confirm")
 * @param {string} cancelText - Text for cancel button (default: "Cancel")
 * @param {function} onConfirm - Callback when confirm is clicked
 * @param {function} onCancel - Callback when cancel is clicked or modal is closed
 * @param {string} type - Type of confirmation: 'danger', 'warning', or 'info' (default: 'info')
 * @param {boolean} disabled - Whether buttons should be disabled
 */
function ConfirmationModal({
  show,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info',
  disabled = false,
}) {
  if (!show) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !disabled) {
      onCancel?.();
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return styles.confirmModalDeclineBtn;
      case 'warning':
        return styles.confirmModalWarningBtn;
      default:
        return styles.confirmModalAcceptBtn;
    }
  };

  return (
    <div className={styles.confirmModal} onClick={handleBackdropClick}>
      <div className={styles.confirmModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.confirmModalHeader}>
          <h3 className={styles.confirmModalTitle}>{title}</h3>
        </div>
        <div className={styles.confirmModalBody}>
          <p className={styles.confirmModalMessage}>{message}</p>
        </div>
        <div className={styles.confirmModalActions}>
          <button
            type="button"
            className={styles.confirmModalCancelBtn}
            onClick={onCancel}
            disabled={disabled}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={getConfirmButtonClass()}
            onClick={onConfirm}
            disabled={disabled}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;

