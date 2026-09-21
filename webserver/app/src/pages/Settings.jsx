import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useLanguageStore } from '../stores/languageStore';
import { apiClient } from '../api/client';
import { useNotificationStore } from '../stores/notificationStore';
import { TwoFactorSettings } from '../components/profile/TwoFactorSettings';
import { useUserStore } from '../stores/userStore';
import { Button } from '../components/UI/Button';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

const DEV_SECRET = process.env.REACT_APP_DEV_PASS || '';

export default function Settings() {
  const navigate = useNavigate();
  const { t } = useLingui();

  const notificationsEnabled = useNotificationStore((state) => state.notificationsEnabled);
  const toggleNotifications = useNotificationStore((state) => state.toggleNotifications);


  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const currentUser = useUserStore((state) => state.user);
  const userId = currentUser?.id;

  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDarkMode = theme === 'dark';

  const locale = useLanguageStore((state) => state.locale);
  const setLocale = useLanguageStore((state) => state.setLocale);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const currentLangObj = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  const [show2FASettings, setShow2FASettings] = useState(false);
  const [isDevUnlocked, setIsDevUnlocked] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [amountToAdd, setAmountToAdd] = useState(1000);
  const [devFeedback, setDevFeedback] = useState(null);
  const [currentBudget, setCurrentBudget] = useState(10000);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const handleToggle2FA = () => {
    setShow2FASettings((prev) => !prev);
  };

  const handleToggleNotifications = () => {
    toggleNotifications();
  };

  const handleUnlockDev = (e) => {
    e.preventDefault();
    if (secretInput.trim() === DEV_SECRET) {
      setIsDevUnlocked(true);
      setDevFeedback({ type: 'success', message: t`Mode développeur déverrouillé !` });
      setSecretInput('');
    } else {
      setDevFeedback({ type: 'error', message: t`Phrase secrète invalide.` });
    }
  };

  const handleAddFunds = async () => {
    const numericAmount = parseFloat(amountToAdd);
    const MAX_AMOUNT = 2147483646;

    if (!userId) {
      setDevFeedback({ type: 'error', message: t`Identifiant utilisateur introuvable.` });
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0 || numericAmount > MAX_AMOUNT) {
      setDevFeedback({ type: 'error', message: t`Veuillez saisir un montant valide.` });
      return;
    }
    if (currentBudget + numericAmount > MAX_AMOUNT) {
      setDevFeedback({
        type: 'error',
        message: t`Le solde total ne peut pas dépasser ${MAX_AMOUNT}€. (Solde actuel : ${currentBudget}€)`,
      });
      return;
    }

    try {
      const response = await apiClient.post(`/walletTopUp/${userId}`, {
        amount: numericAmount,
      });

      const data = response.data;
      const updatedBudget = currentBudget + numericAmount;

      setCurrentBudget(updatedBudget);
      setDevFeedback({
        type: 'success',
        message: t`+${numericAmount}€ crédités avec succès ! (Nouveau solde : ${data.newBudget ?? 'mis à jour'}€)`,
      });
    } catch (err) {
      setDevFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || t`Erreur lors du rechargement du portefeuille.`,
      });
    }
  };

  const handleDeleteClick = () => {
    if (!userId) {
      setError(t`Identifiant utilisateur introuvable.`);
      return;
    }
    setShowConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/user/${userId}`);

      alert(t`Compte supprimé avec succès.`);
      if (logout) logout();
      localStorage.removeItem('token');
      navigate('/');
    } catch (err) {
      setError(err?.message || t`Erreur lors de la suppression.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-[calc(100vh-140px)] py-12 px-4 flex justify-center items-center"
        style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
      >
        <div
          className="w-full max-w-md rounded-[var(--radius-lg)] p-8 text-center shadow-2xl"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px',
          }}
        >
          <div className="mb-6 text-6xl">🔐</div>

          <h1 className="text-2xl font-bold mb-3 tracking-wide" style={{ color: 'var(--color-text)' }}>
            <Trans>Accès aux paramètres</Trans>
          </h1>

          <p className="mb-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <Trans>
              Connectez-vous à votre compte pour accéder à vos paramètres personnels, gérer votre profil et vos préférences.
            </Trans>
          </p>

          <div className="flex flex-col gap-3">
            <Button
              to="/authentication"
              className="w-full py-3 px-4 rounded-[var(--radius-md)] font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
              variant="primary"
            >
              <Trans>Se connecter</Trans>
            </Button>

            <Button
              to="/authentication"
              className="w-full py-3 px-4 rounded-[var(--radius-md)] font-medium !text-[var(--color-primary)] !border !border-[var(--color-primary)] transition-all duration-200 focus:outline-none focus:ring-2"
              variant="ghost"
            >
              <Trans>Créer un compte</Trans>
            </Button>
          </div>

          <p className="mt-6 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <Link to="/" className="underline hover:no-underline transition-all text-[var(--color-primary)]">
              <Trans>Retourner à l'accueil</Trans>
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[calc(100vh-140px)] py-12 px-4 flex justify-center items-start"
      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <div
        className="w-full max-w-xl rounded-[var(--radius-lg)] p-8 shadow-2xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          borderWidth: '1px',
        }}
      >
        <h1 className="text-2xl font-bold mb-6 tracking-wide" style={{ color: 'var(--color-text)' }}>
          <Trans>Paramètres</Trans>
        </h1>

        {error && (
          <div
            className="mb-6 p-3 text-sm rounded-[var(--radius-md)]"
            style={{
              backgroundColor: 'var(--color-danger-surface)',
              borderColor: 'var(--color-danger)',
              borderWidth: '1px',
              color: 'var(--color-danger)',
            }}
          >
            {error}
          </div>
        )}

        {/* Langue */}
        <div
          className="mb-6 pb-6 relative"
          style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}
        >
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Trans>Langue de l'application</Trans>
          </label>

          <button
            type="button"
            onClick={() => setIsLangOpen((prev) => !prev)}
            className="w-full flex items-center justify-between rounded-[var(--radius-md)] p-3 text-base outline-none focus:ring-2 cursor-pointer"
            style={{
              backgroundColor: 'var(--color-surface-hover)',
              borderColor: 'var(--color-border)',
              borderWidth: '1px',
              color: 'var(--color-text)',
            }}
          >
            <span>{currentLangObj.flag} {currentLangObj.label}</span>
            <span className="text-xs text-[var(--color-text-muted)]">▼</span>
          </button>

          {isLangOpen && (
            <div
              className="absolute top-full left-0 w-full mt-1.5 rounded-[var(--radius-md)] shadow-lg z-50 overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                borderWidth: '1px',
              }}
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLocale(lang.code);
                    setIsLangOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-base transition hover:opacity-80"
                  style={{
                    color: 'var(--color-text)',
                    backgroundColor: locale === lang.code ? 'var(--color-surface-hover)' : 'transparent',
                  }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mode sombre */}
        <div
          className="mb-6 pb-6 flex items-center justify-between"
          style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}
        >
          <div>
            <h2 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              <Trans>Mode sombre</Trans>
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {isDarkMode ? <Trans>Thème sombre activé</Trans> : <Trans>Thème clair activé</Trans>}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isDarkMode}
            aria-label={t`Basculer le mode sombre`}
            onClick={toggleTheme}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2"
            style={{
              backgroundColor: isDarkMode ? 'var(--color-primary)' : 'var(--color-surface-hover)',
            }}
          >
            <span
              className="inline-block h-5 w-5 rounded-full shadow-lg transition duration-200"
              style={{
                backgroundColor: 'var(--color-on-primary)',
                transform: isDarkMode ? 'translateX(20px)' : 'translateX(0)',
              }}
            />
          </button>
        </div>

        {/* Notifications */}
        <div
          className="mb-6 pb-6 flex items-center justify-between"
          style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}
        >
          <div>
            <h2 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              <Trans>Notifications</Trans>
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {notificationsEnabled ? (
                <Trans>Notifications activées</Trans>
              ) : (
                <Trans>Notifications désactivées</Trans>
              )}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={notificationsEnabled}
            aria-label={t`Basculer les notifications`}
            onClick={handleToggleNotifications}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2"
            style={{
              backgroundColor: notificationsEnabled ? 'var(--color-primary)' : 'var(--color-surface-hover)',
            }}
          >
            <span
              className="inline-block h-5 w-5 rounded-full shadow-lg transition duration-200"
              style={{
                backgroundColor: 'var(--color-on-primary)',
                transform: notificationsEnabled ? 'translateX(20px)' : 'translateX(0)',
              }}
            />
          </button>
        </div>

        {/* 2FA Toggle & Section */}
        <div
          className="mb-6 pb-6"
          style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                <Trans>Double authentification (2FA)</Trans>
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {show2FASettings ? (
                  <Trans>Masquer le panneau de configuration</Trans>
                ) : (
                  <Trans>Afficher les options de sécurité 2FA</Trans>
                )}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={show2FASettings}
              aria-label={t`Activer ou désactiver la double authentification`}
              onClick={handleToggle2FA}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2"
              style={{
                backgroundColor: show2FASettings ? 'var(--color-primary)' : 'var(--color-surface-hover)',
              }}
            >
              <span
                className="inline-block h-5 w-5 rounded-full shadow-lg transition duration-200"
                style={{
                  backgroundColor: 'var(--color-on-primary)',
                  transform: show2FASettings ? 'translateX(20px)' : 'translateX(0)',
                }}
              />
            </button>
          </div>

          {show2FASettings && (
            <div
              className="mt-4 rounded-[var(--radius-md)] border overflow-hidden"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-hover)' }}
            >
              <TwoFactorSettings />
            </div>
          )}
        </div>

        {/* Mode Développeur */}
        <div
          className="mb-8 pb-8"
          style={{ borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
              🛠️ <Trans>Mode Développeur</Trans>
            </h2>
            {isDevUnlocked && (
              <span
                className="text-xs px-2 py-0.5 rounded font-mono"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                  borderWidth: '1px',
                  color: 'var(--color-on-primary)',
                }}
              >
                <Trans>Déverrouillé</Trans>
              </span>
            )}
          </div>

          {devFeedback && (
            <div
              className="mb-4 p-2.5 rounded text-xs font-mono"
              style={{
                backgroundColor: devFeedback.type === 'success' ? 'var(--color-surface-hover)' : 'var(--color-danger-surface)',
                borderColor: devFeedback.type === 'success' ? 'var(--color-primary)' : 'var(--color-danger)',
                borderWidth: '1px',
                color: devFeedback.type === 'success' ? 'var(--color-primary)' : 'var(--color-danger)',
              }}
            >
              {devFeedback.message}
            </div>
          )}

          {!isDevUnlocked ? (
            <form onSubmit={handleUnlockDev} className="flex gap-2">
              <input
                type="password"
                placeholder={t`Entrez la phrase secrète...`}
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                aria-label={t`Phrase secrète`}
                className="flex-1 rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-surface-hover)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px',
                  color: 'var(--color-text)',
                }}
              />
              <button
                type="submit"
                className="px-4 py-2 font-semibold text-sm rounded-[var(--radius-md)] transition hover:opacity-90"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                }}
              >
                <Trans>Valider</Trans>
              </button>
            </form>
          ) : (
            <div
              className="p-4 rounded-[var(--radius-md)] space-y-3"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                borderWidth: '1px',
              }}
            >
              <label className="block text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                <Trans>Ajouter des fonds au portefeuille (EUR) :</Trans>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={amountToAdd}
                  onChange={(e) => setAmountToAdd(e.target.value)}
                  aria-label={t`Montant à créditer`}
                  className="w-32 rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-surface-hover)',
                    borderColor: 'var(--color-border)',
                    borderWidth: '1px',
                    color: 'var(--color-text)',
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddFunds}
                  className="px-4 py-2 font-medium text-sm rounded-[var(--radius-md)] transition hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                  }}
                >
                  <Trans>Créditer le compte</Trans>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Zone de danger */}
        <div
          className="p-5 rounded-[var(--radius-lg)]"
          style={{
            backgroundColor: 'var(--color-danger-surface)',
            borderColor: 'var(--color-danger)',
            borderWidth: '1px',
          }}
        >
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-danger)' }}>
            <Trans>Zone de danger</Trans>
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
            <Trans>Une fois votre compte supprimé, toutes vos données seront définitivement effacées du système.</Trans>
          </p>
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={loading}
            className="px-5 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold transition active:scale-[0.98]"
            style={{
              backgroundColor: loading ? 'var(--color-surface-hover)' : 'var(--color-danger)',
              color: loading ? 'var(--color-danger)' : 'var(--color-on-danger)',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? <Trans>Suppression...</Trans> : <Trans>Supprimer le compte</Trans>}
          </button>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowConfirm(false)}
          >
            <div
              className="rounded-[var(--radius-lg)] p-6 max-w-sm w-full mx-4"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                borderWidth: '1px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                <Trans>Supprimer votre compte ?</Trans>
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                <Trans>Cette action est définitive et irréversible. Toutes vos données seront perdues.</Trans>
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold transition"
                  style={{
                    backgroundColor: 'var(--color-surface-hover)',
                    color: 'var(--color-text)',
                    borderColor: 'var(--color-border)',
                    borderWidth: '1px',
                  }}
                >
                  <Trans>Annuler</Trans>
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteAccount}
                  disabled={loading}
                  className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold transition"
                  style={{
                    backgroundColor: 'var(--color-danger)',
                    color: 'var(--color-on-danger)',
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? <Trans>Suppression...</Trans> : <Trans>Supprimer définitivement</Trans>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}