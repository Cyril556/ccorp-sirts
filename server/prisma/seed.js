import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CCorp SIRTS database...');

  // Clean existing data
  await prisma.comment.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminHash = await bcrypt.hash('Admin@1234', 10);
  const leadHash   = await bcrypt.hash('Lead@1234',  10);
  const analystHash = await bcrypt.hash('Analyst@1234', 10);
  const viewerHash  = await bcrypt.hash('Viewer@1234',  10);

  const admin = await prisma.user.create({
    data: { name: 'Alice Admin', email: 'admin@ccorp.local', passwordHash: adminHash, role: 'ADMIN' },
  });
  const lead = await prisma.user.create({
    data: { name: 'Sam Lead', email: 'lead@ccorp.local', passwordHash: leadHash, role: 'SOC_LEAD' },
  });
  const analyst = await prisma.user.create({
    data: { name: 'John Analyst', email: 'analyst@ccorp.local', passwordHash: analystHash, role: 'ANALYST' },
  });
  await prisma.user.create({
    data: { name: 'Eve Viewer', email: 'viewer@ccorp.local', passwordHash: viewerHash, role: 'VIEWER' },
  });

  console.log('Users created successfully.');

  const incidents = [
    {
      title: 'Ransomware Outbreak on Finance Workstations',
      description: 'Multiple workstations in the Finance department have been encrypted by ransomware. Files with .locked extension detected. Initial vector appears to be a phishing email with malicious attachment received at 08:32.',
      category: 'MALWARE', severity: 'CRITICAL', status: 'IN_PROGRESS',
      sourceIP: '192.168.10.45', affectedAsset: 'FINANCE-PC-01, FINANCE-PC-02, FINANCE-PC-03',
      createdById: admin.id, assignedToId: analyst.id,
    },
    {
      title: 'Spear-Phishing Campaign Targeting HR Department',
      description: 'A spear-phishing campaign has been identified targeting HR staff. Emails impersonate the CEO requesting urgent wire transfers. Three employees clicked the malicious link before the campaign was identified.',
      category: 'PHISHING', severity: 'HIGH', status: 'OPEN',
      sourceIP: '203.0.113.45', affectedAsset: 'HR-MAIL-SERVER',
      createdById: analyst.id, assignedToId: lead.id,
    },
    {
      title: 'Unauthorized Access to Production Database',
      description: 'Intrusion detection system flagged repeated login attempts to the primary database server. Multiple failed attempts followed by a successful login from an unrecognised IP address at 03:14 UTC.',
      category: 'UNAUTHORIZED_ACCESS', severity: 'CRITICAL', status: 'ESCALATED',
      sourceIP: '10.0.0.254', affectedAsset: 'DB-PROD-01',
      createdById: lead.id, assignedToId: analyst.id,
    },
    {
      title: 'Volumetric DDoS Attack on Public Web Server',
      description: 'The public-facing web server experienced extremely high traffic (approx. 500x normal baseline). CDN confirmed a volumetric DDoS attack. External users unable to access services for 47 minutes. Mitigation applied.',
      category: 'DDoS', severity: 'HIGH', status: 'RESOLVED',
      sourceIP: '198.51.100.0', affectedAsset: 'WEB-PUB-01',
      createdById: admin.id, resolvedAt: new Date(Date.now() - 3600000),
    },
    {
      title: 'Suspected Data Exfiltration via Cloud Storage',
      description: 'DLP system detected an anomalous outbound data transfer of over 2.3 GB from an internal endpoint to an unapproved external cloud storage provider. Exfiltration occurred over 4 hours during off-peak hours.',
      category: 'DATA_BREACH', severity: 'CRITICAL', status: 'OPEN',
      sourceIP: '192.168.1.78', affectedAsset: 'CORP-FILE-SERVER',
      createdById: analyst.id,
    },
    {
      title: 'Trojan Malware on IT Administrator Workstation',
      description: 'Endpoint protection detected Trojan.GenericKD on the IT administrator workstation. The malware attempted to access credential stores and establish a C2 connection. System isolated and reimaged.',
      category: 'MALWARE', severity: 'HIGH', status: 'RESOLVED',
      sourceIP: '192.168.5.10', affectedAsset: 'IT-ADMIN-PC-01',
      createdById: analyst.id, assignedToId: analyst.id,
      resolvedAt: new Date(Date.now() - 86400000),
    },
    {
      title: 'Insider Threat - Excessive Privileged File Access',
      description: 'UEBA system flagged unusual behavior from a privileged user account. The account accessed 847 sensitive files outside normal working hours and outside their normal access patterns over a 3-day window.',
      category: 'INSIDER_THREAT', severity: 'MEDIUM', status: 'IN_PROGRESS',
      affectedAsset: 'CORP-AD-DOMAIN',
      createdById: lead.id, assignedToId: lead.id,
    },
    {
      title: 'Credential Stuffing Attack on VPN Gateway',
      description: 'Authentication logs show repeated failed login attempts against the VPN gateway from 23 distinct source IPs. Pattern consistent with an automated credential stuffing attack using leaked credentials.',
      category: 'UNAUTHORIZED_ACCESS', severity: 'MEDIUM', status: 'CLOSED',
      sourceIP: '185.220.101.0', affectedAsset: 'VPN-GW-01',
      createdById: analyst.id, resolvedAt: new Date(Date.now() - 172800000),
    },
  ];

  for (const inc of incidents) {
    const created = await prisma.incident.create({ data: inc });
    await prisma.auditLog.create({
      data: {
        incidentId: created.id,
        userId: inc.createdById,
        action: 'INCIDENT_CREATED',
        details: `Incident created with severity ${inc.severity}`,
      },
    });
    if (inc.assignedToId) {
      await prisma.auditLog.create({
        data: {
          incidentId: created.id,
          userId: inc.createdById,
          action: 'INCIDENT_ASSIGNED',
          details: `Incident assigned to analyst`,
        },
      });
    }
    console.log('  Created:', created.title);
  }

  console.log('\nDatabase seeding complete!');
  console.log('\nDemo credentials:');
  console.log('  Admin:   admin@ccorp.local   /  Admin@1234   [Full access]');
  console.log('  Lead:    lead@ccorp.local    /  Lead@1234    [SOC Lead]');
  console.log('  Analyst: analyst@ccorp.local /  Analyst@1234 [Analyst]');
  console.log('  Viewer:  viewer@ccorp.local  /  Viewer@1234  [Read-only]');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
