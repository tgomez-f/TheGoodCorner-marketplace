import { Link } from 'react-router-dom';
import { Trans } from '@lingui/react/macro';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] gap-6">
      <h1 className="text-8xl font-bold text-[var(--color-primary)]">404</h1>
      <p className="text-xl font-semibold text-[var(--color-text)]">
        <Trans>Page introuvable</Trans>
      </p>
      <p className="text-sm text-[var(--color-text-muted)]">
        <Trans>La page que tu cherches n'existe pas.</Trans>
      </p>
      <Link
        to="/"
        className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-[var(--radius-md)] font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
      >
        <Trans>Retour à l'accueil</Trans>
      </Link>
    </div>
  );
}