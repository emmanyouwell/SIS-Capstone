import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import styles from './Sidebar.module.css';

const menuItems = {
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/announcements', label: 'Announcements', icon: 'info' },
    { path: '/admin/accounts', label: 'Accounts', icon: 'user' },
    { path: '/admin/grades', label: 'Grades', icon: 'bar-chart' },
    { path: '/admin/subjects', label: 'Subject', icon: 'book' },
    { path: '/admin/schedule', label: 'Schedule', icon: 'calendar' },
    { path: '/admin/enrollment', label: 'Enrollment', icon: 'open-book' },
    { path: '/admin/masterlist', label: 'Masterlist', icon: 'list' },
    { path: '/admin/notifications', label: 'Notifications', icon: 'bell' },
    { path: '/admin/messages', label: 'Messages', icon: 'mail' },
    { path: '/admin/profile', label: 'Profile', icon: 'home' },
  ],
  student: [
    { path: '/student/dashboard', label: 'Announcements', icon: 'info' },
    { path: '/student/subjects', label: 'Subjects', icon: 'book' },
    { path: '/student/grades', label: 'Grades', icon: 'bar-chart' },
    { path: '/student/schedule', label: 'Schedule', icon: 'calendar' },
    { path: '/student/enrollment', label: 'Enrollment', icon: 'book' },
    { path: '/student/notifications', label: 'Notifications', icon: 'bell' },
    { path: '/student/messages', label: 'Messages', icon: 'mail' },
    { path: '/student/profile', label: 'Profile', icon: 'user' },
    { path: '/student/help', label: 'Help', icon: 'info' },
  ],
  teacher: [
    { path: '/teacher/dashboard', label: 'Announcements', icon: 'info' },
    { path: '/teacher/classes', label: 'Classes', icon: 'user' },
    { path: '/teacher/grades', label: 'Grades', icon: 'bar-chart' },
    { path: '/teacher/subject', label: 'Subjects', icon: 'book' },
    { path: '/teacher/masterlist', label: 'Masterlist', icon: 'list' },
    { path: '/teacher/message', label: 'Messages', icon: 'mail' },
    { path: '/teacher/profile', label: 'Profile', icon: 'home' },
    { path: '/teacher/help', label: 'Help', icon: 'info' },
  ],
};

const iconSVGs = {
  dashboard: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  info: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  user: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 8-4 8-4s8 0 8 4"/>
    </svg>
  ),
  'bar-chart': (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  book: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M2 19.5A2.5 2.5 0 0 1 4.5 17H20"/><path d="M2 6.5A2.5 2.5 0 0 1 4.5 4H20v16H4.5A2.5 2.5 0 0 1 2 17.5z"/>
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  'open-book': (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M2 7v13a2 2 0 0 0 2 2h14"/><path d="M22 7v13a2 2 0 0 1-2 2H6"/><path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2"/><path d="M12 5v16"/>
    </svg>
  ),
  list: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/>
    </svg>
  ),
  bell: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  mail: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/>
    </svg>
  ),
  home: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7"/><path d="M9 22V12h6v10"/>
    </svg>
  ),
};

function Sidebar({ userType = 'admin', isOpen: controlledIsOpen, onToggle, onClose }) {
  const [localOpen, setLocalOpen] = useState(false);
  const controlled = typeof controlledIsOpen === 'boolean';
  const isOpen = controlled ? controlledIsOpen : localOpen;
  const location = useLocation();
  const items = menuItems[userType] || menuItems.admin;

  const toggleSidebar = () => {
    if (controlled) return onToggle && onToggle();
    setLocalOpen((s) => !s);
  };

  const closeSidebar = () => {
    if (controlled) return onClose && onClose();
    setLocalOpen(false);
  };

  return (
    <>
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.logoContainer}>
          <img src="/images/logo.jpg" alt="School Logo" />
        </div>
        <ul>
          {items.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <li key={item.path} className={isActive ? styles.active : ''}>
                <Link to={item.path} onClick={closeSidebar} aria-label={item.label}>
                  <span className={styles.icon}>{iconSVGs[item.icon] || iconSVGs.info}</span>
                  <span className={styles.label}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {isOpen && <div className={styles.overlay} onClick={closeSidebar} aria-hidden="true" />}
    </>
  );
}

export default Sidebar;
