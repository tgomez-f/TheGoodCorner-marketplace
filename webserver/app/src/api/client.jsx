import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { refreshRequest } from './authApi';
import { redirectTo } from '../utils/navigate';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Indispensable pour que le cookie refresh httpOnly voyage entre le front
  // (localhost:4443) et l'API (autre port/domaine) : sans ça, le navigateur
  // ne l'envoie ni ne l'accepte jamais. Le backend doit avoir un CORS
  // symétrique (credentials: true + origin explicite, jamais '*').
  withCredentials: true,
});

// Attache automatiquement le token d'auth (s'il existe) à CHAQUE requête.
// useAuthStore.getState() lit l'état du store en dehors de tout composant
// React (un intercepteur n'est pas un composant, donc pas de hook ici).
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// File d'attente : si plusieurs requêtes échouent en 401 en même temps
// (ex: 3 appels en vol juste avant l'expiration de l'access token), on ne
// veut déclencher qu'UN SEUL refresh, pas trois en parallèle. Les requêtes
// suivantes attendent le résultat du premier refresh puis rejouent.
let isRefreshing = false;
let pendingRequests = [];

const BLOCK_DURATION = 4000;
let rateLimitBlocked = false;

function onRefreshed(newToken) {
  pendingRequests.forEach((callback) => callback(newToken));
  pendingRequests = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = ['/auth/login', '/auth/register', '/auth/refresh'].some((path) =>
      originalRequest?.url?.includes(path)
    );

	if (error.response?.status === 503) {
	  redirectTo('/Unavailable');
	  return Promise.reject(new Error('Service temporairement indisponible.'));
	}
  // ===== 429 : redirection + blocage, une seule fois =====
    if (error.response?.status === 429) {
      if (!rateLimitBlocked) {
        rateLimitBlocked = true;
        redirectTo('/rate-limiting');
        setTimeout(() => { rateLimitBlocked = false; }, BLOCK_DURATION);
      }
      const rateLimitError = new Error('Trop de requêtes, veuillez patienter.');
      rateLimitError.isRateLimited = true;
      return Promise.reject(rateLimitError);
    }
    // =========================================================

    // Un 401 sur une route "normale" (pas login/register/refresh eux-mêmes,
    // et pas déjà rejouée une fois) déclenche une tentative de refresh
    // silencieux avant d'abandonner.
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { token } = await refreshRequest();
        useAuthStore.getState().setToken(token);
        onRefreshed(token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        pendingRequests = [];
        if (!refreshError?.isRateLimited) {
          useAuthStore.getState().logout();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const isLoginOrRegister = ['/auth/login', '/auth/register'].some((path) =>
      originalRequest?.url?.includes(path)
    );

    if ((error.response?.status === 401) && !isLoginOrRegister) {
      useAuthStore.getState().logout();
    }

    const message = error.response?.data?.message || error.message || 'Erreur réseau';
    return Promise.reject(new Error(message));
  }
);