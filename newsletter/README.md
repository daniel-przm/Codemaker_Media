# Newsletter

Los correos a los usuarios de Codemaker 3D. Son pocos, así que se mandan a
mano desde Gmail: un HTML que se abre en el navegador, se copia y se pega.

## Un correo, una carpeta

```
newsletter/<AAAA-MM-tema>/
├── correo.html     El correo
└── img/            La marca y las mascotas, en PNG
```

## Cómo se hace

1. **Las imágenes**: `node newsletter/scripts/generar-imagenes.mjs newsletter/<correo>`.
   Salen de los componentes de marca de la aplicación (que tiene que estar al
   lado, como para las tomas; ver `plantilla/app.mjs`), así que la mascota es
   siempre la de la app. Gmail no pinta SVG: por eso PNG.
2. **Se suben las imágenes** (commit y `git push origin main`).
3. **Se enlazan por su URL de `raw.githubusercontent.com`, fijada al SHA** de
   ese commit, como hace Metricool: así un correo ya enviado no cambia aunque se
   regeneren las imágenes después.
   `https://raw.githubusercontent.com/daniel-przm/Codemaker_Media/<sha>/newsletter/<correo>/img/voxel.png`
4. **Se envía**: abrir `correo.html` en Chrome, Ctrl+A, Ctrl+C y Ctrl+V en un
   correo nuevo de Gmail. Primero a uno mismo, y mirarlo también en el móvil.

## Cómo está hecho el HTML

- **Tablas y estilos en línea**: es lo único que Gmail respeta. Ni `<style>`,
  ni SVG, ni fuentes web.
- **Fondo blanco con los colores de la aplicación**: azul `#007AFB`, tarjetas
  `#f9fafb`, y el color de cada studio de su `STUDIO_CONFIG`.
- **La tipografía es la del sistema.** Gmail no carga fuentes web, así que la
  Montserrat Alternates de las redes no llegaría: se quedaría en la de respaldo.

## Normas de contenido

Las del `README.md` principal valen para lo público. **Un correo a usuarios es
la excepción a «ni planes ni precios»**: va a quien ya tiene cuenta, y es
justo donde se les recuerda qué incluye cada plan. Que el precio sea el vigente
el día que se envía: `docs/LICENCIAS.md` en la aplicación.
