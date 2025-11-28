import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/admin/AdminLogin';
import StudentLogin from './pages/student/StudentLogin';
import TeacherLogin from './pages/teacher/TeacherLogin';
import AdminLayout from './components/AdminLayout';
import StudentLayout from './components/StudentLayout';
import TeacherLayout from './components/TeacherLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminAccounts from './pages/admin/AdminAccounts';
import AdminAccountView from './pages/admin/AdminAccountView';
import AdminAccountEdit from './pages/admin/AdminAccountEdit';
import AdminGrades from './pages/admin/AdminGrades';
import AdminGradeView from './pages/admin/AdminGradeView';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminSubjectView from './pages/admin/AdminSubjectView';
import AdminSubjectEdit from './pages/admin/AdminSubjectEdit';
import AdminSchedule from './pages/admin/AdminSchedule';
import AdminEnrollment from './pages/admin/AdminEnrollment';
import AdminEnrollmentPending from './pages/admin/AdminEnrollmentPending';
import AdminEnrollmentEnrolled from './pages/admin/AdminEnrollmentEnrolled';
import AdminMasterlist from './pages/admin/AdminMasterlist';
import AdminMasterlistGradeView from './pages/admin/AdminMasterlistGradeView';
import AdminMasterlistAssignTeacher from './pages/admin/AdminMasterlistAssignTeacher';
import AdminMasterlistAssignStudent from './pages/admin/AdminMasterlistAssignStudent';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminMessages from './pages/admin/AdminMessages';
import AdminProfile from './pages/admin/AdminProfile';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentSubjects from './pages/student/StudentSubjects';
import StudentGrades from './pages/student/StudentGrades';
import StudentSchedule from './pages/student/StudentSchedule';
import StudentEnrollment from './pages/student/StudentEnrollment';
import StudentNotifications from './pages/student/StudentNotifications';
import StudentMessages from './pages/student/StudentMessages';
import StudentProfile from './pages/student/StudentProfile';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherClasses from './pages/teacher/TeacherClasses';
import TeacherGrades from './pages/teacher/TeacherGrades';
import TeacherSubject from './pages/teacher/TeacherSubject';
import TeacherMasterlist from './pages/teacher/TeacherMasterlist';
import TeacherMessage from './pages/teacher/TeacherMessage';
import TeacherProfile from './pages/teacher/TeacherProfile';
import StudentHelp from './pages/student/StudentHelp';
import TeacherHelp from './pages/teacher/TeacherHelp';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="accounts" element={<AdminAccounts />} />
          <Route path="accounts/view/:accountType" element={<AdminAccountView />} />
          <Route path="accounts/edit/:accountType" element={<AdminAccountEdit />} />
          <Route path="grades" element={<AdminGrades />} />
          <Route path="grades/:grade" element={<AdminGradeView />} />
          <Route path="subjects" element={<AdminSubjects />} />
          <Route path="subjects/:grade/view" element={<AdminSubjectView />} />
          <Route path="subjects/:grade/edit" element={<AdminSubjectEdit />} />
          <Route path="subjects/:grade/materials" element={<AdminSubjectView />} />
          <Route path="schedule" element={<AdminSchedule />} />
          <Route path="enrollment" element={<AdminEnrollment />} />
          <Route path="enrollment/pending" element={<AdminEnrollmentPending />} />
          <Route path="enrollment/enrolled" element={<AdminEnrollmentEnrolled />} />
          <Route path="masterlist" element={<AdminMasterlist />} />
          <Route path="masterlist/:grade" element={<AdminMasterlistGradeView />} />
          <Route path="masterlist/assign-teacher" element={<AdminMasterlistAssignTeacher />} />
          <Route path="masterlist/assign-student" element={<AdminMasterlistAssignStudent />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="subjects" element={<StudentSubjects />} />
          <Route path="grades" element={<StudentGrades />} />
          <Route path="schedule" element={<StudentSchedule />} />
          <Route path="enrollment" element={<StudentEnrollment />} />
          <Route path="notifications" element={<StudentNotifications />} />
          <Route path="messages" element={<StudentMessages />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="help" element={<StudentHelp />} />
        </Route>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="classes" element={<TeacherClasses />} />
          <Route path="grades" element={<TeacherGrades />} />
          <Route path="subject" element={<TeacherSubject />} />
          <Route path="masterlist" element={<TeacherMasterlist />} />
          <Route path="message" element={<TeacherMessage />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="help" element={<TeacherHelp />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
