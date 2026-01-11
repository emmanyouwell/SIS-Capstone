import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css';

function AdminLayout() {
  const { user } = useSelector((state) => state.auth);
  const userName = user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Administrator';
  const userRole = 'Administrator';

  // Control sidebar open state here so Header can toggle it
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((s) => !s);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Close overlay when hitting the Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeSidebar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <Sidebar userType="admin" isOpen={isSidebarOpen} onToggle={toggleSidebar} onClose={closeSidebar} />
      <Header userName={userName} userRole={userRole} onMenuToggle={toggleSidebar} isMenuOpen={isSidebarOpen} />
      <main className={styles.content}>
        <Outlet />
      </main>
    </>
  );
}

export default AdminLayout;

