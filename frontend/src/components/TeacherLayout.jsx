import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css';

function TeacherLayout() {
  const { user } = useSelector((state) => state.auth);
  const userName = user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Teacher';
  const userRole = 'Teacher';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((s) => !s);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeSidebar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <Sidebar userType="teacher" isOpen={isSidebarOpen} onToggle={toggleSidebar} onClose={closeSidebar} />
      <Header userName={userName} userRole={userRole} onMenuToggle={toggleSidebar} isMenuOpen={isSidebarOpen} />
      <main className={styles.content}>
        <Outlet />
      </main>
    </>
  );
}

export default TeacherLayout;

