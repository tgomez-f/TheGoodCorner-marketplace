import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useLoginForm } from '../hooks/useLoginForm';
import { Button } from '../components/UI/Button';
import { FormField } from '../components/UI/FormField';

function Login() {
  const navigate = useNavigate();
  const { t } = useLingui();
  const {
    isRegister,
    requiresTwoFactor,
    form,
    submitting,
    isShaking,
    error,
    handleChange,
    switchMode,
    submit,
    clearShake,
  } = useLoginForm();

  const handleSubmit = (e) => {
    e.preventDefault();
    submit(() => navigate('/'));
  };

  return (
    <div className="auth-backdrop min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-bg)]">
      <div className="relative z-10 w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-blue-500 transition-colors mb-8"
        >
          <ArrowLeft size={16} strokeWidth={2.75}/>
          <Trans>Retour à la boutique</Trans>
        </Link>

        <div className="animate-fade-slide-up">
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-bold text-[var(--color-text)]">
              🛍️ TheGoodCorner
            </Link>
            <p className="text-[var(--color-text-muted)] mt-2">
              {isRegister ? (
                <Trans>Crée ton compte en quelques secondes</Trans>
              ) : (
                <Trans>Content de te revoir</Trans>
              )}
            </p>
          </div>

          <div
            className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-lg p-8 ${
              isShaking ? 'animate-shake' : ''
            }`}
            onAnimationEnd={clearShake}
          >
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {isRegister && (
                <FormField
                  id="username"
                  label={t`Nom d'utilisateur`}
                  icon={UserIcon}
                  type="text"
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange('username')}
                  placeholder="max"
                  disabled={submitting}
                />
              )}

              <FormField
                id="email"
                label={t`Email`}
                icon={Mail}
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="khalid@example.com"
                disabled={submitting}
              />

              <FormField
                id="password"
                label={t`Mot de passe`}
                icon={Lock}
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={form.password}
                onChange={handleChange('password')}
                placeholder="••••••••"
                disabled={submitting}
              />

              {requiresTwoFactor && (
                <FormField icon={Lock} id="two-factor-code" label="Code de l’application ou code de secours"
                  type="text" autoComplete="one-time-code" value={form.code}
                  onChange={handleChange('code')} disabled={submitting} />
              )}

              {error && (
                <p className="text-sm text-[var(--color-danger)]" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" variant="primary" fullWidth loading={submitting}>
                {isRegister ? <Trans>Créer mon compte</Trans> : <Trans>Se connecter</Trans>}
              </Button>
            </form>

            <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
              {isRegister ? (
                <Trans>Déjà un compte ?</Trans>
              ) : (
                <Trans>Pas encore de compte ?</Trans>
              )}{' '}
              <Button
                onClick={switchMode}
                disabled={submitting}
                variant='ghost'
                className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
              >
                {isRegister ? <Trans>Se connecter</Trans> : <Trans>S'inscrire</Trans>}
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;