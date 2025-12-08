import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Header from './Header';

function TeacherLayout() {
  const { user } = useSelector((state) => state.auth);
  const userName = user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Teacher';
  const userRole = 'Teacher';

  return (
    <>
      <Sidebar userType="teacher" />
      <Header userName={userName} userRole={userRole} />
      <Outlet />
    </>
  );
}

export default TeacherLayout;

