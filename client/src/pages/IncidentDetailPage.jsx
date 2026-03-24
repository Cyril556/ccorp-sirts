import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const SEV_MAP = { CRITICAL:'badge-critical', HIGH:'badge-high', MEDIUM:'badge-medium', LOW:'badge-low' };
const STATUS_MAP = { OPEN:'status-open', IN_PROGRESS:'status-in_progress', ESCALATED:'status-escalated', RESOLVED:'status-resolved', CLOSED:'status-closed' };
const STATUSES = ['OPEN','IN_PROGRESS','ESCALATED','RESOLVED','CLOSED'];

export default function IncidentDetailPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchIncident = () => {
    api.get('/incidents/' + id)
      .then((res) => { setIncident(res.data.data); setNewStatus(res.data.data.status); })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load'));
  };

  useEffect(() => { fetchIncident(); }, [id]);

  const handleStatusUpdate = async () => {
    setSubmitting(true); setError(''); setSuccess('');
    try {
      await api.patch('/incidents/' + id, { status: newStatus });
      setSuccess('Status updated successfully.');
      fetchIncident();
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
    finally { setSubmitting(false); }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true); setError(''); setSuccess('');
    try {
      await api.post('/incidents/' + id + '/comments', { body: comment });
      setComment('');
      setSuccess('Comment added.');
      fetchIncident();
    } catch (err) { setError(err.response?.data?.error || 'Failed to add comment'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this incident?')) return;
    try { await api.delete('/incidents/' + id); navigate('/incidents'); }
    catch (err) { setError(err.response?.data?.error || 'Delete failed'); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleString('en-GB', { dateStyle:'medium', timeStyle:'short' }) : 'N/A';

  if (!incident) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400 text-sm">{error || 'Loading incident...'}</div>
    </div>
  );

  const canEdit = currentUser?.role === 'ADMIN' || currentUser?.role === 'SOC_LEAD' || incident.assignedToId === currentUser?.id;

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/incidents')} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Incidents
          </button>
          {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SOC_LEAD') && (
            <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 px-3 py-1.5 rounded-lg transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete Incident
            </button>
          )}
        </div>

        {/* Alerts */}
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>}
        {success && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg">{success}</div>}

        {/* Title Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 font-mono">INC-{String(incident.id).padStart(4,'0')}</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-3">{incident.title}</h1>
          <div className="flex flex-wrap gap-2">
            <span className={SEV_MAP[incident.severity] || 'badge-low'}>{incident.severity}</span>
            <span className={STATUS_MAP[incident.status] || 'status-open'}>{incident.status?.replace('_',' ')}</span>
            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">{incident.category?.replace('_',' ')}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Incident Details</h2>
            <div className="space-y-3">
              {[['Source IP', incident.sourceIP || 'N/A'], ['Affected Asset', incident.affectedAsset || 'N/A'], ['Created By', incident.createdBy?.name || 'Unknown'], ['Assigned To', incident.assignedTo?.name || 'Unassigned']].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-sm text-gray-200">{val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Timeline</h2>
            <div className="space-y-3">
              {[['Reported', fmt(incident.createdAt)], ['Last Updated', fmt(incident.updatedAt)], ['Resolved', fmt(incident.resolvedAt)]].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-xs text-gray-200 font-mono">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Description</h2>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{incident.description || 'No description provided.'}</p>
        </div>

        {/* Status Update */}
        {canEdit && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Update Status</h2>
            <div className="flex gap-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={submitting || newStatus === incident.status}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {submitting ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Comments & Notes</h2>
          {incident.comments?.length > 0 ? (
            <div className="space-y-3 mb-4">
              {incident.comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                    {c.user?.name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-200">{c.user?.name || 'Unknown'}</span>
                      <span className="text-xs text-gray-500">{fmt(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-400">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-4">No comments yet.</p>
          )}
          <div className="flex gap-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment or note..."
              rows={2}
              className="flex-1 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none placeholder-gray-500"
            />
            <button
              onClick={handleAddComment}
              disabled={submitting || !comment.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors self-end"
            >
              Post
            </button>
          </div>
        </div>

        {/* Audit Log */}
        {incident.auditLogs?.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Audit Log</h2>
            <div className="space-y-2">
              {incident.auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <span className="text-gray-300">{log.action}</span>
                    {log.details && <span className="text-gray-500 ml-1">— {log.details}</span>}
                    {log.user && <span className="text-gray-500 ml-1">by {log.user.name}</span>}
                    <span className="text-gray-600 ml-1">• {fmt(log.timestamp)}</span>
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
