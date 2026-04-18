import './App.css';
import { CircularProgress } from '@mui/material';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { AdminPanel } from './components/layout/AdminPanel';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VolunteerEventProvider } from './context/EventContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { ReportProvider } from './context/ReportContext';
import { BanProvider } from './context/BanContext';

import { EventsListPage } from './pages/EventsListPage';
import { CommunityEventsPage } from './pages/CommunityEventsPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { MyEventPage } from './pages/MyEventsPage';
import {ReportsListPage} from './pages/ReportsListPage';
import {ProfilePage} from './pages/ProfilePage';
import {UsersListPage} from './pages/UsersListPage';

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
import { EventDetailsPage } from './pages/EventDetailsPage';
import { EventsToVisitPage } from './pages/EventsToVisitPage';

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
                    <AttendanceProvider>
                    <VolunteerEventProvider>
                      <EventsListPage />
                    </VolunteerEventProvider>
                    </AttendanceProvider>
                  }
                />

                <Route
                  path="/events"
                  element={
                    <AttendanceProvider>
                    <VolunteerEventProvider>
                      <EventsListPage />
                    </VolunteerEventProvider>
                    </AttendanceProvider>
                  }
                />
                <Route
                  path="/community-events"
                  element={
                    <VolunteerEventProvider>
                      <CommunityEventsPage />
                    </VolunteerEventProvider>
                  }
                />
                <Route
                  path="/events/add"
                  element={
                    <ProtectedRoute allowedRoles={['organizer', 'volunteer']}>
                      <VolunteerEventProvider>
                        <CreateEventPage/>
                      </VolunteerEventProvider>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/myevents"
                  element={
                    <ProtectedRoute>
                      <AttendanceProvider>
                        <VolunteerEventProvider>
                          <MyEventPage />
                        </VolunteerEventProvider>
                      </AttendanceProvider>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/events-to-visit"
                  element={
                    <ProtectedRoute>
                      <AttendanceProvider>
                        <VolunteerEventProvider>
                          <ReportProvider>
                            <EventsToVisitPage />
                          </ReportProvider>
                        </VolunteerEventProvider>
                      </AttendanceProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/:id"
                  element={
                    <ProtectedRoute >
                      <VolunteerEventProvider>
                        <AttendanceProvider>
                          <ReportProvider>
                            <EventDetailsPage/>
                          </ReportProvider>
                        </AttendanceProvider>
                      </VolunteerEventProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-panel"
                  element={
                    <ProtectedRoute allowedRoles={['moderator']}>
                      <VolunteerEventProvider>
                        <AdminPanel/>
                      </VolunteerEventProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute allowedRoles={['moderator']}>
                      <ReportProvider>
                        <BanProvider>
                          <ReportsListPage/>
                        </BanProvider>
                      </ReportProvider>
                    </ProtectedRoute>
                  }
                />
                <Route //FIX PROVIDERS
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ReportProvider>
                        <BanProvider>
                          <AuthProvider>
                            <ProfilePage/>
                          </AuthProvider>
                        </BanProvider>
                      </ReportProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                        <BanProvider>
                          <AuthProvider>
                            <UsersListPage/>
                          </AuthProvider>
                        </BanProvider>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/events" replace />} />

              </Routes>
            </Layout>
          </AuthProvider>
        </BrowserRouter>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
