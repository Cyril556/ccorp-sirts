import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import IncidentsPage from './pages/IncidentsPage.jsx';
import IncidentDetailPage from './pages/IncidentDetailPage.jsx';
import NewIncidentPage from './pages/NewIncidentPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

const PrivateRoute = ({ children, roles }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/dashboard" replace />;
  if (roles && !roles.includes(currentUser.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/incidents" element={<PrivateRoute><IncidentsPage /></PrivateRoute>} />
        <Route path="/incidents/new" element={<PrivateRoute><NewIncidentPage /></PrivateRoute>} />
        <Route path="/incidents/:id" element={<PrivateRoute><IncidentDetailPage /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute roles={['ADMIN']}><UsersPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}