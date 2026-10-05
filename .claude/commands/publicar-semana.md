# Preparar y programar las publicaciones de la semana

Cada domingo (o de una vez para todo un mes): grabar los Reels de ejemplo y
preparar los carruseles del blog de lo que viene, y dejarlos programados en
Metricool. Lo que toca, en `CALENDARIO.md`; cómo se hace una
publicación, en `README.md`; cómo se escribe una toma, en `tomas/LEEME.md`.

Se trabaja **sobre `main`, con commits, sin ramas ni PR, y sin CI** (`CLAUDE.md`).
La aplicación (Codemaker_App) solo se usa: **no se toca**. Si una toma
necesita algo que la aplicación no tiene, se le cuenta a Daniel.

## 0 · El entorno

- Codemaker_App al lado de este repositorio (o `CODEMAKER_APP=<ruta>`), en su
  `main` actualizado, con `npm ci` hecho. Y `npm install` aquí.
  El motor de planos (`showreel/`) ya está en `main` de la aplicación.
  ⚠️ Para las tomas de Game con cuadros (el museo) necesita subir las láminas
  a los emuladores (`prepararLaminas` en `showreel/planos/grabar.mjs`): si
  falla con «Faltan por publicar las láminas», es que aún no está.
- `CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome` si la sesión no
  encuentra el Chromium de Playwright. Los emuladores necesitan Java 21+.
- Si toca un Game con modelos del catálogo: el inventario (`tomas/LEEME.md`).

## 1 · Qué toca

Leer `CALENDARIO.md`, que tiene el ritmo: lunes, carrusel del blog; martes y
jueves, Reel de un ejemplo; viernes, foto de un centro; todo a las 19:30.
Desde el día siguiente al último programado, hasta cubrir lo que se vaya a
programar.
Coger los primeros de la cola. Si la cola se acaba, de la reserva, sin repetir
nada de «Que no se repitan». Mirar en el catálogo de la aplicación
(`ejemplos/catalogo.mjs`) si hay ejemplos nuevos: tienen preferencia. Solo
ejemplos de la Galería: uno con `galeria: false` no puede llevar «Este ejemplo
está en la Galería».

Para el blog: los artículos de `src/content/blog/` de Codemaker_NewWeb con
`draft: false` que no estén en `CALENDARIO.md`, comprobando que su página
responde en codemaker.es. Las situaciones de aprendizaje nuevas
(`docs/situaciones-publicadas.md` de la web) van primero.

## 2 · Por cada Reel

1. **La toma**, en `tomas/<studio>-<nombre>.mjs` (`tomas/LEEME.md`).
2. **La publicación**, en `publicaciones/ejemplo-<nombre>/datos.json`: copiar
   la de `ejemplo-laberinto` y cambiar `studio`, `proyecto`, `areas`, `etapas`
   (de su línea del catálogo) y `toma`.
3. **Borrador**: `npm run grabar -- publicaciones/ejemplo-<nombre> --rapido`, y
   mirar una hoja de fotogramas (ffmpeg `tile`). Ajustar hasta que se vea bien:
   que se entienda qué se hace, nada tapado, nadie parado mucho rato.
4. **La buena**: `npm run grabar -- publicaciones/ejemplo-<nombre>`. Cambiar
   `img/fotograma.png` si hay un fotograma mejor para la portada.
5. `npm run render -- …` y `npm run reel -- …` (la música se hace sola).
   Mirar portada, rótulo, cierre y unos fotogramas del `reel.mp4`.
6. **El texto**, en `texto.txt`, con el tono de los ya publicados (ver
   `ejemplo-parkour` y `ejemplo-laberinto`):
   - un gancho de una línea; qué es y qué hace, en concreto;
   - por qué sirve en clase, con lo que se aprende de verdad;
   - una pregunta al profesor («¿Tus alumnos serían capaces de…?»);
   - «💡 Idea para clase: …» (la de su descripción en el catálogo);
   - «Este ejemplo está en la Galería de ejemplos de Codemaker 3D. Pruébalo gratis en codemaker.es»;
   - 6–8 hashtags, empezando por `#claustrovirtual`.

   **Normas** (`README.md`): nada de planes, precios ni licencias; nunca
   presentar un ejemplo como proyecto de un alumno o de un usuario; no
   prometer lo que el ejemplo no hace (comprobarlo en la receta).

## 3 · Subir y programar

1. `git add` de la publicación (sin `fotogramas/`, que se ignoran), sus
   `ImagenesRRSS/` y la toma; commit y `git push origin main`.
2. Comprobar que responden 200 las URL
   `https://raw.githubusercontent.com/daniel-przm/Codemaker_Media/<sha>/ImagenesRRSS/ejemplo-<nombre>/reel.mp4`
   y `…/portada.png`, **con el SHA del commit**, nunca `main`.
3. Metricool, `createScheduledPost`: blogId **7062538**, Europe/Madrid, 19:30,
   `providers: [{network: "instagram"}]`,
   `instagramData: {type: "REEL", showReelOnFeed: true}`, `media` = el
   `reel.mp4`, `videoThumbnailUrl` = la `portada.png`, `text` = `texto.txt`.
   **Solo el Reel**: la Story la comparte Daniel desde el Reel.

   Programado de verdad (`draft: false`): así lo decidió Daniel el
   01/10/2026. Si alguna vez quiere revisarlo antes, `draft: true` lo deja en
   borrador con su fecha.
4. **Los carruseles del blog**: con la plantilla `blog` (copiar
   `publicaciones/blog-alternativa-tinkercad`); imágenes de la propia web
   (`public/images/`) o capturas de la galería (`ejemplos/capturas/` de la
   aplicación), **nunca fotos con caras de alumnos**. Texto como el de
   `blog-curriculo-espanol`. En Metricool, `type: "POST"` con las tres láminas.
   Ojo con el cambio de hora: a partir del último domingo de octubre, `+01:00`.

## 4 · Cerrar

- `CALENDARIO.md`: lo publicado desde el domingo pasado, con su enlace
  (Metricool, `getScheduledPosts` de la semana pasada: su `publicUrl`), lo
  programado nuevo, y la cola sin lo que se ha usado. Commit y push.
- El resumen para Daniel: qué se ha programado, para cuándo, y cualquier cosa
  que haya que mirar. Con los `reel.mp4` si se pueden enviar.
