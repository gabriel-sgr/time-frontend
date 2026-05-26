import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DisplayPage from './pages/DisplayPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ManageClasses from './pages/admin/ManageClasses';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageClassrooms from './pages/admin/ManageClassrooms';
import ManageSubjects from './pages/admin/ManageSubjects';
import ManageClassSubjects from './pages/admin/ManageClassSubjects';
import ManageTeacherSubjects from './pages/admin/ManageTeacherSubjects';
import ManageTimePeriods from './pages/admin/ManageTimePeriods';
import ManageTimetable from './pages/admin/ManageTimetable';
import ManageAnnouncements from './pages/admin/ManageAnnouncements';
import ManageSettings from './pages/admin/ManageSettings';
import ManageAdminProfile from './pages/admin/ManageAdminProfile';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full"></div></div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/display" element={<DisplayPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="classes" element={<ManageClasses />} />
        <Route path="teachers" element={<ManageTeachers />} />
        <Route path="classrooms" element={<ManageClassrooms />} />
        <Route path="subjects" element={<ManageSubjects />} />
        <Route path="class-subjects" element={<ManageClassSubjects />} />
        <Route path="teacher-subjects" element={<ManageTeacherSubjects />} />
        <Route path="time-periods" element={<ManageTimePeriods />} />
        <Route path="timetable" element={<ManageTimetable />} />
        <Route path="announcements" element={<ManageAnnouncements />} />
        <Route path="settings" element={<ManageSettings />} />
        <Route path="profile" element={<ManageAdminProfile />} />
      </Route>
      <Route path="/" element={<Navigate to="/display" />} />
      <Route path="*" element={<Navigate to="/display" />} />
    </Routes>
  );
}
