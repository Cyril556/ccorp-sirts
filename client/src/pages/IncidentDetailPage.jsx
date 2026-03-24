import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function IncidentDetailPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const fetchIncident = () => {
    api.get('/incidents/' + id)
      .then((res) => { setIncident(res.data.data); setNewStatus(res.data.data.status); })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load'));
  };

  useEffect(() => { fetchIncident(); }, [id]);

  const handleStatusUpdate = async () => {
    try { await api.patch('/incidents/' + id, { status: newStatus }); fetchIncident(); }
    catch (err) { setError(err.response?.data?.error || 'Update failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this incident?')) return;
    try { await api.delete('/incidents/' + id); navigate('/incidents'); }
    catch (err) { setError(err.response?.data?.error || 'Delete failed'); }
  };

  if (!incident) return <p>{error || 'Loading...'}</p>;

  return (
    <div>
      <Link to="/incidents">Back</Link>
      <h1>{incident.title}</h1>
      <p><b>Category:</b> {incident.category} | <b>Severity:</b> {incident.severity} | <b>Status:</b> {incident.status}</p>
      <p><b>Source IP:</b> {incident.sourceIP || 'N/A'} | <b>Asset:</b> {incident.affectedAsset || 'N/A'}</p>
      <p>{incident.description}</p>
      <p><b>Created by:</b> {incident.createdBy?.name} | <b>Assigned:</b> {incident.assignedTo?.name || 'Unassigned'}</p>
      <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
        {['OPEN','IN_PROGRESS','ESCALATED','RESOLVED','CLOSED'].map((s) => <option key={s}>{s}</option>)}
      </select>
      <button onClick={handleStatusUpdate}>Update Status</button>
      {currentUser?.role === 'ADMIN' && <button onClick={handleDelete} style={{ color: 'red' }}>Delete</button>}
      <hr />
      <h3>Comments</h3>
      {incident.comments?.map((c) => <p key={c.id}><b>{c.user?.name}:</b> {c.body}</p>)}
      <hr />
      <h3>Audit Log</h3>
      {incident.auditLogs?.map((log) => <p key={log.id}>[{new Date(log.timestamp).toLocaleString()}] {log.user?.name}: {log.action}</p>)}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
