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

## Normas de contenido

- **Ni planes, ni precios, ni licencias.** No se dice qué studio es BASIC o
  PRO ni cuánto cuesta: cambia, y una publicación de Instagram no se corrige.
  Quien quiera saberlo, lo mira en la web.
- **«Pruébalo gratis» sí vale siempre**: todo se puede probar gratis (el PRO,
  con 14 días de prueba sin tarjeta).
- El usuario de Instagram es **@codemaker_3d**.

`publicaciones/01-presentacion` es anterior a las plantillas y lleva su propio
`carrusel.html`. Sus PNG son los publicados: no se regeneran.
