import { CircularProgress } from '@mui/material';
import './App.css';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { Header } from './components/layout/Header';
import { Layout } from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';

import { VolunteerEventProvider } from './context/EventContext';
import { EventsListPage } from './pages/EventsListPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from "./context/AuthContext";
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
// import { ProfilePage } from './pages/ProfilePage';
// import { EventDetailsPage } from './pages/EventDetailsPage';

const ProtectedRoute: React.FC<{ children: React.ReactElement, allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading, userRole } = useAuth();
  
  if (isLoading) return <CircularProgress/>
  if (!user) {
    alert("Недостаточно прав. Выполните вход!");
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && (!userRole || !allowedRoles.includes(userRole))) {
    alert("У вас недостаточно прав для доступа к этой странице.");
    return <Navigate to="/" replace />;
  }

  return children;
};
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <VolunteerEventProvider>
            <Layout>
              <Routes>
                <Route path="/login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
                <Route path="/register" element={<ErrorBoundary><RegisterPage /></ErrorBoundary>} />
                {/* Публичные маршруты */}
                <Route path="/" element={<EventsListPage />} />
                <Route path="/events" element={<EventsListPage />} />
                
                {/* Редирект для неизвестных маршрутов */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </VolunteerEventProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
