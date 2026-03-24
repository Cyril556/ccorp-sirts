import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load stats'));
  }, []);

  return (
    <div>
      <h1>CCorp SIRTS - Dashboard</h1>
      <p>Welcome, {currentUser?.name} ({currentUser?.role})</p>
      <nav>
        <Link to="/incidents">Incidents</Link>{' | '}
        <Link to="/incidents/new">New Incident</Link>
        {currentUser?.role === 'ADMIN' && <span>{' | '}<Link to="/users">Users</Link></span>}
        {' | '}<button onClick={logout}>Logout</button>
      </nav>
      <hr />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {stats ? (
        <div>
          <p>Open Incidents: {stats.open}</p>
          <p>Critical Active: {stats.critical}</p>
          <p>This Week: {stats.incidentsThisWeek}</p>
          <p>MTTR: {stats.mttr}h</p>
          <pre>{JSON.stringify(stats.byCategory, null, 2)}</pre>
        </div>
      ) : !error && <p>Loading...</p>}
    </div>
  );
}
