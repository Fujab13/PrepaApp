// sw.js
// Service worker mínimo: solo existe para recibir Web Push (no cachea nada,
// no hay soporte offline — eso no se pidió). Se registra desde
// src/services/pushNotifications.js. Ver supabase/functions/_shared/
// pushNotifications.ts para quién envía el push (nuevo alumno inscrito en
// una oferta de tutoría) y src/pages/TutoriasMaestro.jsx para el botón que
// activa/desactiva la suscripción.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let datos = {};
  try {
    datos = event.data ? event.data.json() : {};
  } catch {
    datos = { title: "PrepaApp", body: event.data ? event.data.text() : "" };
  }

  const titulo = datos.title || "PrepaApp";
  const opciones = {
    body: datos.body || "",
    icon: "/logo.png",
    badge: "/logo.png",
    data: { url: datos.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(titulo, opciones));
});

// Si ya hay una pestaña de la app abierta, la enfoca y navega ahí en vez de
// abrir una pestaña nueva — es lo que espera un usuario de una app instalada.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
