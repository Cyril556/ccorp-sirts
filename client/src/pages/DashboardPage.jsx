import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const SEV_COLORS = { CRITICAL:'#ef4444', HIGH:'#f97316', MEDIUM:'#eab308', LOW:'#22c55e' };
const CAT_COLORS = ['#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316'];
const STATUS_MAP = { OPEN:'status-open', IN_PROGRESS:'status-in_progress', ESCALATED:'status-escalated', RESOLVED:'status-resolved', CLOSED:'status-closed' };
const SEV_MAP = { CRITICAL:'badge-critical', HIGH:'badge-high', MEDIUM:'badge-medium', LOW:'badge-low' };

function StatCard({ label, value, sub, icon, accent }) {
  const colors = { blue:'border-blue-500/30 bg-blue-500/5', red:'border-red-500/30 bg-red-500/5', yellow:'border-yellow-500/30 bg-yellow-500/5', green:'border-green-500/30 bg-green-500/5' };
  return (
    <div className={`rounded-xl border p-5 ${colors[accent] || colors.blue} transition-all hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className="text-2xl opacity-60">{icon}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/incidents?limit=8')
    ]).then(([s, i]) => {
      setStats(s.data.data);
      setRecent(i.data.data?.slice(0,8) || []);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const catData = stats?.byCategory ? Object.entries(stats.byCategory).map(([name,value]) => ({name,value})) : [];
  const dayData = stats?.byDay || [];

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center"><svg className="w-10 h-10 animate-spin text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg><p className="text-gray-500 mt-3 text-sm">Loading dashboard...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 p-6 fade-in">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Security Operations <span className="text-blue-400">Dashboard</span></h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {currentUser?.name} &bull; {new Date().toLocaleDateString('en-GB', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Open Incidents" value={stats?.open} sub="Require immediate attention" icon="🚨" accent="red" />
          <StatCard label="Critical" value={stats?.critical} sub="Highest severity" icon="⚠️" accent="red" />
          <StatCard label="This Week" value={stats?.incidentsThisWeek} sub="New incidents" icon="📅" accent="blue" />
          <StatCard label="Avg Resolution" value={stats?.mttr ? `${stats.mttr}h` : 'N/A'} sub="Mean time to resolve" icon="⏱️" accent="green" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="xl:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Incidents by Day (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dayData} margin={{top:0,right:0,bottom:0,left:-20}}>
                <XAxis dataKey="day" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{background:'#111827',border:'1px solid #1f2937',borderRadius:'8px',color:'#f9fafb'}} cursor={{fill:'rgba(59,130,246,0.05)'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Pie Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">By Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {catData.map((_,i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{background:'#111827',border:'1px solid #1f2937',borderRadius:'8px',color:'#f9fafb'}} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:'11px',color:'#9ca3af'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-300">Recent Incidents</h3>
            <Link to="/incidents" className="text-xs text-blue-400 hover:text-blue-300 font-medium">View all &rarr;</Link>
          </div>
          <div className="divide-y divide-gray-800">
            {recent.length === 0 && <div className="px-6 py-8 text-center text-gray-600 text-sm">No incidents yet.</div>}
            {recent.map(inc => (
              <Link key={inc.id} to={`/incidents/${inc.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800/50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-100 truncate group-hover:text-white">{inc.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{inc.category} &bull; {inc.affectedAsset || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={SEV_MAP[inc.severity]}>{inc.severity}</span>
                  <span className={STATUS_MAP[inc.status]}>{inc.status?.replace('_',' ')}</span>
                </div>
                <span className="text-gray-600 group-hover:text-gray-400">&rsaquo;</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
