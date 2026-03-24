import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CATEGORIES = ['MALWARE','PHISHING','UNAUTHORIZED_ACCESS','DDoS','DATA_BREACH','INSIDER_THREAT','OTHER'];
const SEVERITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];

export default function NewIncidentPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    category: 'MALWARE',
    severity: 'LOW',
    sourceIP: '',
    affectedAsset: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/incidents', form);
      navigate('/incidents');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Create New Incident</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label><strong>Title *</strong></label><br />
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.4rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label><strong>Category</strong></label><br />
          <select name="category" value={form.category} onChange={handleChange} style={{ width: '100%', padding: '0.4rem' }}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label><strong>Severity</strong></label><br />
          <select name="severity" value={form.severity} onChange={handleChange} style={{ width: '100%', padding: '0.4rem' }}>
            {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label><strong>Source IP</strong></label><br />
          <input name="sourceIP" value={form.sourceIP} onChange={handleChange} style={{ width: '100%', padding: '0.4rem' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label><strong>Affected Asset</strong></label><br />
          <input name="affectedAsset" value={form.affectedAsset} onChange={handleChange} style={{ width: '100%', padding: '0.4rem' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label><strong>Description</strong></label><br />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            style={{ width: '100%', padding: '0.4rem' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '0.5rem 1.5rem' }}>
          {loading ? 'Submitting...' : 'Submit Incident'}
        </button>
        <button type="button" onClick={() => navigate('/incidents')} style={{ marginLeft: '1rem', padding: '0.5rem 1.5rem' }}>
          Cancel
        </button>
      </form>
    </div>
  );
}
