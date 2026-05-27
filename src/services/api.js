import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const getMe = () => api.get('/auth/me');

// Classes
export const getClasses = () => api.get('/classes');
export const createClass = (data) => api.post('/classes', data);
export const updateClass = (id, data) => api.put(`/classes/${id}`, data);
export const deleteClass = (id) => api.delete(`/classes/${id}`);

// Teachers
export const getTeachers = () => api.get('/teachers');
export const createTeacher = (data) => api.post('/teachers', data);
export const updateTeacher = (id, data) => api.put(`/teachers/${id}`, data);
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`);

// Classrooms
export const getClassrooms = () => api.get('/classrooms');
export const createClassroom = (data) => api.post('/classrooms', data);
export const updateClassroom = (id, data) => api.put(`/classrooms/${id}`, data);
export const deleteClassroom = (id) => api.delete(`/classrooms/${id}`);

// Subjects
export const getSubjects = () => api.get('/subjects');
export const createSubject = (data) => api.post('/subjects', data);
export const updateSubject = (id, data) => api.put(`/subjects/${id}`, data);
export const deleteSubject = (id) => api.delete(`/subjects/${id}`);

// Class-Subject assignments
export const getClassSubjects = () => api.get('/class-subjects');
export const getClassSubjectsByClass = (classId) => api.get(`/class-subjects/class/${classId}`);
export const createClassSubject = (data) => api.post('/class-subjects', data);
export const createBulkClassSubjects = (data) => api.post('/class-subjects/bulk-assign/subjects', data);
export const updateClassSubject = (id, data) => api.put(`/class-subjects/${id}`, data);
export const deleteClassSubject = (id) => api.delete(`/class-subjects/${id}`);
export const removeSubjectFromClass = (classId, subjectId) => api.delete(`/class-subjects/class/${classId}/subject/${subjectId}`);

// Teacher-Subject assignments
export const getTeacherSubjects = () => api.get('/teacher-subjects');
export const getTeacherSubjectsByTeacher = (teacherId) => api.get(`/teacher-subjects/teacher/${teacherId}`);
export const getTeachersForSubject = (subjectId) => api.get(`/teacher-subjects/subject/${subjectId}`);
export const createTeacherSubject = (data) => api.post('/teacher-subjects', data);
export const createBulkTeacherSubjects = (data) => api.post('/teacher-subjects/bulk-assign/subjects', data);
export const updateTeacherSubject = (id, data) => api.put(`/teacher-subjects/${id}`, data);
export const deleteTeacherSubject = (id) => api.delete(`/teacher-subjects/${id}`);
export const removeSubjectFromTeacher = (teacherId, subjectId) => api.delete(`/teacher-subjects/teacher/${teacherId}/subject/${subjectId}`);

// Time Periods
export const getTimePeriods = () => api.get('/time-periods');
export const getTimePeriodsByDay = (day) => api.get(`/time-periods/day/${day}`);
export const createTimePeriod = (data) => api.post('/time-periods', data);
export const updateTimePeriod = (id, data) => api.put(`/time-periods/${id}`, data);
export const deleteTimePeriod = (id) => api.delete(`/time-periods/${id}`);

// Activities (after-class activities)
export const getActivities = (classId) => api.get(classId ? `/activities?class_id=${classId}` : '/activities');
export const getActivitiesByClass = (classId) => api.get(`/activities/class/${classId}`);
export const getSpecialActivitiesForDisplay = () => api.get('/activities/display/special-activities');
export const createActivity = (data) => api.post('/activities', data);
export const updateActivity = (id, data) => api.put(`/activities/${id}`, data);
export const deleteActivity = (id) => api.delete(`/activities/${id}`);

// Timetable
export const getTimetable = () => api.get('/timetable');
export const getCurrentSession = () => api.get('/timetable/current-session');
export const getCurrentSessions = () => api.get('/timetable/current-sessions');
export const createTimetableEntry = (data) => api.post('/timetable', data);
export const updateTimetableEntry = (id, data) => api.put(`/timetable/${id}`, data);
export const deleteTimetableEntry = (id) => api.delete(`/timetable/${id}`);
export const generateTimetable = () => api.post('/timetable/auto-generate');
export const validateTimetable = () => api.get('/timetable/validate');
export const downloadTimetablePDF = (classId) => 
  api.get(`/timetable/class/${classId}/download?format=pdf`, { responseType: 'blob' });
export const downloadTimetableCSV = (classId) => 
  api.get(`/timetable/class/${classId}/download?format=csv`, { responseType: 'blob' });

// Announcements
export const getAnnouncements = () => api.get('/announcements');
export const getAllAnnouncements = () => api.get('/announcements/all');
export const uploadAnnouncement = (formData) => api.post('/announcements', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteAnnouncement = (id) => api.delete(`/announcements/${id}`);

export default api;
