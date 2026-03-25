import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CCorp SIRTS database...');

  await prisma.comment.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.user.deleteMany();

  const adminHash   = await bcrypt.hash('Admin@1234', 10);
  const leadHash    = await bcrypt.hash('Lead@1234',  10);
  const analystHash = await bcrypt.hash('Analyst@1234', 10);

  const admin = await prisma.user.create({
    data: { name: 'Alice Admin', email: 'admin@ccorp.local', passwordHash: adminHash, role: 'ADMIN' },
  });
  const lead = await prisma.user.create({
    data: { name: 'Sam Lead', email: 'lead@ccorp.local', passwordHash: leadHash, role: 'SOC_LEAD' },
  });
  const analyst = await prisma.user.create({
    data: { name: 'John Analyst', email: 'analyst@ccorp.local', passwordHash: analystHash, role: 'ANALYST' },
  });

  console.log('Users created.');

  const incidents = [
    {
      title: 'Ransomware Outbreak on Finance Workstations',
      description: 'Multiple workstations in the Finance department encrypted by ransomware. Initial vector appears to be a phishing email with malicious attachment.',
      category: 'MALWARE', severity: 'CRITICAL', status: 'IN_PROGRESS',
      sourceIP: '192.168.10.45', affectedAsset: 'FINANCE-PC-01',
      createdById: admin.id, assignedToId: analyst.id,
    },
    {
      title: 'Spear-Phishing Campaign Targeting HR Department',
      description: 'Emails impersonating the CEO requesting urgent wire transfers. Three employees clicked the malicious link before the campaign was identified.',
      category: 'PHISHING', severity: 'HIGH', status: 'OPEN',
      sourceIP: '203.0.113.45', affectedAsset: 'HR-MAIL-SERVER',
      createdById: analyst.id, assignedToId: lead.id,
    },
    {
      title: 'Unauthorised Access to Production Database',
      description: 'IDS flagged repeated login attempts to the primary database server. Successful login from unrecognised IP at 03:14 UTC.',
      category: 'UNAUTHORISED_ACCESS', severity: 'CRITICAL', status: 'ESCALATED',
      sourceIP: '10.0.0.254', affectedAsset: 'DB-PROD-01',
      createdById: lead.id, assignedToId: analyst.id,
    },
    {
      title: 'Volumetric DDoS Attack on Public Web Server',
      description: 'Public-facing web server hit with ~500x normal traffic. External users unable to access services for 47 minutes. Mitigation applied.',
      category: 'DOS', severity: 'HIGH', status: 'RESOLVED',
      sourceIP: '198.51.100.0', affectedAsset: 'WEB-PUB-01',
      createdById: admin.id, resolvedAt: new Date(Date.now() - 3600000),
    },
    {
      title: 'Suspected Data Exfiltration via Cloud Storage',
      description: 'DLP detected anomalous outbound transfer of 2.3 GB from internal endpoint to unapproved cloud storage over 4 hours during off-peak hours.',
      category: 'OTHER', severity: 'CRITICAL', status: 'OPEN',
      sourceIP: '192.168.1.78', affectedAsset: 'CORP-FILE-SERVER',
      createdById: analyst.id,
    },
    {
      title: 'Trojan Malware on IT Administrator Workstation',
      description: 'Endpoint protection detected Trojan.GenericKD. Malware attempted to access credential stores and establish C2 connection. System isolated and reimaged.',
      category: 'MALWARE', severity: 'HIGH', status: 'RESOLVED',
      sourceIP: '192.168.5.10', affectedAsset: 'IT-ADMIN-PC-01',
      createdById: analyst.id, assignedToId: analyst.id,
      resolvedAt: new Date(Date.now() - 86400000),
    },
    {
      title: 'Excessive Privileged File Access - Insider Risk',
      description: 'UEBA flagged unusual behavior: account accessed 847 sensitive files outside normal working hours over a 3-day window.',
      category: 'UNAUTHORISED_ACCESS', severity: 'MEDIUM', status: 'IN_PROGRESS',
      affectedAsset: 'CORP-AD-DOMAIN',
      createdById: lead.id, assignedToId: lead.id,
    },
    {
      title: 'Credential Stuffing Attack on VPN Gateway',
      description: 'Auth logs show repeated failed logins against VPN gateway from 23 distinct IPs. Consistent with automated credential stuffing using leaked credentials.',
      category: 'UNAUTHORISED_ACCESS', severity: 'MEDIUM', status: 'CLOSED',
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

  console.log('\nSeeding complete!');
  console.log('\nDemo credentials:');
  console.log('  Admin:   admin@ccorp.local   /  Admin@1234');
  console.log('  Lead:    lead@ccorp.local    /  Lead@1234');
  console.log('  Analyst: analyst@ccorp.local /  Analyst@1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
