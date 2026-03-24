import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <nav style={{
      background: '#1a1a2e',
      padding: '0.75rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: '#fff',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#e94560' }}>CCorp SIRTS</span>
        <Link to="/dashboard" style={{ color: '#dfe6e9', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/incidents" style={{ color: '#dfe6e9', textDecoration: 'none' }}>Incidents</Link>
        <Link to="/incidents/new" style={{ color: '#dfe6e9', textDecoration: 'none' }}>New Incident</Link>
        {currentUser.role === 'ADMIN' && (
          <Link to="/users" style={{ color: '#e17055', textDecoration: 'none' }}>Admin</Link>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.85rem', color: '#b2bec3' }}>
          {currentUser.name} ({currentUser.role})
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: '#e94560',
            border: 'none',
            color: '#fff',
            padding: '0.35rem 0.9rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
