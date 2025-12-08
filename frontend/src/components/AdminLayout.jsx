import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Header from './Header';

function AdminLayout() {
  const { user } = useSelector((state) => state.auth);
  const userName = user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Administrator';
  const userRole = 'Administrator';

  return (
    <>
      <Sidebar userType="admin" />
      <Header userName={userName} userRole={userRole} />
      <Outlet />
    </>
  );
}

export default AdminLayout;

