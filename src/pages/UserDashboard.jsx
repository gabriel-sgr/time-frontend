import { useState, useEffect } from 'react';
import { getCurrentSession } from '../services/api';
import { FiClock, FiCalendar, FiBookOpen, FiUser, FiMapPin } from 'react-icons/fi';

export default function UserDashboard() {
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentSession = async () => {
    try {
      const res = await getCurrentSession();
      setCurrentSession(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching current session:', err);
      setError('Failed to load current session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentSession();
    // Refresh every minute
    const interval = setInterval(fetchCurrentSession, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  const getPeriodColor = (period) => {
    if (!period) return 'bg-gray-100 text-gray-600';
    if (period.is_break) return 'bg-yellow-100 text-yellow-700';
    if (period.name === 'Lunch') return 'bg-orange-100 text-orange-700';
    if (period.name === 'Assembly') return 'bg-purple-100 text-purple-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">School Timetable Dashboard</h1>
          <p className="text-gray-600">Current Session Information</p>
        </div>

        {/* Time and Day Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <FiClock size={24} className="text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Current Time</div>
                <div className="text-2xl font-bold text-gray-800">{currentSession?.current_time}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <FiCalendar size={24} className="text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Today</div>
                <div className="text-2xl font-bold text-gray-800">{currentSession?.day_name}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Period */}
        {currentSession?.current_period && (
          <div className={`rounded-2xl shadow-lg p-6 mb-6 ${getPeriodColor(currentSession.current_period)}`}>
            <div className="text-center">
              <div className="text-sm font-medium mb-1 opacity-75">Current Period</div>
              <div className="text-3xl font-bold mb-2">{currentSession.current_period.name}</div>
              <div className="text-lg font-medium">
                {currentSession.current_period.start_time} - {currentSession.current_period.end_time}
              </div>
            </div>
          </div>
        )}

        {/* No current period */}
        {!currentSession?.current_period && (
          <div className="bg-gray-200 rounded-2xl shadow-lg p-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 mb-2">No Active Period</div>
              <div className="text-gray-500">School hours are over or haven't started yet</div>
            </div>
          </div>
        )}

        {/* Active Sessions */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Active Sessions</h2>
          {currentSession?.sessions && currentSession.sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentSession.sessions.map((session) => (
                <div key={session._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiBookOpen size={20} className="text-blue-600" />
                    </div>
                    <div className="font-semibold text-gray-800">{session.subject_name}</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiUser size={16} />
                      <span>{session.teacher_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiMapPin size={16} />
                      <span>{session.classroom_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiCalendar size={16} />
                      <span className="font-medium">{session.class_name}</span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {session.start_time} - {session.end_time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No active sessions at this time
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
