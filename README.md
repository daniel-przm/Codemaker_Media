# Codemaker_Media

Las imágenes de las redes sociales de Codemaker 3D, y las plantillas que las generan.

## Cómo sale una publicación

1. Crea `publicaciones/<nombre>/` con un `datos.json` y sus imágenes en `img/`.
   Lo más rápido es copiar la carpeta de muestra de su plantilla (tabla de abajo).
2. `npm install` (una vez) y `npm run render -- publicaciones/<nombre>`.
3. Los PNG salen en `ImagenesRRSS/<nombre>/`.
4. Metricool no admite ficheros, solo URL públicas: se programa con las de
   `raw.githubusercontent.com` de este repo, fijadas al SHA del commit. Metricool descarga las imágenes en
   cuanto se programa el post y se queda una copia, así que después no dependen del repo.

## Plantillas (`plantilla/`)

| Plantilla | Para qué | Láminas | Muestra |
|---|---|---|---|
| `blog` | Nueva entrada del blog | 3 · 1080×1350: portada, desarrollo, cierre | `publicaciones/blog-robotica-sin-kits` |
| `studio` | Presentar un studio (`"tipo": "presentacion"`) o una novedad (`"tipo": "novedad"`) | portada + una por función + cierre | `publicaciones/studio-voxelstudio` |
| `ejemplo` | Reel de un proyecto de ejemplo | 3 · 1080×1920: `portada` (miniatura), `rotulo` (transparente, va encima del vídeo), `cierre` (último segundo y medio) | `publicaciones/ejemplo-casa-con-jardin` |
| `destacada` | Portadas de las historias destacadas | una por destacada, 1080×1920, icono centrado | `publicaciones/destacadas` |

Lo común (color, tipografía Montserrat Alternates, logo, pie, flechas, caja de
checks) está en `plantilla/base.css` y `plantilla/comun.js`. Los títulos
largos no se desbordan: la plantilla reduce su letra hasta que caben.

## Los Reels de ejemplo

Se enseña el proyecto **usándose**: el juego jugado, el robot resolviendo, las
últimas piezas colocándose. La aplicación (Codemaker_App) se usa como
herramienta, sin tocarla: tiene que estar clonada al lado, con `npm ci` hecho
(o `CODEMAKER_APP=<ruta>`).

1. **La toma**, en `tomas/<studio>-<nombre>.mjs`: qué ejemplo carga y qué pasa
   en cada fotograma. Cómo se escribe: `tomas/LEEME.md`.
2. `publicaciones/<nombre>/datos.json` con `"toma": "<id de la toma>"`.
3. `npm run grabar -- publicaciones/<nombre> [--rapido]`: la graba con el motor
   de planos de la aplicación y deja sus fotogramas en la publicación.
4. `npm run render -- publicaciones/<nombre>`: portada, rótulo y cierre.
5. `npm run reel -- publicaciones/<nombre>`: `ImagenesRRSS/<nombre>/reel.mp4`,
   con la música del showreel a su medida, que se genera sola la primera vez
   (`musica.wav`; para rehacerla, se borra).

El procedimiento de cada semana, de la cola del calendario a Metricool:
`.claude/commands/publicar-semana.md`. Lo que toca: `CALENDARIO.md`.

## Wallpapers

Fondos de pantalla para los PC del aula, en `wallpapers/`. Se rehacen con
`npm run wallpaper`; cómo están hechos, en `wallpapers/README.md`.

## Normas de contenido

- **Ni planes, ni precios, ni licencias.** No se dice qué studio es BASIC o
  PRO ni cuánto cuesta: cambia, y una publicación de Instagram no se corrige.
  Quien quiera saberlo, lo mira en la web.
- **«Pruébalo gratis» sí vale siempre**: todo se puede probar gratis (el PRO,
  con 14 días de prueba sin tarjeta).
- **Los ejemplos se presentan como lo que son**: ejemplos de la Galería y un
  reto para la clase («¿tus alumnos serían capaces…?»). Nunca como proyectos
  que nos mandan usuarios. Lo que venga de aulas de verdad se publica con su
  centro.
- El usuario de Instagram es **@codemaker_3d**.

`publicaciones/01-presentacion` es anterior a las plantillas y lleva su propio
`carrusel.html`. Sus PNG son los publicados: no se regeneran.
