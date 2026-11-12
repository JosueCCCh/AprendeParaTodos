# Aprende para todos

Plataforma web de aprendizaje accesible. Funciona en dispositivos modestos, con conexión lenta o sin conexión.

## Características
- Lectura de cada lección en voz alta (Web Speech API)
- Tamaño de letra ajustable, fuente para dislexia, alto contraste y reducción de animaciones
- Navegación completa con teclado y compatible con lectores de pantalla
- Mini evaluaciones y progreso guardado en el dispositivo (localStorage)
- Funciona sin conexión (Service Worker) e instalable como app
- Sin frameworks ni base de datos: HTML, CSS y JavaScript

## Probar en tu computadora
Necesita un servidor local (por el `fetch` del JSON). Con VS Code instala la extensión **Live Server** y presiona "Go Live". También sirve: `python3 -m http.server 8000`.

## Publicar en GitHub Pages
1. Sube el proyecto a tu repositorio.
2. Settings → Pages → Branch `main` → carpeta `/ (root)` → Save.

## Agregar lecciones
Edita `data/lecciones.json`. Cada lección tiene `id`, `titulo`, `minutos`, `texto` (lista de párrafos) y `quiz` (pregunta `p`, opciones `o`, índice correcto `c`). Si cambias archivos, sube la versión `V` en `sw.js`.

## Ideas para crecer
Más idiomas, subtítulos de video, cuentas con Supabase, ranking y contribuciones de la comunidad.

## Licencia
MIT