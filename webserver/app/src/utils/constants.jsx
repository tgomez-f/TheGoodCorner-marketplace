import { msg } from '@lingui/core/macro';
import { i18n } from '@lingui/core';

export const SESSION_KEY = 'has_session';

export const PRODUCT_PRICE_MAX = 10000;

export const CATEGORIES = [
  { value: 'Training', label: msg`Entrainement` },
  { value: 'Professionnal', label: msg`Professionnel` },
  { value: 'Combat', label: msg`Combat` },
  { value: 'Cardio', label: msg`Cardio` },
  { value: 'other', label: msg`Autre` },
];

export const CATEGORY_LABEL = {
  Training: msg`Entrainement`,
  Professionnal: msg`Professionnel`,
  Professional: msg`Professionnel`,
  Combat: msg`Combat`,
  Cardio: msg`Cardio`,
  other: msg`Autre`,
  Autre: msg`Autre`,
};

export const getCategoryLabel = (name) => {
  if (name && CATEGORY_LABEL[name]) {
    return i18n._(CATEGORY_LABEL[name]);
  }
  return name ?? i18n._(msg`Non catégorisé`);
};