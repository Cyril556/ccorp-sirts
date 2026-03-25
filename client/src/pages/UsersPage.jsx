import { useState } from 'react';
import { MOCK_USERS, MOCK_INCIDENTS } from '../data/mockData.js';
import { useAuth } from '../context/AuthContext.jsx';

const ROLE_COLORS = { ADMIN:'text-red-400 bg-red-400/10 border-red-400/20', SOC_LEAD:'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', ANALYST:'text-blue-400 bg-blue-400/10 border-blue-400/20' };

export default function UsersPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const incidentCount = (userId) => MOCK_INCIDENTS.filter(i => i.assignedToId === userId || i.createdById === userId).length;
  const fmt = d => new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});

  return (
    <div className="min-h-screen bg-gray-950 p-6 fade-in">
      <div className="max-w-screen-xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">User <span className="text-blue-400">Management</span></h1>
            <p className="text-gray-500 text-sm mt-0.5">{users.length} users registered</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {['ADMIN','SOC_LEAD','ANALYST'].map(role => (
            <div key={role} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{role.replace('_',' ')}</p>
              <p className="text-2xl font-bold text-white">{users.filter(u=>u.role===role).length}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <div className="relative max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users..." className="input pl-9 w-full" />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Incidents</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map(user => (
                <tr key={user.id} className={`transition-colors hover:bg-gray-800/50 ${user.id === currentUser?.id ? 'bg-blue-500/5' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-100">{user.name} {user.id === currentUser?.id && <span className="text-xs text-blue-400 ml-1">(you)</span>}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${ROLE_COLORS[user.role]}`}>{user.role.replace('_',' ')}</span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-gray-400 text-sm">{incidentCount(user.id)}</td>
                  <td className="px-5 py-4 hidden lg:table-cell text-gray-500 text-xs font-mono">{fmt(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
