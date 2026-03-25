import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext.jsx';
import { MOCK_INCIDENTS, MOCK_USERS, getMockStats, getUserById } from '../data/mockData.js';

const SEV_MAP    = { CRITICAL:'badge-critical', HIGH:'badge-high', MEDIUM:'badge-medium', LOW:'badge-low' };
const STATUS_MAP = { OPEN:'status-open', IN_PROGRESS:'status-in_progress', ESCALATED:'status-escalated', RESOLVED:'status-resolved', CLOSED:'status-closed' };
const CAT_COLORS = ['#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f97316'];

function StatCard({ label, value, sub, icon, accent }) {
  const colors = { red:'border-red-500/30 bg-red-500/5', blue:'border-blue-500/30 bg-blue-500/5', green:'border-green-500/30 bg-green-500/5', yellow:'border-yellow-500/30 bg-yellow-500/5' };
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
  const stats  = getMockStats();
  const recent = MOCK_INCIDENTS.slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  const catData = Object.entries(stats.byCategory).map(([name, value]) => ({ name: name.replace('_',' '), value }));

  return (
    <div className="min-h-screen bg-gray-950 p-6 fade-in">
      <div className="max-w-screen-2xl mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Security Operations <span className="text-blue-400">Dashboard</span></h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {currentUser?.name} &bull; {new Date().toLocaleDateString('en-GB',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Open Incidents"  value={stats.open}               sub="Require immediate attention" icon="🚨" accent="red" />
          <StatCard label="Critical"        value={stats.critical}           sub="Highest severity"           icon="⚠️" accent="red" />
          <StatCard label="This Week"       value={stats.incidentsThisWeek}  sub="New incidents"             icon="📅" accent="blue" />
          <StatCard label="Avg Resolution"  value={stats.mttr ? `${stats.mttr}h` : 'N/A'} sub="Mean time to resolve" icon="⏱️" accent="green" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Incidents by Day (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.byDay} margin={{top:0,right:0,bottom:0,left:-20}}>
                <XAxis dataKey="day" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{background:'#111827',border:'1px solid #1f2937',borderRadius:'8px',color:'#f9fafb'}} cursor={{fill:'rgba(59,130,246,0.05)'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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

        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-300">Recent Incidents</h3>
            <Link to="/incidents" className="text-xs text-blue-400 hover:text-blue-300 font-medium">View all &rarr;</Link>
          </div>
          <div className="divide-y divide-gray-800">
            {recent.map(inc => {
              const assignee = getUserById(inc.assignedToId);
              return (
                <Link key={inc.id} to={`/incidents/${inc.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800/50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-100 truncate group-hover:text-white">{inc.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{inc.category?.replace('_',' ')} &bull; {inc.affectedAsset || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500 hidden lg:block">{assignee?.name || <span className="italic">Unassigned</span>}</span>
                    <span className={SEV_MAP[inc.severity]}>{inc.severity}</span>
                    <span className={STATUS_MAP[inc.status]}>{inc.status?.replace('_',' ')}</span>
                  </div>
                  <span className="text-gray-600 group-hover:text-gray-400">&rsaquo;</span>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
