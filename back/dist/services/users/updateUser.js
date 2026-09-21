import { hashIt } from '../../utils/securityUtils.js';
// Erreur "métier" (validation), distincte d'un vrai crash serveur : permet
// au controller de répondre 400 avec le message exact plutôt qu'un 500
// générique. Voir le patch du catch{} dans userController.ts.
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
export const userUpdate = ({ body, file }) => {
    const data = {};
    const sellerEliteStatusCatchPass = 'GoodCornerBigBoss';
    if (body.email !== undefined) {
        const allowedDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'laposte.net'];
        const domain = body.email.split('@')[1];
        if (domain && !allowedDomains.includes(domain.toLowerCase()))
            throw new ValidationError('Email invalide : domaine non autorisé.');
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
                throw new ValidationError('Numéro de téléphone invalide (10 chiffres requis).');
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
        let loc;
        try {
            loc = typeof body.location === 'string' ? JSON.parse(body.location) : body.location;
        }
        catch {
            throw new ValidationError('Adresse invalide (format incorrect).');
        }
        const requiredFields = ['country', 'region', 'city', 'street', 'house_number'];
        const missing = requiredFields.filter((key) => !loc?.[key]);
        if (missing.length > 0)
            throw new ValidationError(`Adresse incomplète : ${missing.join(', ')} requis.`);
        const houseNumber = Number(loc.house_number);
        if (Number.isNaN(houseNumber))
            throw new ValidationError('Numéro de rue invalide.');
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
