// avatar.js
// Resuelve la foto de perfil de un usuario de Supabase Auth, mismo criterio
// que ya usa la RPC obtener_perfil_profesor para el perfil público de un
// profesor (ver migraciones 20260826160000 y 20260827120000): primero la
// foto de OAuth (Google guarda `avatar_url`/`picture` en user_metadata), y
// si no existe se cae a Gravatar ("la foto ligada a tu correo"). Gravatar
// acepta tanto MD5 como SHA-256 del correo como identificador; aquí se usa
// SHA-256 vía Web Crypto (nativo del navegador) para no tener que traer ni
// escribir a mano una implementación de MD5 solo para esto.
export async function resolverAvatarUsuario(user) {
  if (!user) return null;

  const deOAuth = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  if (deOAuth) return deOAuth;

  const email = user.email?.trim().toLowerCase();
  if (!email || !window.crypto?.subtle) return null;

  const hashBuffer = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // d=404 para que Gravatar responda 404 cuando el correo no tiene foto
  // registrada (en vez de una silueta genérica "mp"), así el onError de la
  // <img> sí se dispara y cae al círculo con inicial.
  return `https://www.gravatar.com/avatar/${hashHex}?d=404&s=176`;
}
