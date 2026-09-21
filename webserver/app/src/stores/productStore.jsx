import { create } from 'zustand'
import { useUserStore } from '../stores/userStore';
import { PRODUCT_PRICE_MAX } from '../utils/constants';
import {
  fetchAllProducts,
  fetchProductByIdRequest,
  createProductRequest,
  updateProductRequest,
  deleteProductRequest,
} from '../api/productApi'

export const useProductStore = create((set, get) => ({
  products: [],
  loading: true,
  error: null,
  
  // Produit de la fiche détail, indépendant de `products`
  currentProduct: null,
  currentProductLoading: false,
  currentProductError: null,
  
  filters: {
    search: '',
    selectedCategory: '',
    minPrice: 0,
    maxPrice: PRODUCT_PRICE_MAX,
  },

  fetchProducts: async () => {
    if (get().products.length === 0) {
      set({ loading: true });
    }
    try {
      const data = await fetchAllProducts();
      // Déduplication de sécurité sur la réponse API
      const uniqueProducts = Array.isArray(data)
        ? Array.from(new Map(data.map((item) => [String(item.id), item])).values())
        : [];

      set({ products: uniqueProducts, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProductById: async (id) => {
    set({ currentProductLoading: true, currentProductError: null });
    try {
      const data = await fetchProductByIdRequest(id);
      set({ currentProduct: data, currentProductLoading: false });
      return data;
    } catch (err) {
      // Check if it's a 503 status (Axios stores response in err.response)
      const status = err.response?.status;
      const isOffline = status === 503 || !navigator.onLine;

      set({ 
        currentProductError: {
          message: err.message,
          status: status,
          isOffline: isOffline,
          data: err.response?.data // Contains your service worker's JSON response if available
        }, 
        currentProductLoading: false 
      });
    }
  },

  updateProduct_socket: (product) => {
    set((state) => ({
      products: state.products.map((p) => String(p.id) === String(product.id) ? product : p),
      currentProduct:
        state.currentProduct && String(state.currentProduct.id) === String(product.id)
          ? product
          : state.currentProduct,
    }));
  },

  updateProductStock: ({ id, quantity }) => {
    set((state) => ({
      products: state.products.map((p) =>
        String(p.id) === String(id) ? { ...p, quantity } : p
      ),
    }));
  },

  // Utilisé notamment par les WebSockets
  addProduct: (product) => {
    if (!product || !product.id) return;
    set((state) => {
      const exists = state.products.some((p) => String(p.id) === String(product.id));
      if (exists) return state;
      return { products: [product, ...state.products] };
    });
  },

  // POST /products
  createProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const data = await createProductRequest(productData);

      set((state) => {
        // Bloque l'ajout si le produit a déjà été injecté (via WebSocket ou double appel)
        const alreadyExists = state.products.some((p) => String(p.id) === String(data.id));
        if (alreadyExists) {
          return { loading: false };
        }
        return { 
          products: [data, ...state.products], 
          loading: false 
        };
      });

      const { user, setUser } = useUserStore.getState();
      if (user) {
        const userProducts = user.product ?? [];
        const alreadyInUser = userProducts.some((p) => String(p.id) === String(data.id));
        if (!alreadyInUser) {
          setUser({ ...user, product: [...userProducts, data] });
        }
      }

      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  // PUT /products/:id
  updateProduct: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const data = await updateProductRequest(id, updates);
      set((state) => ({
        products: state.products.map((p) => (String(p.id) === String(id) ? data : p)),
        currentProduct:
          state.currentProduct && String(state.currentProduct.id) === String(id)
            ? data
            : state.currentProduct,
        loading: false,
      }));
      const { user, setUser } = useUserStore.getState();
      if (user?.product) {
        setUser({
          ...user,
          product: user.product.map((p) => (String(p.id) === String(id) ? data : p)),
        });
      }
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // DELETE /products/:id
  deleteProduct: async (id) => {
  set({ loading: true, error: null });
  try {
    await deleteProductRequest(id);
    set((state) => ({
      products: state.products.filter((p) => String(p.id) !== String(id)),
      loading: false,
    }));

    const { user, setUser } = useUserStore.getState();
    if (user?.product) {
      setUser({
        ...user,
        product: user.product.filter((p) => String(p.id) !== String(id)),
      });
    }
  } catch (err) {
    set({ error: err.message, loading: false });
    throw err;
  }
},

  // Filtrage avec déduplication intégrée
  getFilteredProducts: () => {
    const { products, filters } = get();
    const currentUser = useUserStore.getState().user;

    return products.filter((product) => {
      let myCategory = false;
      if (!product.quantity || product.quantity <= 0) return false;

      if (filters.selectedCategory === 'MyProducts') {
        myCategory = product.author?.username === currentUser?.username;
      }

      const matchSearch = product.name
        ?.toLowerCase()
        .includes(filters.search.toLowerCase());

      const matchCategory =
        !filters.selectedCategory ||
        (filters.selectedCategory === 'MyProducts'
          ? myCategory
          : product.category?.name === filters.selectedCategory);

      const matchPrice =
        product.price >= filters.minPrice && product.price <= filters.maxPrice;

      return matchSearch && matchCategory && matchPrice;
    });
  },

  resetFilters: () =>
    set({
      filters: { search: '', selectedCategory: '', minPrice: 0, maxPrice: PRODUCT_PRICE_MAX },
    }),

  getProductById: (id) => {
    return get().products.find((p) => String(p.id) === String(id));
  },

  setProducts: (products) => set({ products }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
}))