import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function AdminLayout() {
  return (
    <>
      <Sidebar userType="admin" />
      <Header userName="Erwin Acorda" userRole="Administrator" />
      <Outlet />
    </>
  );
}

export default AdminLayout;

