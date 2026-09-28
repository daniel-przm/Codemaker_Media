# Codemaker_Media

Las imágenes de las redes sociales de Codemaker 3D, y las plantillas que las generan.

## Cómo sale una publicación

1. Crea `publicaciones/<nombre>/` con un `datos.json` y sus imágenes en `img/`.
   Lo más rápido es copiar la carpeta de muestra de su plantilla (tabla de abajo).
2. `npm install` (una vez) y `npm run render -- publicaciones/<nombre>`.
3. Los PNG salen en `ImagenesRRSS/<nombre>/`.
4. Metricool no admite ficheros, solo URL públicas: se programa con las de
   `raw.githubusercontent.com` de este repo. Metricool descarga las imágenes en
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

1. La toma, en Codemaker_App: `npm run showreel:planos -- --instagram <nombre>`
   (el proyecto usado, en 4:5) o `npm run ejemplos:grabar` (la vuelta de 360°).
   Sus fotogramas, en `publicaciones/<nombre>/fotogramas/` (no se versionan).
2. `npm run render -- publicaciones/<nombre>`: portada, rótulo y cierre.
3. `npm run reel -- publicaciones/<nombre>`: monta `ImagenesRRSS/<nombre>/reel.mp4`.
4. **La música**: si falta `publicaciones/<nombre>/musica.wav`, el paso 3 dice
   el comando exacto para generarla en Codemaker_App, a la medida del Reel.
   Es la del anuncio del showreel: el groove mientras se ve el proyecto y el
   golpe de la marca justo en el cierre. Sintetizada, sin licencias. Se
   genera y se vuelve a montar.

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
