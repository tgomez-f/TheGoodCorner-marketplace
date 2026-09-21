import { apiClient } from './client';
import { SESSION_KEY } from '../utils/constants';

export async function loginRequest(email, password, code) {
  // axios retourne ce que le serveur renvoie (data) + des metadonnee
  // En destructurant '{ data }' on garde que ce qui nous interesse (les donnees renvoyer par le back)
  const { data } = await apiClient.post('/auth/login', { email, password, code });
  return {
    requiresTwoFactor: data.requiresTwoFactor,
    user: data.data,
    token: data.accessToken,
  };
}

export async function registerRequest(email, password, username) {
  const { data } = await apiClient.post('/auth/register', { email, password, username });
    return {
      user: data.data,
      token: data.accessToken,
    };
}

// Appelé au chargement de l'app (voir authStore.initAuth) et par l'intercepteur
// de client.jsx quand un access token expire. Le cookie refresh httpOnly part
// automatiquement avec la requête (withCredentials) — rien à lui passer ici.
export async function refreshRequest() {
		const { data } = await apiClient.post('/auth/refresh');
		return {
		  user: data.data,
		  token: data.accessToken,
		};
	}

export async function logoutRequest() {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    localStorage.removeItem(SESSION_KEY);
  }
}