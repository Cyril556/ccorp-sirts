import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function CreateIncidentPage() {
  const { user } = useContext(AuthContext);
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

  const categories = ['MALWARE','PHISHING','UNAUTHORIZED_ACCESS','DDoS','DATA_BREACH','INSIDER_THREAT','OTHER'];
  const severities = ['LOW','MEDIUM','HIGH','CRITICAL'];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/incidents', form, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      navigate('/incidents');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create incident');
    }
  };

  return (
    <div>
      <h1>Create New Incident</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label>Severity</label>
          <select name="severity" value={form.severity} onChange={handleChange}>
            {severities.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label>Source IP</label>
          <input name="sourceIP" value={form.sourceIP} onChange={handleChange} />
        </div>
        <div>
          <label>Affected Asset</label>
          <input name="affectedAsset" value={form.affectedAsset} onChange={handleChange} />
        </div>
        <div>
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={5} />
        </div>
        <button type="submit">Submit Incident</button>
      </form>
    </div>
  );
}
