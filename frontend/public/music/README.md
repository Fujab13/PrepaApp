# Música de fondo

Coloca aquí tus archivos `.mp3` (por ejemplo `lofi-1.mp3`) y luego agrégalos a
la lista `MUSIC_TRACKS` en `src/data/musicTracks.js` con su ruta pública:

```js
export const MUSIC_TRACKS = [
  '/music/lofi-1.mp3',
  '/music/lofi-2.mp3',
];
```

La app reproduce las pistas en orden aleatorio y pasa a la siguiente al
terminar cada una. El usuario puede silenciarla con el botón dedicado en el
menú lateral (Sidenav).
