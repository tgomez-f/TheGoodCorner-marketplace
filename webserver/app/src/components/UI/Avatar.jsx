import { useState, useEffect } from 'react';
import { CircleUserRound } from 'lucide-react';
import { getInitials, getAvatarColor } from '../../utils/avatar';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Préréglages "design system" (classes Tailwind statiques, donc compatibles
// responsive comme xl ci-dessous, contrairement à des classes générées
// dynamiquement). Pour une taille ponctuelle non couverte par un
// préréglage, passe directement un nombre en px à `size` (ex: size={44}).
const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl',
};
const ICON_PX = { xs: 14, sm: 16, md: 20, lg: 24, xl: 32 };
const DOT_SIZE_CLASSES = { xs: 'w-1.5 h-1.5', sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3', xl: 'w-4 h-4' };

/**
 * Avatar unifié : image si dispo (avec fallback propre si elle casse),
 * sinon un badge de repli.
 *
 * `status` (optionnel) : 'online' | 'offline' — affiche un petit point de
 * présence en bas à droite. Absent = pas de point (comportement d'origine).
 */
function Avatar({
  src,
  alt = '',
  name,
  size = 'md',
  shape = 'circle',
  variant = 'initials',
  status,
  className = '',
}) {
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => setImgFailed(false), [src]);

  const showImage = Boolean(src) && !imgFailed;
  const isPreset = typeof size === 'string' && SIZE_CLASSES[size];

  const bgClass =
    variant === 'gradient'
      ? 'bg-gradient-to-br from-[var(--color-primary)] to-blue-600 shadow-lg'
      : name
      ? getAvatarColor(name)
      : 'bg-[var(--color-surface-hover)]';

  const iconPx = isPreset ? ICON_PX[size] : Math.round(Number(size) * 0.55);
  const dotPx = Math.round(Number(size) * 0.28);

  return (
    <span
      className={cx('relative inline-flex shrink-0', isPreset && SIZE_CLASSES[size], className)}
      style={!isPreset ? { width: size, height: size } : undefined}
    >
      <span
        style={isPreset ? undefined : { fontSize: Math.round(Number(size) * 0.4) }}
        className={cx(
          'inline-flex items-center justify-center overflow-hidden w-full h-full font-bold text-white',
          isPreset && SIZE_CLASSES[size],
          shape === 'square' ? 'rounded-2xl' : 'rounded-full',
          bgClass
        )}
      >
        {showImage ? (
          <img src={src} alt={alt} onError={() => setImgFailed(true)} className="w-full h-full object-cover" />
        ) : name ? (
          variant === 'gradient' ? name.charAt(0).toUpperCase() : getInitials(name)
        ) : (
          <CircleUserRound size={iconPx} className="text-[var(--color-text-muted)]" aria-hidden="true" />
        )}
      </span>

      {status && (
        <span
          aria-hidden="true"
          className={cx(
            'absolute bottom-0 right-0 rounded-full border-2 border-[var(--color-surface)]',
            isPreset ? DOT_SIZE_CLASSES[size] : '',
            status === 'online' ? 'bg-green-500' : 'bg-gray-400'
          )}
          style={!isPreset ? { width: dotPx, height: dotPx } : undefined}
        />
      )}
    </span>
  );
}

export default Avatar;