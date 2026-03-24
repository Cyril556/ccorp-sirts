import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const updated = await prisma.user.update({
      where: { id },
      data: { ...(name && { name }), ...(role && { role }) },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    return res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};
