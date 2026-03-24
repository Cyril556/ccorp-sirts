import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.error || 'Invalid credentials.'); }
    finally { setLoading(false); }
  };

  const DEMOS = [{role:'Admin',email:'admin@ccorp.local',pass:'Admin@1234'},{role:'SOC Lead',email:'lead@ccorp.local',pass:'Lead@1234'},{role:'Analyst',email:'analyst@ccorp.local',pass:'Analyst@1234'}];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
      <div className="relative w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/30">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-white">CCorp <span className="text-blue-400">SIRTS</span></h1>
          <p className="text-gray-500 text-sm mt-1">Security Incident Response &amp; Ticketing System</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to your account</h2>
          {error && (<div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2"><svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p className="text-sm text-red-400">{error}</p></div>)}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="analyst@ccorp.local" className="input" required autoFocus /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" className="input" required /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2">{loading?<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</>:'Sign In'}</button>
          </form>
          <div className="mt-6 pt-5 border-t border-gray-800">
            <p className="text-xs text-gray-600 text-center mb-3 uppercase tracking-wider font-medium">Quick Login</p>
            <div className="grid grid-cols-3 gap-2">{DEMOS.map(c=>(<button key={c.role} type="button" onClick={()=>{setEmail(c.email);setPassword(c.pass);}} className="p-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg text-center transition-all"><p className="text-xs font-semibold text-gray-100">{c.role}</p><p className="text-[10px] text-gray-500 mt-0.5 truncate">{c.email}</p></button>))}</div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-700 mt-5">CCorp SIRTS v2.0 &bull; Secure Operations Centre</p>
      </div>
    </div>
  );
}
