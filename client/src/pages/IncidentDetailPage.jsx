import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { MOCK_INCIDENTS, MOCK_AUDIT_LOGS, MOCK_COMMENTS, MOCK_USERS, getUserById } from '../data/mockData.js';

const SEV_MAP    = { CRITICAL:'badge-critical', HIGH:'badge-high', MEDIUM:'badge-medium', LOW:'badge-low' };
const STATUS_MAP = { OPEN:'status-open', IN_PROGRESS:'status-in_progress', ESCALATED:'status-escalated', RESOLVED:'status-resolved', CLOSED:'status-closed' };
const STATUSES   = ['OPEN','IN_PROGRESS','ESCALATED','RESOLVED','CLOSED'];

export default function IncidentDetailPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const incident = MOCK_INCIDENTS.find(i => i.id === id);
  const [status, setStatus] = useState(incident?.status || '');
  const [comments, setComments] = useState(MOCK_COMMENTS.filter(c => c.incidentId === id));
  const [commentBody, setCommentBody] = useState('');
  const auditLogs = MOCK_AUDIT_LOGS.filter(a => a.incidentId === id);

  if (!incident) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 text-lg">Incident not found.</p>
        <Link to="/incidents" className="text-blue-400 text-sm mt-2 inline-block hover:underline">← Back to incidents</Link>
      </div>
    </div>
  );

  const createdBy  = getUserById(incident.createdById);
  const assignedTo = getUserById(incident.assignedToId);
  const fmt = d => d ? new Date(d).toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : 'N/A';

  const handleAddComment = () => {
    if (!commentBody.trim()) return;
    const newComment = {
      id: `cm-${Date.now()}`, incidentId: id,
      userId: currentUser.id, body: commentBody.trim(),
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, newComment]);
    setCommentBody('');
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6 fade-in">
      <div className="max-w-5xl mx-auto">

        {/* Back + Header */}
        <div className="mb-6">
          <button onClick={()=>navigate(-1)} className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1 mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
          </button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 font-mono mb-1">{incident.id.toUpperCase()}</p>
              <h1 className="text-xl font-bold text-white">{incident.title}</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={SEV_MAP[incident.severity]}>{incident.severity}</span>
              <span className={STATUS_MAP[status]}>{status?.replace('_',' ')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Main */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{incident.description}</p>
            </div>

            {/* Comments */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Comments ({comments.length})</h3>
              <div className="space-y-4 mb-5">
                {comments.length === 0 && <p className="text-gray-600 text-sm italic">No comments yet.</p>}
                {comments.map(c => {
                  const author = getUserById(c.userId) || { name: currentUser.name };
                  return (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {author.name?.[0]}
                      </div>
                      <div className="flex-1 bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-300">{author.name}</span>
                          <span className="text-xs text-gray-600">{fmt(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-300">{c.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Add comment */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {currentUser?.name?.[0]}
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentBody}
                    onChange={e=>setCommentBody(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="input w-full resize-none"
                  />
                  <button onClick={handleAddComment} disabled={!commentBody.trim()} className="btn-primary mt-2 text-xs py-1.5 px-4 disabled:opacity-40 disabled:cursor-not-allowed">
                    Post Comment
                  </button>
                </div>
              </div>
            </div>

            {/* Audit Log */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Audit Trail</h3>
              <div className="space-y-3">
                {auditLogs.length === 0 && <p className="text-gray-600 text-sm italic">No audit entries.</p>}
                {auditLogs.map(log => {
                  const actor = getUserById(log.userId);
                  return (
                    <div key={log.id} className="flex gap-3 text-sm">
                      <div className="mt-0.5 w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                      <div>
                        <span className="text-gray-300 font-medium">{actor?.name || 'System'}</span>
                        <span className="text-gray-500 mx-1">·</span>
                        <span className="text-gray-400">{log.details}</span>
                        <p className="text-xs text-gray-600 font-mono mt-0.5">{fmt(log.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-4">

            {/* Update Status */}
            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SOC_LEAD') && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Update Status</h3>
                <select value={status} onChange={e=>setStatus(e.target.value)} className="select w-full">
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
                <button className="btn-primary w-full mt-3 text-sm">Save Changes</button>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</h3>
              {[
                { label:'Category',       value: incident.category?.replace('_',' ') },
                { label:'Affected Asset', value: incident.affectedAsset || 'N/A' },
                { label:'Source IP',      value: incident.sourceIP     || 'N/A' },
                { label:'Created By',     value: createdBy?.name       || 'N/A' },
                { label:'Assigned To',    value: assignedTo?.name      || 'Unassigned' },
                { label:'Created',        value: fmt(incident.createdAt) },
                { label:'Last Updated',   value: fmt(incident.updatedAt) },
                { label:'Resolved At',    value: incident.resolvedAt ? fmt(incident.resolvedAt) : '—' },
              ].map(row => (
                <div key={row.label}>
                  <p className="text-xs text-gray-600 mb-0.5">{row.label}</p>
                  <p className="text-sm text-gray-300 font-medium">{row.value}</p>
                </div>
              ))}
            </div>

            {/* SLA Indicator */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">SLA Status</h3>
              {(() => {
                const targets = { CRITICAL: 4, HIGH: 8, MEDIUM: 24, LOW: 72 };
                const target  = targets[incident.severity];
                const elapsed = (Date.now() - new Date(incident.createdAt)) / 3600000;
                const pct     = Math.min((elapsed / target) * 100, 100);
                const color   = pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-yellow-500' : 'bg-green-500';
                const label   = pct >= 100 ? '🔴 SLA Breached' : pct >= 75 ? '🟡 SLA At Risk' : '🟢 Within SLA';
                return (
                  <>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{label}</span>
                      <span>Target: {target}h</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className={`h-2 rounded-full ${color} transition-all`} style={{width:`${pct}%`}} />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{Math.round(elapsed)}h elapsed</p>
                  </>
                );
              })()}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
