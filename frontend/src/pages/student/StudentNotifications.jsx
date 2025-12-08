import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllNotifications,
  deleteNotification,
  updateNotification,
  markAllAsRead,
  clearError,
} from '../../store/slices/notificationSlice';
import styles from './StudentNotifications.module.css';

/**
 * Format date to readable string (e.g., "June 10", "May 28")
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

/**
 * Capitalize first letter of notification type
 */
const formatType = (type) => {
  if (!type) return 'Other';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

function StudentNotifications() {
  const dispatch = useDispatch();
  const { notifications: apiNotifications, loading, error } = useSelector(
    (state) => state.notifications
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Fetch notifications on mount
  useEffect(() => {
    dispatch(fetchAllNotifications());
  }, [dispatch]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Transform API notifications to component format
  const notifications = useMemo(() => {
    if (!apiNotifications || apiNotifications.length === 0) return [];
    return apiNotifications.map((notification) => ({
      id: notification._id,
      type: formatType(notification.type),
      message: notification.message,
      date: formatDate(notification.dateCreated),
      read: notification.status === 'read',
      _id: notification._id, // Keep original _id for API calls
    }));
  }, [apiNotifications]);

  // Filter notifications based on search query
  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) {
      return notifications;
    }
    const query = searchQuery.toLowerCase();
    return notifications.filter(
      (notification) =>
        notification.type.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query) ||
        notification.date.toLowerCase().includes(query)
    );
  }, [notifications, searchQuery]);

  // Check if all filtered notifications are selected
  const isAllSelected = useMemo(() => {
    if (filteredNotifications.length === 0) return false;
    return filteredNotifications.every((notification) => selectedIds.has(notification.id));
  }, [filteredNotifications, selectedIds]);

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(filteredNotifications.map((n) => n.id));
      setSelectedIds(allIds);
    } else {
      const filteredIds = new Set(filteredNotifications.map((n) => n.id));
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        filteredIds.forEach((id) => newSet.delete(id));
        return newSet;
      });
    }
  };

  // Handle individual checkbox change
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle delete selected notifications
  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    
    // Delete all selected notifications
    const deletePromises = Array.from(selectedIds)
      .map((id) => {
        const notification = notifications.find((n) => n.id === id);
        return notification ? dispatch(deleteNotification(notification._id)) : null;
      })
      .filter((promise) => promise !== null);
    
    await Promise.all(deletePromises);
    setSelectedIds(new Set());
  };

  // Handle mark selected as read
  const handleMarkAsRead = async () => {
    if (selectedIds.size === 0) return;
    
    // Mark all selected notifications as read
    const updatePromises = Array.from(selectedIds).map((id) => {
      const notification = notifications.find((n) => n.id === id);
      if (notification && !notification.read) {
        return dispatch(
          updateNotification({
            id: notification._id,
            data: { status: 'read' },
          })
        );
      }
      return Promise.resolve();
    });
    
    await Promise.all(updatePromises);
    setSelectedIds(new Set());
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead());
    setSelectedIds(new Set());
  };

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchAllNotifications());
    setSearchQuery('');
    setSelectedIds(new Set());
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.notificationPanel}>
        {error && (
          <div className={styles.errorMessage} style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        <div className={styles.notificationToolbar}>
          <div className={styles.notificationSearch}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            className={styles.markAllBtn}
            onClick={handleMarkAllAsRead}
            disabled={loading || notifications.length === 0}
          >
            Mark all as Read
          </button>
          <button
            className={styles.refreshBtn}
            title="Refresh"
            onClick={handleRefresh}
            disabled={loading}
            aria-label="Refresh notifications"
          >
            <svg
              width="22"
              height="22"
              fill="none"
              stroke="#222"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
        <div className={styles.notificationActionsRow}>
          <label>
            <input
              type="checkbox"
              id="select-all"
              checked={isAllSelected}
              onChange={handleSelectAll}
              disabled={loading || filteredNotifications.length === 0}
            />
            Select All
          </label>
          <button
            className={`${styles.deleteBtn} ${styles.actionBtn}`}
            onClick={handleDelete}
            disabled={selectedIds.size === 0 || loading}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="#e53e3e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
            </svg>
            Delete
          </button>
          <button
            className={`${styles.markReadBtn} ${styles.actionBtn}`}
            onClick={handleMarkAsRead}
            disabled={selectedIds.size === 0 || loading}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="#4c7a67"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Mark as read
          </button>
        </div>
        <div className={styles.notificationTableWrapper}>
          {loading && notifications.length === 0 ? (
            <div className={styles.emptyState} style={{ padding: '20px', textAlign: 'center' }}>
              Loading notifications...
            </div>
          ) : (
            <table className={styles.notificationTable}>
              <tbody>
                {filteredNotifications.length === 0 ? (
                  <tr>
                    <td colSpan="4" className={styles.emptyState}>
                      No notifications found
                    </td>
                  </tr>
                ) : (
                  filteredNotifications.map((notification) => (
                    <tr
                      key={notification.id}
                      className={notification.read ? styles.read : ''}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(notification.id)}
                          onChange={() => handleCheckboxChange(notification.id)}
                          disabled={loading}
                        />
                      </td>
                      <td>
                        <b>{notification.type}</b>
                      </td>
                      <td>{notification.message}</td>
                      <td className={styles.date}>{notification.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentNotifications;

