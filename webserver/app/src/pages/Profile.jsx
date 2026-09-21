import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Trans, Plural, useLingui } from "@lingui/react/macro";
import { MessageCircle, PackageSearch, Lock, UserRoundX, HeartCrack, Check, X } from "lucide-react";
import { ProductForm } from "../components/products/ProductForm";
import { useProfileEditForm } from "../hooks/useProfileEditForm";
import { ProfilHeader } from "../components/profile/ProfilHeader";
import { ProfilInfos } from "../components/profile/ProfilInfos";
import { ReviewCard } from "../components/reviews/ReviewCard";
import ProductCard from "../components/products/ProductCard";
import { useAuthStore } from "../stores/authStore";
import { useFriendStore } from "../stores/friendStore";
import { TabButton } from "../components/UI/TabButton";
import { EmptyState } from "../components/UI/EmptyState";
import { formatMonthYear } from "../utils/date";
import { Button } from "../components/UI/Button";
import { useProductStore } from '../stores/productStore';
import { useNotificationStore } from '../stores/notificationStore'; // eslint-disable-line
import Avatar from "../components/UI/Avatar";

function Profile() {
  const { t } = useLingui();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { isAuthenticated, initializing } = useAuthStore();
  const deleteProduct = useProductStore((state) => state.deleteProduct);
  const navigate = useNavigate();

  const {
    user,
    isEditing,
    form,
    submitting,
    error,
    avatarSrc,
    startEditing,
    cancelEditing,
    handleChange,
    handleLocationChange,
    handleAvatarChange,
    save,
  } = useProfileEditForm();

  const displayName = user?.name || user?.username || t`Utilisateur`;
  const userRating = user?.sellerRating || 0;
  const reviewCount = user?.sellerReviewCount || 0;

  const friends = useFriendStore((state) => state.friends);
  const receivedFriendRequests = useFriendStore((state) => state.friendRequests);
  const sentFriendRequests = useFriendStore((state) => state.sentFriendRequests);
  const acceptFriendRequest = useFriendStore((state) => state.acceptFriendRequest);
  const rejectFriendRequest = useFriendStore((state) => state.rejectFriendRequest);
  const deleteFriendRequest = useFriendStore((state) => state.deleteFriendRequest);
  const onlineUserIds = useFriendStore((state) => state.onlineUserIds);
  const friendError = useFriendStore((state) => state.error);
  const { submitting: friendSubmitting } = useFriendStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'products';
  const setActiveTab = (tab) => setSearchParams({ tab });

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      useFriendStore.getState().fetchReceivedFriendRequests();
      useFriendStore.getState().fetchFriends();
      useFriendStore.getState().fetchSentFriendRequests();
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    const { notifications, markAsRead } = useNotificationStore.getState();
    const typesForTab = {
      reviews: ['REVIEW'],
      products: ['PRODUCT_SOLD'],
      friends: ['FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'FRIEND_REJECTED'],
    };
    const types = typesForTab[activeTab];
    if (!types) return;
    notifications
      .filter((n) => !n.read && types.includes(n.type))
      .forEach((n) => markAsRead(n.id));
  }, [activeTab]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-[var(--color-surface-hover)] rounded-full">
                  <Lock size={40} className="text-[var(--color-text-muted)]" />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-3">
                <Trans>Vous n'êtes pas connecté</Trans>
              </h1>

              <p className="text-[var(--color-text-muted)] mb-8 text-lg">
                <Trans>
                  Connectez-vous pour accéder à votre page profil, gérer vos annonces et consulter vos avis.
                </Trans>
              </p>
              <p className="text-[var(--color-text-muted)] mb-8 text-xs">
                <Trans>Bien tenté, petit fouineur !</Trans>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/authentication"
                  className="px-6 py-3 bg-[var(--color-primary)] text-[var(--color-primary-text)] font-semibold rounded-[var(--radius-md)] hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  <Trans>Se connecter</Trans>
                </Link>
                <Link
                  to="/authentication"
                  className="px-6 py-3 border border-[var(--color-border)] text-[var(--color-text)] font-semibold rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <Trans>Créer un compte</Trans>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="px-6 sm:px-8 lg:px-12 py-8 sm:py-10">
          <ProfilHeader
            user={user}
            displayName={displayName}
            userRating={userRating}
            reviewCount={reviewCount}
            isEditing={isEditing}
            submitting={submitting}
            avatarSrc={avatarSrc}
            onAvatarChange={handleAvatarChange}
            onEdit={startEditing}
            onCancel={cancelEditing}
            onSave={save}
          />

          {isEditing && error && (
            <div className="mb-6 p-4 bg-[var(--color-danger-surface)] border border-[var(--color-danger)] rounded-[var(--radius-md)]">
              <p
                className="text-sm text-[var(--color-danger)] font-medium"
                role="alert"
              >
                {error}
              </p>
            </div>
          )}

          <ProfilInfos
            user={user}
            userRating={userRating}
            reviewCount={reviewCount}
            isEditing={isEditing}
            form={form}
            onFieldChange={handleChange}
            onLocationFieldChange={handleLocationChange}
          />
        </div>
      </section>

      <div className="flex justify-start ml-12 gap-10 pt-6">
        <TabButton active={activeTab === "products"} onClick={() => setActiveTab("products")}>
          <Trans>Mes Annonces ({user?.product?.length || 0})</Trans>
        </TabButton>
        <TabButton active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")}>
          <Trans>Avis ({reviewCount || 0})</Trans>
        </TabButton>
        <TabButton active={activeTab === "friends"} onClick={() => setActiveTab("friends")}>
          <Trans>Mes amis ({friends?.length || 0})</Trans>
          {receivedFriendRequests?.length > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-[var(--color-danger)] text-[var(--color-on-danger)] rounded-full align-middle">
              {receivedFriendRequests.length}
            </span>
          )}
        </TabButton>
      </div>

      {activeTab === "products" ? (
        user?.product?.length > 0 ? (
          <div className="products-grid px-6 sm:px-8 lg:px-12 pt-8">
            {user?.product?.map((product) => (
              <ProductCard
                key={product.id}
                product={{ ...product, author: user }}
                allowOutOfStock={true}
                isOwner={true}
                onDelete={deleteProduct}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PackageSearch}
            title={t`Vous n'avez aucun article en vente.`}
            description={t`Postez votre premier produit en remplissant le formulaire ci-dessous.`}
            className="py-16 bg-[var(--color-surface-hover)]"
          />
        )
      ) : activeTab === "reviews" ? (
        reviewCount > 0 ? (
          <section className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
            <div className="px-6 sm:px-8 lg:px-12 py-16">
              <div className="max-w-4xl">
                <div className="flex items-center gap-3 mb-8">
                  <MessageCircle
                    size={28}
                    className="text-[var(--color-primary)]"
                  />
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)]">
                      <Trans>Mes avis</Trans>
                    </h2>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                      <Plural
                        value={reviewCount}
                        one="# avis client"
                        other="# avis des clients"
                      />
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {(showAllReviews
                    ? user?.receivedReviews
                    : user?.receivedReviews?.slice(0, 3)
                  )?.map((review) => (
                    <ReviewCard
                      key={review.id}
                      author={review.reviewAuthor.username}
                      avatar={review.reviewAuthor.avatar}
                      rating={review.reviewRating}
                      date={formatMonthYear(review.createdAt)}
                      content={review.reviews}
                    />
                  ))}
                </div>

                {!showAllReviews && reviewCount > 3 && (
                  <button
                    onClick={() => setShowAllReviews(true)}
                    className="mt-6 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                  >
                    <Trans>Voir tous les avis ({reviewCount})</Trans>
                  </button>
                )}

                {showAllReviews && reviewCount > 3 && (
                  <button
                    onClick={() => setShowAllReviews(false)}
                    className="mt-6 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                  >
                    <Trans>Voir moins d'avis</Trans>
                  </button>
                )}
              </div>
            </div>
          </section>
        ) : (
          <EmptyState
            icon={MessageCircle}
            iconSize={30}
            title={t`Personne ne vous a laissé d'avis pour l'instant`}
            className="py-16 bg-[var(--color-surface-hover)]"
          />
        )
      ) : (
        <div className="px-6 sm:px-8 lg:px-12 py-16 bg-[var(--color-bg)]">
          <div className="max-w-4xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-8">
              <Trans>Amis</Trans>
            </h2>

            {friendSubmitting && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
              </div>
            )}

            {friendError && (
              <div className="mb-6 p-4 bg-[var(--color-danger-surface)] border border-[var(--color-danger)] rounded-[var(--radius-md)]">
                <p className="text-sm text-[var(--color-danger)] font-medium">{friendError}</p>
              </div>
            )}

            {/* Demandes reçues */}
            {receivedFriendRequests?.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
                  <Trans>Demandes reçues ({receivedFriendRequests.length})</Trans>
                </h3>
                <div className="flex flex-col gap-3">
                  {receivedFriendRequests.map((request) => (
                    <div key={request.id} className="p-3 w-90 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)]">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={request.sender?.avatar}
                          alt={request.sender?.username}
                          name={request.sender?.username}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--color-text)] truncate">
                            {request.sender?.username}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            <Trans>Souhaite devenir ami avec toi</Trans>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            icon={Check}
                            variant="primary"
                            size="sm"
                            aria-label={t`Accepter la demande d'ami`}
                            onClick={() => acceptFriendRequest(request.id)}
                            disabled={friendSubmitting}
                          >
                            {friendSubmitting ? "Chargement..." : "Accepter"}
                          </Button>
                          <Button
                            icon={X}
                            variant="outline"
                            size="sm"
                            aria-label={t`Refuser la demande d'ami`}
                            onClick={() => rejectFriendRequest(request.id)}
                            disabled={friendSubmitting}
                          >
                            {friendSubmitting ? "Chargement..." : "Refuser"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Demandes envoyées */}
            {sentFriendRequests?.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
                  <Trans>Demandes envoyées ({sentFriendRequests.length})</Trans>
                </h3>
                <div className="flex flex-col gap-3">
                  {sentFriendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-3 w-90 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)]"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={request.receiver?.avatar}
                          alt={request.receiver?.username}
                          name={request.receiver?.username}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--color-text)] truncate">
                            {request.receiver?.username}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            <Trans>En attente de réponse</Trans>
                          </p>
                        </div>
                        <Button
                          icon={X}
                          variant="ghost"
                          size="sm"
                          aria-label={t`Annuler la demande d'ami`}
                          onClick={() => deleteFriendRequest(request.id)}
                          disabled={friendSubmitting}
                        >
                          {friendSubmitting ? <Trans>Chargement...</Trans> : <Trans>Annuler</Trans>}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Liste d'amis */}
            {friends && friends.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
                  <Trans>Mes amis ({friends.length})</Trans>
                </h3>
                <div className="flex flex-col gap-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="p-3 w-90 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar
                          src={friend.avatar}
                          alt={friend.username}
                          name={friend.username}
                          status={onlineUserIds[friend.id] ? 'online' : 'offline'}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--color-text)]">{friend.username}</p>
                          <p className="text-xs text-[var(--color-text-muted)] truncate">{friend.name}</p>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            icon={UserRoundX}
                            variant="ghost"
                            className="px-3 py-1 flex-shrink-0 text-sm whitespace-nowrap font-semibold text-[var(--color-danger)] border border-[var(--color-danger)] rounded-[var(--radius-sm)] hover:bg-[var(--color-danger-surface)] transition-colors"
                            onClick={() => deleteFriendRequest(friend.friendRequestId)}
                            disabled={!friend.friendRequestId || friendSubmitting}
                            title={!friend.friendRequestId ? t`Introuvable, réessaie après rechargement` : undefined}
                            aria-label={t`Supprimer de la liste d'amis`}
                          >
                            {friendSubmitting ? <Trans>Chargement...</Trans> : <Trans>Supprimer</Trans>}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* EmptyState */}
          {friends && friends.length === 0 && !receivedFriendRequests?.length && !sentFriendRequests?.length && (
            <EmptyState
              icon={HeartCrack}
              iconSize={30}
              title={t`Vous n'avez pas d'amis pour l'instant`}
              description={t`Envoyez des demandes d'amitié pour rejoindre d'autres utilisateurs`}
              className="py-16 bg-[var(--color-surface-hover)] rounded-[var(--radius-sm)]"
            />
          )}
        </div>
      )}

      <section className="bg-[var(--color-surface)]">
        <div className="px-6 sm:px-8 lg:px-12 py-16">
          <div className="max-w-2xl">
            <div className="mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-2">
                <Trans>Ajouter un produit</Trans>
              </h2>
              <p className="text-[var(--color-text-muted)]">
                <Trans>Remplis les informations pour créer un nouveau produit</Trans>
              </p>
            </div>
            <ProductForm onSuccess={(product) => navigate(`/products/${product.id}`)} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Profile;