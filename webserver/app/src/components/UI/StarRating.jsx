import { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * Affichage d'une note en étoiles. Passe `onRatingChange` pour la rendre
 * interactive (cliquable, avec aperçu au survol) — sans ce prop, elle
 * reste en lecture seule comme avant (comportement inchangé pour tous
 * les usages existants : ProfilHeader, ProductCard, ReviewCard...).
 */
export const StarRating = ({ rating = 0, size = 18, maxStars = 5, onRatingChange = null }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const interactive = Boolean(onRatingChange);
  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className='flex gap-1' onMouseLeave={() => interactive && setHoverRating(0)}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const starValue = i + 1;
        return (
          <Star
            key={i}
            size={size}
            onClick={interactive ? () => onRatingChange(starValue) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(starValue) : undefined}
            className={[
              i < Math.ceil(displayRating) ? 'fill-yellow-400 text-green-500' : 'fill-gray-300 text-gray-300',
              interactive ? 'cursor-pointer transition-transform hover:scale-110' : '',
            ].filter(Boolean).join(' ')}
          />
        );
      })}
    </div>
  );
};
