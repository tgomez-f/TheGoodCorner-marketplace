import React, { useEffect, useState } from 'react';
import { Trash2, CreditCard, Store, Minus, Plus, Wallet } from 'lucide-react';
import { Trans, Plural, useLingui } from '@lingui/react/macro';
import { Popover } from '../components/UI/Popover';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { apiClient } from '../api/client';
import { Button } from '../components/UI/Button';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../stores/uiStore';

export function CartPopover() {
  const { t } = useLingui();
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCartStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useUserStore((state) => state.user);
  const closeUi = useUIStore((state) => state.closeUi);
  const navigate = useNavigate();

  const [walletBudget, setWalletBudget] = useState(user?.budget ?? 0);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchBudget = async () => {
      try {
        const response = await apiClient.get('/transactions');
        const resData = response.data?.data;
        const currentBudget = Array.isArray(resData) ? resData[0]?.budget : resData?.budget;
        if (currentBudget !== undefined && currentBudget !== null) {
          setWalletBudget(Number(currentBudget));
        }
      } catch (err) {}
    };
    fetchBudget();
  }, [isAuthenticated]);

  const handleGotoCheckout = () => {
    closeUi('cart-popover');
    navigate('/checkout');
  };

  return (
    <Popover
      id="cart-popover"
      position="right"
      showCloseButton={true}
      width="w-full max-w-full sm:max-w-md md:max-w-lg lg:w-[620px]"
    >
      <div className="flex flex-col h-[calc(100dvh-5rem)] max-h-[85vh] bg-[var(--color-surface)] p-1 sm:p-2">
        <h3 className="font-semibold text-lg sm:text-xl mb-4 text-[var(--color-text)] shrink-0">
          <Trans>Votre Panier</Trans>
        </h3>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 sm:py-12 bg-[var(--color-surface-hover)] rounded-lg px-4 text-center">
              <div className="text-center text-[var(--color-text-muted)] mb-4">
                <Trans>Panier vide</Trans>
              </div>
              <Button
                icon={Store}
                className="bg-[var(--color-primary)] text-[var(--color-on-primary)] px-4 sm:px-6 py-2 rounded-lg hover:bg-[var(--color-primary-hover)] transition font-medium text-sm sm:text-base"
                title={t`Continuer vos achats`}
                aria-label={t`Continuer vos achats`}
                to="/products"
              >
                <Trans>Découvrir les produits</Trans>
              </Button>
            </div>
          ) : (
            <div className="space-y-3 bg-[var(--color-surface-hover)] p-2 rounded-lg">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-hover)] transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base text-[var(--color-text)] truncate">
                      {item.name}
                    </p>
                    <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-0.5">
                      {item.quantity} × {item.price.toFixed(2)} €
                    </p>
                    <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5 block">
                      (
                      <Plural
                        value={item.stock}
                        one="# disponible"
                        other="# disponibles"
                      />
                      )
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--color-border)]">
                    <div className="flex items-center gap-1 rounded bg-[var(--color-surface-hover)] sm:bg-transparent px-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Minus}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="text-[var(--color-text)] hover:text-[var(--color-primary)] p-1.5"
                        aria-label={t`Diminuer la quantité`}
                      />
                      <span className="w-6 sm:w-8 text-center text-xs sm:text-sm text-[var(--color-text)] font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Plus}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="text-[var(--color-text)] hover:text-[var(--color-primary)] p-1.5"
                        aria-label={t`Augmenter la quantité`}
                      />
                    </div>

                    <Button
                      onClick={() => removeFromCart(item.id)}
                      variant="danger"
                      icon={Trash2}
                      className="text-[var(--color-danger)] hover:bg-[var(--color-danger-surface)] p-2 rounded transition ml-auto sm:ml-0"
                      title={t`Retirer article du panier`}
                      aria-label={t`Retirer article du panier`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-[var(--color-border)] pt-4 mt-4 space-y-3 shrink-0">
            {isAuthenticated && (
              <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs sm:text-sm">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Wallet size={15} className="text-blue-400 shrink-0" />
                  <Trans>Solde portefeuille :</Trans>
                </span>
                <span className="font-mono font-semibold text-[var(--color-text)]">
                  {Number(walletBudget).toFixed(2)} €
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm sm:text-base text-[var(--color-text)]">
                <Trans>Total :</Trans>
              </span>
              <span className="text-xl sm:text-2xl font-bold text-green-500">
                {cartTotal.toFixed(2)} €
              </span>
            </div>

            <Button
              onClick={handleGotoCheckout}
              icon={CreditCard}
              className="w-full bg-[var(--color-primary)] text-[var(--color-on-primary)] py-2.5 sm:py-3 rounded-lg hover:bg-[var(--color-primary-hover)] transition font-medium text-sm sm:text-base"
              title={t`Aller au paiement`}
              aria-label={t`Aller au paiement`}
            >
              <Trans>Procéder au paiement</Trans>
            </Button>
          </div>
        )}
      </div>
    </Popover>
  );
}