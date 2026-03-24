import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CCorp SIRTS database...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPass = await bcrypt.hash('Admin@1234', 10);
  const leadPass = await bcrypt.hash('Lead@1234', 10);
  const analystPass = await bcrypt.hash('Analyst@1234', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Alice Admin',
      email: 'admin@ccorp.local',
      passwordHash: adminPass,
      role: 'ADMIN',
    },
  });

  const socLead = await prisma.user.create({
    data: {
      name: 'Bob SOC Lead',
      email: 'soclead@ccorp.local',
      passwordHash: leadPass,
      role: 'SOC_LEAD',
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: 'Carol Analyst',
      email: 'analyst@ccorp.local',
      passwordHash: analystPass,
      role: 'ANALYST',
    },
  });

  console.log('Created users:', admin.email, socLead.email, analyst.email);

  // Create 5 sample incidents
  const incidents = [
    {
      title: 'Phishing Email Campaign Detected',
      description: 'Multiple employees received suspicious emails with malicious links targeting credentials.',
      category: 'PHISHING',
      severity: 'HIGH',
      status: 'IN_PROGRESS',
      sourceIP: '185.220.101.45',
      affectedAsset: 'Email Gateway / 12 User Mailboxes',
      assignedToId: analyst.id,
      createdById: socLead.id,
    },
    {
      title: 'Ransomware Infection on DESKTOP-7',
      description: 'Ransomware binary detected and partially executed on DESKTOP-7. Files encrypted in D: drive.',
      category: 'MALWARE',
      severity: 'CRITICAL',
      status: 'ESCALATED',
      sourceIP: '10.0.1.47',
      affectedAsset: 'DESKTOP-7 / Finance Department',
      assignedToId: socLead.id,
      createdById: analyst.id,
    },
    {
      title: 'Unauthorised SSH Access Attempt',
      description: 'Brute-force SSH login attempts detected on production server from external IP.',
      category: 'UNAUTHORISED_ACCESS',
      severity: 'MEDIUM',
      status: 'OPEN',
      sourceIP: '103.21.244.0',
      affectedAsset: 'PROD-SERVER-01',
      createdById: admin.id,
    },
    {
      title: 'DDoS Attack on Web Application',
      description: 'Sudden spike in traffic to public-facing web app causing service degradation.',
      category: 'DOS',
      severity: 'HIGH',
      status: 'RESOLVED',
      sourceIP: '0.0.0.0/0',
      affectedAsset: 'ccorp-web.example.com',
      assignedToId: analyst.id,
      createdById: socLead.id,
      resolvedAt: new Date(),
    },
    {
      title: 'Suspicious PowerShell Script Execution',
      description: 'EDR alert triggered by encoded PowerShell command on LAPTOP-22. Possible lateral movement.',
      category: 'OTHER',
      severity: 'LOW',
      status: 'CLOSED',
      sourceIP: '10.0.2.22',
      affectedAsset: 'LAPTOP-22 / HR Department',
      createdById: analyst.id,
      resolvedAt: new Date(Date.now() - 86400000),
    },
  ];

  for (const inc of incidents) {
    const created = await prisma.incident.create({ data: inc });
    await prisma.auditLog.create({
      data: {
        incidentId: created.id,
        userId: created.createdById,
        action: 'INCIDENT_CREATED',
        details: 'Seed: incident created',
      },
    });
    console.log('Created incident:', created.title);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
