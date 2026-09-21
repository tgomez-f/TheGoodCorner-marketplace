import { useMemo } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useProductForm } from '../../hooks/useProductForm';
import { FormField } from '../UI/FormField';
import { Button } from '../UI/Button';
import { FileInput } from '../UI/FileInput';
import { Package, Euro, Tag, FileText, PlusCircle } from 'lucide-react';
import { PRODUCT_PRICE_MAX, CATEGORIES, useCategoryLabel } from '../../utils/constants';

export function ProductForm({ product = null, onSuccess }) {
  const { _, t } = useLingui();
  const { form, submitting, error, isEditMode, handleChange, submit, isShaking } = useProductForm(product);

  const categories = useMemo(() => {

    return CATEGORIES.map((cat) => ({
      value: cat.value,
      label: _(cat.label),
    }));
  }, [_]);

  const handleSubmit = (e) => {
    e.preventDefault();
    submit(onSuccess);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 transition-transform ${isShaking ? 'animate-shake' : ''}`} noValidate>
      {/* Ligne 1: Nom + Catégorie */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormField
          id="product-name"
          label={t`Nom du produit`}
          icon={Package}
          type="text"
          value={form.name}
          onChange={handleChange('name')}
          placeholder={t`Ex: Chaise ergonomique`}
          disabled={submitting}
        />

        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-[var(--color-text)] mb-2">
            <Trans>Catégorie</Trans>
          </label>
          <div className="relative">
            <Tag
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
              aria-hidden="true"
            />
            <select
              id="category"
              className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors disabled:opacity-60"
              value={form.category}
              onChange={handleChange('category')}
              disabled={submitting}
            >
              <option value="">
                {t`-- Sélectionne une catégorie --`}
              </option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Champ affiché uniquement si "Autre" est sélectionné */}
      {form.category === 'other' && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <FormField
            id="custom-category"
            label={t`Précise la catégorie personnalisée`}
            icon={PlusCircle}
            type="text"
            value={form.customCategory || ''}
            onChange={handleChange('customCategory')}
            placeholder={t`Ex: Équipements de frappe`}
            disabled={submitting}
            required
          />
        </div>
      )}

      {/* Ligne 2: Prix + Image */}
      <div className={isEditMode ? 'grid grid-cols-1 gap-6' : 'grid grid-cols-1 sm:grid-cols-2 gap-6'}>
        <FormField
          id="price"
          label={t`Prix (€)`}
          icon={Euro}
          type="number"
          step="0.01"
          min="0"
          max={PRODUCT_PRICE_MAX}
          value={form.price}
          onChange={handleChange('price')}
          placeholder="29.99"
          disabled={submitting}
        />

        {!isEditMode && (
          <FileInput
            id="image-file"
            label={t`Image du produit`}
            accept=".png,.jpeg,.jpg,image/png,image/jpeg"
            value={form.image}
            onChange={handleChange('image')}
            disabled={submitting}
          />
        )}
      </div>

      {isEditMode && form.existingImageUrl && (
        <div className="flex items-center gap-3">
          <img
            src={form.existingImageUrl}
            alt={t`Image actuelle`}
            className="w-14 h-14 object-cover rounded-[var(--radius-sm)] border border-[var(--color-border)]"
          />
          <p className="text-xs text-[var(--color-text-muted)]">
            <Trans>L'image ne peut pas être modifiée depuis ce formulaire pour l'instant.</Trans>
          </p>
        </div>
      )}

      {/* Ligne 3: Description */}
      <FormField
        id="description"
        label={t`Description`}
        icon={FileText}
        type="text"
        as="textarea"
        value={form.description}
        onChange={handleChange('description')}
        placeholder={t`Décris ton produit en détail...`}
        disabled={submitting}
        className="resize-none"
        rows="5"
      />

      {/* Message d'erreur */}
      {error && (
        <div className="p-4 bg-[var(--color-danger-surface)] border border-[var(--color-danger)] rounded-[var(--radius-md)]">
          <p className="text-sm text-[var(--color-danger)] font-medium" role="alert">
            {error}
          </p>
        </div>
      )}

      {/* Bouton Submit */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={submitting}
        className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-on-primary)] py-3 rounded-[var(--radius-md)] font-semibold transition-colors"
      >
        {isEditMode ? t`Enregistrer les modifications` : t`Créer le produit`}
      </Button>
    </form>
  );
}