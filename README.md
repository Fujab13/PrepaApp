// correr en local host, abre en el terminal
cd project-root/frontend
npm install
npm run dev
https://claude.ai/share/ebba0bf0-86f7-4f89-9127-ecf4c91fbffc

//usar ngrok para hostear tu puerto, abrelo en otro terminal, necesitas tu llave
ngrok http 5173

https://chat.deepseek.com/share/2iirama4bqnav9bzsn

✕ ☰ ♔ ♕ ♖ ♗ ♘ ♙ ♚ ♛ ♜ ♝ ♞ ♟ 
💽 🐺 🦕 🔅 🔆 👤
✅ ❌ ⊠ ⛶ 🏁

AÑADIR LECCIONES INFO
Las lecciones se estructuran en 6 etapas de 12 preguntas es decir 72 preguntas
-Creamos un js con el nombre de interes y lo llenamos con el mismo formato de data.js 
-Dentro de index.js en la la misma carpeta importamos la nueva leccion y la añadimos al strign

AÑADIR LECTURAS EXTRA #/data/lecturas
    -Creamos un js con el nombre de interes y lo llenamos con el mismo formato de las lecturas.js
    -Dentro de index.js en la misma carpeta importamos la nueva lectura y la añadimos dentro del string

Notas: 
Si revisa /project-root/frontend/src/data/ Encontrara las FLASHCARDS en ~/data/lecturas y QUIZZES en ~/data
El codigo general encargado de mostrar todo esta en /project-root/frontend/scr/pages/Home.jsx y muestra 
{/* Material de lectura */} y {/* Lista de materias */}

Supabase → Authentication → Providers → Google pero
    Credenciales en Google Cloud Console
    https://console.cloud.google.com/auth/clients?organizationId=0&project=prepaapp

https://fiuzmomidaxvewhsodsj.supabase.co
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpdXptb21pZGF4dmV3aHNvZHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTE2MTAsImV4cCI6MjA5NjAyNzYxMH0.HpGe7wnwH3EdphunbYtCThBHZqPLUg-5JwQCrSLKXHc

Logica de la Base de Datos
    El razonamiento es algo así.
    El usuario tiene una app de acceso a la universidad: con temas tipo matematicas, español, fisica, ingenieria, biologia, economia, etc.
    Los contenidos se parten en unidades: 0-130 este numero esta inspirado en los 130 niveles de duolingo no hay una razon especifica
    El subprogreso: Se divide de 0 a 1000 unicamente suponiendo que por ejemplo en la unidad 15 queramos guardar si se quedo digamos en la tarjeta 100, en una pregunta 200, o en el concepto numero 500, ns el subprogreso en teoria al pasar a una nueva unidad deberia restablecerse, bien podría ocupar el maximo teorico de 1000, o bien podría llegar a 15 si esa unidad solo tiene 15 elementos de estudio es todo. 

Con esta lógica de Unidades (0-130) y Elementos internos (0-1000), el enfoque de "Estado Actual" 
(una sola fila por usuario y materia) es, por mucho, la mejor opción.

SQL EDITOR supabase
create table progreso_usuario (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  materia_id text not null,
  progreso int default 0,
  fecha date default current_date,
  unique(user_id, materia_id, fecha)
);
alter table progreso_usuario enable row level security;
create policy "usuarios ven su propio progreso"
on progreso_usuario for all
using (auth.uid() = user_id);


npm install @supabase/supabase-js

Archivo Leccion.jsx linea 13:1 import { getPreguntasDeUnidad, PREGUNTAS_POR_UNIDAD } from '../components/unidades' removido 

Agregar libros
1. Copia el PDF a frontend/public/libros/tu_libro.pdf
2. Agrega una entrada en frontend/src/data/libros.js:


## Arquitectura General
La aplicación está desarrollada con React y Vite. La navegación se organiza mediante páginas (`pages`), que utilizan componentes reutilizables (`components`). Los datos académicos y lecturas se almacenan en módulos dentro de `data`. La autenticación se gestiona mediante Supabase y React Context (`AuthContext`), mientras que el progreso del usuario se controla mediante hooks personalizados (`useProgreso`).

npm install katex react-katex 
Instalar KaTeX
para renderizar fórmulas escritas en sintaxis LaTeX.

revisa vite.config.js para añadir direcciones url permitidas


import { triggerVibration } from '../components/haptics';
const handleSubmit = () => {
  try {
    // Lógica de guardado...
    triggerVibration('success');
  } catch (error) {
    triggerVibration('error');
  }
};

Authentication → URL Configuration
Site URL:
http://localhost:5173        ← el puerto donde corre tu app (Vite usa 5173, CRA usa 3000)
Redirect URLs (agrega estas):
http://localhost:5173/**
http://localhost:5173

console.cloud.google.com → tu proyecto → APIs & Services → Credentials → tu OAuth Client ID:
Authorized JavaScript origins:
http://localhost:5173

Authorized redirect URIs:
https://TU_PROJECT_ID.supabase.co/auth/v1/callback

:root {
  --bg:         #0f0f1a;
  --surface:    #1a1a2e;
  --surface2:   #22223b;
  --text:       #f0f0f0;
  --text-muted: #846c89;
  --correct:    #4ade80;
  --wrong:      #f87171;
  --radius:     16px;
  --font:       'Inter', system-ui, sans-serif;
}


Gratuito
    Anuncios no intrusivos
    Lecciones ( 72 preguntas por materia ) 
    Flashcards ( 72 por materia )
    Enlaces BUAP 
    PDF's

Pago
    Lecciones (150 preguntas por materia) 
        Desbloquea Español I, II, III ...
    Flashcards ( +300 por materia )
    Recordatorios sobre P.Admisión al correo ()

Odontologia (dientes)


Puntos y subpuntos clave que debería conocer un aspirante a la BUAP

Calendario y Proceso
    Convocatoria: que y donde
    Registro: Pasos autoservicio
    Pago: Fechas y proceso
    Documentos: Fechas y proceso
    Resultados: Fechas y proceso, como lidiar con el exito.

Examen (EXANI-II)
    Definición: CENEVAL
    Habilidades: Comprensión lectora, redacción, pens. matemático
    Conocimientos: que se espera de cada área
    Ingles: Diagnostico

Formato
    Estructura del Examen
    Tiempo de duración
    Formato de Asignación de Examen (FAE)
    Reglamento: prohibidos, permitidos, documentos

Requisitos
    Certificado: Prom. min.
    Constancia de estudio: otra opcion
    Equivalencia

Oferta Educativa y Sedes
    Modalidades: Escolarizada, semiescolarizada y a distancia.
    Ubicación de sedes: CU, CU2, Salud, Complejo Cultural
    Puntaje de corte

Post-Admisión
    Curso de Inducción: Qué y si es obligatorio.
    Inscripción: Documentos necesarios para el ingreso oficial
    Cuotas: Diferencia entre cuota de inscripción y colegiatura

//IDEA PARA MAÑANA
Diseñar un cuestionario de 12 o 6 preguntas que estime tus probabilidades de pasar en una determinada carrera de la buap. 
que determine tu probabilidad de pasar con ayuda
que determine tu probabilidad de pasar sin ayuda

//DE TODOS LOS PUNTOS CLAVES CREAR FLASHCARDS

//DISEÑAR UN SISTEMA DE RECORDATORIOS INTELIGENTES PARA PERMITIR ENVIAR RECORDATORIOS INTRUSIVOS A CLIENTES PREMIUM 
SOBRE LAS FECHAS IMPORTANTES DEL PROCESO DE ADMISIÓN

npx tree-node-cli -I "node_modules"
VS Project
├── package-lock.json
└── project-root
    ├── README.md
    ├── frontend
    │   ├── index.html
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── public
    │   │   ├── a
    │   │   └── libros
    │   │       ├── autoevaluacion.pdf
    │   │       ├── curriculum.pdf
    │   │       └── estudio.pdf
    │   ├── src
    │   │   ├── App.jsx
    │   │   ├── components
    │   │   │   ├── Hexagono.jsx
    │   │   │   ├── Latex.jsx
    │   │   │   ├── LibroCard.jsx
    │   │   │   ├── MateriaCard.jsx
    │   │   │   ├── OpcionBtn.jsx
    │   │   │   ├── Sidenav.jsx
    │   │   │   ├── haptics.js
    │   │   │   ├── progreso.js
    │   │   │   └── unidades.js
    │   │   ├── context
    │   │   │   └── AuthContext.jsx
    │   │   ├── data
    │   │   │   ├── espanol.js
    │   │   │   ├── index.js
    │   │   │   ├── ingenierias.js
    │   │   │   ├── lecturas
    │   │   │   │   ├── espanol.js
    │   │   │   │   ├── index.js
    │   │   │   │   ├── ingenierias.js
    │   │   │   │   ├── matematicas.js
    │   │   │   │   └── medicina.js
    │   │   │   ├── libros.js
    │   │   │   ├── matematicas.js
    │   │   │   └── medicina.js
    │   │   ├── hooks
    │   │   │   └── useProgreso.js
    │   │   ├── logo.ico
    │   │   ├── main.jsx
    │   │   ├── pages
    │   │   │   ├── Home.jsx
    │   │   │   ├── Leccion.jsx
    │   │   │   ├── Lectura.jsx
    │   │   │   └── Login.jsx
    │   │   ├── styles
    │   │   │   └── global.css
    │   │   └── supabase.js
    │   └── vite.config.js
    └── package-lock.json