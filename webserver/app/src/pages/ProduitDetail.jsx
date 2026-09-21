import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingCart, Calendar, MessageCircle, Trash2 } from 'lucide-react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { useUIStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';
import { useAuthStore } from '../stores/authStore';
import { useMessageStore } from '../stores/messageStore';
import { useLanguageStore } from '../stores/languageStore';
import { Button } from '../components/UI/Button';
import Avatar from '../components/UI/Avatar';
import ProductCard from '../components/products/ProductCard';
import { getCategoryLabel } from '../utils/constants';
import { useCartErrorMessage } from '../hooks/useCartError';
import NotFound from './NotFound';

function ProductDetailSkeleton() {
  return (
    <div className="container py-10 animate-pulse">
      <div className="h-4 w-64 bg-[var(--color-surface-hover)] rounded mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square bg-[var(--color-surface-hover)] rounded-[var(--radius-lg)]" />
        <div className="flex flex-col gap-4">
          <div className="h-4 w-24 bg-[var(--color-surface-hover)] rounded" />
          <div className="h-8 w-3/4 bg-[var(--color-surface-hover)] rounded" />
          <div className="h-8 w-32 bg-[var(--color-surface-hover)] rounded" />
          <div className="h-24 w-full bg-[var(--color-surface-hover)] rounded" />
          <div className="h-11 w-48 bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] mt-4" />
        </div>
      </div>
    </div>
  );
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLingui();
  const translateCartError = useCartErrorMessage();
  const currentLocale = useLanguageStore((state) => state.locale);

  const cachedProduct = useProductStore((state) => state.getProductById(id));
  const currentProduct = useProductStore((state) => state.currentProduct);
  const currentProductError = useProductStore((state) => state.currentProductError);
  const fetchProductById = useProductStore((state) => state.fetchProductById);
  const deleteProduct = useProductStore((state) => state.deleteProduct);
  const allProducts = useProductStore((state) => state.products);
  const addToCart = useCartStore((state) => state.addToCart);
  const openUi = useUIStore((state) => state.openUi);
  const currentUser = useUserStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const startConversationWith = useMessageStore((state) => state.startConversationWith);

  const [quantity, setQuantity] = useState(1);
  const [localError, setLocalError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const categoryLabels = useMemo(() => ({
    All: t`Tous`,
    Training: t`Entraînement`,
    Professional: t`Professionnel`,
    Combat: t`Combat`,
    Cardio: t`Cardio`,
  }), [t]);

  useEffect(() => {
    fetchProductById(id);
  }, [id, fetchProductById]);

  useEffect(() => {
    if (!localError) return;
    const timer = setTimeout(() => {
      setLocalError(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [localError]);

  const isCurrentFresh = currentProduct && String(currentProduct.id) === String(id);
  const product = isCurrentFresh ? currentProduct : cachedProduct;

  const isOwner = currentUser && product && String(currentUser.id) === String(product.author?.id);

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    try {
      await deleteProduct(id);
      navigate('/products');
    } catch {
      setLocalError(t`Erreur lors de la suppression.`);
      setDeleteConfirm(false);
    }
  };

  useEffect(() => {
    if (product) {
      setQuantity(product.quantity === 0 ? 0 : 1);
    }
  }, [product?.quantity]);

  if (!product && !currentProductError) {
    return <ProductDetailSkeleton />;
  }

  if (!product && currentProductError) {
    // Check if the error is due to being offline / 503
    if (currentProductError.isOffline || currentProductError.status === 503) {
      return (
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">
            <Trans>Vous êtes hors-ligne</Trans>
          </h1>
          <p className="text-[var(--color-text-muted)] mb-6">
            <Trans>Ce produit n'est pas disponible en cache et votre connexion est interrompue.</Trans>
          </p>
          <Button to="/products" variant="primary">
            <Trans>Retour aux produits</Trans>
          </Button>
        </div>
      );
    }

    return <NotFound />;
  }

  if (!product && currentProductError) {
    return <NotFound />;
  }

  if (!product || Number(product.quantity) <= 0) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-4">
          <Trans>Produit indisponible</Trans>
        </h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          <Trans>Ce produit est actuellement en rupture de stock ou n'est plus disponible.</Trans>
        </p>
        <Button to="/products" variant="primary">
          <Trans>Retour aux produits</Trans>
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    const success = addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity,
      stock: product.quantity,
      authorId: product.author?.id,
    });

    if (success) {
      setLocalError(null);
      openUi('cart-popover');
    } else {
      const lastError = useCartStore.getState().error;
      setLocalError(translateCartError(lastError) || t`Impossible d'ajouter cet article au panier.`);
    }
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      navigate('/authentication');
      return;
    }
    startConversationWith(product.author);
    navigate('/messagerie');
  };

  const relatedProducts = allProducts.filter(
    (p) => p.category?.id === product.category?.id && p.id !== product.id && Number(p.quantity) > 0
  );

  const authorName = product.author?.username;
  const memberSince = product.author?.createdAt
    ? new Intl.DateTimeFormat(currentLocale || 'fr-FR', { month: 'long', year: 'numeric' }).format(
        new Date(product.author.createdAt)
      )
    : null;

  const isOutOfStock = product.quantity === 0;

  return (
    <div className="bg-[var(--color-bg)]">
      <div className="container py-10">
        <nav className="text-sm text-[var(--color-text-muted)] mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-[var(--color-primary)] transition-colors">
            <Trans>Accueil</Trans>
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[var(--color-primary)] transition-colors">
            <Trans>Produits</Trans>
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text)]">{product.name}</span>
        </nav>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-6"
        >
          <ArrowLeft size={16} strokeWidth={2.75} />
          <Trans>Retour aux produits</Trans>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="flex items-center justify-center bg-[var(--color-surface-hover)] rounded-[var(--radius-lg)] p-8">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-w-full h-auto rounded-[var(--radius-md)]"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-medium text-[var(--color-primary)] uppercase tracking-wide mb-2">
              {categoryLabels[product.category?.name] ?? getCategoryLabel(product.category?.name)}
            </span>
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-[var(--color-primary)] mb-6">
              {product.price?.toFixed(2) ?? '—'} €
            </p>
            <p className="text-[var(--color-text-muted)] leading-relaxed mb-8">
              {product.description || <Trans>Description à venir.</Trans>}
            </p>

            {localError && (
              <div className="p-4 mb-4 bg-[var(--color-danger-surface)] border border-[var(--color-danger)] rounded-[var(--radius-md)]">
                <p className="text-sm text-[var(--color-danger)] font-medium" role="alert">
                  {typeof localError === 'object' ? localError.message : localError}
                </p>
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-[var(--color-text)]">
                <Trans>Quantité</Trans>
              </span>
              <div className="flex items-center gap-1 bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Minus}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  aria-label={t`Diminuer la quantité`}
                />
                <span className="w-8 text-center text-[var(--color-text)] font-medium">
                  {isOutOfStock ? 0 : quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Plus}
                  onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                  disabled={quantity >= product.quantity || isOutOfStock}
                  aria-label={t`Augmenter la quantité`}
                />
              </div>
              <span className={`text-xs ${isOutOfStock ? 'text-red-400 font-semibold' : 'text-[var(--color-text-muted)]'}`}>
                {!isOutOfStock ? (
                  <Trans>({product.quantity} en stock)</Trans>
                ) : (
                  <Trans>(Victime de son succès)</Trans>
                )}
              </span>
            </div>

            <Button
              icon={ShoppingCart}
              variant="primary"
              size="lg"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              title={isOutOfStock ? t`Victime de son succès` : t`Ajouter au panier`}
              aria-label={isOutOfStock ? t`Victime de son succès` : t`Ajouter au panier`}
            >
              {isOutOfStock ? <Trans>Victime de son succès</Trans> : <Trans>Ajouter au panier</Trans>}
            </Button>
          </div>
        </div>

        <div className="my-16 border-t border-[var(--color-border)]" />

        <section className="mb-16">
          <h3 className="text-xl font-semibold text-[var(--color-text)] mb-6">
            <Trans>Vendu par</Trans>
          </h3>
          <div className="flex items-center justify-between gap-4">
            <Link to={`/profile/${product.author?.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              <Avatar src={product.author?.avatar} alt={authorName} name={authorName} size={64} className="flex-shrink-0" />
              <div>
                <h4 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                  {authorName || <Trans>Vendeur inconnu</Trans>}
                </h4>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                  <Calendar size={16} />
                  <span>
                    {memberSince ? (
                      <Trans>Membre depuis {memberSince}</Trans>
                    ) : (
                      <Trans>Nouveau membre</Trans>
                    )}
                  </span>
                </div>
              </div>
            </Link>
            {isOwner ? (
              <div className="flex items-center gap-2">
                <Button
                  variant={deleteConfirm ? 'danger' : 'outline'}
                  size="md"
                  icon={Trash2}
                  onClick={handleDelete}
                  aria-label={deleteConfirm ? t`Confirmer la suppression` : t`Supprimer`}
                >
                  {deleteConfirm ? <Trans>Confirmer la suppression</Trans> : <Trans>Supprimer</Trans>}
                </Button>
                {deleteConfirm && (
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                  >
                    <Trans>Annuler</Trans>
                  </button>
                )}
              </div>
            ) : (
            <div className="flex flex-col items-start gap-2">
              <Button variant="outline" size="md" icon={MessageCircle} onClick={handleContactSeller}>
                <Trans>Contacter le vendeur</Trans>
              </Button>
              {!isAuthenticated && (
                <p className="text-sm text-[var(--color-text-muted)]">
                  <Trans>Vous devez être connecté pour contacter le vendeur</Trans>
                </p>
              )}
            </div>
            )}
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6">
              <Trans>Produits similaires</Trans>
            </h2>
            <div className="products-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;