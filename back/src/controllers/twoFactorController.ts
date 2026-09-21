import { Response } from 'express';
import { AuthenticatedRequest } from '../interfaces/interfaces.js';
import prisma from '../services/db.js';
import { comparePassword } from '../utils/securityUtils.js';
import { encryptSecret, newSecret } from '../utils/twoFactor.js';
import { consumeFactor } from '../services/twoFactor.js';

export async function factorStatus(req: AuthenticatedRequest, res: Response) {
  const factor = await prisma.twoFactor.findUnique({ where: { userId: req.user!.id } });
  res.set('Cache-Control', 'no-store').json({ enabled: factor?.enabled ?? false });
}
export async function setupFactor(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (typeof req.body.password !== 'string' || !comparePassword(req.body.password, user.password))
    return res.status(400).json({ message: 'Invalid password' });
  const secret = newSecret();
  const encrypted = encryptSecret(secret);
  const result = await prisma.$transaction(async tx => {
    // On lock user
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
    const existing = await tx.twoFactor.findUnique({ where: { userId } });
    if (existing?.enabled) return false;
    // La clé expire au bout de 10 minutes
    const data = { secret: encrypted, setupExpiresAt: new Date(Date.now() + 10 * 60000), recoveryHashes: [], lastStep: -1 };
    await tx.twoFactor.upsert({ where: { userId }, create: { userId, ...data }, update: data });
    return true;
  });
  if (!result) return res.status(409).json({ message: 'La double authentification est déjà active' });
  // On stocke pas la réponse en cache
  return res.set('Cache-Control', 'no-store').json({ secret });
}
export const changeFactor = (action: 'enable' | 'disable') => async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (typeof req.body.password !== 'string' || !comparePassword(req.body.password, user.password))
    return res.status(400).json({ message: 'Invalid password' });
  const result = await consumeFactor(userId, req.body.code, action);
  if (!result.ok) return res.status(result.limited ? 429 : 400).json({ message: result.limited ? 'Trop de tentatives' : 'Code incorrect ou déjà utilisé' });
  return res.set('Cache-Control', 'no-store').json(result);
};
