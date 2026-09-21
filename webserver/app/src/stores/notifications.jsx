import { create } from 'zustand'

export const useNotificationStore = create((set) => ({
  notifications: [],

  addNotification: (message, type = 'info', duration = 3000) => {
    const id = Date.now()
    const notification = { id, message, type }

    set((state) => ({
      notifications: [...state.notifications, notification],
    }))

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      }, duration)
    }

    return id
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),
}))
