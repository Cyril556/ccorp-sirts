import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { MOCK_INCIDENTS } from '../data/mockData.js';

const CATEGORIES = ['PHISHING','MALWARE','UNAUTHORISED_ACCESS','DOS','OTHER'];
const SEVERITIES = ['CRITICAL','HIGH','MEDIUM','LOW'];

export default function NewIncidentPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:'', description:'', category:'PHISHING', severity:'MEDIUM', sourceIP:'', affectedAsset:'' });
  const [submitted, setSubmitted] = useState(false);

  const handle = e => setForm(f => ({...f, [e.target.name]: e.target.value}));

  const handleSubmit = e => {
    e.preventDefault();
    const newInc = {
      id: `inc-${Date.now()}`,
      ...form,
      status: 'OPEN',
      createdById: currentUser.id,
      assignedToId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
    };
    MOCK_INCIDENTS.unshift(newInc);
    setSubmitted(true);
    setTimeout(() => navigate('/incidents'), 1500);
  };

  if (submitted) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-white font-semibold text-lg">Incident Created</h2>
        <p className="text-gray-500 text-sm mt-1">Redirecting to incident registry...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 p-6 fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button onClick={()=>navigate(-1)} className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1 mb-3 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">New <span className="text-blue-400">Incident</span></h1>
          <p className="text-gray-500 text-sm mt-1">Log a new security incident for investigation</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title <span className="text-red-400">*</span></label>
            <input name="title" value={form.title} onChange={handle} required placeholder="Brief incident title" className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description <span className="text-red-400">*</span></label>
            <textarea name="description" value={form.description} onChange={handle} required rows={5} placeholder="Detailed description of the incident..." className="input w-full resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select name="category" value={form.category} onChange={handle} className="select w-full">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Severity</label>
              <select name="severity" value={form.severity} onChange={handle} className="select w-full">
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Source IP</label>
              <input name="sourceIP" value={form.sourceIP} onChange={handle} placeholder="e.g. 192.168.1.1" className="input w-full font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Affected Asset</label>
              <input name="affectedAsset" value={form.affectedAsset} onChange={handle} placeholder="e.g. WEB-PROD-01" className="input w-full font-mono" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Create Incident</button>
            <button type="button" onClick={()=>navigate(-1)} className="flex-1 px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors text-sm">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
