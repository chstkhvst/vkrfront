import './App.css';
import { CircularProgress } from '@mui/material';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VolunteerEventProvider } from './context/EventContext';
import { AttendanceProvider } from './context/AttendanceContext';

import { EventsListPage } from './pages/EventsListPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { MyEventPage } from './pages/MyEventsPage';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import React from 'react';
import { NotificationProvider, useNotification } from './components/Notification';

const ProtectedRoute: React.FC<{ children: React.ReactElement, allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading, userRole } = useAuth();
  const { showNotification } = useNotification();
  const location = useLocation();
  
  if (isLoading) return <CircularProgress/>
  
  if (!user) {
    showNotification('Пожалуйста, войдите в систему', 'warning');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && (!userRole || !allowedRoles.includes(userRole))) {
    showNotification('У вас недостаточно прав для доступа к этой странице', 'error');
    return <Navigate to="/" replace />;
  }

  return children;
};
function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <BrowserRouter>
          <AuthProvider>
            <Layout>
              <Routes>

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route
                  path="/"
                  element={
                    <VolunteerEventProvider>
                      <EventsListPage />
                    </VolunteerEventProvider>
                  }
                />

                <Route
                  path="/events"
                  element={
                    <VolunteerEventProvider>
                      <EventsListPage />
                    </VolunteerEventProvider>
                  }
                />

                <Route
                  path="/events/add"
                  element={
                    <ProtectedRoute allowedRoles={['organizer']}>
                      <VolunteerEventProvider>
                        <CreateEventPage />
                      </VolunteerEventProvider>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/myevents"
                  element={
                    <ProtectedRoute>
                      <AttendanceProvider>
                        <MyEventPage />
                      </AttendanceProvider>
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>
            </Layout>
          </AuthProvider>
        </BrowserRouter>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
