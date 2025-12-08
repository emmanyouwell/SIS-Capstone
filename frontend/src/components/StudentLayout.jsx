import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Header from './Header';

function StudentLayout() {
  const { user } = useSelector((state) => state.auth);
  const userName = user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student';
  const userRole = user?.gradeLevel ? `Grade ${user.gradeLevel}` : 'Student';

  return (
    <>
      <Sidebar userType="student" />
      <Header userName={userName} userRole={userRole} />
      <Outlet />
    </>
  );
}

export default StudentLayout;

