import { useLingui } from '@lingui/react/macro';

/**
 * Traduit les erreurs du cartStore (voir stores/cartStore.jsx). Doit être
 * appelé au niveau du rendu d'un composant (règle des hooks) ; la fonction
 * qu'il renvoie, elle, peut ensuite être appelée n'importe où (handler
 * d'event compris), puisque ce n'est plus un hook.
 */
export function useCartErrorMessage() {
  const { t } = useLingui();

  return (error) => {
    if (!error) return null;

    switch (error.code) {
      case 'INVALID_PRODUCT':
        return t`Produit invalide.`;
      case 'OWN_PRODUCT':
        return t`Vous ne pouvez pas ajouter votre propre produit au panier.`;
      case 'INSUFFICIENT_STOCK':
        return t`Stock insuffisant : vous avez déjà ${error.currentCount} article(s) dans le panier pour un stock de ${error.maxStock}.`;
      case 'STOCK_LIMITED':
        return t`Stock limité à ${error.stock} unité(s).`;
      default:
        return null;
    }
  };
}