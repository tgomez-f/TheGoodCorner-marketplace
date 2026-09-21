import { Trans, Plural, useLingui } from '@lingui/react/macro';
import { Button } from '../UI/Button';
import { UserRoundPen, Shield, Check, X, Camera } from 'lucide-react';
import { StarRating } from '../UI/StarRating';
import Avatar from '../UI/Avatar';
import { formatMonthYear } from '../../utils/date';

export function ProfilHeader({
  user,
  displayName,
  userRating,
  reviewCount,
  isEditing,
  submitting,
  avatarSrc,
  onAvatarChange,
  onEdit,
  onCancel,
  onSave,
}) {
  const { t } = useLingui();

  return (
    <div className='flex items-start justify-between gap-6 mb-8'>
      <div className='flex gap-5 flex-1'>
        {/* Avatar */}
        <div className='relative flex-shrink-0'>
          <Avatar src={avatarSrc} alt={displayName} name={displayName} size='xl' shape='square' variant='gradient' />

          {isEditing && (
            <label
              htmlFor='avatar-upload'
              className='absolute -bottom-1 -right-1 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md border-2 border-[var(--color-surface)] cursor-pointer hover:bg-[var(--color-primary-hover)] transition-colors'
              title={t`Changer la photo de profil`}
            >
              <Camera size={14} aria-hidden='true' />
              <input
                id='avatar-upload'
                type='file'
                accept='.png,.jpeg,.jpg,image/png,image/jpeg'
                onChange={onAvatarChange}
                className='sr-only'
                aria-label={t`Changer la photo de profil`}
              />
            </label>
          )}
        </div>

        {/* Infos principales */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-3 mb-2'>
            <h1 className='text-2xl sm:text-3xl font-bold text-[var(--color-text)]'>
              {displayName}
            </h1>
            <Shield size={20} className='text-[var(--color-primary)] flex-shrink-0' />
          </div>

          <div className='flex items-center gap-2 mb-3'>
            <StarRating rating={userRating} size={18} maxStars={5}/>
            <span className='text-xs text-[var(--color-text-muted)] font-medium'>
              <Trans>
                {userRating.toFixed(1)} (
                <Plural
                  value={reviewCount}
                  one="# avis"
                  other="# avis"
                />
                )
              </Trans>
            </span>
          </div>

          <p className='text-sm text-[var(--color-text-muted)]'>
            <Trans>Vendeur depuis {formatMonthYear(user?.createdAt)} • En ligne</Trans>
          </p>
        </div>
      </div>

      {isEditing ? (
        <div className='flex items-center gap-2 flex-shrink-0'>
          <Button onClick={onCancel} variant='outline' icon={X} disabled={submitting}>
            <Trans>Annuler</Trans>
          </Button>
          <Button
            onClick={onSave}
            className='bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-on-primary)] px-5 py-2 rounded-lg transition-colors'
            variant='secondary'
            icon={Check}
            iconPosition='right'
            loading={submitting}
          >
            <Trans>Sauvegarder</Trans>
          </Button>
        </div>
      ) : (
        <Button
          onClick={onEdit}
          className='bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-on-primary)] px-5 py-2 rounded-lg transition-colors flex-shrink-0'
          variant='secondary'
          icon={UserRoundPen}
          iconPosition='right'
        >
          <Trans>Modifier</Trans>
        </Button>
      )}
    </div>
  );
}