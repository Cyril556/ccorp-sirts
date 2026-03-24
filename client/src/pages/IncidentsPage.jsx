import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/incidents')
      .then((res) => setIncidents(res.data.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load'));
  }, []);

  return (
    <div>
      <h1>Incidents</h1>
      <Link to="/dashboard">Dashboard</Link>{' | '}
      <Link to="/incidents/new">+ New Incident</Link>
      <hr />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {incidents.length === 0 && !error ? <p>No incidents found.</p> : (
        <table border="1" cellPadding="8">
          <thead><tr><th>Title</th><th>Category</th><th>Severity</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {incidents.map((inc) => (
              <tr key={inc.id}>
                <td>{inc.title}</td><td>{inc.category}</td><td>{inc.severity}</td><td>{inc.status}</td>
                <td><Link to={'/incidents/' + inc.id}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
