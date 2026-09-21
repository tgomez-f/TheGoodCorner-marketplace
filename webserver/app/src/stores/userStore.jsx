// src/stores/userStore.jsx
import { create } from 'zustand';
import { fetchUserRequest, updateUserRequest, removeUserRequest } from '../api/userApi';

export const useUserStore = create(
    (set, get) => ({
      // Ton propre profil (complet, privé) — jamais rempli par un fetch
      // direct : GET /user/:id est publique, donc incapable de renvoyer
      // email/location même pour ton propre id. Rempli par authStore via
      // setUser(), juste après login/register/refresh, qui renvoient déjà
      // le profil complet.
      user: null,
      loading: false,
      error: null,

      // Profil PUBLIC d'un autre utilisateur consulté (pour page sellerProfile)
      // séparé de `user` pour ne jamais écraser ton propre
      // profil avec la version publique de quelqu'un d'autre.
      viewedUser: null,
      viewedUserLoading: false,
      viewedUserError: null,

      // GET /user/:id — profil PUBLIC d'un utilisateur donné ou le user privee meme si meme id
      fetchUser: async (id) => {
        const currentUser = get().user;

        if (currentUser?.id === id) {
          set({ loading: true, error: null });
          try {
            const data = await fetchUserRequest(id);
            set({ user: data, loading: false });
            return data;
          } catch (err) {
            set({ error: err.message, loading: false });
          }
        }
        set({ viewedUserLoading: true, viewedUserError: null });
        try {
          const data = await fetchUserRequest(id);
          set({ viewedUser: data, viewedUserLoading: false });
          return data;
        } catch (err) {
          set({ viewedUserError: err.message, viewedUserLoading: false });
        }
      },

      // Appelé par authStore juste après login/register/refresh : ces
      // routes renvoient déjà le profil complet, pas besoin de le
      // redemander.
      setUser: (user) => set({ user }),

      // PUT /user/:id — met à jour TON profil. L'id vient du user déjà en
      // store, pas besoin de le repasser à chaque appel.
      updateProfile: async (updates) => {
        const id = get().user?.id;
        if (!id) {
          const err = new Error('Impossible de mettre à jour : Aucun user connecter.');
          set({ error: err.message });
          throw err;
        }
        set({ loading: true, error: null });
        try {
          const data = await updateUserRequest(id, updates);
          set({ user: data, error: null });
          return data;
        } catch (err) {
          set({ error: err.message });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      // DELETE /user/:id — supprime TON compte.
      deleteAccount: async () => {
        const id = get().user?.id;
        if (!id) return;
        set({ loading: true, error: null });
        try {
          await removeUserRequest(id);
          set({ user: null, loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },



      logout: () => {
        // Les données d'amitié sont privées : on les vide comme viewedUser,
        // pour ne pas qu'elles traînent en mémoire pour le prochain compte
        // connecté sur ce navigateur (même logique que messageStore.reset()).
        set({
          user: null,
          error: null,
          loading: false,
          viewedUser: null,
        });
      },

      updateReview: (review) => {
        set((state) => {
          const updatedUser = state.user?.receivedReviews
            ? {
                ...state.user,
                receivedReviews: state.user.receivedReviews.map((r) =>
                  r.id === review.id ? review : r
                ),
              }
            : state.user;
          const updatedViewedUser = state.viewedUser?.receivedReviews
            ? {
                ...state.viewedUser,
                receivedReviews: state.viewedUser.receivedReviews.map((r) =>
                  r.id === review.id ? review : r
                ),
              }
            : state.viewedUser;
          return { user: updatedUser, viewedUser: updatedViewedUser };
        });
      },

      clearError: () => {
        set({ error: null });
      },

      updateViewedUserProduct_full: (product) => {
        set((state) => {
          if (!state.viewedUser?.product) return state;
          return {
            viewedUser: {
              ...state.viewedUser,
              product: state.viewedUser.product.map((p) =>
                String(p.id) === String(product.id) ? product : p
              ),
            },
          };
        });
      },

      updateViewedUserProduct: (id, quantity) => {
        set((state) => {
          if (!state.viewedUser?.product) return state;
          return {
            viewedUser: {
              ...state.viewedUser,
              product: state.viewedUser.product.map((p) =>
                String(p.id) === String(id) ? { ...p, quantity } : p
              ),
            },
          };
        });
      },
    })
);