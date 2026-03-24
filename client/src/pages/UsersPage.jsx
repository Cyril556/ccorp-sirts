import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ROLES = ['ANALYST', 'SOC_LEAD', 'ADMIN', 'VIEWER'];

export default function UsersPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [assignMap, setAssignMap] = useState({});
  const [activeTab, setActiveTab] = useState('users');

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
        setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load data');
      }
    };
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setError(''); setSuccess('');
    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setSuccess('Role updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleAssign = async (incidentId) => {
    const assignedToId = assignMap[incidentId];
    if (!assignedToId) return;
    setError(''); setSuccess('');
    try {
      await api.patch(`/incidents/${incidentId}`, { assignedToId });
      const assignedUser = users.find((u) => u.id === assignedToId);
      setIncidents(incidents.map((i) => i.id === incidentId ? { ...i, assignedTo: assignedUser } : i));
      setAssignMap({ ...assignMap, [incidentId]: '' });
      setSuccess('Incident assigned successfully.');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to assign incident');
    }
  };

  if (currentUser?.role !== 'ADMIN') return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-white font-semibold">Access Denied</h2>
        <p className="text-gray-400 text-sm mt-1">Admin privileges required.</p>
      </div>
    </div>
  );

  const unassigned = incidents.filter(i => !i.assignedTo);
  const roleColors = { ADMIN: 'text-red-400 bg-red-500/10', SOC_LEAD: 'text-purple-400 bg-purple-500/10', ANALYST: 'text-blue-400 bg-blue-500/10', VIEWER: 'text-gray-400 bg-gray-500/10' };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Manage users, roles and incident assignments</p>
        </div>

        {/* Alerts */}
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg">{success}</div>}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[['Total Users', users.length, 'blue'], ['Total Incidents', incidents.length, 'yellow'], ['Unassigned', unassigned.length, 'red']].map(([label, val, color]) => (
            <div key={label} className={`bg-gray-900 border border-${color}-500/20 rounded-xl p-4`}>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
              <p className={`text-3xl font-bold text-${color}-400 mt-1`}>{val}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
          {['users', 'assignments'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'users' ? 'User Management' : 'Incident Assignment'}
            </button>
          ))}
        </div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-gray-200">Users ({users.length})</h2>
            </div>
            <div className="divide-y divide-gray-800">
              {users.map((u) => (
                <div key={u.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-semibold text-sm">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleColors[u.role] || 'text-gray-400 bg-gray-500/10'}`}>{u.role}</span>
                    {u.id !== currentUser?.id && (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                      </select>
                    )}
                    {u.id === currentUser?.id && (
                      <span className="text-xs text-gray-600 italic">You</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Incident Assignment Tab */}
        {activeTab === 'assignments' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-gray-200">Incidents ({incidents.length})</h2>
            </div>
            <div className="divide-y divide-gray-800">
              {incidents.length === 0 && (
                <div className="px-5 py-8 text-center text-gray-500 text-sm">No incidents found.</div>
              )}
              {incidents.map((inc) => (
                <div key={inc.id} className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{inc.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{inc.severity}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-xs text-gray-500">{inc.status?.replace('_', ' ')}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-xs text-gray-400">
                        {inc.assignedTo ? `Assigned: ${inc.assignedTo.name}` : 'Unassigned'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={assignMap[inc.id] || ''}
                      onChange={(e) => setAssignMap({ ...assignMap, [inc.id]: e.target.value })}
                      className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="">Select analyst...</option>
                      {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                    </select>
                    <button
                      onClick={() => handleAssign(inc.id)}
                      disabled={!assignMap[inc.id]}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
