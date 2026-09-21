import { create } from 'zustand';
import { createReviewRequest, updateReviewRequest, deleteReviewRequest } from '../api/reviewApi';
import { useProductStore } from './productStore';
// Ce store ne garde plus de liste d'avis en mémoire : les avis affichés
// viennent directement de viewedUser.receivedReviews (userStore), déjà
// inclus dans la réponse GET /user/:id. Ce store ne sert plus qu'à
// déclencher les actions d'écriture (créer/modifier/supprimer un avis) —
// c'est ensuite à l'appelant de rafraîchir viewedUser (fetchUser) pour
// voir le résultat.
export const useReviewStore = create((set) => ({
  submitting: false,
  error: null,

  createReview: async (id, reviewData) => {
    set({ submitting: true, error: null });
    try {
      const newReview = await createReviewRequest(id, reviewData);
      set({ submitting: false });
	  useProductStore.getState().fetchProducts();
      return newReview;
    } catch (err) {
      set({ error: err.message, submitting: false });
      throw err;
    }
  },

  updateReview: async (id, reviewId, updates) => {
    set({ submitting: true, error: null });
    try {
      const updatedReview = await updateReviewRequest(id, reviewId, updates);
      set({ submitting: false });
	  useProductStore.getState().fetchProducts();
      return updatedReview;
    } catch (err) {
      set({ error: err.message, submitting: false });
      throw err;
    }
  },

  deleteReview: async (id, reviewId) => {
    set({ submitting: true, error: null });
    try {
      await deleteReviewRequest(id, reviewId);
      set({ submitting: false });
	  useProductStore.getState().fetchProducts();
    } catch (err) {
      set({ error: err.message, submitting: false });
      throw err;
    }
  },
  

  clearError: () => set({ error: null }),
}));
