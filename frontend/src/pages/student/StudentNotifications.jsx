import { useState, useMemo } from 'react';
import styles from './StudentNotifications.module.css';

// Initial notifications data
const initialNotifications = [
  {
    id: 1,
    type: 'Enrollment',
    message: '3 Students submitted their documents for enrollment.',
    date: 'June 10',
    read: false,
  },
  {
    id: 2,
    type: 'Message',
    message: 'Ms. Mariah A. Lordez sent a message.',
    date: 'June 3',
    read: false,
  },
  {
    id: 3,
    type: 'Message',
    message: 'Mr. Jason K. Yason sent a message.',
    date: 'June 3',
    read: false,
  },
  {
    id: 4,
    type: 'Subject Materials',
    message: 'Mr. James B. Ramos posted a file in Science Grade 8 Section 2.',
    date: 'May 28',
    read: false,
  },
  {
    id: 5,
    type: 'Announcement',
    message: 'Ms. Karla D. Sales posted a class announcement.',
    date: 'May 27',
    read: false,
  },
  {
    id: 6,
    type: 'Announcement',
    message: 'Your post has been archived.',
    date: 'May 25',
    read: false,
  },
];

function StudentNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

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
  const handleDelete = () => {
    if (selectedIds.size === 0) return;
    setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
  };

  // Handle mark selected as read
  const handleMarkAsRead = () => {
    if (selectedIds.size === 0) return;
    setNotifications((prev) =>
      prev.map((n) => (selectedIds.has(n.id) ? { ...n, read: true } : n))
    );
    setSelectedIds(new Set());
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setSelectedIds(new Set());
  };

  // Handle refresh
  const handleRefresh = () => {
    setNotifications(initialNotifications.map((n) => ({ ...n })));
    setSearchQuery('');
    setSelectedIds(new Set());
  };

  return (
    <div className={styles.mainContent}>
        <div className={styles.notificationPanel}>
          <div className={styles.notificationToolbar}>
            <div className={styles.notificationSearch}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className={styles.markAllBtn} onClick={handleMarkAllAsRead}>
              Mark all as Read
            </button>
            <button
              className={styles.refreshBtn}
              title="Refresh"
              onClick={handleRefresh}
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
              />
              Select All
            </label>
            <button
              className={`${styles.deleteBtn} ${styles.actionBtn}`}
              onClick={handleDelete}
              disabled={selectedIds.size === 0}
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
              disabled={selectedIds.size === 0}
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
          </div>
        </div>
      </div>
  );
}

export default StudentNotifications;

