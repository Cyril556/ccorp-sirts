import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import authRoutes from './routes/auth.routes.js';
import incidentRoutes from './routes/incident.routes.js';
import userRoutes from './routes/user.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'CCorp SIRTS API running', timestamp: new Date() } });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Auto-seed: wipe and re-seed if demo users don't exist with correct credentials
async function seedIfEmpty() {
  try {
    // Check if the correct admin user exists
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@ccorp.local' } });
    const leadUser  = await prisma.user.findUnique({ where: { email: 'lead@ccorp.local' } });

    // If either is missing, wipe all data and re-seed fresh
    if (!adminUser || !leadUser) {
      console.log('Demo users missing - wiping and re-seeding database...');

      await prisma.comment.deleteMany();
      await prisma.auditLog.deleteMany();
      await prisma.incident.deleteMany();
      await prisma.user.deleteMany();

      const adminPass   = await bcrypt.hash('Admin@1234',   10);
      const leadPass    = await bcrypt.hash('Lead@1234',    10);
      const analystPass = await bcrypt.hash('Analyst@1234', 10);
      const viewerPass  = await bcrypt.hash('Viewer@1234',  10);

      const admin = await prisma.user.create({
        data: { name: 'Alice Admin', email: 'admin@ccorp.local', passwordHash: adminPass, role: 'ADMIN' }
      });
      const socLead = await prisma.user.create({
        data: { name: 'Sam Lead', email: 'lead@ccorp.local', passwordHash: leadPass, role: 'SOC_LEAD' }
      });
      const analyst = await prisma.user.create({
        data: { name: 'John Analyst', email: 'analyst@ccorp.local', passwordHash: analystPass, role: 'ANALYST' }
      });
      await prisma.user.create({
        data: { name: 'Eve Viewer', email: 'viewer@ccorp.local', passwordHash: viewerPass, role: 'VIEWER' }
      });

      const incidents = [
        {
          title: 'Phishing Email Campaign Detected',
          description: 'Multiple employees received suspicious emails with malicious links targeting credentials. 12 users affected across Finance and HR departments.',
          category: 'PHISHING', severity: 'HIGH', status: 'IN_PROGRESS',
          sourceIP: '185.220.101.45', affectedAsset: 'Email Gateway / 12 User Mailboxes',
          assignedToId: analyst.id, createdById: socLead.id
        },
        {
          title: 'Ransomware Infection on DESKTOP-7',
          description: 'Ransomware binary detected and partially executed on DESKTOP-7. Files encrypted in D: drive. System isolated from network.',
          category: 'MALWARE', severity: 'CRITICAL', status: 'ESCALATED',
          sourceIP: '10.0.1.47', affectedAsset: 'DESKTOP-7 / Finance Department',
          assignedToId: socLead.id, createdById: analyst.id
        },
        {
          title: 'Unauthorized SSH Access Attempt on Production Server',
          description: 'Brute-force SSH login attempts detected on production server from external IP. 847 failed attempts over 2 hours before account lockout triggered.',
          category: 'UNAUTHORIZED_ACCESS', severity: 'MEDIUM', status: 'OPEN',
          sourceIP: '103.21.244.0', affectedAsset: 'PROD-SERVER-01',
          createdById: admin.id
        },
        {
          title: 'DDoS Attack on Web Application',
          description: 'Sudden spike in traffic to public-facing web app causing service degradation. Traffic volume 400x baseline. CDN rate limiting applied.',
          category: 'DDoS', severity: 'HIGH', status: 'RESOLVED',
          sourceIP: '0.0.0.0', affectedAsset: 'ccorp-web.example.com',
          assignedToId: analyst.id, createdById: socLead.id,
          resolvedAt: new Date()
        },
        {
          title: 'Suspicious PowerShell Script Execution',
          description: 'EDR alert triggered by encoded PowerShell command on LAPTOP-22. Possible lateral movement or C2 beacon. Script extracted and sent to malware analysis.',
          category: 'OTHER', severity: 'LOW', status: 'CLOSED',
          sourceIP: '10.0.2.22', affectedAsset: 'LAPTOP-22 / HR Department',
          createdById: analyst.id, resolvedAt: new Date(Date.now() - 86400000)
        },
        {
          title: 'Suspected Data Exfiltration via USB',
          description: 'DLP alert triggered when a large volume of sensitive files was copied to a USB device by a privileged user account outside business hours.',
          category: 'INSIDER_THREAT', severity: 'HIGH', status: 'OPEN',
          affectedAsset: 'CORP-FILESERVER-01', createdById: admin.id
        },
      ];

      for (const inc of incidents) {
        const created = await prisma.incident.create({ data: inc });
        await prisma.auditLog.create({
          data: {
            incidentId: created.id,
            userId: created.createdById,
            action: 'INCIDENT_CREATED',
            details: 'Auto-seed: incident created with severity ' + inc.severity
          }
        });
      }

      console.log('Seeding complete. Demo accounts:');
      console.log('  admin@ccorp.local    / Admin@1234');
      console.log('  lead@ccorp.local     / Lead@1234');
      console.log('  analyst@ccorp.local  / Analyst@1234');
      console.log('  viewer@ccorp.local   / Viewer@1234');
    } else {
      console.log('Demo users present - skipping seed.');
    }
  } catch (e) {
    console.error('Seed error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

app.listen(PORT, async () => {
  console.log(`CCorp SIRTS server running on port ${PORT}`);
  await seedIfEmpty();
});

export default app;
