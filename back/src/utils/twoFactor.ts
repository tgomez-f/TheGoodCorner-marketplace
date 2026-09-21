import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// Base32
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function newSecret() {
  // generation de 32 octets random -> conversion en caractère -> création du tableau -> conversion en string
  return Array.from(randomBytes(32), b => alphabet[b & 31]).join('');
}

// decode le Base32
function decode(secret: string) {
  // pour chaque caractere, on convertit en binaire puis on complete avec des 0 pour former des groupes de 5 bits
  const bits = [...secret].map(c => alphabet.indexOf(c).toString(2).padStart(5, '0')).join('');
  // on decoupe la string (representation binaire) en groupe de 8, on convertit chaque groupe en decimal, et on construit le buffer
  return Buffer.from(bits.match(/.{8}/g)!.map(b => parseInt(b, 2)));
}

// calcule le code TOTP à 6 chiffres
export function totp(secret: string, step: number, digits = 6) {
  // on met la période sur 64 bits
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  // calcule le hash via le secret et la période (30 secondes)
  const hash = createHmac('sha1', decode(secret)).update(counter).digest();
  // on recupere les 4 derniers bits du hash pour definir l'offset -> position à partir de laquelle on va lire les 4 octets
  const offset = hash[hash.length - 1]! & 15;
  // on lit les 4 octets du hash, en mettant le bit de signe à 0 pour que le résultat soit positif - puis on génère le TOTP à 6 chiffres
  return ((hash.readUInt32BE(offset) & 0x7fffffff) % (10 ** digits)).toString().padStart(digits, '0');
}

export function verifyTotp(secret: string, code: unknown, lastStep: number, now = Date.now()) {
  // vérifie si code est string de 6 chiffres
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) return null;
  // période de 30 secondes
  const step = Math.floor(now / 30000);
  for (const a of [step, step - 1, step + 1]) {
    // on n'accepte pas un totp déjà utilisé (1 totp max consommé par période)
    // on compare le code recu au code attendu, de facon safe pour éviter que le temps de comparaison ne révèle où se trouve une différence
    if (a > lastStep && timingSafeEqual(Buffer.from(totp(secret, a)), Buffer.from(code))) return a;
  }
  return null;
}

// Verifie si la clé serveur existe et vérifie via REGEX qu'elle contient bien 64 caracteres hexadecimaux
// Puis la convertit de string vers octets et la return
function encryptionKey() {
  const key = process.env.TWO_FACTOR_ENCRYPTION_KEY;
  if (!key || !/^[a-fA-F0-9]{64}$/.test(key)) throw new Error('TWO_FACTOR_ENCRYPTION_KEY must contain 64 hexadecima characters');
  return Buffer.from(key, 'hex');
}
export function encryptSecret(secret: string) {
  // initialization vector de 12 octets recommandé pour AES-GCM
  const iv = randomBytes(12);
  // creation du cipher
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  // chiffrement via le cipher
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  // secret stocké en BDD: [IV: 12 octets] [tag: 16 octets] [secret chiffré: 32 octets]
  // tag permet de détecter une clé altérée
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64');
}
export function decryptSecret(value: string) {
  const data = Buffer.from(value, 'base64');
  // cipher de déchiffrement, à partir de la clé serveur et l'IV
  const cipher = createDecipheriv('aes-256-gcm', encryptionKey(), data.subarray(0, 12));
  cipher.setAuthTag(data.subarray(12, 28));
  return Buffer.concat([cipher.update(data.subarray(28)), cipher.final()]).toString('utf8');
}
export const recoveryHash = (code: string) => createHash('sha256').update(code.toLowerCase()).digest('hex');
export const newRecoveryCodes = () => Array.from({ length: 10 }, () => randomBytes(10).toString('hex'));
