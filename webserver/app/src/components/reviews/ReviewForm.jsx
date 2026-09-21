import { Trans, useLingui } from '@lingui/react/macro';
import { useReviewForm } from '../../hooks/useReviewForm';
import { StarRating } from '../UI/StarRating';
import { Button } from '../UI/Button';
import { Send } from 'lucide-react';

export function ReviewForm({ targetUserId, onSuccess }) {
  const { t } = useLingui();
  const { rating, setRating, content, setContent, submitting, error, success, submit } = useReviewForm(targetUserId, onSuccess);

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  if (success) {
    return (
      <div className="mb-6 p-4 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-[var(--radius-md)]">
        <p className="text-sm text-[var(--color-text)] font-medium">
          <Trans>Merci, ton avis a été publié !</Trans>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-4 sm:p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] space-y-4" noValidate>
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1">
          <Trans>Laisser un avis</Trans>
        </h3>
        <p className="text-xs text-[var(--color-text-muted)]">
          <Trans>Partage ton expérience avec ce vendeur</Trans>
        </p>
      </div>

      <div>
        <p className="text-xs text-[var(--color-text-muted)] mb-1.5">
          <Trans>Ta note</Trans>
        </p>
        <StarRating rating={rating} size={22} onRatingChange={setRating} />
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder={t`Décris ton expérience avec ce vendeur...`}
        disabled={submitting}
        className="w-full text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] leading-relaxed bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none transition-all disabled:opacity-60"
      />

      {error && (
        <p className="text-sm text-[var(--color-danger)] font-medium" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="primary" icon={Send} loading={submitting}>
          <Trans>Publier mon avis</Trans>
        </Button>
      </div>
    </form>
  );
}