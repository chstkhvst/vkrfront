import './App.css';
import { CircularProgress } from '@mui/material';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { AdminPanel } from './components/layout/AdminPanel';
import { ScrollToTop } from './components/layout/ScrollToTop';

import { AuthProvider, useAuth } from './context/AuthContext';
import { VolunteerEventProvider } from './context/EventContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { ReportProvider } from './context/ReportContext';
import { BanProvider } from './context/BanContext';
import { NotificationForUserProvider } from './context/NotificationForUserContext';

import { EventsListPage } from './pages/EventsListPage';
import { CommunityEventsPage } from './pages/CommunityEventsPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { MyEventPage } from './pages/MyEventsPage';
import {ReportsListPage} from './pages/ReportsListPage';
import {ProfilePage} from './pages/ProfilePage';
import {UsersListPage} from './pages/UsersListPage';
import {BanHistoryPage} from './pages/BanHistoryPage';
import { UserForModer } from './pages/UserForModer';


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
import { RatingPage } from './pages/RatingPage';
import { PendingOrganizersPage } from './pages/PendingOrganizersPage';
import { EditEventPage } from './pages/EditEventPage';

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
        <ScrollToTop/>
          <AuthProvider>
            <NotificationForUserProvider>
              <Layout>
                <Routes>

                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/events/*"
                    element={
                      <VolunteerEventProvider>
                        <Routes>

                          <Route
                            path=""
                            element={
                              <AttendanceProvider>
                                <EventsListPage />
                              </AttendanceProvider>
                            }
                          />
                          <Route
                            path="community"
                            element={
                                <CommunityEventsPage />
                            }
                          />
                          <Route
                            path=":id"
                            element={
                              <ProtectedRoute >
                                  <AttendanceProvider>
                                    <ReportProvider>
                                      <EventDetailsPage/>
                                    </ReportProvider>
                                  </AttendanceProvider>
                              </ProtectedRoute>
                            }
                          />
                      </Routes>
                    </VolunteerEventProvider>
                  }
                  >
                  </Route>
                  
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
                            <ReportProvider>
                              <MyEventPage />
                            </ReportProvider>
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
                  <Route
                    path="/bans"
                    element={
                      <ProtectedRoute allowedRoles={['moderator']}>
                          <BanProvider>
                            <BanHistoryPage/>
                          </BanProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route //FIX PROVIDERS
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ReportProvider>
                          <BanProvider>
                              <ProfilePage/>
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
                              <UsersListPage/>
                          </BanProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/user-for-moder/:id"
                    element={
                      <ProtectedRoute>
                          <BanProvider>
                            <VolunteerEventProvider>
                              <UserForModer/>
                            </VolunteerEventProvider>
                          </BanProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/rating"
                    element={
                      <ProtectedRoute>
                        <RatingPage/>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pending-organizers"
                    element={
                      <ProtectedRoute allowedRoles={['moderator']}>
                          <PendingOrganizersPage/>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/edit-event/:id"
                    element={
                      <ProtectedRoute allowedRoles={['organizer']}>
                        <VolunteerEventProvider>
                          <AttendanceProvider>
                              <EditEventPage />
                          </AttendanceProvider>
                        </VolunteerEventProvider>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/events" replace />} />

                </Routes>
              </Layout>
            </NotificationForUserProvider>
          </AuthProvider>
        </BrowserRouter>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
