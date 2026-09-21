import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useUserStore } from './userStore' 

/**
 * `error` stocke un CODE + les données brutes, jamais un message déjà
 * traduit : ce store Zustand vit hors de l'arbre React, donc pas d'accès
 * à useLingui() ici. La traduction se fait côté composant via
 * hooks/useCartError.jsx (useCartErrorMessage), qui, lui, a accès à `t`.
 * Codes possibles : INVALID_PRODUCT, OWN_PRODUCT, INSUFFICIENT_STOCK, STOCK_LIMITED.
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      cartCount: 0,
      cartTotal: 0,
      error: null,
      isHydrated: false,
      currentUserId: null,

      switchUser: (userId) => {
        const state = get()
        
        if (state.currentUserId === userId) {
          return
        }

        // Si on change d'utilisateur, sauvegarder l'état actuel
        // avant de charger le nouvel utilisateur
        if (state.currentUserId !== null) {
          // La persist middleware sauvegarde automatiquement dans localStorage
        }

        // Charger le panier du nouvel utilisateur depuis localStorage
        const storageKey = `cart-storage-${userId}`
        const savedCart = localStorage.getItem(storageKey)
        
        if (savedCart) {
          try {
            const parsed = JSON.parse(savedCart)
            set({
              cartItems: parsed.cartItems || [],
              cartCount: parsed.cartCount || 0,
              cartTotal: parsed.cartTotal || 0,
              currentUserId: userId,
            })
          } catch (e) {
            set({ currentUserId: userId, cartItems: [], cartCount: 0, cartTotal: 0 })
          }
        } else {
          // Nouvel utilisateur = panier vide
          set({ currentUserId: userId, cartItems: [], cartCount: 0, cartTotal: 0 })
        }
      },

      addToCart: (product) => {
        if (!product || !product.id || !product.price) {
          set({ error: { code: 'INVALID_PRODUCT' } })
          return false
        }
        const currentUser = useUserStore.getState().user        
        if (product.authorId === currentUser?.id) {
          set({ error: { code: 'OWN_PRODUCT', productId: product.id } })
          return false
        }
        const maxStock = Number(product.stock ?? product.quantity) || 0;
        const addCount = Number(product.quantity) || 1;
      
        const state = get(); // Récupère l'état actuel
        const existing = state.cartItems.find((item) => item.id === product.id);
        const currentCount = existing ? existing.quantity : 0;
      
        // 1. Bloquer si la quantité cumulée dépasse le stock disponible
        if (currentCount + addCount > maxStock) {
          set({
            error: { code: 'INSUFFICIENT_STOCK', currentCount, maxStock, productId: product.id }
          });
          return false;
        }

        set((prevState) => {
          const existing = prevState.cartItems.find((item) => item.id === product.id)
          let newItems

          if (existing) {
            newItems = prevState.cartItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                : item
            )
          } else {
            newItems = [...prevState.cartItems, { ...product, quantity: product.quantity || 1 }]
          }

          return {
            cartItems: newItems,
            cartCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
            cartTotal: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          }
        })
        return true
      },

      removeFromCart: (productId) =>
        set((state) => {
          const newItems = state.cartItems.filter((item) => item.id !== productId)
          return {
            cartItems: newItems,
            cartCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
            cartTotal: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          }
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          const newItems = state.cartItems.map((item) => {
            if (item.id === productId) {
              // ✅ Limiter la quantité au stock disponible
              const validQuantity = Math.max(1, Math.min(quantity, item.stock))
              
              if (quantity > item.stock) {
                set({ error: { code: 'STOCK_LIMITED', stock: item.stock, productId } })
              }

              return { ...item, quantity: validQuantity }
            }
            return item
          })
          return {
            cartItems: newItems,
            cartCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
            cartTotal: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          }
        }),

      clearCart: () =>
        set({
          cartItems: [],
          cartCount: 0,
          cartTotal: 0,
        }),
      
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

    }),
    {
      name: 'cart-storage', // Clé globale
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        // Sauvegarder aussi le panier de l'utilisateur actuel avec une clé unique
        if (state.currentUserId) {
          const userCartKey = `cart-storage-${state.currentUserId}`
          const userCartData = {
            cartItems: state.cartItems,
            cartCount: state.cartCount,
            cartTotal: state.cartTotal,
          }
          localStorage.setItem(userCartKey, JSON.stringify(userCartData))
        }

        return {
          cartItems: state.cartItems,
          cartCount: state.cartCount,
          cartTotal: state.cartTotal,
          currentUserId: state.currentUserId,
        }
      },
      onRehydrateStorage: () => (state) => {
        state.isHydrated = true;
      },
    }
  )
)
