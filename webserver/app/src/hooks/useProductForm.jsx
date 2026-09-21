import { useState, useEffect } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useProductStore } from '../stores/productStore';
import { PRODUCT_PRICE_MAX } from '../utils/constants';

const CATEGORY_VALUES = ['Training', 'Professionnal', 'Combat', 'Cardio'];

export function useProductForm(initialProduct = null) {
  const { t } = useLingui();
  const { createProduct, updateProduct, error, setError } = useProductStore();
  const isEditMode = !!initialProduct;

  const buildInitialForm = () => {
    if (!initialProduct) {
      return {
        name: '',
        image: null,
        price: '',
        category: '',
        customCategory: '',
        description: '',
      };
    }

    const categoryName =
      typeof initialProduct.category === 'string'
        ? initialProduct.category
        : initialProduct.category?.name || '';
    const isKnownCategory = CATEGORY_VALUES.includes(categoryName);

    return {
      name: initialProduct.name || '',
      image: null,
      existingImageUrl: initialProduct.imageUrl || null,
      price: initialProduct.price != null ? String(initialProduct.price) : '',
      category: isKnownCategory ? categoryName : categoryName ? 'other' : '',
      customCategory: isKnownCategory ? '' : categoryName || '',
      description: initialProduct.description || '',
    };
  };

  const [form, setForm] = useState(buildInitialForm);
  const [submitting, setSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (isShaking) {
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isShaking]);

  const handleChange = (field) => (e) => {
    let value = e.target.value;

    if (field === 'price') {
      if (Number(value) > PRODUCT_PRICE_MAX)
        value = String(PRODUCT_PRICE_MAX);
    }
    if (field === 'image') {
      setForm((f) => ({ ...f, [field]: e.target.files?.[0] || null }));
    } else {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    }
    if (error) setError(null);
  };

  const validate = () => {
    if (!form.name.trim()) return t`Le nom du produit est requis.`;
    if (!form.category.trim()) return t`Sélectionne une catégorie.`;
    if (form.category === 'other' && !form.customCategory.trim()) return t`Précise la catégorie personnalisée.`;
    if (!form.price || isNaN(parseFloat(form.price))) return t`Le prix doit être un nombre valide.`;
    if (parseFloat(form.price) <= 0 || parseFloat(form.price) > PRODUCT_PRICE_MAX) return t`Le prix doit être supérieur à 0 et inférieur à 10 000.`;
    if (!isEditMode && !form.image) return t`Ajoute une image.`;
    if (!form.description.trim()) return t`Ajoute une description.`;
    if (form.description.length < 10) return t`La description doit faire au moins 10 caractères.`;
    return null;
  };

  const submit = async (onSuccess) => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setIsShaking(true);
      return;
    }

    setSubmitting(true);

    try {
      const finalCategory = form.category === 'other' ? form.customCategory.trim() : form.category.trim();
      let success;

      if (isEditMode) {
        success = await updateProduct(initialProduct.id, {
          name: form.name.trim(),
          price: parseFloat(form.price),
          category: finalCategory,
          description: form.description.trim(),
        });
      } else {
        success = await createProduct({
          name: form.name.trim(),
          image: form.image,
          price: parseFloat(form.price),
          category: finalCategory,
          description: form.description.trim(),
          stock: 1,
        });
      }

      if (success) {
        if (!isEditMode) {
          setForm({
            name: '',
            image: null,
            price: '',
            category: '',
            customCategory: '',
            description: '',
          });
        }
        onSuccess?.(success);
      } else {
        setIsShaking(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    submitting,
    isShaking,
    error,
    isEditMode,
    handleChange,
    submit,
    clearShake: () => setIsShaking(false),
  };
}