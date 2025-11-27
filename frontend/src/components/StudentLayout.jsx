import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

function StudentLayout() {
  return (
    <>
      <Sidebar userType="student" />
      <Header userName="Kiana Mae Alvarez" userRole="Grade 8 - Section Lilac" />
      <Outlet />
    </>
  );
}

export default StudentLayout;

