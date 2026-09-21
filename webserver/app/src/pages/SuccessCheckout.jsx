import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trans } from '@lingui/react/macro';
import { useProductStore } from '../stores/productStore';
import { useUserStore } from '../stores/userStore';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

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
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 },
};

export default function SuccessCheckout() {
  const navigate = useNavigate();
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const fetchUser = useUserStore((state) => state.fetchUser);
  const currentUser = useUserStore((state) => state.user);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (fetchProducts) fetchProducts();
      if (fetchUser) fetchUser(currentUser?.id);
    }, 800);

    return () => clearTimeout(timer);
  }, [fetchProducts, fetchUser, currentUser?.id]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-bg)] overflow-hidden"
    >
      {/* Logo 42 en filigrane centré */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] md:w-[750px] aspect-square pointer-events-none select-none z-0 flex items-center justify-center">
        <img
          src="/icons/42.svg"
          alt="42 Logo"
          className="w-full h-full object-contain neon-42"
        />
      </div>

      {/* Carte de confirmation opaque */}
      <motion.div className="relative z-10 max-w-md w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-8 text-center shadow-2xl backdrop-blur-2xl">
        
        {/* Icône de validation avec animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 100 }}
          className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </svg>
        </motion.div>

        {/* Titre & Message */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
            <Trans>Paiement réussi !</Trans>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6">
            <Trans>
              Merci pour votre commande. La transaction a été validée par Stripe et vos articles sont en cours de préparation.
            </Trans>
          </p>
        </motion.div>

        {/* Encadré d'information */}
        <motion.div
          variants={itemVariants}
          className="bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl p-4 text-left mb-6 text-sm"
        >
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="flex justify-between items-center py-2"
          >
            <span className="text-[var(--color-text-muted)]">
              <Trans>Statut</Trans>
            </span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="text-emerald-400 font-semibold flex items-center gap-1"
            >
              <CheckCircle2 size={16} />
              <Trans>Payé</Trans>
            </motion.span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="flex justify-between items-center py-2"
          >
            <span className="text-[var(--color-text-muted)]">
              <Trans>Délai estimé</Trans>
            </span>
            <span className="text-[var(--color-text)]">
              <Trans>2 à 4 jours ouvrés</Trans>
            </span>
          </motion.div>
        </motion.div>

        {/* Actions de navigation */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-3"
        >
          <motion.button
            onClick={() => navigate('/profile')}
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-on-primary)] font-semibold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>
              <Trans>Retourner sur mon profil</Trans>
            </span>
            <ArrowRight size={18} />
          </motion.button>

          <motion.button
            onClick={() => navigate('/products')}
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
            className="w-full bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] text-[var(--color-text)] font-semibold py-3 px-4 rounded-xl transition-all border border-[var(--color-border)]"
          >
            <Trans>Retourner sur les produits</Trans>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}