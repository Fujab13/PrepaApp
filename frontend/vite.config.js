import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'

export default defineConfig({
  // El plugin de Cloudflare va DESPUÉS del de React (orden recomendado por
  // su documentación). Este proyecto no tiene ningún Worker con lógica
  // propia (nada de bindings, SSR, ni funciones — todo lo dinámico sigue
  // viviendo en Supabase Edge Functions), así que el plugin aquí solo se
  // encarga de generar el wrangler.json de salida que necesita `wrangler
  // deploy` al desplegar a Cloudflare Workers (Static Assets); no debería
  // cambiar en nada el comportamiento de `npm run dev` en local.
  plugins: [react(), cloudflare()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'skid-uncolored-napped.ngrok-free.dev',
      '.ngrok-free.dev'  
    ]
  }
})