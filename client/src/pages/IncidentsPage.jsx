import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const SEV_MAP = { CRITICAL:'badge-critical', HIGH:'badge-high', MEDIUM:'badge-medium', LOW:'badge-low' };
const STATUS_MAP = { OPEN:'status-open', IN_PROGRESS:'status-in_progress', ESCALATED:'status-escalated', RESOLVED:'status-resolved', CLOSED:'status-closed' };
const SEVERITIES = ['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'];
const CATEGORIES = ['', 'PHISHING', 'MALWARE', 'UNAUTHORISED_ACCESS', 'DOS', 'OTHER'];

export default function IncidentsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    api.get('/incidents').then(r => setIncidents(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = incidents.filter(i => {
    const q = search.toLowerCase();
    return (!q || i.title?.toLowerCase().includes(q) || i.affectedAsset?.toLowerCase().includes(q) || i.sourceIP?.includes(q))
      && (!severity || i.severity === severity)
      && (!status || i.status === status)
      && (!category || i.category === category);
  });

  const fmt = d => d ? new Date(d).toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'}) : 'N/A';

  return (
    <div className="min-h-screen bg-gray-950 p-6 fade-in">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Incident <span className="text-blue-400">Registry</span></h1>
            <p className="text-gray-500 text-sm mt-0.5">{incidents.length} total incidents</p>
          </div>
          <Link to="/incidents/new" className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            New Incident
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search incidents..." className="input pl-9" />
            </div>
            <select value={severity} onChange={e=>setSeverity(e.target.value)} className="select">
              {SEVERITIES.map(s => <option key={s} value={s}>{s || 'All Severities'}</option>)}
            </select>
            <select value={status} onChange={e=>setStatus(e.target.value)} className="select">
              {STATUSES.map(s => <option key={s} value={s}>{s?.replace('_',' ') || 'All Statuses'}</option>)}
            </select>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="select">
              {CATEGORIES.map(c => <option key={c} value={c}>{c?.replace('_',' ') || 'All Categories'}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Assigned To</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading && (<tr><td colSpan={7} className="px-5 py-10 text-center text-gray-600"><svg className="w-6 h-6 animate-spin mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></td></tr>)}
              {!loading && filtered.length === 0 && (<tr><td colSpan={7} className="px-5 py-10 text-center text-gray-600 text-sm">No incidents match your filters.</td></tr>)}
              {filtered.map((inc, idx) => (
                <tr key={inc.id} onClick={()=>navigate(`/incidents/${inc.id}`)} className="hover:bg-gray-800/50 cursor-pointer transition-colors">
                  <td className="px-5 py-4 text-gray-600 font-mono text-xs">{idx+1}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-100">{inc.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">{inc.sourceIP || '—'}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell"><span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">{inc.category?.replace('_',' ')}</span></td>
                  <td className="px-5 py-4"><span className={SEV_MAP[inc.severity]}>{inc.severity}</span></td>
                  <td className="px-5 py-4"><span className={STATUS_MAP[inc.status]}>{inc.status?.replace('_',' ')}</span></td>
                  <td className="px-5 py-4 hidden lg:table-cell text-gray-400 text-xs">{inc.assignedTo?.name || <span className="text-gray-600 italic">Unassigned</span>}</td>
                  <td className="px-5 py-4 hidden lg:table-cell text-gray-500 text-xs font-mono">{fmt(inc.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
