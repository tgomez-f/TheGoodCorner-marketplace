import { Prisma } from '@prisma/client';
import { UserUpdate } from '../../interfaces/interfaces.js';
import { hashIt } from '../../utils/securityUtils.js';

// Erreur "métier" (validation), distincte d'un vrai crash serveur : permet
// au controller de répondre 400 avec le message exact plutôt qu'un 500
// générique. Voir le patch du catch{} dans userController.ts.
export class ValidationError extends Error {
  constructor(message: string) {
	super(message);
	this.name = 'ValidationError';
  }
}

export const userUpdate = ({ body, file }: UserUpdate): Prisma.UserUpdateInput => {
	const data: Prisma.UserUpdateInput = {};
	const sellerEliteStatusCatchPass = 'GoodCornerBigBoss';

	if (body.email !== undefined) {
		const allowedDomains: string[] = ['gmail.com', 'hotmail.com', 'yahoo.com', 'laposte.net'];
		const domain = body.email.split('@')[1];
		if (domain && !allowedDomains.includes(domain.toLowerCase()))
			throw new ValidationError('Invalid email. Domain is forbidden.');
		data.email = String(body.email);
	}

	if (body.username !== undefined) 
		data.username = String(body.username);
	if (body.password !== undefined)
		data.password = String(body.password);
	if (body.name !== undefined)
		data.name = String(body.name);
	if (body.bio !== undefined)
		data.bio = String(body.bio);

	if (body.phoneNumber !== undefined) {
		if (body.phoneNumber === null || body.phoneNumber === '') {
			data.phoneNumber = null;
	} 
	else {
		const sanitizedPhone = String(body.phoneNumber).replace(/\D/g, '');
		if (sanitizedPhone.length !== 10)
			throw new ValidationError('Invalid phone number (10 digits are required).');
		data.phoneNumber = sanitizedPhone;
		}
	}
	if (body.sellerEliteStatusCatchPhrase !== undefined) {
		if (body.sellerEliteStatusCatchPhrase === sellerEliteStatusCatchPass && body.sellerEliteStatus === false)
			data.sellerEliteStatus = true;
		data.sellerEliteStatusCatchPhrase = hashIt(body.sellerEliteStatusCatchPhrase);
	}

	if (body.location !== undefined) {
	// Envoyé en multipart (FormData) : toujours une string côté body, même
	// pour un objet — le front le stringifie en JSON avant l'envoi (voir
	// useProfileEditForm.jsx). Le typeof reste défensif si jamais ce champ
	// arrive un jour déjà parsé (ex: body JSON pur, sans multer).
	let loc: Record<string, unknown>;
	try {
	  loc = typeof body.location === 'string' ? JSON.parse(body.location) : body.location;
	} 
	catch {
		throw new ValidationError('Invalid adress (bad format)');
	}

	const requiredFields = ['country', 'region', 'city', 'street', 'house_number'];
	const missing = requiredFields.filter((key) => !loc?.[key]);
	if (missing.length > 0)
		throw new ValidationError(`incomplete adress : ${missing.join(', ')} required.`);

	const houseNumber = Number(loc.house_number);
	if (Number.isNaN(houseNumber))
		throw new ValidationError('Invalid house street number');

	const locPayload = {
		country: String(loc.country),
		region: String(loc.region),
		city: String(loc.city),
		street: String(loc.street),
		houseNumber,
		additionnal_infos: loc.additionnal_infos ? String(loc.additionnal_infos) : null,
	};

	data.location = {
	  upsert: {
		create: locPayload,
		update: locPayload,
		},
	};
	}

	if (file)
		data.avatar = `/uploads/${file.filename}`;
  return (data);
};