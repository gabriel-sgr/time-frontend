import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiUsers, FiBook, FiBookOpen, FiGrid, FiClock, FiCalendar, FiImage, FiLogOut, FiMenu, FiX, FiMapPin, FiSettings, FiUser } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const API_URL = import.meta.env.VITE_API_URL || '/api';

const navItems = [
  { to: '/admin', icon: FiHome, label: 'Dashboard', end: true },
  { to: '/admin/classes', icon: FiGrid, label: 'Classes' },
  { to: '/admin/teachers', icon: FiUsers, label: 'Teachers' },
  { to: '/admin/classrooms', icon: FiMapPin, label: 'Classrooms' },
  { to: '/admin/subjects', icon: FiBook, label: 'Subjects' },
  { to: '/admin/class-subjects', icon: FiBookOpen, label: 'Class Subjects' },
  { to: '/admin/teacher-subjects', icon: FiUsers, label: 'Teacher Subjects' },
  { to: '/admin/time-periods', icon: FiClock, label: 'Time Periods' },
  { to: '/admin/timetable', icon: FiCalendar, label: 'Timetable' },
  { to: '/admin/announcements', icon: FiImage, label: 'Announcements' },
  { to: '/admin/settings', icon: FiSettings, label: 'Settings' },
  { to: '/admin/profile', icon: FiUser, label: 'My Profile' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/settings`);
        setSettings(res.data);
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-school-primary transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-white/10">
            {settings?.logo_path && (
              <img
                src={`${API_BASE}${settings.logo_path}`}
                alt="School Logo"
                className="w-12 h-12 object-contain mx-auto mb-2 bg-white rounded-full"
              />
            )}
            <h1 className="text-white font-bold text-sm leading-tight text-center">
              {settings?.school_name || 'LYCEE SAINT ALEXANDRE'}
            </h1>
            <p className="text-blue-200 text-xs mt-1 text-center">Management System</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white font-semibold'
                      : 'text-blue-200 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-white/10">
            <p className="text-blue-200 text-xs mb-2">Logged in as</p>
            <p className="text-white font-medium text-sm">{user?.fullName || 'Head Teacher'}</p>
            <button onClick={handleLogout} className="flex items-center gap-2 mt-3 text-blue-200 hover:text-white text-sm transition-colors">
              <FiLogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-gray-600">
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          <div className="flex items-center gap-3">
            <a href="/display" target="_top" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View Display Screen →
            </a>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
