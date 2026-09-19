// pwaInstall.js
// Utilidad para el prompt nativo "Agregar a pantalla de inicio" (evento
// beforeinstallprompt — Chrome/Edge/Android; iOS/Safari no lo soporta, de
// ahí el aviso alterno ya existente en TutoriasMaestro.jsx para push). El
// listener se registra a nivel de módulo (no en un componente) para no
// perderse el evento si el navegador lo dispara antes de que el Sidenav
// llegue a montarse.
let promptDiferido = null;
const suscriptores = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    promptDiferido = e;
    suscriptores.forEach((cb) => cb(true));
  });

  window.addEventListener('appinstalled', () => {
    promptDiferido = null;
    suscriptores.forEach((cb) => cb(false));
  });
}

export function hayPromptDeInstalacion() {
  return Boolean(promptDiferido);
}

export function suscribirseAPromptInstalacion(callback) {
  suscriptores.add(callback);
  return () => suscriptores.delete(callback);
}

/** Muestra el prompt nativo. Devuelve 'accepted' | 'dismissed' | null (si ya no había prompt disponible). */
export async function mostrarPromptInstalacion() {
  if (!promptDiferido) return null;
  promptDiferido.prompt();
  const { outcome } = await promptDiferido.userChoice;
  promptDiferido = null;
  return outcome;
}
