import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '../UI/Button';
import { useCartStore } from '../../stores/cartStore';
import { useUIStore } from '../../stores/uiStore';
import { PlusCircle, Star, Trash2, Pencil, X } from 'lucide-react';
import Avatar from '../UI/Avatar';
import { ProductForm } from './ProductForm';
import { useCartErrorMessage } from '../../hooks/useCartError';

export default function ProductCard({
    product,
    allowOutOfStock = false,
    isOwner = false,
    onDelete,
}) {
    const { t } = useLingui();
    const translateCartError = useCartErrorMessage();
    
    const [showConfirm, setShowConfirm] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [localError, setLocalError] = useState(null);

    const addToCart = useCartStore((state) => state.addToCart);
    const openUi = useUIStore((state) => state.openUi);
    const author = product?.author || {};

    const handleAddToCart = () => {
        const success = addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: 1,
            authorId: product.author?.id,
            stock: product.quantity,
        });

        if (success) {
            setLocalError(null);
            openUi('cart-popover');
        } else {
            const lastError = useCartStore.getState().error;
            setLocalError(translateCartError(lastError) || t`Impossible d'ajouter cet article au panier.`);
        }
    };

    const handleEditClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowEdit(true);
    };

    const handleDeleteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        setShowConfirm(false);
        try {
            await onDelete(product.id);
        } catch (err) {
            setLocalError(err?.message || t`Impossible de supprimer cet article.`);
            setDeleting(false);
        }
    };

    useEffect(() => {
        if (!localError) return;
        const timer = setTimeout(() => setLocalError(null), 3000);
        return () => clearTimeout(timer);
    }, [localError]);

    if (!product || (!allowOutOfStock && Number(product.quantity) <= 0))
        return null;

    const sellerInfo = (
        <>
            <Avatar src={author.avatar} name={author.username} size="xs" />
            <span className="text-xs font-medium text-[var(--color-text)]">
                {author.username || <Trans>Vendeur inconnu</Trans>}
            </span>
        </>
    );

    const isInStock = product.quantity > 0;

    return (
        <div className="card">
            <div className="card-header flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {author.id ? (
                <Link
                    to={`/profile/${author.id}`}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    {sellerInfo}
                </Link>
            ) : (
                <div className="flex items-center gap-2">{sellerInfo}</div>
            )}
            <div className="flex items-center gap-1 ml-3">
                <Star
                    size={15}
                    className="text-[var(--color-primary)]"
                    fill="var(--color-primary)"
                />
                <span className="text-xs font-medium text-[var(--color-text-muted)]">
                    {author?.sellerRating ?? '—'}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                    ({author?.sellerReviewCount ?? 0})
                </span>
            </div>
        </div>

                {isOwner && isInStock && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleEditClick}
                            disabled={deleting}
                            title={t`Modifier l'annonce`}
                            aria-label={t`Modifier l'annonce`}
                            className="p-1.5 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50"
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            disabled={deleting}
                            title={t`Supprimer l'annonce`}
                            aria-label={t`Supprimer l'annonce`}
                            className="p-1.5 rounded-full text-[var(--color-danger)] hover:bg-[var(--color-danger-surface)] transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            <Link to={`/products/${product.id}`}>
                <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-[var(--color-surface-hover)]">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        width="340"
                        height="340"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                    />
                </div>
            </Link>

            {localError && (
                <div className="p-4 bg-[var(--color-danger-surface)] border border-[var(--color-danger)] rounded-[var(--radius-md)]">
                    <p className="text-sm text-[var(--color-danger)] font-medium" role="alert">
                        {localError}
                    </p>
                </div>
            )}

            <div className="card-body card-footer-compact">
                <Link
                    to={`/products/${product.id}`}
                    className="hover:text-[var(--color-primary)] transition-colors"
                >
                    <h3 className="card-title line-clamp-2">{product.name}</h3>
                </Link>
                <p className="card-price">{product.price?.toFixed(2) ?? '—'}€</p>
                <Button
                    icon={PlusCircle}
                    onClick={handleAddToCart}
                    disabled={!isInStock}
                    title={!isInStock ? t`Victime de son succès` : t`Ajouter au panier`}
                    aria-label={!isInStock ? t`Victime de son succès` : t`Ajouter au panier`}
                    className="w-full"
                >
                    {isInStock ? (
                        <Trans>Ajouter au panier</Trans>
                    ) : (
                        <Trans>Victime de son succès</Trans>
                    )}
                </Button>
            </div>

            {showConfirm && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowConfirm(false); }}
                >
                    <div
                        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 max-w-sm w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                            <Trans>Supprimer l'annonce ?</Trans>
                        </h3>
                        <p className="text-sm text-[var(--color-text-muted)] mb-6">
                            <Trans>"{product.name}" sera définitivement supprimée. Cette action est irréversible.</Trans>
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowConfirm(false); }}
                            >
                                <Trans>Annuler</Trans>
                            </Button>
                            <Button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); confirmDelete(); }}
                                className="bg-[var(--color-danger)] hover:opacity-90 text-white"
                            >
                                <Trans>Supprimer</Trans>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showEdit && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowEdit(false); }}
                >
                    <div
                        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-[var(--color-text)]">
                                <Trans>Modifier l'annonce</Trans>
                            </h3>
                            <button
                                onClick={() => setShowEdit(false)}
                                aria-label={t`Fermer`}
                                className="p-1.5 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <ProductForm
                            product={product}
                            onSuccess={() => setShowEdit(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}