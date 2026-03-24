import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function AdminPage() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState('');
  const [assignMap, setAssignMap] = useState({});

  const headers = { Authorization: `Bearer ${user.token}` };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, iRes] = await Promise.all([
          axios.get('/api/users', { headers }),
          axios.get('/api/incidents', { headers }),
        ]);
        setUsers(uRes.data);
        setIncidents(iRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin data');
      }
    };
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/users/${userId}/role`, { role: newRole }, { headers });
      setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleAssign = async (incidentId) => {
    const assignedTo = assignMap[incidentId];
    if (!assignedTo) return;
    try {
      await axios.put(`/api/incidents/${incidentId}/assign`, { assignedTo }, { headers });
      setIncidents(incidents.map((i) =>
        i._id === incidentId ? { ...i, assignedTo: { _id: assignedTo, name: users.find((u) => u._id === assignedTo)?.name } } : i
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign incident');
    }
  };

  if (user?.role !== 'ADMIN') return <p>Access Denied</p>;

  return (
    <div>
      <h1>Admin Panel</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h2>User Management</h2>
      <table border="1" cellPadding="6">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                >
                  {['ANALYST','ADMIN','VIEWER'].map((r) => <option key={r}>{r}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Incident Assignment</h2>
      <table border="1" cellPadding="6">
        <thead>
          <tr><th>Title</th><th>Status</th><th>Assigned To</th><th>Assign</th></tr>
        </thead>
        <tbody>
          {incidents.map((inc) => (
            <tr key={inc._id}>
              <td>{inc.title}</td>
              <td>{inc.status}</td>
              <td>{inc.assignedTo?.name || 'Unassigned'}</td>
              <td>
                <select
                  value={assignMap[inc._id] || ''}
                  onChange={(e) => setAssignMap({ ...assignMap, [inc._id]: e.target.value })}
                >
                  <option value="">Select analyst</option>
                  {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
                <button onClick={() => handleAssign(inc._id)}>Assign</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
