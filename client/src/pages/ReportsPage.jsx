import { useState } from 'react';
import { MOCK_INCIDENTS, MOCK_USERS } from '../data/mockData.js';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30');

  // Compute metrics
  const totalIncidents = MOCK_INCIDENTS.length;
  const byStatus = MOCK_INCIDENTS.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {});
  const bySeverity = MOCK_INCIDENTS.reduce((acc, i) => {
    acc[i.severity] = (acc[i.severity] || 0) + 1;
    return acc;
  }, {});
  const byCategory = MOCK_INCIDENTS.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {});

  // Resolution times (mock: random data for demonstration)
  const resolvedIncidents = MOCK_INCIDENTS.filter(i => i.resolvedAt);
  const avgResolutionTime = resolvedIncidents.length > 0
    ? Math.round(resolvedIncidents.reduce((sum, i) => {
        const diff = new Date(i.resolvedAt) - new Date(i.createdAt);
        return sum + (diff / 3600000);
      }, 0) / resolvedIncidents.length)
    : 0;

  // Top analysts by resolved incidents
  const analystStats = MOCK_USERS
    .filter(u => ['SOC_ANALYST', 'SOC_LEAD'].includes(u.role))
    .map(u => ({
      ...u,
      resolved: MOCK_INCIDENTS.filter(i => i.assignedToId === u.id && i.resolvedAt).length,
      active: MOCK_INCIDENTS.filter(i => i.assignedToId === u.id && !i.resolvedAt).length,
    }))
    .sort((a, b) => b.resolved - a.resolved);

  // SLA compliance
  const slaTargets = { CRITICAL: 4, HIGH: 8, MEDIUM: 24, LOW: 72 };
  const slaBreaches = MOCK_INCIDENTS.filter(i => {
    const elapsed = (Date.now() - new Date(i.createdAt)) / 3600000;
    return elapsed > slaTargets[i.severity];
  }).length;
  const slaCompliance = Math.round(((totalIncidents - slaBreaches) / totalIncidents) * 100);

  // Monthly trend (mock: last 6 months)
  const monthTrend = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((month, i) => ({
    month,
    incidents: Math.floor(Math.random() * 20) + 5,
  }));

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-screen-xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Security Operations <span className="text-blue-400">Reports</span></h1>
            <p className="text-gray-500 text-sm mt-0.5">Analytics &amp; Performance Metrics</p>
          </div>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="select text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last 12 months</option>
          </select>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Incidents</p>
            <p className="text-3xl font-bold text-white mt-1">{totalIncidents}</p>
            <p className="text-xs text-green-400 mt-1">↑ 12% vs last period</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Avg. Resolution</p>
            <p className="text-3xl font-bold text-white mt-1">{avgResolutionTime}h</p>
            <p className="text-xs text-green-400 mt-1">↓ 8% faster</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider">SLA Compliance</p>
            <p className="text-3xl font-bold text-white mt-1">{slaCompliance}%</p>
            <p className="text-xs text-yellow-400 mt-1">{slaBreaches} breaches</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Open Incidents</p>
            <p className="text-3xl font-bold text-white mt-1">{byStatus.OPEN || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Require attention</p>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Incidents by Status */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Incidents by Status</h3>
            <div className="space-y-3">
              {['OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'].map(status => {
                const count = byStatus[status] || 0;
                const pct = (count / totalIncidents * 100).toFixed(0);
                const colors = {
                  OPEN: 'bg-blue-500',
                  IN_PROGRESS: 'bg-yellow-500',
                  ESCALATED: 'bg-red-500',
                  RESOLVED: 'bg-green-500',
                  CLOSED: 'bg-gray-500',
                };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{status.replace('_', ' ')}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className={`h-2 rounded-full ${colors[status]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Incidents by Severity */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Incidents by Severity</h3>
            <div className="space-y-3">
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => {
                const count = bySeverity[sev] || 0;
                const pct = (count / totalIncidents * 100).toFixed(0);
                const colors = {
                  CRITICAL: 'bg-red-500',
                  HIGH: 'bg-orange-500',
                  MEDIUM: 'bg-yellow-500',
                  LOW: 'bg-blue-400',
                };
                return (
                  <div key={sev}>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{sev}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className={`h-2 rounded-full ${colors[sev]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Category breakdown + Monthly trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Incidents by Category */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Incidents by Category</h3>
            <div className="space-y-3">
              {Object.entries(byCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => {
                  const pct = (count / totalIncidents * 100).toFixed(0);
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{cat.replace('_', ' ')}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className="h-2 rounded-full bg-purple-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Monthly Trend (6 Months)</h3>
            <div className="flex items-end justify-between h-48 gap-2">
              {monthTrend.map((m, i) => {
                const maxVal = Math.max(...monthTrend.map(x => x.incidents));
                const height = (m.incidents / maxVal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex items-end justify-center h-full">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{m.month}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Analyst Performance Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Analyst Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                  <th className="pb-3">Analyst</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3 text-center">Resolved</th>
                  <th className="pb-3 text-center">Active</th>
                  <th className="pb-3 text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {analystStats.map(u => (
                  <tr key={u.id} className="hover:bg-gray-800/30">
                    <td className="py-3 text-gray-300">{u.name}</td>
                    <td className="py-3 text-gray-400">{u.role.replace('_', ' ')}</td>
                    <td className="py-3 text-center text-green-400 font-semibold">{u.resolved}</td>
                    <td className="py-3 text-center text-yellow-400 font-semibold">{u.active}</td>
                    <td className="py-3 text-center text-gray-300 font-semibold">{u.resolved + u.active}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
