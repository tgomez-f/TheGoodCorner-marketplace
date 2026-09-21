import { apiClient } from './client';



//GET /products   TOUS LES PRODUITS
export async function fetchAllProducts() {
  const {data} = await apiClient.get('/products');
  return data.data;
}

// GET /products/:id — publique, pas besoin d'auth (cohérent avec la route,
// pas de AuthenticateToken dessus côté backend)
export async function fetchProductByIdRequest(id) {
  const { data } = await apiClient.get(`/products/${id}`);
  return data;
}

// POST /products — AuthenticateToken + upload d'image (multer).
// On construit le FormData ici pour que le reste de l'app manipule un objet
// JS normal, comme pour updateUserRequest.
export async function createProductRequest(productData) {
  const formData = new FormData();
  Object.entries(productData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  // apiClient force 'Content-Type: application/json' par défaut (voir
  // client.jsx). Pour un upload, il faut au contraire laisser le navigateur
  // calculer lui-même le Content-Type multipart/form-data AVEC le boundary
  // — d'où le `undefined` explicite ici pour écraser le défaut de l'instance.
  // Si jamais multer renvoie une erreur de parsing côté back, c'est le
  // premier endroit à vérifier.
  const { data } = await apiClient.post('/products', formData, {
    headers: { 'Content-Type': undefined },
  });
  return data.data;
}

// PUT /products/:id — AuthenticateToken, PAS d'upload middleware sur cette
// route (contrairement à create) : donc JSON classique, et a priori pas
// possible de changer l'image via cet endpoint pour l'instant. À confirmer
// côté backend si c'est voulu.
export async function updateProductRequest(id, updates) {
  const { data } = await apiClient.put(`/products/${id}`, updates);
  return data.data;
}

// DELETE /products/:id — AuthenticateToken
export async function deleteProductRequest(id) {
  const { data } = await apiClient.delete(`/products/${id}`);
  return data;
}