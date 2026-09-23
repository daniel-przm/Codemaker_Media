# ImagenesRRSS

Las imágenes finales, listas para publicar. Metricool las recoge por su URL pública:

    https://raw.githubusercontent.com/daniel-przm/Codemaker_Media/main/ImagenesRRSS/<publicación>/01.png

No se editan a mano: salen de `publicaciones/<publicación>/carrusel.html` con

    npm install        # una vez
    npm run render -- publicaciones/<publicación>

Cada `<section class="lamina">` del HTML es una imagen de 1080×1350 (4:5).
El estilo común (color, tipografía, pie, flechas) vive en `plantilla/base.css`.
