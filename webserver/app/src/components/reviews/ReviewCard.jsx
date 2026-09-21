import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { StarRating } from '../UI/StarRating';
import Avatar from '../UI/Avatar';
import { Button } from '../UI/Button';
import { Edit2, Trash2, Check, X } from 'lucide-react';

export const ReviewCard = ({
  author,
  avatar,
  rating,
  date,
  content,
  product,
  authorId,
  currentUserId,
  onSave,
  onDelete,
}) => {
  const { t } = useLingui();
  const isAuthor = currentUserId && authorId && String(currentUserId) === String(authorId);

  const [isEditing, setIsEditing] = useState(false);
  const [draftRating, setDraftRating] = useState(rating);
  const [draftContent, setDraftContent] = useState(content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const startEditing = () => {
    setDraftRating(rating);
    setDraftContent(content);
    setError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    if (draftRating < 1 || draftRating > 5) {
      setError(t`Choisis une note entre 1 et 5 étoiles.`);
      return;
    }

    const trimmedContent = (draftContent || '').trim();

    if (!trimmedContent) {
      setError(t`Le commentaire ne peut pas être vide.`);
      return;
    }

    if (trimmedContent.length > 5000) {
      setError(t`Le commentaire ne peut pas être aussi long.`);
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onSave({ reviews: trimmedContent, reviewRating: draftRating });
      setIsEditing(false);
    } catch (err) {
      setError(err?.message || t`Une erreur est survenue lors de l'enregistrement.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 sm:p-5">
      {/* Header review */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar src={avatar} alt={author} name={author} size="md" className="flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text)] truncate">
              {author}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">{date}</p>
          </div>
        </div>

        <StarRating
          rating={isEditing ? draftRating : rating}
          size={16}
          onRatingChange={isEditing ? setDraftRating : undefined}
        />

        {/* Action buttons */}
        {isAuthor && !isEditing && (
          <div className="flex gap-1 -mt-2 ms-2">
            <Button
              variant="ghost"
              size="sm"
              icon={Edit2}
              iconOnly
              aria-label={t`Modifier cet avis`}
              onClick={startEditing}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              iconOnly
              aria-label={t`Supprimer cet avis`}
              onClick={onDelete}
            />
          </div>
        )}
        {isAuthor && isEditing && (
          <div className="flex gap-1 -mt-2 ms-2">
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              iconOnly
              aria-label={t`Annuler`}
              onClick={cancelEditing}
              disabled={saving}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Check}
              iconOnly
              aria-label={t`Sauvegarder`}
              onClick={handleSave}
              loading={saving}
            />
          </div>
        )}
      </div>

      {/* Contenu avis */}
      {isEditing ? (
        <div className="mb-3 space-y-1.5">
          <textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            rows={3}
            disabled={saving}
            aria-label={t`Modifier le commentaire`}
            className="w-full text-sm text-[var(--color-text)] leading-relaxed bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none transition-colors disabled:opacity-60 review-content"
          />
          {error && (
            <p className="text-xs text-[var(--color-danger)] font-medium" role="alert">
              {error}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text)] mb-3 leading-relaxed review-content">
          {content}
        </p>
      )}

      {/* Produit (optionnel) */}
      {product && (
        <p className="text-xs text-[var(--color-text-muted)] italic">
          <Trans>
            Produit : <span className="font-medium">{product}</span>
          </Trans>
        </p>
      )}
    </div>
  );
};