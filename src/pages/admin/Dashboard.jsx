import { useState, useEffect } from 'react';
import { getClasses, getTeachers, getSubjects, getClassrooms, getTimetable, getAllAnnouncements } from '../../services/api';
import { FiGrid, FiUsers, FiBook, FiMapPin, FiClock, FiImage } from 'react-icons/fi';

export default function Dashboard() {
  const [stats, setStats] = useState({ classes: 0, teachers: 0, subjects: 0, classrooms: 0, timetable: 0, announcements: 0 });

  useEffect(() => {
    Promise.all([
      getClasses(), getTeachers(), getSubjects(), getClassrooms(), getTimetable(), getAllAnnouncements()
    ]).then(([c, t, s, r, tt, a]) => {
      setStats({
        classes: c.data.length, teachers: t.data.length, subjects: s.data.length,
        classrooms: r.data.length, timetable: tt.data.length, announcements: a.data.length
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Classes', value: stats.classes, icon: FiGrid, color: 'bg-blue-500' },
    { label: 'Teachers', value: stats.teachers, icon: FiUsers, color: 'bg-green-500' },
    { label: 'Subjects', value: stats.subjects, icon: FiBook, color: 'bg-purple-500' },
    { label: 'Classrooms', value: stats.classrooms, icon: FiMapPin, color: 'bg-red-500' },
    { label: 'Timetable Entries', value: stats.timetable, icon: FiClock, color: 'bg-orange-500' },
    { label: 'Announcements', value: stats.announcements, icon: FiImage, color: 'bg-pink-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
            <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center`}>
              <Icon className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Quick Start Guide</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm">
          <li>Add <strong>Classes</strong> (e.g. S1A, S2B, S5 MCB)</li>
          <li>Add <strong>Teachers</strong>, <strong>Subjects</strong>, and <strong>Classrooms</strong></li>
          <li>Create <strong>Timetable</strong> entries with time slots</li>
          <li>Upload <strong>Announcements</strong> images</li>
          <li>Open <strong>Display Screen</strong> on Raspberry Pi in kiosk mode</li>
        </ol>
        <p className="mt-4 text-gray-500 text-xs">School hours: Morning Self Study (6:00-7:00) | Day Courses (8:00-17:00) | Evening Self Study (17:00-18:00)</p>
      </div>
    </div>
  );
}
