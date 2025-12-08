import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import styles from './Header.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { fetchAllNotifications, fetchUnreadCount, updateNotification } from '../store/slices/notificationSlice';

function Header({ userName, userRole }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  
  // Fetch notifications on mount and periodically
  useEffect(() => {
    dispatch(fetchAllNotifications());
    dispatch(fetchUnreadCount());
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchAllNotifications());
      dispatch(fetchUnreadCount());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dispatch]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleNotificationClick = async (notification) => {
    // Mark notification as read
    if (notification.status === 'unread') {
      await dispatch(updateNotification({ id: notification._id, data: { status: 'read' } }));
      dispatch(fetchUnreadCount());
    }
    
    // Navigate based on notification type and link
    if (notification.type === 'message' && notification.link) {
      navigate(notification.link);
    } else if (notification.link) {
      navigate(notification.link);
    }
    
    setShowDropdown(false);
  };
  
  const handleLogout = () => {
    const btn = document.querySelector(`.${styles.logoutBtn}`);
    const btnText = btn?.querySelector('span');
    const progressBar = document.querySelector(`.${styles.logoutProgress}`);
    
    // Clear auth state immediately
    dispatch(logout());
    
    // Navigate immediately to prevent any redirect issues
    // Use setTimeout to ensure state update is processed first
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 0);
    
    // Show animation if elements exist
    if (btn && btnText && progressBar) {
      btn.classList.add(styles.btnLoading);
      btnText.textContent = 'Logging out...';
      progressBar.classList.add(styles.start);
      
      setTimeout(() => {
        btn.classList.remove(styles.btnLoading);
        btn.classList.add(styles.btnSuccess, styles.animate);
        btnText.textContent = 'Goodbye!';
      }, 1500);
    }
  };

  return (
    <>
      <div className={styles.logoutProgress}></div>
      <div className={styles.topHeader}>
        <div className={styles.schoolName}>
          Sto. Niño National High School
        </div>
        <div className={styles.headerControls}>
          <div className={styles.notifications} ref={dropdownRef}>
            <div 
              className={styles.notificationIcon} 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <svg width="24" height="24" fill="none" stroke="#184d27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </div>
            {showDropdown && (
              <div className={styles.notificationDropdown}>
                <div className={styles.dropdownHeader}>
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <span className={styles.unreadBadge}>{unreadCount} unread</span>
                  )}
                </div>
                <div className={styles.dropdownContent}>
                  {notifications && notifications.length > 0 ? (
                    [...notifications]
                      .sort((a, b) => {
                        // Sort unread first, then by date
                        if (a.status === 'unread' && b.status !== 'unread') return -1;
                        if (a.status !== 'unread' && b.status === 'unread') return 1;
                        return new Date(b.dateCreated) - new Date(a.dateCreated);
                      })
                      .slice(0, 10)
                      .map((notification) => (
                        <div
                          key={notification._id}
                          className={`${styles.notificationItem} ${
                            notification.status === 'unread' ? styles.unread : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className={styles.notificationMessage}>
                            {notification.message}
                          </div>
                          <div className={styles.notificationTime}>
                            {new Date(notification.dateCreated).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className={styles.noNotifications}>No notifications</div>
                  )}
                </div>
                {notifications && notifications.length > 0 && (
                  <div className={styles.dropdownFooter}>
                    <button onClick={() => navigate(`/${user?.role?.toLowerCase()}/notifications`)}>
                      View All
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={styles.userControls}>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{userName}</div>
              <div className={styles.userRole}>{userRole}</div>
            </div>
            <div className={styles.userAvatar}>
              <img src="https://cdn-icons-png.flaticon.com/128/3135/3135715.png" alt="User Avatar" />
            </div>
            <button className={`${styles.logoutBtn} ${styles.btnSmartAnimate}`} onClick={handleLogout}>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;

