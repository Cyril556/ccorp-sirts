import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CATEGORIES = ['MALWARE','PHISHING','UNAUTHORIZED_ACCESS','DDoS','DATA_BREACH','INSIDER_THREAT','OTHER'];
const SEVERITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];

const inputCls = 'w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-500';
const labelCls = 'block text-xs font-medium text-gray-400 mb-1.5';

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
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/incidents')} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Report New Incident</h1>
            <p className="text-gray-500 text-sm mt-0.5">File a new security incident for investigation</p>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className={labelCls}>Incident Title <span className="text-red-400">*</span></label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Ransomware detected on FINANCE-PC-01"
              className={inputCls}
            />
          </div>

          {/* Category + Severity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category <span className="text-red-400">*</span></label>
              <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Severity <span className="text-red-400">*</span></label>
              <select name="severity" value={form.severity} onChange={handleChange} className={inputCls}>
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Source IP + Affected Asset */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Source IP</label>
              <input
                name="sourceIP"
                value={form.sourceIP}
                onChange={handleChange}
                placeholder="e.g. 192.168.1.45"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Affected Asset</label>
              <input
                name="affectedAsset"
                value={form.affectedAsset}
                onChange={handleChange}
                placeholder="e.g. FINANCE-PC-01"
                className={inputCls}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description <span className="text-red-400">*</span></label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Describe what happened, what was observed, and any initial findings..."
              className={inputCls + ' resize-none'}
            />
          </div>

          {/* Reporter info */}
          <div className="bg-gray-800/50 rounded-lg px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="text-xs text-gray-400">Reporting as <span className="text-gray-200 font-medium">{currentUser?.name}</span> ({currentUser?.role?.replace('_',' ')})</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/incidents')}
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors border border-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
