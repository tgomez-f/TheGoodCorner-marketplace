import { create } from 'zustand';

export const useUIStore = create((set) => ({
  UserInterfaces: {},

  openUi: (id) => {
    set((state) => {
      const newState = { ...state.UserInterfaces, [id]: true };
      return { UserInterfaces: newState };  // ← OUI faut toujours retourner l'objet!
    });
  },

  toggleUi: (id) => {
    set((state) => {
      const newState = { ...state.UserInterfaces, [id]: !state.UserInterfaces[id] };
      return { UserInterfaces: newState };
    });
  },

  closeUi: (id) => {
    set((state) => {
      const newState = { ...state.UserInterfaces, [id]: false };
      return { UserInterfaces: newState };
    });
  },

  closeAllUis: () => {
    set(() => {
      const newState = {};
      return { UserInterfaces: newState };
    });
  },

  isUiOpen: (id) => {
    return useUIStore.getState().UserInterfaces[id] || false;
  },
}));
