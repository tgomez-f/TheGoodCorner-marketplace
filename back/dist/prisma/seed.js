import prisma from '../services/db.js';
import { buildProduct } from '../services/products/buildProduct.js';
import 'dotenv/config';
import { hashIt } from '../utils/securityUtils.js';
import { generateTokens } from '../utils/jsonWebTokens.js';
import { saveRefreshToken } from '../services/users/utilsUsers.js';
// import generated prisma binaries containing scheme tables as methods/objects
// get an instance of the database object from prisma
/**
 * return a random int between max and min (on call)
 * @param min
 * @param max
 * @returns integer
 */
const getRandomInt = (min, max) => {
    return (Math.floor(Math.random() * (max - min + 1) + min));
};
const getRandomFloat = (min, max, decimals = 1) => {
    const val = Math.random() * (max - min) + min;
    return parseFloat(val.toFixed(decimals));
};
/**
 * return a ramdom element from an array using a random determined array index
 * @param array : string[]
 * @returns string
 */
const getRandomElement = (array) => {
    if (array.length === 0)
        throw new Error("Array cannot be empty");
    const randomIndex = Math.floor(Math.random() * array.length);
    const element = array[randomIndex];
    return array[randomIndex];
};
const shuffleArray = (array) => {
    return [...array].sort(() => 0.5 - Math.random());
};
// just basic strings[] datastructures
const firstNamePool = ['John', 'Terry', 'Larry', 'Suzette', 'Maxime', 'Ratatouille', 'Solange', 'Gims', 'Acer', 'Supermario', 'CuisineDuKekra', 'Gregoire', 'Paulanploie', 'Goldorak', 'Biereblonde', 'Bellebrune', 'Macaron'];
const lastNamePool = ['Dubougnon', 'Carpenterie', 'Leland', 'Frondeur', 'Leboucher', 'Creped', 'Poudriere', 'Camelier', 'Fraise', 'MangeM****'];
const domainPool = ['gmail.com', 'hotmail.com', 'yahoo.com', 'laposte.net'];
const productNamePool = ['Gants de Boxe Yokkao Elite', 'Gants d\'Entraînement Basique', 'Gants Muay Thai Premium', 'Gants de Compétition Pro', 'Gants pour Débutants', 'Gants d\'Entraînement Intensif', 'Gants Loisir Confort', 'Gants Boxe Anglaise', 'Gants d\'Entraînement Légers', 'Gants Kickboxing', 'Gants Sparring', 'Gants Ultra Premium'];
const imagePool = Array.from({ length: 12 }, (_, i) => `/image_${i}.jpg`);
const defaultCategories = ['Professional', 'Training', 'Combat', 'Cardio'];
const descriptionPool = ['Gants haut de gamme conçus pour la compétition, cuir véritable et rembourrage optimisé pour la protection des poings.', 'Parfaits pour débuter, ces gants offrent un bon compromis entre confort et durabilité pour vos séances régulières', 'Conçus spécifiquement pour le Muay Thai, avec un poignet renforcé et une mousse haute densité pour absorber les chocs.', 'Le choix des compétiteurs exigeants : finitions soignées, maintien optimal du poignet et amorti premium.', 'Légers et confortables, idéaux pour découvrir la boxe cardio sans se ruiner.', 'Pensés pour les séances intenses, avec une ventilation renforcée et un rembourrage résistant.', 'Un confort optimal pour vos entraînements loisir, sans compromis sur la protection.', 'Spécialement conçus pour la boxe anglaise, avec une prise en main précise et un excellent maintien du poignet.', 'Légers et souples, parfaits pour travailler la vitesse et la technique.', 'Robustes et bien rembourrés, conçus pour encaisser les échanges intenses du kickboxing.', 'Un amorti généreux pour protéger votre partenaire d\'entraînement autant que vous-même.', 'Le nec plus ultra : cuir premium, finitions artisanales et performance de niveau professionnel.'];
const bioPool = ['Incapable de reculer. Pur produit du combat sans concession.', 'Spécialiste du KO au premier reprise. Pas le temps de bavarder.', 'Ancien adepte de la rue, aujourd\'hui maître du ring.', 'Calme au pesage, tempête sur le canvas.', 'Ne jure que par le travail au corps et la pression constante.', 'L\'art de l\'esquive et du contre parfait. Toujours intouchable.', 'Un mental d\'acier et des poings en béton armé.', 'Toujours là pour assurer le spectacle et faire rugir la foule.', 'Un style imprévisible. Capable de retourner un combat en une seconde.', 'Méthodique, froid et chirurgical. Une vraie machine.', 'La passion du noble art poussée à son paroxysme.', 'Encaisse tout, ne fatigue jamais. Un vrai cauchemar sur le long terme.'];
const locationPool = [
    { city: 'Paris', region: 'Île-de-France', country: 'France', street: 'Rue du Faubourg Saint-Antoine', houseNumber: 42 },
    { city: 'Marseille', region: "Provence-Alpes-Côte d'Azur", country: 'France', street: 'Boulevard de la Liberation', houseNumber: 15 },
    { city: 'Lyon', region: 'Auvergne-Rhône-Alpes', country: 'France', street: 'Rue Garibaldi', houseNumber: 88 },
    { city: 'Lille', region: 'Hauts-de-France', country: 'France', street: 'Rue Nationale', houseNumber: 104 },
    { city: 'Bordeaux', region: 'Nouvelle-Aquitaine', country: 'France', street: 'Cours Victor Hugo', houseNumber: 23 },
    { city: 'Nice', region: "Provence-Alpes-Côte d'Azur", country: 'France', street: 'Promenade des Anglais', houseNumber: 50 },
    { city: 'Toulouse', region: 'Occitanie', country: 'France', street: 'Rue Pargaminières', houseNumber: 12 },
    { city: 'Nantes', region: 'Pays de la Loire', country: 'France', street: 'Rue de la Paix', houseNumber: 7 }
];
const sellerReviewsPool = ['Vendeur ultra réactif, matériel comme neuf et emballage au top !', 'Article conforme à la description, livraison rapide. Je recommande sans hésiter.', 'Les gants sont super confortables mais le colis a mis un peu de temps à arriver.', 'Parfait ! Transaction fluide, vendeur très sérieux et courtois.', 'Produit conforme mais l\'odeur du cuir neuf était un peu forte au déballage.', 'Super qualité d\'équipement, vendeur passionné et de bon conseil !', 'Envoi soigné et rapide. Le matériel encaisse bien les entraînements intensifs.', 'Très bonne communication, le vendeur a répondu à toutes mes questions.'];
/**
 * simple for loop that create a dummy randomized user and then push it to the array
 * @param undefined array
 * @param map builtin function
 * @return an initialized User
 */
// seller review 
// review count
const randomUsers = [];
for (let i = 0; i < 15; i++) {
    const firstName = getRandomElement(firstNamePool);
    const lastName = getRandomElement(lastNamePool);
    const username = `${firstName}_${getRandomInt(1, 100)}`;
    const email = `${username}@${getRandomElement(domainPool)}`;
    const bio = getRandomElement(bioPool);
    const randomLocation = locationPool[Math.floor(Math.random() * locationPool.length)];
    const randomPhone = [];
    for (let i = 0; i < 10; i++)
        randomPhone.push(String(getRandomInt(0, 9)));
    randomUsers.push({
        email,
        name: `${firstName} ${lastName}`,
        password: hashIt(`pass_${getRandomInt(0, 999)}`),
        username,
        bio: bio,
        sellerRating: 0,
        sellerReviewCount: 0,
        phoneNumber: randomPhone.join(''),
        location: {
            create: randomLocation
        }
    });
}
/**
 * since all theses operations take some time and since Prisma databases operation and NodeJs runs asynchronously(especially if we add more users) they are run asynchronously
 * we then have to wait for them to finish, then we use try to screen for errors and prints them. finally (in any case),
 * we disconnect from the DB instance so Node doesnt hang
 */
async function main() {
    try {
        console.log('Cleaning existing data...');
        await prisma.review.deleteMany();
        await prisma.product.deleteMany();
        await prisma.location?.deleteMany().catch(() => { });
        await prisma.user.deleteMany();
        await prisma.category.deleteMany();
        await prisma.payment.deleteMany();
        await prisma.friendRequest.deleteMany();
        await prisma.message.deleteMany();
        await prisma.refreshToken.deleteMany();
        await prisma.location.deleteMany();
        console.log('Seeding categories...');
        for (const category of defaultCategories) {
            await prisma.category.upsert({
                where: { name: category },
                update: {},
                create: { name: category },
            });
        }
        console.log('Seeding users...');
        await Promise.all(randomUsers.map((userData) => prisma.user.create({
            data: userData,
        })));
        const users = await prisma.user.findMany({ select: { id: true, email: true } });
        console.log('Seeding products...');
        const productCreatePromises = [];
        for (const user of users) {
            const { refreshToken } = generateTokens(user.id, user.email);
            const hashedRefreshToken = hashIt(refreshToken);
            await saveRefreshToken(user.id, hashedRefreshToken);
            const productCount = getRandomInt(1, 2);
            for (let i = 0; i < productCount; i++) {
                const selectedCategory = getRandomElement(defaultCategories);
                const selectedDescription = getRandomElement(descriptionPool);
                const selectedImage = getRandomElement(imagePool);
                const productInput = buildProduct({
                    body: {
                        name: `${getRandomElement(productNamePool)}`,
                        price: getRandomInt(20, 600),
                        quantity: getRandomInt(1, 3),
                        description: selectedDescription,
                        category: selectedCategory,
                    },
                    file: {
                        filename: selectedImage,
                    },
                    userId: user.id,
                });
                productCreatePromises.push(prisma.product.create({
                    data: productInput,
                }));
            }
        }
        await Promise.all(productCreatePromises);
        console.log('seeding reviews');
        const foundUsers = await prisma.user.findMany({ select: { id: true } });
        const reviewData = [];
        for (const targetUser of foundUsers) {
            const eligibleAuthors = foundUsers.filter((u) => u.id !== targetUser.id);
            if (eligibleAuthors.length === 0)
                continue;
            const reviewCount = getRandomInt(1, Math.min(2, eligibleAuthors.length));
            const selectedAuthors = shuffleArray(eligibleAuthors).slice(0, reviewCount);
            for (const author of selectedAuthors) {
                reviewData.push({
                    authorId: author.id,
                    reviewedUserId: targetUser.id,
                    reviewRating: getRandomInt(1, 5),
                    reviews: getRandomElement(sellerReviewsPool),
                });
            }
        }
        ;
        if (reviewData.length > 0) {
            await prisma.review.createMany({
                data: reviewData,
                skipDuplicates: true
            });
        }
        ;
        console.log('Synchronizing sellers ratings and review counts...');
        const usersWithReviews = await prisma.user.findMany({
            select: {
                id: true,
                receivedReviews: {
                    select: { reviewRating: true }
                }
            }
        });
        for (const user of usersWithReviews) {
            const count = user.receivedReviews.length;
            const average = count > 0 ? user.receivedReviews.reduce((account, rev) => account + rev.reviewRating, 0) / count : 0;
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    sellerReviewCount: count,
                    sellerRating: Math.round(average * 10) / 10, // Arrondi à 1 décimale (ex: 4.5)
                }
            });
        }
        ;
        console.log('Seeding friend requests and friends...');
        const userIds = foundUsers.map((u) => u.id);
        const existingPairs = new Set();
        const friendRequestData = [];
        for (const senderId of userIds) {
            // Pick 2-4 potential connections per user
            const potentialTargets = userIds.filter((id) => id !== senderId);
            const targetCount = getRandomInt(1, Math.min(3, potentialTargets.length));
            const chosenTargets = shuffleArray(potentialTargets).slice(0, targetCount);
            for (const receiverId of chosenTargets) {
                const pairKey = [Math.min(senderId, receiverId), Math.max(senderId, receiverId)].join(':');
                if (existingPairs.has(pairKey))
                    continue;
                existingPairs.add(pairKey);
                friendRequestData.push({
                    senderId,
                    receiverId,
                    status: 'ACCEPTED',
                });
            }
        }
        if (friendRequestData.length > 0) {
            await prisma.friendRequest.createMany({
                data: friendRequestData,
                skipDuplicates: true,
            });
        }
        console.log('Seeding successful !');
    }
    catch (e) {
        console.log('Error seeding the database', e);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
