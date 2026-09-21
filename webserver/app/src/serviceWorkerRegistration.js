/**
 * Enregistrement du service worker — adapté du template officiel
 * Create React App, avec un point d'entrée (onUpdate) pour notifier
 * l'app quand une nouvelle version est prête, plutôt que de rafraîchir
 * silencieusement sous les pieds de quelqu'un (ex: en plein paiement).
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/)
);

/**
 * @param {{ onSuccess?: (reg: ServiceWorkerRegistration) => void, onUpdate?: (reg: ServiceWorkerRegistration) => void }} config
 */
export function register(config) {
  if (
    process.env.REACT_APP_SERVICE_WORKER === 'disabled' ||
    process.env.NODE_ENV !== 'production' ||
    !('serviceWorker' in navigator)
  ) {
    return;
  }

  const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
  if (publicUrl.origin !== window.location.origin) {
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

    if (isLocalhost) {
      checkValidServiceWorker(swUrl, config);
    } else {
      registerValidSW(swUrl, config);
    }
  });
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              config?.onUpdate?.(registration);
            } else {
              config?.onSuccess?.(registration);
            }
          }
        };
      };
    })
    .catch((error) => {
    });

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (response.status === 404 || (contentType != null && contentType.indexOf('javascript') === -1)) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => window.location.reload());
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
    });
}

export function applyUpdate(registration) {
  registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      let unregisteredAny = false;

      const unregisterPromises = registrations.map((registration) =>
        registration.unregister().then((success) => {
          if (success) unregisteredAny = true;
        })
      );

      Promise.all(unregisterPromises).then(() => {
        // Supprime tous les caches de stockage de l'app (tgc-static, runtime, api)
        if ('caches' in window) {
          caches.keys().then((names) => {
            Promise.all(names.map((name) => caches.delete(name))).then(() => {
              if (unregisteredAny) {
                window.location.reload();
              }
            });
          });
        }
      });
    });
  }
}