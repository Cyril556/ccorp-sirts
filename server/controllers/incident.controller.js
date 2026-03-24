import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createAuditLog = async (incidentId, userId, action, details) => {
  await prisma.auditLog.create({ data: { incidentId, userId, action, details } });
};

export const getAllIncidents = async (req, res, next) => {
  try {
    const incidents = await prisma.incident.findMany({
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: incidents });
  } catch (err) { next(err); }
};

export const getIncidentById = async (req, res, next) => {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: req.params.id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        comments: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' } },
        auditLogs: { include: { user: { select: { id: true, name: true } } }, orderBy: { timestamp: 'asc' } },
      },
    });
    if (!incident) return res.status(404).json({ success: false, error: 'Incident not found' });
    return res.json({ success: true, data: incident });
  } catch (err) { next(err); }
};

export const createIncident = async (req, res, next) => {
  try {
    const { title, description, category, severity, sourceIP, affectedAsset, assignedToId } = req.body;
    if (!title || !description || !category || !severity) {
      return res.status(400).json({ success: false, error: 'title, description, category and severity are required' });
    }
    const incident = await prisma.incident.create({
      data: { title, description, category, severity, sourceIP, affectedAsset, assignedToId, createdById: req.user.id },
    });
    await createAuditLog(incident.id, req.user.id, 'INCIDENT_CREATED', 'Incident created with severity ' + severity);
    return res.status(201).json({ success: true, data: incident });
  } catch (err) { next(err); }
};

export const updateIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.incident.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Incident not found' });
    const { status, assignedToId, severity, title, description, category, sourceIP, affectedAsset } = req.body;
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (severity !== undefined) updateData.severity = severity;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (sourceIP !== undefined) updateData.sourceIP = sourceIP;
    if (affectedAsset !== undefined) updateData.affectedAsset = affectedAsset;
    if (status === 'RESOLVED' || status === 'CLOSED') updateData.resolvedAt = new Date();
    const updated = await prisma.incident.update({ where: { id }, data: updateData });
    const changes = Object.keys(updateData).map((k) => k + ': ' + updateData[k]).join(', ');
    await createAuditLog(id, req.user.id, 'INCIDENT_UPDATED', 'Updated: ' + changes);
    return res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

export const deleteIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.incident.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Incident not found' });
    await prisma.auditLog.deleteMany({ where: { incidentId: id } });
    await prisma.comment.deleteMany({ where: { incidentId: id } });
    await prisma.incident.delete({ where: { id } });
    return res.json({ success: true, data: { message: 'Incident deleted' } });
  } catch (err) { next(err); }
};

export const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req.body;
    if (!body || !body.trim()) return res.status(400).json({ success: false, error: 'Comment body is required' });
    const existing = await prisma.incident.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Incident not found' });
    const comment = await prisma.comment.create({
      data: { incidentId: id, userId: req.user.id, body },
      include: { user: { select: { id: true, name: true } } },
    });
    await createAuditLog(id, req.user.id, 'COMMENT_ADDED', 'Comment added');
    return res.status(201).json({ success: true, data: comment });
  } catch (err) { next(err); }
};
