import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useReviewStore } from '../stores/reviewStore';

/**
 * Encapsule le formulaire "laisser un avis" sur le profil d'un vendeur :
 * état des champs (note + commentaire), validation, soumission.
 *
 * `onSuccess` est appelé après un POST réussi — sert typiquement à
 * rafraîchir viewedUser (userStore.fetchUser) puisque c'est lui qui
 * porte receivedReviews, plus de liste séparée à mettre à jour ici.
 */
export function useReviewForm(targetUserId, onSuccess) {
  const { t } = useLingui();
  const createReview = useReviewStore((state) => state.createReview);

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (rating < 1 || rating > 5) return t`Choisis une note entre 1 et 5 étoiles.`;
    if (!content.trim()) return t`Écris un commentaire avant de publier.`;
    return null;
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await createReview(targetUserId, { reviews: content.trim(), reviewRating: rating });
      setSuccess(true);
      setRating(0);
      setContent('');
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return { rating, setRating, content, setContent, submitting, error, success, submit };
}
