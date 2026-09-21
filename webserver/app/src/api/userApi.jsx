import { apiClient } from './client';


export async function GetAllUsers() {
  const { data } = await apiClient.get("/user");
  return data.data;
}


// GET /user/:id — PUBLIQUE (pas de AuthenticateToken côté backend). Renvoie
// donc toujours la version publique du profil (username, avatar, bio,
// sellerRating...), jamais email/location — même quand :id est le tien.
// Sert à consulter le profil d'un AUTRE utilisateur (ex: page vendeur), pas
// à récupérer ton propre profil complet (voir authStore.jsx).
export async function fetchUserRequest(id) {
  const { data } = await apiClient.get(`/user/${id}`);
  return data.data;
}

// PUT /user/:id — AuthenticateToken + upload d'image (uploadMiddleware) :
// multipart obligatoire, updates peut contenir un champ `avatar` (File).
// NB: pas de solution propre ici pour un champ imbriqué type location — à
// aplatir (location_city, location_street...) si besoin, en attendant une
// décision côté backend (voir contrat, point 9).
export async function updateUserRequest(id, updates) {
  const formData = new FormData();
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  const { data } = await apiClient.put(`/user/${id}`, formData, {
    headers: { 'Content-Type': undefined },
  });
  return data.data;
}

// DELETE /user/:id — AuthenticateToken
export async function removeUserRequest(id) {
  const { data } = await apiClient.delete(`/user/${id}`);
  return data;
}