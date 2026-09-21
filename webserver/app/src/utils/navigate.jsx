// Pont minimal entre du code hors-React (ex: l'intercepteur axios de
// client.jsx) et react-router. Posé une seule fois par NavigationBridge
// (voir App.jsx) au montage du Router.
let navigateRef = null;

export function setNavigate(fn) {
  navigateRef = fn;
}

export function redirectTo(path, options) {
  if (navigateRef) {
    navigateRef(path, options);
  } else {
    // Fallback si jamais appelé avant que le Router soit monté (ne devrait pas arriver)
    window.location.href = path;
  }
}