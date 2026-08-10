// useSubidaArchivos.js
// Subida de archivos de apoyo al bucket privado `tutoria-archivos`, bajo la
// carpeta del propio usuario (mismo patrón que ya usaba TutoriasAlumno.jsx
// para su formulario). Reusado por TutoriasAlumno.jsx y TutoriasMaestro.jsx
// al publicar una oferta: los archivos se suben de inmediato con
// `oferta_id` null (los adjunta `crear_oferta_tutoria` una vez que la
// oferta existe) y quedan re-parentados a la solicitud cuando se acepta.

import { useState } from "react";
import { supabase } from "../services/supabaseClient";

export const MAX_ARCHIVOS = 5;
export const MAX_TAMANO_ARCHIVO_MB = 10;

export function useSubidaArchivos(user) {
  const [archivos, setArchivos] = useState([]);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  const [errorArchivos, setErrorArchivos] = useState("");

  async function subirArchivos(fileList) {
    setErrorArchivos("");
    const nuevos = Array.from(fileList ?? []);
    if (nuevos.length === 0) return;

    if (archivos.length + nuevos.length > MAX_ARCHIVOS) {
      setErrorArchivos(`Puedes adjuntar máximo ${MAX_ARCHIVOS} archivos.`);
      return;
    }
    const demasiadoGrande = nuevos.find((f) => f.size > MAX_TAMANO_ARCHIVO_MB * 1024 * 1024);
    if (demasiadoGrande) {
      setErrorArchivos(`"${demasiadoGrande.name}" pesa más de ${MAX_TAMANO_ARCHIVO_MB}MB.`);
      return;
    }

    setSubiendoArchivo(true);
    for (const file of nuevos) {
      const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("tutoria-archivos").upload(path, file);
      if (uploadError) {
        setErrorArchivos(`No se pudo subir "${file.name}".`);
        continue;
      }
      setArchivos((prev) => [...prev, { path, nombreOriginal: file.name, tamanoBytes: file.size }]);
    }
    setSubiendoArchivo(false);
  }

  async function quitarArchivo(path) {
    setArchivos((prev) => prev.filter((a) => a.path !== path));
    await supabase.storage.from("tutoria-archivos").remove([path]);
  }

  function resetArchivos() {
    setArchivos([]);
    setErrorArchivos("");
  }

  return { archivos, subiendoArchivo, errorArchivos, subirArchivos, quitarArchivo, resetArchivos };
}
