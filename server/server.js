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

// Auto-seed if DB is empty
async function seedIfEmpty() {
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      console.log('No users found - seeding database...');
      const adminPass = await bcrypt.hash('Admin@1234', 10);
      const leadPass = await bcrypt.hash('Lead@1234', 10);
      const analystPass = await bcrypt.hash('Analyst@1234', 10);
      const admin = await prisma.user.create({ data: { name: 'Alice Admin', email: 'admin@ccorp.local', passwordHash: adminPass, role: 'ADMIN' } });
      const socLead = await prisma.user.create({ data: { name: 'Bob SOC Lead', email: 'soclead@ccorp.local', passwordHash: leadPass, role: 'SOC_LEAD' } });
      const analyst = await prisma.user.create({ data: { name: 'Carol Analyst', email: 'analyst@ccorp.local', passwordHash: analystPass, role: 'ANALYST' } });
      const incidents = [
        { title: 'Phishing Email Campaign Detected', description: 'Multiple employees received suspicious emails with malicious links targeting credentials.', category: 'PHISHING', severity: 'HIGH', status: 'IN_PROGRESS', sourceIP: '185.220.101.45', affectedAsset: 'Email Gateway / 12 User Mailboxes', assignedToId: analyst.id, createdById: socLead.id },
        { title: 'Ransomware Infection on DESKTOP-7', description: 'Ransomware binary detected and partially executed on DESKTOP-7. Files encrypted in D: drive.', category: 'MALWARE', severity: 'CRITICAL', status: 'ESCALATED', sourceIP: '10.0.1.47', affectedAsset: 'DESKTOP-7 / Finance Department', assignedToId: socLead.id, createdById: analyst.id },
        { title: 'Unauthorised SSH Access Attempt', description: 'Brute-force SSH login attempts detected on production server from external IP.', category: 'UNAUTHORISED_ACCESS', severity: 'MEDIUM', status: 'OPEN', sourceIP: '103.21.244.0', affectedAsset: 'PROD-SERVER-01', createdById: admin.id },
        { title: 'DDoS Attack on Web Application', description: 'Sudden spike in traffic to public-facing web app causing service degradation.', category: 'DOS', severity: 'HIGH', status: 'RESOLVED', sourceIP: '0.0.0.0/0', affectedAsset: 'ccorp-web.example.com', assignedToId: analyst.id, createdById: socLead.id, resolvedAt: new Date() },
        { title: 'Suspicious PowerShell Script Execution', description: 'EDR alert triggered by encoded PowerShell command on LAPTOP-22. Possible lateral movement.', category: 'OTHER', severity: 'LOW', status: 'CLOSED', sourceIP: '10.0.2.22', affectedAsset: 'LAPTOP-22 / HR Department', createdById: analyst.id, resolvedAt: new Date(Date.now() - 86400000) },
      ];
      for (const inc of incidents) {
        const created = await prisma.incident.create({ data: inc });
        await prisma.auditLog.create({ data: { incidentId: created.id, userId: created.createdById, action: 'INCIDENT_CREATED', details: 'Auto-seed: incident created' } });
      }
      console.log('Seeding complete. Users: admin@ccorp.local / soclead@ccorp.local / analyst@ccorp.local');
    } else {
      console.log(`Database already has ${count} user(s) - skipping seed.`);
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
