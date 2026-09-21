import { Request, Response } from "express";
import prisma from "../services/db.js";
import { AuthenticatedRequest } from "../interfaces/interfaces.js";
import Stripe from 'stripe';
import { findReturnUser } from "../services/users/utilsUsers.js";
import productRouter from "../routes/products.js";
// request has already been processed by multer before arriving here since its a middleware, req.file has been filtered already
/**
 * create a transaction inside the prisma database by taking the request and sending the json object
 * @param request
 * @returns promise containing the json object
 */
const stripe = new Stripe(process.env.PRIVATE_STRIPE_KEY || '');
const paymentController =
{
	createTransaction: async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId)
				return (res.status(401).json({ status: 'ERROR', message: 'Unauthorized' }));

			const { stripeCurrency = 'eur', productId = [], quantity = [], cartSnapshot = [] } = req.body;

			if (!Array.isArray(productId) || !Array.isArray(quantity) || productId.length === 0)
				return (res.status(400).json({ status: 'ERROR', message: 'Cart cannot be empty' }));

			if (productId.length !== quantity.length)
				return (res.status(400).json({ status: 'ERROR', message: 'Discrepancy between product and quantity' }));

			const quantityMap = new Map<number, number>();
			for (let i = 0; i < productId.length; i++) {
				const qty = Number(quantity[i]);
				if (isNaN(qty) || qty <= 0)
					return (res.status(400).json({ status: 'ERROR', message: 'Invalid quantity' }));
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
				return (res.status(400).json({ status: 'ERROR', message: 'Somes products are not found in the database' }));
			
			if (!Array.isArray(cartSnapshot) || cartSnapshot.length === 0)
				return (res.status(400).json({ status: 'ERROR', message: 'Cart Snapshot is invalid' }));

			if (cartSnapshot.length !== productId.length)
				return (res.status(400).json({ status: 'ERROR', message: 'Discrepancy cart snapshot does not match cart' }));
			
			const numericPrice = products.reduce((sum, item) => {
				const itemQty = quantityMap.get(item.id) || 0;
				return (sum + (Number(item.price) * itemQty));
			}, 0);

			if (numericPrice <= 0)
				return (res.status(400).json({ status: 'ERROR', message: 'Invalid total amount' }));

			if (user.budget < numericPrice)
				return (res.status(400).json({ status: 'ERROR', message: "User doesnt have enough budget left", currentBudget: user.budget }));

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
						if (prods.quantity! < requestedQty)
							throw new Error('OUT_OF_STOCK');

					}
					return tx.payment.create({
						data: {
							stripeId: stripePaymentIntent.id,
							amount: numericPrice,
							currency: stripeCurrency,
							status: 'PENDING',
							userId: userId,
							cartSnapshot: cartSnapshot,
							products: {
								connect: productId.map((id: number) => ({ id })),
						}}
					});
				});
				console.log('Transaction successfully created !');
				return (res.status(201).json({ status: 'OK', data: { transaction: newTransaction, clientSecret: stripePaymentIntent.client_secret } }));
			} catch (stockError: any) {
				await stripe.paymentIntents.cancel(stripePaymentIntent.id);
				if (stockError.message === 'OUT_OF_STOCK')
					return res.status(400).json({ status: 'ERROR', message: 'Item went out of stock during checkout!' });
				throw stockError;
			}
		} catch (error: any) {
			console.error('Erreur createTransaction:', error);
			return res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
		}
	},
	stripeWebhook: async (req: Request, res: Response) => {
		const sig = req.headers['stripe-signature'] as string;
		let event: Stripe.Event;

		try {
			// req.body MUST be the raw Buffer here. If express.json() parses it first, this throws an error.
			event = stripe.webhooks.constructEvent(
				req.body,
				sig,
				process.env.STRIPE_WEBHOOK!
			);
		} catch (err: any) {
			console.error(`Webhook signature verification failed: ${err.message}`);
			return (res.status(400).send(`Webhook Error: ${err.message}`));
		}
		// Handle successful payment
		if (event.type === 'payment_intent.succeeded') {
			const paymentIntent = event.data.object as Stripe.PaymentIntent;
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
			const cart: Array<{ id: number; qty: number }> = rawCart ? JSON.parse(rawCart) : [];
			const amountToDeduct = transaction.amount;
			const soldNotifIds = new Map<number, number>();

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
							await tx.user.update({
								where: { id: updatedProduct.userId },
								data: { budget: { increment: sellerGain } }
							});
							const notif = await tx.notification.create({
								data: {
									userId: updatedProduct.userId,
									type: 'PRODUCT_SOLD',
									content: {
										productId: updatedProduct.id,
										productName: updatedProduct.name,
										quantity: Number(item.qty),
										gain: sellerGain,
									},
								},
							});
							soldNotifIds.set(Number(item.id), notif.id);
						}
					}
					// 2. Decrement user budget securely
					await tx.user.update({
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
				const io = req.app.get('io');
				if (io) {
					for (const item of cart) {
						const product = await prisma.product.findUnique({ where: { id: Number(item.id) } });
						if (!product)
							return (res.status(404).json({ status: 'ERROR', message: 'Couldn\'t find the product asked for' }));
						if (product.userId) {
							io.to(`user_${product.userId}`).emit('product_sold', {
								notifId: soldNotifIds.get(Number(item.id)),
								productId: product.id,
								productName: product.name,
								quantity: Number(item.qty),
								gain: Number(item.qty) * Number(product.price),
							});
						}
						io.emit('product_updated', { id: product.id, quantity: product.quantity });
					}
				}
			} catch (dbError: any) {
				console.error('Error applying DB updates:', dbError);
				return (res.status(500).end()); // Let Stripe retry later
			}
		}
		// Handle failed or canceled payments
		else if (event.type === 'payment_intent.payment_failed' || event.type === 'payment_intent.canceled') {
			const paymentIntent = event.data.object as Stripe.PaymentIntent;
			await prisma.payment.updateMany({
				where: { stripeId: paymentIntent.id },
				data: { status: event.type === 'payment_intent.canceled' ? 'CANCELED' : 'FAILED' }
			});
			console.log(`failed or canceled payment successfully proceeded.`);
		}
		return (res.status(200).json({ status: 'OK', received: true }));
	},
	getAllTransactions: async (req: AuthenticatedRequest, res: Response) => {
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
						include: {products:true}
					},
					budget: true,
					avatar: true,
					product: true,
				}
			});
			if (!user)
				return res.status(404).json({ status: 'ERROR', message: 'User not found' });
			console.log(`all 20 last transactions of ${userId}`);
			return res.status(200).json({ status: 'OK', data: user })
		} catch (error) {
			console.error('Erreur getAllTransaction:', error);
			return res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
		}
	},
	getTransaction: async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			if (!userId)
				return res.status(401).json({ status: 'ERROR', message: 'Unauthorized' });
			const transactionId = req.params.id as string; // This is the stripeId (e.g. pi_3MtwbL2eZvKYlo2C0XXXXXX)
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
		} catch (error: any) {
			console.error('Erreur getTransaction:', error);
			return res.status(500).json({ status: 'ERROR', message: 'Internal server error' });
		}
	},
	topUp: async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = Number(req.params.id);
			const amount = Number(req.body.amount);
			if (!userId || isNaN(userId))
				return res.status(400).json({ message: 'Invalid userId'});
			if (Number.isNaN(amount) || amount <= 0 || amount > 2147483646)
				return (res.status(403).json({ message: 'invalid amount parameter provided'}));
			const user = await prisma.user.findUnique({
				where: { id: userId }
			})
			if (!user)
				return (res.status(404).json({ message: 'unable to find user'}));
			if (user.budget + amount > 2147483646)
				return (res.status(403).json({ message: 'budget is set too high'}));

			const updatedUser = await prisma.user.update({
				where: { id: userId },
				data: { budget: { increment: amount } }
			})

			console.log(`successfully topped up : ${updatedUser.username}`);
			return (res.status(200).json({ message: 'OK', newBudget: updatedUser.budget }));
		}
		catch (error) {
			console.error('Erreur topUp:', error);
			return (res.status(500).json({ message: 'internal server Error'}));
		}
	}
}
export default paymentController;