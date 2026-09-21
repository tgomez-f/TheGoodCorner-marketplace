import prisma from './db.js';
import { decryptSecret, verifyTotp, recoveryHash, newRecoveryCodes } from '../utils/twoFactor.js';

export async function consumeFactor(userId: number, code: unknown, action: 'login' | 'enable' | 'disable') {
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${userId} FOR UPDATE`;
    await tx.$queryRaw`SELECT "userId" FROM "TwoFactor" WHERE "userId" = ${userId} FOR UPDATE`;
    const factor = await tx.twoFactor.findUnique({ where: { userId } });
    if (!factor || (action === 'enable' ? factor.enabled || factor.setupExpiresAt < new Date() : !factor.enabled)) return { ok: false as const };
    const now = new Date();
    // Limite d'essais -> 5 toutes les 15 minutes
    const reset = now.getTime() - factor.windowStart.getTime() >= 15 * 60 * 1000;
    const attempts = reset ? 0 : factor.attempts;
    if (attempts >= 5) return { ok: false as const, limited: true };
    await tx.twoFactor.update({ where: { userId }, data: { attempts: attempts + 1, ...(reset ? { windowStart: now } : {}) } });
    const step = verifyTotp(decryptSecret(factor.secret), code, factor.lastStep);
    // on calcule le hash du code en input, au cas où ce serait un code de secours
    const hash = typeof code === 'string' && code.length <= 20 ? recoveryHash(code) : '';
    const recovery = action !== 'enable' && factor.recoveryHashes.includes(hash);
    if (step === null && !recovery) return { ok: false as const };
    if (action === 'disable') {
      await tx.twoFactor.delete({ where: { userId } });
    } else { // login || enable
      const codes = action === 'enable' ? newRecoveryCodes() : undefined;
      await tx.twoFactor.update({ where: { userId }, data: {
        enabled: true,
        attempts: 0,
        // si le totp est valide, on met à jour lastStep
        ...(step !== null ? { lastStep: step } : {}),
        // on met dans la base les nouveaux codes de secours hashés (enable) ou on retire le code de secours utilisé (login)
        recoveryHashes: codes ? codes.map(recoveryHash) : factor.recoveryHashes.filter(value => value !== hash),
      } });
      if (action === 'login') return { ok: true as const };
      await tx.refreshToken.deleteMany({ where: { userId } });
      return { ok: true as const, recoveryCodes: codes };
    }
    await tx.refreshToken.deleteMany({ where: { userId } });
    return { ok: true as const };
  });
}
