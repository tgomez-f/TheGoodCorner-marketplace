import prisma from "../services/db.js";
import Stripe from 'stripe';
// request has already been processed by multer before arriving here since its a middleware, req.file has been filtered already
/**
 * create a transaction inside the prisma database by taking the request and sending the json object
 * @param request
 * @returns promise containing the json object
 */
const stripe = new Stripe(process.env.PRIVATE_STRIPE_KEY || '');
const paymentController = {
    createTransaction: async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId)
                return (res.status(401).json({ status: 'ERROR', message: 'Unauthorized' }));
            const { stripeCurrency = 'eur', productId = [], quantity = [] } = req.body;
            if (!Array.isArray(productId) || !Array.isArray(quantity) || productId.length === 0)
                return (res.status(400).json({ status: 'ERROR', message: 'le panier ne peut pas etre vide' }));
            if (productId.length !== quantity.length)
                return (res.status(400).json({ status: 'ERROR', message: 'Incohérence entre produits et quantités' }));
            const quantityMap = new Map();
            for (let i = 0; i < productId.length; i++) {
                const qty = Number(quantity[i]);
                if (isNaN(qty) || qty <= 0)
                    return (res.status(400).json({ status: 'ERROR', message: 'Quantité invalide' }));
                quantityMap.set(productId[i], qty);
            }
            const [user, products] = await Promise.all([
                prisma.user.findUnique({ where: { id: userId } }),
                prisma.product.findMany({
                    where: {
                        id: { in: productId }
                    }
                })
            ]);
            if (!user)
                return (res.status(404).json({ status: 'ERROR', message: 'User not found' }));
            if (products.length !== productId.length)
                return (res.status(400).json({ status: 'ERROR', message: 'certains produits sont introuvables en db' }));
            const numericPrice = products.reduce((sum, item) => {
                const itemQty = quantityMap.get(item.id) || 0;
                return (sum + (Number(item.price) * itemQty));
            }, 0);
            if (numericPrice <= 0)
                return (res.status(400).json({ status: 'ERROR', message: 'Montant total invalide' }));
            if (user.budget < numericPrice)
                return (res.status(400).json({ status: 'ERROR', message: "L'utilisateur n'a plus assez de budget !", currentBudget: user.budget }));
            let customerId = user.stripeCustomerId;
            if (!customerId) {
                const customer = await stripe.customers.create({
                    email: user.email,
                    name: user.username,
                    metadata: { userId: user.id.toString() }
                });
                await prisma.user.update({
                    where: { id: userId },
                    data: { stripeCustomerId: customer.id }
                });
                customerId = customer.id;
            }
            const cartItems = products.map((prod) => ({
                id: prod.id,
                qty: quantityMap.get(prod.id) || 1
            }));
            const stripesCentsConvertedAmount = Math.round(numericPrice * 100);
            const stripePaymentIntent = await stripe.paymentIntents.create({
                payment_method_types: ['card'],
                amount: stripesCentsConvertedAmount,
                currency: stripeCurrency,
                customer: customerId,
                metadata: {
                    userId: userId.toString(),
                    amount: numericPrice.toString(),
                    cart: JSON.stringify(cartItems)
                }
            });
            try {
                const newTransaction = await prisma.$transaction(async (tx) => {
                    for (const prods of products) {
                        const requestedQty = quantityMap.get(prods.id) || 1;
                        if (prods.quantity < requestedQty)
                            throw new Error('OUT_OF_STOCK');
                    }
                    return tx.payment.create({
                        data: {
                            stripeId: stripePaymentIntent.id,
                            amount: numericPrice,
                            currency: stripeCurrency,
                            status: 'PENDING',
                            userId: userId,
                            products: {
                                connect: productId.map((id) => ({ id })),
                            }
                        }
                    });
                });
                console.log('Transaction successfully created !');
                return (res.status(201).json({ status: 'OK', data: { transaction: newTransaction, clientSecret: stripePaymentIntent.client_secret } }));
            }
            catch (stockError) {
                await stripe.paymentIntents.cancel(stripePaymentIntent.id);
                if (stockError.message === 'OUT_OF_STOCK')
                    return res.status(400).json({ status: 'ERROR', message: 'Item went out of stock during checkout!' });
                throw stockError;
            }
        }
        catch (error) {
            console.error('Erreur createTransaction:', error);
            return res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
        }
    },
    stripeWebhook: async (req, res) => {
        const sig = req.headers['stripe-signature'];
        let event;
        try {
            // req.body MUST be the raw Buffer here. If express.json() parses it first, this throws an error.
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK);
        }
        catch (err) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return (res.status(400).send(`Webhook Error: ${err.message}`));
        }
        // Handle successful payment
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const transaction = await prisma.payment.findFirst({
                where: { stripeId: paymentIntent.id }
            });
            // Idempotency check: prevent duplicate deductions if Stripe resends the event
            if (!transaction) {
                console.log(`Webhook received for unknown transaction ${paymentIntent.id} (ignoring mock trigger).`);
                return (res.status(200).json({ status: 'OK', received: true }));
            }
            if (transaction.status === 'SUCCEEDED') {
                console.log(`Payment ${paymentIntent.id} already processed. Skipping.`);
                return (res.status(200).json({ status: 'OK', received: true }));
            }
            // Extract cart from metadata
            const rawCart = paymentIntent.metadata?.cart;
            const cart = rawCart ? JSON.parse(rawCart) : [];
            const amountToDeduct = transaction.amount;
            try {
                await prisma.$transaction(async (tx) => {
                    // 1. Décrémentation du stock des produits
                    for (const item of cart) {
                        const updatedProduct = await tx.product.update({
                            where: { id: Number(item.id) },
                            data: { quantity: { decrement: Number(item.qty) } }
                        });
                        console.log(`[STOCK] Produit #${updatedProduct.id} décrémenté de ${item.qty} (restant: ${updatedProduct.quantity})`);
                        if (updatedProduct.userId) {
                            const sellerGain = Number(item.qty) * Number(updatedProduct.price);
                            const updatedSellerBudget = await tx.user.update({
                                where: { id: updatedProduct.userId },
                                data: { budget: { increment: sellerGain } }
                            });
                        }
                    }
                    // 2. Decrement user budget securely
                    const updatedBuyerBudget = await tx.user.update({
                        where: { id: transaction.userId },
                        data: { budget: { decrement: amountToDeduct } }
                    });
                    // 3. Mark payment as completed
                    await tx.payment.update({
                        where: { id: transaction.id },
                        data: { status: 'SUCCEEDED' }
                    });
                });
                console.log(`Payment ${paymentIntent.id} successfully processed.`);
            }
            catch (dbError) {
                console.error('Error applying DB updates:', dbError);
                return (res.status(500).end()); // Let Stripe retry later
            }
        }
        // Handle failed or canceled payments
        else if (event.type === 'payment_intent.payment_failed' || event.type === 'payment_intent.canceled') {
            const paymentIntent = event.data.object;
            await prisma.payment.updateMany({
                where: { stripeId: paymentIntent.id },
                data: { status: event.type === 'payment_intent.canceled' ? 'CANCELED' : 'FAILED' }
            });
        }
        return (res.status(200).json({ status: 'OK', received: true }));
    },
    getAllTransactions: async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId)
                return res.status(400).json({ status: 'ERROR', message: 'invalid UserId' });
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    username: true,
                    email: true,
                    phoneNumber: true,
                    payment: {
                        orderBy: { createdAt: 'desc' },
                        take: 20,
                        include: { products: true }
                    },
                    budget: true,
                    avatar: true,
                    product: true,
                }
            });
            if (!user)
                return res.status(404).json({ status: 'ERROR', message: 'User not found' });
            console.log(`all 20 last transactions of ${userId}`);
            return res.status(200).json({ status: 'OK', data: user });
        }
        catch (error) {
            console.error('Erreur getAllTransaction:', error);
            return res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
        }
    },
    getTransaction: async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId)
                return res.status(401).json({ status: 'ERROR', message: 'Unauthorized' });
            const transactionId = req.params.id; // This is the stripeId (e.g. pi_3MtwbL2eZvKYlo2C0XXXXXX)
            if (!transactionId)
                return res.status(400).json({ status: 'ERROR', message: 'Payment Intent ID is required' });
            const Stripetransaction = await prisma.payment.findFirst({
                where: {
                    stripeId: transactionId
                }
            });
            if (!Stripetransaction)
                return res.status(404).json({ status: 'ERROR', message: 'Transaction not found' });
            if (Stripetransaction.userId !== userId)
                return res.status(403).json({ status: 'ERROR', message: "You do not have permission to view this transaction" });
            console.log('an individual transaction has been returned with its corresponding user');
            return res.status(200).json({ status: 'OK', data: Stripetransaction });
        }
        catch (error) {
            console.error('Erreur getTransaction:', error);
            return res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
        }
    },
    topUp: async (req, res) => {
        try {
            const userId = Number(req.params.id);
            const amount = Number(req.body.amount);
            if (!userId || isNaN(userId))
                return res.status(400).json({ message: 'Invalid userId', status: 400 });
            if (Number.isNaN(amount) || amount <= 0 || amount > 100000)
                return (res.status(403).json({ message: 'invalid parameter provided', Status: 400 }));
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user)
                return (res.status(404).json({ message: 'unable to find user', Status: 400 }));
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { budget: { increment: amount } }
            });
            console.log(`successfully topped up : ${updatedUser.username}`);
            return (res.status(200).json({ message: 'OK', newBudget: updatedUser.budget }));
        }
        catch (error) {
            console.error('Erreur topUp:', error);
            return (res.status(500).json({ message: 'internal server Error', Status: 500 }));
        }
    }
};
export default paymentController;
