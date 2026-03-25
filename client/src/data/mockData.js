// ============================================================
// CCorp SIRTS — Mock Data (mirrors seeded Supabase DB)
// ============================================================

export const MOCK_USERS = [
  { id: 'u1', name: 'Alice Admin',   email: 'admin@ccorp.local',   role: 'ADMIN',     createdAt: '2026-01-10T08:00:00Z' },
  { id: 'u2', name: 'Sam Lead',      email: 'lead@ccorp.local',    role: 'SOC_LEAD',  createdAt: '2026-01-12T09:00:00Z' },
  { id: 'u3', name: 'John Analyst',  email: 'analyst@ccorp.local', role: 'ANALYST',   createdAt: '2026-01-15T10:00:00Z' },
];

export const MOCK_INCIDENTS = [
  {
    id: 'inc-001', title: 'Ransomware Outbreak on Finance Workstations',
    description: 'Multiple workstations in the Finance department have been encrypted by ransomware. Files with .locked extension detected. Initial vector appears to be a phishing email with malicious attachment received at 08:32.',
    category: 'MALWARE', severity: 'CRITICAL', status: 'IN_PROGRESS',
    sourceIP: '192.168.10.45', affectedAsset: 'FINANCE-PC-01, FINANCE-PC-02',
    createdById: 'u1', assignedToId: 'u3',
    createdAt: '2026-03-18T08:45:00Z', updatedAt: '2026-03-18T10:00:00Z', resolvedAt: null,
  },
  {
    id: 'inc-002', title: 'Spear-Phishing Campaign Targeting HR Department',
    description: 'A spear-phishing campaign targeting HR staff has been identified. Emails impersonate the CEO requesting urgent wire transfers. Three employees clicked the malicious link before identification.',
    category: 'PHISHING', severity: 'HIGH', status: 'OPEN',
    sourceIP: '203.0.113.45', affectedAsset: 'HR-MAIL-SERVER',
    createdById: 'u3', assignedToId: 'u2',
    createdAt: '2026-03-19T11:20:00Z', updatedAt: '2026-03-19T11:20:00Z', resolvedAt: null,
  },
  {
    id: 'inc-003', title: 'Unauthorised Access to Production Database',
    description: 'IDS flagged repeated login attempts to the primary database server. Multiple failed attempts followed by a successful login from an unrecognised IP at 03:14 UTC.',
    category: 'UNAUTHORISED_ACCESS', severity: 'CRITICAL', status: 'ESCALATED',
    sourceIP: '10.0.0.254', affectedAsset: 'DB-PROD-01',
    createdById: 'u2', assignedToId: 'u3',
    createdAt: '2026-03-20T03:30:00Z', updatedAt: '2026-03-20T07:00:00Z', resolvedAt: null,
  },
  {
    id: 'inc-004', title: 'Volumetric DDoS Attack on Public Web Server',
    description: 'Public-facing web server experienced ~500x normal traffic. CDN confirmed volumetric DDoS. External users unable to access services for 47 minutes. Mitigation applied via upstream filtering.',
    category: 'DOS', severity: 'HIGH', status: 'RESOLVED',
    sourceIP: '198.51.100.0', affectedAsset: 'WEB-PUB-01',
    createdById: 'u1', assignedToId: null,
    createdAt: '2026-03-20T14:00:00Z', updatedAt: '2026-03-20T15:30:00Z', resolvedAt: '2026-03-20T15:30:00Z',
  },
  {
    id: 'inc-005', title: 'Suspected Data Exfiltration via Cloud Storage',
    description: 'DLP system detected anomalous outbound transfer of 2.3 GB from internal endpoint to unapproved external cloud storage. Exfiltration occurred over 4 hours during off-peak hours.',
    category: 'OTHER', severity: 'CRITICAL', status: 'OPEN',
    sourceIP: '192.168.1.78', affectedAsset: 'CORP-FILE-SERVER',
    createdById: 'u3', assignedToId: null,
    createdAt: '2026-03-21T02:15:00Z', updatedAt: '2026-03-21T02:15:00Z', resolvedAt: null,
  },
  {
    id: 'inc-006', title: 'Trojan Malware on IT Administrator Workstation',
    description: 'Endpoint protection detected Trojan.GenericKD on the IT admin workstation. Malware attempted to access credential stores and establish C2 connection. System isolated and reimaged.',
    category: 'MALWARE', severity: 'HIGH', status: 'RESOLVED',
    sourceIP: '192.168.5.10', affectedAsset: 'IT-ADMIN-PC-01',
    createdById: 'u3', assignedToId: 'u3',
    createdAt: '2026-03-22T09:00:00Z', updatedAt: '2026-03-22T17:00:00Z', resolvedAt: '2026-03-22T17:00:00Z',
  },
  {
    id: 'inc-007', title: 'Excessive Privileged File Access — Insider Risk',
    description: 'UEBA flagged a privileged user account that accessed 847 sensitive files outside normal working hours and outside normal access patterns over a 3-day window.',
    category: 'UNAUTHORISED_ACCESS', severity: 'MEDIUM', status: 'IN_PROGRESS',
    sourceIP: null, affectedAsset: 'CORP-AD-DOMAIN',
    createdById: 'u2', assignedToId: 'u2',
    createdAt: '2026-03-22T20:00:00Z', updatedAt: '2026-03-23T08:00:00Z', resolvedAt: null,
  },
  {
    id: 'inc-008', title: 'Credential Stuffing Attack on VPN Gateway',
    description: 'Auth logs show repeated failed logins against VPN gateway from 23 distinct source IPs. Pattern consistent with automated credential stuffing using leaked credential lists.',
    category: 'UNAUTHORISED_ACCESS', severity: 'MEDIUM', status: 'CLOSED',
    sourceIP: '185.220.101.0', affectedAsset: 'VPN-GW-01',
    createdById: 'u3', assignedToId: null,
    createdAt: '2026-03-23T06:00:00Z', updatedAt: '2026-03-23T14:00:00Z', resolvedAt: '2026-03-23T14:00:00Z',
  },
];

export const MOCK_AUDIT_LOGS = [
  { id: 'al-001', incidentId: 'inc-001', userId: 'u1', action: 'INCIDENT_CREATED',  details: 'Incident created with severity CRITICAL', timestamp: '2026-03-18T08:45:00Z' },
  { id: 'al-002', incidentId: 'inc-001', userId: 'u1', action: 'INCIDENT_ASSIGNED', details: 'Assigned to John Analyst',               timestamp: '2026-03-18T08:50:00Z' },
  { id: 'al-003', incidentId: 'inc-001', userId: 'u3', action: 'STATUS_CHANGED',    details: 'Status changed: OPEN → IN_PROGRESS',     timestamp: '2026-03-18T10:00:00Z' },
  { id: 'al-004', incidentId: 'inc-002', userId: 'u3', action: 'INCIDENT_CREATED',  details: 'Incident created with severity HIGH',     timestamp: '2026-03-19T11:20:00Z' },
  { id: 'al-005', incidentId: 'inc-002', userId: 'u3', action: 'INCIDENT_ASSIGNED', details: 'Assigned to Sam Lead',                   timestamp: '2026-03-19T11:22:00Z' },
  { id: 'al-006', incidentId: 'inc-003', userId: 'u2', action: 'INCIDENT_CREATED',  details: 'Incident created with severity CRITICAL', timestamp: '2026-03-20T03:30:00Z' },
  { id: 'al-007', incidentId: 'inc-003', userId: 'u2', action: 'STATUS_CHANGED',    details: 'Status changed: OPEN → ESCALATED',       timestamp: '2026-03-20T07:00:00Z' },
  { id: 'al-008', incidentId: 'inc-004', userId: 'u1', action: 'INCIDENT_CREATED',  details: 'Incident created with severity HIGH',     timestamp: '2026-03-20T14:00:00Z' },
  { id: 'al-009', incidentId: 'inc-004', userId: 'u1', action: 'STATUS_CHANGED',    details: 'Status changed: OPEN → RESOLVED',        timestamp: '2026-03-20T15:30:00Z' },
];

export const MOCK_COMMENTS = [
  { id: 'cm-001', incidentId: 'inc-001', userId: 'u3', body: 'Isolated affected machines from the network. Running full AV scan now.', createdAt: '2026-03-18T09:10:00Z' },
  { id: 'cm-002', incidentId: 'inc-001', userId: 'u2', body: 'Confirmed ransomware strain as LockBit 3.0. Notified legal and compliance teams.', createdAt: '2026-03-18T09:45:00Z' },
  { id: 'cm-003', incidentId: 'inc-001', userId: 'u1', body: 'Backups verified intact from last night 23:00 snapshot. Recovery plan initiated.', createdAt: '2026-03-18T10:30:00Z' },
  { id: 'cm-004', incidentId: 'inc-002', userId: 'u2', body: 'Blocked sender domain at mail gateway. Forcing password resets on all three affected accounts.', createdAt: '2026-03-19T12:00:00Z' },
  { id: 'cm-005', incidentId: 'inc-003', userId: 'u3', body: 'Revoking the compromised DB credentials and rotating all service account passwords.', createdAt: '2026-03-20T07:30:00Z' },
  { id: 'cm-006', incidentId: 'inc-003', userId: 'u2', body: 'Access logs exported and sent to forensics. IP traced to TOR exit node.', createdAt: '2026-03-20T09:00:00Z' },
];

// Helper to resolve user by ID
export const getUserById = (id) => MOCK_USERS.find(u => u.id === id) || null;

// Dashboard stats derived from mock incidents
export const getMockStats = () => {
  const open = MOCK_INCIDENTS.filter(i => i.status === 'OPEN').length;
  const critical = MOCK_INCIDENTS.filter(i => i.severity === 'CRITICAL').length;
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const incidentsThisWeek = MOCK_INCIDENTS.filter(i => new Date(i.createdAt) >= weekAgo).length;

  // MTTR from resolved incidents
  const resolved = MOCK_INCIDENTS.filter(i => i.resolvedAt);
  const mttr = resolved.length
    ? Math.round(resolved.reduce((acc, i) => acc + (new Date(i.resolvedAt) - new Date(i.createdAt)) / 3600000, 0) / resolved.length)
    : null;

  // By category
  const byCategory = MOCK_INCIDENTS.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {});

  // By day (last 7)
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const byDay = Array.from({ length: 7 }, (_, k) => {
    const d = new Date(now - (6 - k) * 86400000);
    const count = MOCK_INCIDENTS.filter(i => {
      const c = new Date(i.createdAt);
      return c.toDateString() === d.toDateString();
    }).length;
    return { day: days[d.getDay()], count };
  });

  return { open, critical, incidentsThisWeek, mttr, byCategory, byDay };
};
