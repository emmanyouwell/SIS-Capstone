import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function TeacherLayout() {
  return (
    <>
      <Sidebar userType="teacher" />
      <Header userName="Angelica Nanas" userRole="Science Teacher" />
      <Outlet />
    </>
  );
}

export default TeacherLayout;

