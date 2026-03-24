import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [open, critical, incidentsThisWeek, allIncidents, resolvedWithTimes, byCategory] = await Promise.all([
      prisma.incident.count({ where: { status: 'OPEN' } }),
      prisma.incident.count({ where: { severity: 'CRITICAL', status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.incident.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.incident.findMany({ select: { createdAt: true }, orderBy: { createdAt: 'desc' } }),
      prisma.incident.findMany({
        where: { status: { in: ['RESOLVED', 'CLOSED'] }, resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true },
      }),
      prisma.incident.groupBy({ by: ['category'], _count: { id: true } }),
    ]);

    let mttr = 0;
    if (resolvedWithTimes.length > 0) {
      const totalMs = resolvedWithTimes.reduce((acc, inc) => acc + (new Date(inc.resolvedAt) - new Date(inc.createdAt)), 0);
      mttr = Math.round(totalMs / resolvedWithTimes.length / (1000 * 60 * 60));
    }

    const byDay = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      byDay[d.toISOString().split('T')[0]] = 0;
    }
    allIncidents.forEach((inc) => {
      const key = new Date(inc.createdAt).toISOString().split('T')[0];
      if (byDay[key] !== undefined) byDay[key]++;
    });

    const byCategoryFormatted = {};
    byCategory.forEach((item) => { byCategoryFormatted[item.category] = item._count.id; });

    return res.json({ success: true, data: { open, critical, mttr, incidentsThisWeek, byCategory: byCategoryFormatted, byDay } });
  } catch (err) { next(err); }
};
