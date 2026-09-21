/**
 * Ce fichier crée le "cerveau central" de l'app qui gère le thème (clair/sombre).
 * C'est comme une base de données que tous les composants peuvent lire et modifier.
 * 
 * Les composants peuvent demander: "Quel est le thème actuel?" ou "Change le thème"
 * Et tout les composants qui l'utilisent verront le changement automatiquement.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/** create() est une fonction Zustand qui crée un "magasin" global.
 * 
 * Elle prend EN PARAMÈTRE une fonction (flèche) qui:
 *   - Reçoit "set" (une fonction pour modifier l'état)
 *   - Retourne un objet avec les données et méthodes du magasin
 */
export const useThemeStore = create(
  /** persist() est un "middleware" (un add-on) qui ajoute une fonctionnalité:
   *  "Sauvegarde automatiquement le thème dans localStorage"
   * 
   *  localStorage = une mémoire du navigateur qui persiste même après fermer l'app
   *  Exemple: Si tu choisis "dark", au redémarrage du navigateur, il se souvient!
   */
  persist(
    /** C'est une FONCTION FLÈCHE qui:
     *   - Reçoit "set" en paramètre (une fonction fournie par Zustand)
     *   - Retourne un OBJET { } qui contient:
     *       * Les données (theme)
     *       * Les méthodes (toggleTheme, setTheme)
     * Cette fonction s'exécute UNE SEULE FOIS au démarrage de l'app.
     */
    (set) => ({
      // Donnee du store
      // État initial: le thème commence en "light"
      theme: 'light',

      // Methodes du store
      /** toggleTheme() = "changer le thème"
       * 
       * Quand on appelle toggleTheme():
       *   1. Elle appelle set() avec une fonction "updater"
       *   2. set() exécute cette fonction et lui passe l'état actuel (state)
       *   3. La fonction retourne les NOUVELLES valeurs à mettre en place
       *   4. Zustand notifie tous les composants abonnés
       *   5. Tout le monde re-rend avec la nouvelle valeur
       */
      toggleTheme: () =>
        // Appelle set() avec une fonction qui reçoit l'état actuel
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        })),

      setTheme: (newTheme) =>
        // Appelle set() avec un simple objet (pas de fonction updater nécessaire)
        set({ theme: newTheme })
    }),
    {
      name: 'theme-storage',    // Nom de la clé dans localStorage
      storage: createJSONStorage(() => localStorage)      // Stock en JSON
    }
  )
)