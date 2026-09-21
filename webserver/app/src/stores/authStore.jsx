import { create } from 'zustand'
import { loginRequest, registerRequest, refreshRequest, logoutRequest } from '../api/authApi'
import { useCartStore } from './cartStore'
import { useUserStore } from './userStore'
import { useMessageStore } from './messageStore'
import { useNotificationStore } from './notificationStore'
import { connectSocket, disconnectSocket } from '../socket'
import { SESSION_KEY } from '../utils/constants'

const hasInitialSession = typeof window !== 'undefined' && localStorage.getItem(SESSION_KEY) === 'true';
// Ne gère que l'authentification (token, statut) — l'identité de la
// personne (profil) vit exclusivement dans userStore, pour n'avoir qu'une
// seule source de vérité. Voir userStore.setUser(), alimenté ici juste
// après login/register/refresh.
export const useAuthStore = create((set) => ({
  token: null,
  isAuthenticated: false,
  initializing: hasInitialSession,
  loading: false,
  error: null,

  login: async (email, password, code) => {
    set({ loading: true, error: null })
    try {
      const { user, token, requiresTwoFactor } = await loginRequest(email, password, code)
      if (requiresTwoFactor) {
        set({ loading: false })
        return 'two-factor'
      }
	  localStorage.setItem(SESSION_KEY, 'true')
      set({token, isAuthenticated: true, loading: false })
      // login renvoie déjà le profil complet : on le pousse directement
      // dans userStore, pas de fetch séparé (GET /user/:id est publique et
      // ne renverrait que la version publique).
      useUserStore.getState().setUser(user)
      useCartStore.getState().switchUser(user.id)
      connectSocket(user.id)
      useNotificationStore.getState().fetchNotifications()
      return true
    } catch (err) {
      set({ error: err.message, loading: false })
      return false
    }
  },

  register: async (email, password, username) => {
    set({ loading: true, error: null })
    try {
      const { user, token } = await registerRequest(email, password, username)
	  localStorage.setItem(SESSION_KEY, 'true')
      set({token, isAuthenticated: true, loading: false })
      useUserStore.getState().setUser(user)
      useCartStore.getState().switchUser(user.id)
      connectSocket(user.id)
      useNotificationStore.getState().fetchNotifications()
      return true
    } catch (err) {
      set({ error: err.message, loading: false })
      return false
    }
  },

  initAuth: async () => {
	const hasSession = localStorage.getItem(SESSION_KEY) === 'true'
    if (!hasSession) {
      set({ token: null, isAuthenticated: false, initializing: false })
      return
	}
    try {
      const { user, token } = await refreshRequest()
	  if (!token) {
        localStorage.removeItem(SESSION_KEY);
        useUserStore.getState().setUser(null);
        set({ token: null, isAuthenticated: false, initializing: false });
        return;
      }
      set({user, token, isAuthenticated: true, initializing: false })
      useUserStore.getState().setUser(user)
      useCartStore.getState().switchUser(user.id)
      connectSocket(user.id)
      useNotificationStore.getState().fetchNotifications()
    } catch (err) {
      if (err?.isRateLimited) {
      // Rate-limité, pas une session invalide : on ne touche à rien,
      // juste on arrête l'état "initializing" pour ne pas bloquer l'UI.
      set({ initializing: false });
      return;
    }
		localStorage.removeItem(SESSION_KEY);
		useUserStore.getState().setUser(null);
      set({ token: null, isAuthenticated: false, initializing: false })
    }
  },

  logout: async () => {
    // Même si l'appel échoue, on déconnecte quand même côté client.
    localStorage.removeItem(SESSION_KEY)
    set({ token: null, isAuthenticated: false, error: null })
    useCartStore.getState().switchUser(null)
    useUserStore.getState().logout()
    useMessageStore.getState().reset()
    useNotificationStore.getState().reset()
    disconnectSocket()
    try {
      await logoutRequest()
    } catch {
      // best-effort : côté client la session est déjà terminée
    }
  },

  setToken: (token) => set({ token }),
  setError: (error) => set({ error }),
}))