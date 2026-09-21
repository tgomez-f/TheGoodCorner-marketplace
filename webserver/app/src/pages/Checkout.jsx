import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';
import { createPayment } from '../api/paymentApi';
import { apiClient } from '../api/client';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import CheckoutForm from '../components/checkout/checkoutForm';
import { useThemeStore } from '../stores/themeStore';
import { motion, AnimatePresence } from 'motion/react';
import {
    ShoppingCart,
    CreditCard,
    Loader,
    Lock,
    AlertCircle,
    ArrowLeft,
    Package,
    Wallet,
} from 'lucide-react';

loadStripe.setLoadParameters({ advancedFraudSignals: false });
let stripePromise = null;
const getStripe = () => {
    if (!stripePromise && process.env.REACT_APP_STRIPE_PUBLIC_KEY) {
        stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
    }
    return stripePromise;
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: 'easeOut',
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
    exit: { opacity: 0, transition: { duration: 0.3 } },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
    },
};

const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 },
};

export default function Checkout() {
    const navigate = useNavigate();
    const { t } = useLingui();
    const { cartItems, clearCart, isHydrated } = useCartStore();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const storeUser = useUserStore((state) => state.user);

    const [walletBudget, setWalletBudget] = useState(
        storeUser?.budget ?? parseFloat(localStorage.getItem('wallet_balance') || '0')
    );

    const [clientSecret, setClientSecret] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const theme = useThemeStore((state) => state.theme);
    const isDark = theme === 'dark';

    const options = useMemo(() => {
        if (!clientSecret) return null;

        return {
            clientSecret,
            appearance: {
                theme: isDark ? 'night' : 'stripe',
                variables: {
                    colorPrimary: '#3b82f6',
                    colorBackground: isDark ? '#161a22' : '#ffffff',
                    colorText: isDark ? '#f3f4f6' : '#0f172a',
                    colorDanger: '#ef4444',
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                },
                rules: {
                    '.Label': {
                        color: isDark ? '#94a3b8' : '#475569',
                        marginBottom: '6px',
                        fontWeight: '500',
                    },
                    '.Input': {
                        borderColor: isDark ? '#334155' : '#cbd5e1',
                        boxShadow: 'none',
                    },
                    '.Input:focus': {
                        borderColor: '#3b82f6',
                    },
                },
            },
        };
    }, [clientSecret, isDark]);

    const total =
        cartItems?.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0) || 0;

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchBudget = async () => {
            try {
                const response = await apiClient.get('/transactions');
                const resData = response.data?.data;
                const currentBudget = Array.isArray(resData) ? resData[0]?.budget : resData?.budget;
                if (currentBudget !== undefined && currentBudget !== null) {
                    setWalletBudget(Number(currentBudget));
                }
            } catch (err) {
            }
        };

        fetchBudget();
    }, [isAuthenticated]);

    useEffect(() => {
        return () => {
            const elements = document.querySelectorAll(
                'iframe[name^="__privateStripe"], iframe[src*="stripe.com"], div[class*="stripe"]'
            );
            elements.forEach((el) => el.remove());
            stripePromise = null;
        };
    }, []);

    const hasEnoughBudget = walletBudget >= total;

    if (!isHydrated) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative flex items-center justify-center min-h-screen bg-[var(--color-bg)] overflow-hidden"
            >
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] aspect-square pointer-events-none select-none z-0 flex items-center justify-center">
                    <img src="/icons/42.svg" alt={t`Logo 42`} className="w-full h-full object-contain neon-42" />
                </div>
                <div className="relative z-10 text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="inline-block mb-4"
                    >
                        <Loader size={48} className="text-[var(--color-primary)]" />
                    </motion.div>
                    <p className="text-[var(--color-text-muted)]">
                        <Trans>Chargement du panier...</Trans>
                    </p>
                </div>
            </motion.div>
        );
    }

    const handleCheckout = async () => {
        try {
            if (!isAuthenticated) {
                setError(t`Vous devez être connecté pour passer votre commande.`);
                return;
            }
            setLoading(true);
            setError(null);

            const productId = cartItems.map((item) => item.id);
            const quantity = cartItems.map((item) => item.quantity);

            const cartSnapshot = cartItems.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
                priceAtPurchase: item.price,
                name: item.name,
                imageUrl: item.imageUrl,
            }));

            const payload = {
                productId,
                quantity,
                stripeCurrency: 'eur',
                cartSnapshot,
            };

            const res = await createPayment(payload);
            const secret = res.data?.clientSecret || res.clientSecret;

            if (secret) {
                setClientSecret(secret);
            } else {
                setError(t`Impossible d'initialiser le formulaire de paiement.`);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                t`Une erreur est survenue lors de l'initialisation du paiement.`
            );
        } finally {
            setLoading(false);
        }
    };

    if (!cartItems || cartItems.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative flex flex-col items-center justify-center min-h-screen bg-[var(--color-bg)] p-6 overflow-hidden"
            >
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] md:w-[700px] aspect-square pointer-events-none select-none z-0 flex items-center justify-center">
                    <img src="/icons/42.svg" alt={t`Logo 42`} className="w-full h-full object-contain neon-42" />
                </div>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 text-center"
                >
                    <motion.div
                        className="mb-6"
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <ShoppingCart size={64} className="text-[var(--color-primary)] mx-auto" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">
                        <Trans>Votre panier est vide</Trans>
                    </h2>
                    <p className="text-[var(--color-text)] mb-8">
                        <Trans>Découvrez nos produits et commencez à faire vos achats</Trans>
                    </p>
                    <motion.button
                        variants={buttonVariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => navigate('/products')}
                        className="px-8 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-on-primary)] rounded-lg font-semibold transition-colors"
                    >
                        <Trans>Continuer les achats</Trans>
                    </motion.button>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative min-h-screen bg-[var(--color-bg)] p-6 overflow-x-hidden"
        >
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] md:w-[750px] lg:w-[900px] aspect-square pointer-events-none select-none z-0 flex items-center justify-center">
                <img src="/icons/42.svg" alt={t`Logo 42`} className="w-full h-full object-contain neon-42" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
                <motion.div variants={itemVariants} className="mb-8">
                    <motion.button
                        onClick={() => navigate('/products')}
                        whileHover={{ x: -5 }}
                        className="flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <Trans>Retour</Trans>
                    </motion.button>
                    <h1 className="text-4xl font-bold text-[var(--color-text)]">
                        <Trans>Récapitulatif de commande</Trans>
                    </h1>
                </motion.div>
                <motion.div
                    variants={itemVariants}
                    className="bg-[var(--color-bg)] backdrop-blur-2xl rounded-2xl border border-[var(--color-border)] p-8 shadow-2xl"
                >
                    <motion.div className="mb-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Package size={24} className="text-[var(--color-primary)]" />
                            <h2 className="text-lg font-semibold text-[var(--color-text)]">
                                <Trans>
                                    {cartItems.length > 1 ? 'Articles' : 'Article'} ({cartItems.length})
                                </Trans>
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <AnimatePresence>
                                {cartItems.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex justify-between items-center p-4 bg-[var(--color-surface-hover)]/90 rounded-xl hover:bg-[var(--color-border)] transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-[var(--color-text)]">
                                                {item.title || item.name}
                                            </p>
                                            <p className="text-sm text-[var(--color-text-muted)]">
                                                <Trans>
                                                    Quantité : <span className="font-semibold">{item.quantity || 1}</span>
                                                </Trans>
                                            </p>
                                        </div>
                                        <motion.div
                                            className="text-lg font-semibold text-[var(--color-primary)]"
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: 1 }}
                                        >
                                            {(item.price * (item.quantity || 1)).toFixed(2)} €
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {isAuthenticated && (
                        <motion.div
                            variants={itemVariants}
                            className="mb-6 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/80 flex items-center justify-between shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <Wallet size={20} />
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-[var(--color-text)] block">
                                        <Trans>Solde de votre portefeuille</Trans>
                                    </span>
                                    {!hasEnoughBudget && (
                                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                                            <Trans>Solde insuffisant pour finaliser cet achat</Trans>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span
                                className={`text-lg font-bold font-mono ${
                                    hasEnoughBudget
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-red-600 dark:text-red-400'
                                }`}
                            >
                                {Number(walletBudget).toFixed(2)} €
                            </span>
                        </motion.div>
                    )}

                    <motion.div
                        variants={itemVariants}
                        className="h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent my-6"
                    />

                    <motion.div
                        variants={itemVariants}
                        className="flex justify-between items-center mb-8"
                    >
                        <span className="text-xl font-semibold text-[var(--color-text)]">
                            <Trans>Total :</Trans>
                        </span>
                        <motion.span
                            className="text-3xl font-bold text-[var(--color-primary)]"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                        >
                            {total.toFixed(2)} €
                        </motion.span>
                    </motion.div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-[var(--color-danger-surface)] border border-[var(--color-danger)] rounded-lg flex items-start gap-3"
                            >
                                <AlertCircle size={20} className="text-[var(--color-danger)] flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-[var(--color-danger)] font-medium mb-3">{error}</p>
                                    {!isAuthenticated && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => navigate('/authentication')}
                                            className="px-4 py-2 bg-[var(--color-danger)] hover:bg-[var(--color-danger-hover)] text-white rounded-lg font-semibold text-sm transition-colors"
                                        >
                                            <Trans>Se connecter</Trans>
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {!clientSecret ? (
                            <motion.button
                                key="payment-button"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                whileHover="hover"
                                whileTap="tap"
                                variants={buttonVariants}
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] hover:shadow-lg text-[var(--color-on-primary)] py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                                            <Loader size={20} />
                                        </motion.div>
                                        <span>
                                            <Trans>Traitement en cours...</Trans>
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={20} />
                                        <span>
                                            <Trans>Payer {total.toFixed(2)} €</Trans>
                                        </span>
                                    </>
                                )}
                            </motion.button>
                        ) : (
                            <motion.div
                                key="checkout-form"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Elements stripe={getStripe()} options={options}>
                                    <CheckoutForm
                                        onSuccess={() => {
                                            if (clearCart) clearCart();
                                            navigate('/checkout/success');
                                        }}
                                    />
                                </Elements>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="mt-8 text-center text-sm text-[var(--color-text)] flex items-center justify-center gap-2"
                >
                    <Lock size={16} />
                    <p>
                        <Trans>Paiement sécurisé avec Stripe • Données chiffrées • 100% confidentiel</Trans>
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
}