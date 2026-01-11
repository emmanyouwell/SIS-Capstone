import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css';

function StudentLayout() {
  const { user } = useSelector((state) => state.auth);
  const userName = user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student';
  const userRole = user?.gradeLevel ? `Grade ${user.gradeLevel}` : 'Student';

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
      <Sidebar userType="student" isOpen={isSidebarOpen} onToggle={toggleSidebar} onClose={closeSidebar} />
      <Header userName={userName} userRole={userRole} onMenuToggle={toggleSidebar} isMenuOpen={isSidebarOpen} />
      <main className={styles.content}>
        <Outlet />
      </main>
    </>
  );
}

export default StudentLayout;

