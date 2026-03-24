import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function UsersPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState('');
  const [assignMap, setAssignMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, iRes] = await Promise.all([
          api.get('/users'),
          api.get('/incidents'),
        ]);
        setUsers(uRes.data.data || uRes.data);
        setIncidents(iRes.data.data || iRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      }
    };
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleAssign = async (incidentId) => {
    const assignedTo = assignMap[incidentId];
    if (!assignedTo) return;
    try {
      await api.put(`/incidents/${incidentId}/assign`, { assignedToId: assignedTo });
      const assignedUser = users.find((u) => u.id === assignedTo);
      setIncidents(incidents.map((i) =>
        i.id === incidentId ? { ...i, assignedTo: assignedUser } : i
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign incident');
    }
  };

  if (currentUser?.role !== 'ADMIN') return <p>Access Denied. Admins only.</p>;

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <h1>Admin Panel</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h2>User Management</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '2rem' }}>
        <thead style={{ background: '#f0f0f0' }}>
          <tr><th>Name</th><th>Email</th><th>Current Role</th><th>Change Role</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                >
                  {['ANALYST', 'ADMIN', 'VIEWER'].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Incident Assignment</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead style={{ background: '#f0f0f0' }}>
          <tr><th>Title</th><th>Severity</th><th>Status</th><th>Currently Assigned</th><th>Assign To</th></tr>
        </thead>
        <tbody>
          {incidents.map((inc) => (
            <tr key={inc.id}>
              <td>{inc.title}</td>
              <td>{inc.severity}</td>
              <td>{inc.status}</td>
              <td>{inc.assignedTo ? inc.assignedTo.name : 'Unassigned'}</td>
              <td>
                <select
                  value={assignMap[inc.id] || ''}
                  onChange={(e) => setAssignMap({ ...assignMap, [inc.id]: e.target.value })}
                >
                  <option value="">Select analyst</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                {' '}
                <button onClick={() => handleAssign(inc.id)}>Assign</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
