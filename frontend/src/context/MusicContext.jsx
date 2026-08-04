import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { MUSIC_TRACKS } from '../data/musicTracks'

const MusicContext = createContext(null)

const STORAGE_KEY = 'musica_silenciada'

export function MusicProvider({ children }) {
  const audioRef = useRef(null)
  const [muted, setMuted] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true')

  useEffect(() => {
    if (MUSIC_TRACKS.length === 0) return

    const audio = new Audio()
    audio.volume = 0.4
    audio.muted = muted
    audioRef.current = audio

    let indice = Math.floor(Math.random() * MUSIC_TRACKS.length)

    function reproducirSiguiente() {
      audio.src = MUSIC_TRACKS[indice]
      indice = (indice + 1) % MUSIC_TRACKS.length
      audio.play().catch(() => {})
    }

    audio.addEventListener('ended', reproducirSiguiente)
    reproducirSiguiente()

    // Algunos navegadores (sobre todo móviles) bloquean cualquier
    // reproducción, incluso silenciada, hasta la primera interacción.
    // Reintentamos aquí sin depender del estado `muted` (que quedaría
    // "congelado" al valor de montaje dentro de este closure).
    function reanudarConInteraccion() {
      if (audio.paused) audio.play().catch(() => {})
    }
    document.addEventListener('click', reanudarConInteraccion)

    return () => {
      audio.removeEventListener('ended', reproducirSiguiente)
      document.removeEventListener('click', reanudarConInteraccion)
      audio.pause()
      audioRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted
    localStorage.setItem(STORAGE_KEY, String(muted))
  }, [muted])

  function toggleMuted() {
    setMuted(m => !m)
  }

  return (
    <MusicContext.Provider value={{ muted, toggleMuted, hayMusica: MUSIC_TRACKS.length > 0 }}>
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  return useContext(MusicContext)
}
