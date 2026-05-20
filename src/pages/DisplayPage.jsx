import { useState, useEffect, useCallback } from 'react';
import { getCurrentSessions, getCurrentSession, getAnnouncements, getSpecialActivitiesForDisplay, getClasses } from '../services/api';
import { FiClock, FiUser, FiMapPin, FiBook, FiAlertCircle, FiSettings, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';

const POLL_INTERVAL = 8000; // 8 seconds
const SLIDE_INTERVAL = 6000; // 6 seconds per announcement

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function DisplayPage() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [specialActivities, setSpecialActivities] = useState([]);
  const [classes, setClasses] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(null);
  const [showDebug, setShowDebug] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [sessRes, currSessRes, annRes, specialRes, classesRes] = await Promise.all([
        getCurrentSessions(),
        getCurrentSession(),
        getAnnouncements(),
        getSpecialActivitiesForDisplay(),
        getClasses()
      ]);
      setSessions(sessRes.data);
      setCurrentSession(currSessRes.data);
      setAnnouncements(annRes.data);
      setSpecialActivities(specialRes.data || []);
      setClasses(classesRes.data || []);
      console.debug('DisplayPage fetchData:', {
        sessions: sessRes.data,
        currentSession: currSessRes.data,
        announcements: annRes.data,
        specialActivities: specialRes.data,
        classes: classesRes.data
      });
      setError(null);
    } catch (err) {
      setError('Connection lost. Retrying...');
    }
  }, []);

  const fetchSettings = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const res = await axios.get(`${API_URL}/settings`);
      setSettings(res.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const getRelevantSpecialActivities = () => {
    const now = new Date();
    const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon..7=Sun
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    return specialActivities.filter(activity => {
      // Check day of week
      if (activity.day_of_week !== currentDay) return false;

      // If time period is linked, check if we're in that time period
      if (activity.time_period_id) {
        const tp = activity.time_period_id;
        return currentTime >= tp.start_time && currentTime < tp.end_time;
      }

      // Otherwise check regular time
      return currentTime >= activity.start_time && currentTime < activity.end_time;
    });
  };

  // Poll for data
  useEffect(() => {
    fetchData();
    fetchSettings();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Slideshow
  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % announcements.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getDayPeriod = () => {
    // Use current session data if available, otherwise show no active period
    if (currentSession?.current_period) {
      const period = currentSession.current_period;
      const periodName = period.name.toLowerCase();
      
      if (periodName.includes('break')) return { label: period.name, color: 'bg-yellow-500' };
      if (periodName.includes('lunch')) return { label: period.name, color: 'bg-orange-500' };
      if (periodName.includes('assembly')) return { label: period.name, color: 'bg-purple-600' };
      if (periodName.includes('self') || periodName.includes('study')) return { label: period.name, color: 'bg-indigo-600' };
      
      // Default for class periods
      return { label: period.name, color: 'bg-green-600' };
    }
    
    // No current session - use time-based fallback
    const h = currentTime.getHours();
    const m = currentTime.getMinutes();
    const t = h * 60 + m;
    if (t < 420) return { label: 'Before School', color: 'bg-gray-600' }; // before 7:00
    if (t < 480) return { label: 'Preparation', color: 'bg-blue-600' }; // 7:00-8:00
    if (t < 720) return { label: 'Morning Period', color: 'bg-green-600' }; // 8:00-12:00
    if (t < 840) return { label: 'Lunch Break', color: 'bg-orange-500' }; // 12:00-14:00
    if (t < 1020) return { label: 'Afternoon Period', color: 'bg-green-600' }; // 14:00-17:00
    if (t < 1080) return { label: 'After School', color: 'bg-gray-600' }; // 17:00-18:00
    return { label: 'After School', color: 'bg-gray-600' };
  };

  const getPeriodInfo = () => {
    if (!currentSession?.current_period) {
      return getDayPeriod();
    }

    const period = currentSession.current_period;
    const periodName = period.name.toLowerCase();
    
    // Show period name from TimePeriod with color coding based on name
    if (periodName.includes('break')) return { label: period.name, color: 'bg-yellow-500' };
    if (periodName.includes('lunch')) return { label: period.name, color: 'bg-orange-500' };
    if (periodName.includes('assembly')) return { label: period.name, color: 'bg-purple-600' };
    if (periodName.includes('self') || periodName.includes('study')) return { label: period.name, color: 'bg-indigo-600' };
    
    // Default for class periods
    return { label: period.name, color: 'bg-green-600' };
  };

  const period = getPeriodInfo();

  const parseTimeToDate = (timeStr) => {
    if (!timeStr) return null;
    const parts = timeStr.split(':').map((p) => parseInt(p, 10));
    if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return null;
    return new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), parts[0], parts[1]);
  };

  const formatRemaining = (ms) => {
    if (ms <= 0) return 'Ended';
    const totalSec = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`; 
    return `${Math.max(0, mins)}m`;
  };

  const getSessionProgress = (session) => {
    const start = parseTimeToDate(session.start_time);
    const end = parseTimeToDate(session.end_time);
    if (!start || !end) return { percent: 0, remainingText: '' };
    // handle sessions that span midnight
    if (end <= start) end.setDate(end.getDate() + 1);
    const total = end.getTime() - start.getTime();
    const elapsed = currentTime.getTime() - start.getTime();
    const remaining = end.getTime() - currentTime.getTime();
    const percent = total > 0 ? Math.max(0, Math.min(100, Math.round((elapsed / total) * 100))) : 0;
    return { percent, remainingText: remaining > 0 ? formatRemaining(remaining) : 'Ended' };
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-school-primary to-school-secondary px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {settings?.logo_path ? (
            <img
              src={`${API_BASE}${settings.logo_path}`}
              alt="School Logo"
              className="w-10 h-10 object-contain bg-white rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-school-accent rounded-full flex items-center justify-center">
              <span className="text-school-dark font-bold text-sm">LS</span>
            </div>
          )}
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">{settings?.school_name || 'LYCEE SAINT ALEXANDRE SAULI DE MUHURA'}</h1>
            <p className="text-blue-200 text-xs">Digital Timetable Display System</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-white font-mono text-2xl font-bold">{formatTime(currentTime)}</div>
            <div className="text-blue-200 text-xs">{formatDate(currentTime)}</div>
            <div className="mt-1">
              <span className={`inline-block px-2 py-0.5 rounded-full text-white text-xs font-medium ${period.color}`}>
                {period.label}
              </span>
              {currentSession?.current_period && (
                <div className="text-blue-200 text-xs mt-1">
                  {currentSession.current_period.start_time} - {currentSession.current_period.end_time}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-600 text-white text-center py-1 text-sm flex items-center justify-center gap-2">
          <FiAlertCircle /> {error}
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Timetable Grid - 75% */}
        <div className="flex-1 p-4 overflow-y-auto" style={{ flex: '0 0 75%' }}>
          {sessions.length === 0 && getRelevantSpecialActivities().length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <FiClock size={64} className="mx-auto mb-4 opacity-50" />
                {currentSession?.current_period ? (
                  <>
                    <h2 className="text-3xl font-bold mb-2 text-white">{currentSession.current_period.name}</h2>
                    <p className="text-xl text-blue-200">
                      {currentSession.current_period.start_time} - {currentSession.current_period.end_time}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-2">No Active Sessions</h2>
                    <p className="text-lg">Check back during school hours</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {/* Render live session cards directly from `sessions` to avoid name-matching issues */}
              {sessions.map((active) => {
                const prog = getSessionProgress(active);
                return (
                <div key={`session-${active._id}`} className={`rounded-xl p-4 shadow-lg transition-all duration-500 animate-fade-in bg-white border border-gray-200`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-extrabold text-school-primary">{active.class_name || active.class}</h3>
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">LIVE</span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <FiBook className="text-brand-500 shrink-0" size={16} />
                    <span className="font-semibold text-gray-800 text-sm truncate">{active.subject_name || active.subject}</span>
                  </div>

                  {active.teacher_name && (
                    <div className="flex items-center gap-2 mb-2">
                      <FiUser className="text-green-600 shrink-0" size={16} />
                      <span className="text-gray-600 text-sm truncate">{active.teacher_name}</span>
                    </div>
                  )}

                  {active.classroom_name && (
                    <div className="flex items-center gap-2 mb-2">
                      <FiMapPin className="text-red-500 shrink-0" size={16} />
                      <span className="text-gray-600 text-sm truncate">{active.classroom_name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                    <FiClock className="text-gray-400 shrink-0" size={14} />
                    <span className="text-gray-500 text-xs font-mono">{active.start_time} — {active.end_time}</span>
                    <span className="ml-2 text-xs text-gray-500">•</span>
                    <span className="ml-2 text-xs font-mono text-gray-600">{prog.remainingText}</span>
                  </div>

                  <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-school-primary" style={{ width: `${prog.percent}%` }} />
                  </div>
                </div>
                )
              })}
              {/* Special Activities */}
              {getRelevantSpecialActivities().map((activity) => (
                <div
                  key={`special-${activity._id}`}
                  className="rounded-xl p-4 shadow-lg transition-all duration-500 animate-fade-in bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-400"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-extrabold text-purple-700 flex items-center gap-2">
                      <FiStar size={18} />
                      {activity.name}
                    </h3>
                  </div>

                  {activity.description && (
                    <div className="text-sm text-purple-600 mb-2">
                      {activity.description}
                    </div>
                  )}

                  {activity.location && (
                    <div className="flex items-center gap-2 mb-2">
                      <FiMapPin className="text-purple-600 shrink-0" size={16} />
                      <span className="text-gray-700 text-sm">{activity.location}</span>
                    </div>
                  )}

                  {activity.responsible_teacher_id && (
                    <div className="flex items-center gap-2 mb-2">
                      <FiUser className="text-purple-600 shrink-0" size={16} />
                      <span className="text-gray-700 text-sm">{activity.responsible_teacher_id.name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-purple-200">
                    <FiClock className="text-purple-500 shrink-0" size={14} />
                    <span className="text-gray-600 text-xs font-mono">
                      {activity.start_time} — {activity.end_time}
                    </span>
                  </div>
                </div>
              ))}

              {/* Regular sessions are displayed via class cards above */}
            </div>
          )}
        </div>

        {/* Announcements Sidebar - 25% */}
        <div className="bg-gray-800 border-l border-gray-700 flex flex-col" style={{ flex: '0 0 25%' }}>
          {/* Session Activity Display */}
          <div className="bg-gradient-to-r from-school-primary to-school-secondary px-4 py-3">
            <div className="text-center">
              <p className="text-blue-200 text-xs mb-1">Current Session</p>
              {currentSession?.current_period ? (
                <>
                  <h3 className="text-white font-bold text-lg">{period.label}</h3>
                  <p className="text-blue-200 text-xs mt-1">
                    {currentSession.current_period.start_time} - {currentSession.current_period.end_time}
                  </p>
                </>
              ) : (
                <h3 className="text-white font-bold text-lg">{period.label}</h3>
              )}
            </div>
          </div>
          <div className="bg-school-accent px-4 py-3">
            <h2 className="text-school-dark font-bold text-sm text-center tracking-wide">📢 ANNOUNCEMENTS</h2>
          </div>
          <div className="flex-1 relative overflow-hidden">
            {announcements.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p className="text-sm">No announcements</p>
              </div>
            ) : (
              announcements.map((ann, index) => (
                <div
                  key={ann._id}
                  className="absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-1000"
                  style={{ opacity: index === currentSlide ? 1 : 0 }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    {ann.type === 'text' && (
                      <div className="text-center px-4">
                        {ann.title && <h3 className="text-white text-xl font-bold mb-3">{ann.title}</h3>}
                        <p className="text-white text-base leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                      </div>
                    )}
                    {ann.type === 'image' && (
                      <>
                        <img
                          src={`${API_BASE}${ann.image_path}`}
                          alt={ann.title || 'Announcement'}
                          className="max-w-full max-h-[80%] object-contain rounded-lg shadow-lg"
                        />
                        {ann.title && (
                          <p className="text-white text-sm mt-3 text-center font-medium">{ann.title}</p>
                        )}
                      </>
                    )}
                    {ann.type === 'video' && (
                      <>
                        <video
                          src={`${API_BASE}${ann.video_path}`}
                          controls
                          autoPlay
                          muted
                          loop
                          className="max-w-full max-h-[80%] object-contain rounded-lg shadow-lg"
                        />
                        {ann.title && (
                          <p className="text-white text-sm mt-3 text-center font-medium">{ann.title}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {announcements.length > 1 && (
            <div className="flex justify-center gap-1.5 py-2">
              {announcements.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentSlide ? 'bg-school-accent' : 'bg-gray-600'}`} />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Debug panel - toggleable */}
     
    </div>
  );
}
