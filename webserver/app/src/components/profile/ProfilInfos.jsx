import React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { InfoCard } from '../UI/InfoCard';
import { FormField } from '../UI/FormField';
import { Dropdown } from '../UI/Dropdown';
import {
  Mail, Phone, Award, MapPin, Star, Wallet,
  Globe, Map, Building2, Route, Hash, FileText, ChevronDown,
} from 'lucide-react';

function formatAddress(location) {
  if (!location) return null;
  const line1 = [location.houseNumber, location.street].filter(Boolean).join(' ');
  const line2 = [location.city, location.region, location.country].filter(Boolean).join(', ');
  return [line1, line2].filter(Boolean).join(', ') || null;
}

function formatPhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 10) return phone;
  return digits.match(/.{1,2}/g).join(' ');
}

function LocationDetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className='flex items-baseline justify-between gap-4 text-sm py-0.5'>
      <span className='text-[var(--color-text-muted)] flex-shrink-0'>{label}</span>
      <span className='text-[var(--color-text)] font-medium text-right'>{value}</span>
    </div>
  );
}

function LocationInfoCard({ location }) {
  const { t } = useLingui();
  const address = formatAddress(location);
  const streetLine = location ? [location.houseNumber, location.street].filter(Boolean).join(' ') : '';

  return (
    <div className='flex items-start gap-3'>
      <MapPin size={20} className='text-[var(--color-primary)] flex-shrink-0 mt-0.5' />
      <div className='min-w-0 flex-1'>
        <p className='text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide'>
          <Trans>Localisation</Trans>
        </p>
        <div className='flex items-center gap-1 mt-0.5'>
          <p className='text-sm font-medium text-[var(--color-text)] truncate'>
            {address || t`Non renseigné`}
          </p>
          {location && (
            <Dropdown>
              <Dropdown.Trigger
                className='p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors flex-shrink-0'
                aria-label={t`Voir le détail de l'adresse`}
              >
                <ChevronDown size={14} />
              </Dropdown.Trigger>
              <Dropdown.Menu align='left'>
                <Dropdown.Label>
                  <p className='text-sm font-semibold text-[var(--color-text)]'>
                    <Trans>Adresse complète</Trans>
                  </p>
                </Dropdown.Label>
                <Dropdown.Separator />
                <div className='px-4 py-2'>
                  <LocationDetailRow label={t`Adresse`} value={streetLine} />
                  <LocationDetailRow label={t`Ville`} value={location.city} />
                  <LocationDetailRow label={t`Région`} value={location.region} />
                  <LocationDetailRow label={t`Pays`} value={location.country} />
                  <LocationDetailRow label={t`Complément`} value={location.additionnal_infos} />
                </div>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProfilInfos({ user, userRating, reviewCount, isEditing, form, onFieldChange, onLocationFieldChange }) {
  const { t } = useLingui();

  return (
    <>
      {/* Grille d'infos */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 pb-8 border-b border-[var(--color-border)]'>
        <InfoCard 
          icon={Mail}
          label={t`Email`}
          value={isEditing ? form.email : user?.email}
          editable
          isEditing={isEditing}
          onChange={onFieldChange('email')}
          type='email'
        />
        <InfoCard 
          icon={Phone}
          label={t`Téléphone`}
          value={isEditing ? form.phoneNumber : formatPhone(user?.phoneNumber)}
          editable
          isEditing={isEditing}
          onChange={onFieldChange('phoneNumber')}
          type='tel'
        />
        <InfoCard 
          icon={Award}
          label={t`Produits publiés`}
          value={user?.product?.length || '0'}
        />
        <LocationInfoCard location={user?.location} />
        <InfoCard 
          icon={Star}
          label={t`Note moyenne`}
          value={userRating > 0 ? `${userRating.toFixed(1)}/5.0` : t`Aucune note`}
        />
        <InfoCard 
          icon={Wallet}
          label={t`Portefeuille`}
          value={user?.budget}
        />
        <InfoCard 
          icon={Award}
          label={t`Statut`}
          value={reviewCount > 20 ? t`Vendeur Elite` : t`Vendeur`}
        />
      </div>

      {/* Adresse — édition uniquement */}
      {isEditing && (
        <div className='mb-8 pb-8 border-b border-[var(--color-border)]'>
          <h3 className='text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-4'>
            <Trans>Adresse</Trans>
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl'>
            <FormField
              id='loc-country'
              label={t`Pays`}
              icon={Globe}
              value={form.location.country}
              onChange={onLocationFieldChange('country')}
              placeholder={t`France`}
            />
            <FormField
              id='loc-region'
              label={t`Région`}
              icon={Map}
              value={form.location.region}
              onChange={onLocationFieldChange('region')}
              placeholder={t`Île-de-France`}
            />
            <FormField
              id='loc-city'
              label={t`Ville`}
              icon={Building2}
              value={form.location.city}
              onChange={onLocationFieldChange('city')}
              placeholder={t`Paris`}
            />
            <FormField
              id='loc-street'
              label={t`Rue`}
              icon={Route}
              value={form.location.street}
              onChange={onLocationFieldChange('street')}
              placeholder={t`Rue de Rivoli`}
            />
            <FormField
              id='loc-house-number'
              label={t`Numéro`}
              icon={Hash}
              type='number'
              value={form.location.house_number}
              onChange={onLocationFieldChange('house_number')}
              placeholder="12"
            />
            <FormField
              id='loc-additional'
              label={t`Complément (optionnel)`}
              icon={FileText}
              value={form.location.additionnal_infos}
              onChange={onLocationFieldChange('additionnal_infos')}
              placeholder={t`Bâtiment B, 3e étage...`}
            />
          </div>
          <p className='text-xs text-[var(--color-text-muted)] mt-3'>
            <Trans>Laisse tous les champs vides si tu ne veux pas renseigner d'adresse pour l'instant.</Trans>
          </p>
        </div>
      )}

      {/* Bio / Description */}
      <div>
        <h3 className='text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3'>
          <Trans>À propos</Trans>
        </h3>
        {isEditing ? (
          <textarea
            value={form.bio}
            onChange={onFieldChange('bio')}
            rows={4}
            placeholder={t`Parle un peu de toi...`}
            className='w-full max-w-2xl text-sm text-[var(--color-text)] leading-relaxed bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none transition-colors'
          />
        ) : (
          <p className='text-sm text-[var(--color-text)] leading-relaxed max-w-2xl'>
            {user?.bio || <Trans>Aucune description fournie</Trans>}
          </p>
        )}
      </div>
    </>
  );
}