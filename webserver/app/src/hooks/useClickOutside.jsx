import { useEffect, useRef } from 'react';

/**
 * Hook générique : détecte les clics / touch en dehors d'un élément.
 * Utile pour fermer un dropdown, une modale, un menu contextuel...
 *
 * @param {Function} onOutsideClick - callback appelé au clic/touch extérieur
 * @param {boolean} enabled - n'attache l'écouteur que si true
 *   (évite d'écouter le document quand ce n'est pas nécessaire, ex: dropdown fermé)
 * @returns {React.RefObject} ref à poser sur l'élément à surveiller
 */
export function useClickOutside(onOutsideClick, enabled = true) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutsideClick(event);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [onOutsideClick, enabled]);

  return ref;
}
