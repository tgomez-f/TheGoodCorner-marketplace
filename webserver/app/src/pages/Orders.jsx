import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';
import { apiClient } from '../api/client';
import { useLanguageStore } from '../stores/languageStore';

export default function Orders() {
  const { t } = useLingui();
  const currentLocale = useLanguageStore((state) => state.locale);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/transactions');

        const resData = response.data?.data;
        const paymentList = Array.isArray(resData)
          ? resData[0]?.payment || []
          : resData?.payment || [];

        setOrders(paymentList);
      } catch (err) {
        setError(err.message || t`Impossible de charger vos commandes.`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [t]);

  const formatDate = (dateString) => {
    if (!dateString) return t`Date inconnue`;
    return new Date(dateString).toLocaleDateString(currentLocale || 'fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'SUCCEEDED' || s === 'SUCCESS' || s === 'PAID') {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
          <Trans>Payée</Trans>
        </span>
      );
    }
    if (s === 'PENDING') {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-950 text-amber-300 border border-amber-800">
          <Trans>En attente</Trans>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
        {status || t`Statut inconnu`}
      </span>
    );
  };

  const getProductImageUrl = (product) => {
    let rawSrc =
      (Array.isArray(product.images) ? product.images[0] : null) ||
      product.image ||
      product.imageUrl ||
      product.thumbnail ||
      null;

    if (!rawSrc) return null;

    if (rawSrc.startsWith('http://') || rawSrc.startsWith('https://')) {
      return rawSrc;
    }

    if (!rawSrc.startsWith('/')) {
      rawSrc = `/${rawSrc}`;
    }

    if (!rawSrc.startsWith('/uploads') && !rawSrc.startsWith('/api')) {
      rawSrc = `/uploads${rawSrc}`;
    }

    return rawSrc;
  };

  const getMergedOrderItems = (order) => {
    const cartSnapshot = order.cartSnapshot || [];
    const productsMap = new Map(
      (order.products || []).map((p) => [p.id, p])
    );

    return cartSnapshot.map((snapshot) => {
      const currentProduct = productsMap.get(snapshot.productId);

      return {
        productId: snapshot.productId,
        title: snapshot.name || currentProduct?.title || currentProduct?.name || t`Produit supprimé`,
        quantity: snapshot.quantity,
        priceAtPurchase: snapshot.priceAtPurchase || currentProduct?.price || 0,
        images: currentProduct?.images,
        image: currentProduct?.image,
        imageUrl: snapshot.imageUrl,
        thumbnail: currentProduct?.thumbnail,
      };
    });
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[var(--color-bg)] text-[var(--color-text)] py-10 px-4 flex justify-center items-start">
      <div className="w-full max-w-4xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--color-border)]">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-wide">
              <Trans>Mes Commandes</Trans>
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              <Trans>Consultez l'historique et le détail de vos achats passés.</Trans>
            </p>
          </div>
          <Link
            to="/products"
            className="px-4 py-2 bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-on-primary)] text-sm font-medium rounded-[var(--radius-md)] transition"
          >
            <Trans>Continuer mes achats</Trans>
          </Link>
        </div>

        {loading && (
          <div className="py-16 text-center text-[var(--color-text-muted)]">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)] mb-3" />
            <p className="text-sm">
              <Trans>Chargement des commandes...</Trans>
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-[var(--color-danger-surface)] border border-[var(--color-danger)] text-[var(--color-danger)] text-sm rounded-[var(--radius-md)] mb-6">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[var(--color-text-muted)] text-base mb-4">
              <Trans>Vous n'avez passé aucune commande pour le moment.</Trans>
            </p>
            <Link
              to="/products"
              className="text-sm text-[var(--color-primary)] hover:opacity-80 underline font-medium"
            >
              <Trans>Découvrir les produits</Trans>
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const mergedItems = getMergedOrderItems(order);

              return (
                <div
                  key={order.id}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-5 transition hover:border-opacity-80"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
                    <div>
                      <span className="text-xs font-mono text-[var(--color-text-muted)]">
                        <Trans>Commande #{order.id}</Trans>
                      </span>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status)}
                      <span className="text-base font-bold text-[var(--color-text)]">
                        {Number(order.amount).toFixed(2)} €
                      </span>
                    </div>
                  </div>

                  {mergedItems.length > 0 ? (
                    <div className="mt-4 pt-1">
                      <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-2">
                        <Trans>Articles commandés ({mergedItems.length})</Trans>
                      </p>
                      <ul className="divide-y divide-[var(--color-border)]">
                        {mergedItems.map((item, idx) => {
                          const imageUrl = getProductImageUrl(item);

                          return (
                            <li
                              key={item.productId || idx}
                              className="py-2.5 flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-surface-hover)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center shrink-0">
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement.innerHTML = '📦';
                                      }}
                                    />
                                  ) : (
                                    <span className="text-xl">📦</span>
                                  )}
                                </div>

                                <div>
                                  <span className="text-[var(--color-text)] font-medium block">
                                    {item.title}
                                  </span>
                                  <span className="text-xs text-[var(--color-text-muted)]">
                                    <Trans>Quantité : {item.quantity}</Trans>
                                  </span>
                                </div>
                              </div>

                              <span className="text-[var(--color-text)] font-mono font-medium">
                                {Number(item.priceAtPurchase).toFixed(2)} €
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-[var(--color-text-muted)] italic">
                      <Trans>Aucun détail d'article disponible pour cette transaction.</Trans>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}