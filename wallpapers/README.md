# Wallpapers

Fondos de pantalla de Codemaker 3D para los ordenadores del aula.

## Familia 3D (`familia-3d/`)

| Fichero | Para |
|---|---|
| `codemaker-wallpaper-1920x1080.png` | Full HD, la mayoría de los PC del aula |
| `codemaker-wallpaper-2560x1440.png` | Monitores QHD |
| `codemaker-wallpaper-3840x2160.png` | 4K. Si no se sabe la pantalla, este: se ve bien en cualquiera 16:9 |

La mascota en isometría exacta —su silueta es la del logotipo— sobre la
rejilla de un editor 3D, y alrededor las seis de los studios, cada una con lo
suyo:

| Studio | Qué hace en la escena |
|---|---|
| Voxel | mira un árbol hecho de vóxeles de media casilla, con la última pieza bajando a su hueco |
| Modeling | sobre su agujero flota el cilindro que lo ha restado, con los ejes en su centro |
| Form | dentro de su jaula de control, redondeada como en una subdivisión Catmull-Clark |
| Game | en la cima de una montaña esculpida en la propia rejilla |
| Robotic | sobre la línea blanca de un siguelíneas pintada en la rejilla |
| Code | con un bocadillo de Java en los colores de CodeStudio |

Todo encaja en la cuadrícula (casilla de 0,6): la mascota grande ocupa 3×3
casillas, las de los studios 2×2 y los vóxeles del árbol media casilla. La
columna de la izquierda (iconos del escritorio) y la franja de abajo (barra de
tareas) quedan libres.

## Cómo se rehace

```bash
npm run wallpaper -- --borrador   # una a 1280×720, en generador/.cache/, para mirar
npm run wallpaper                 # las tres, sobre las de familia-3d/
```

Necesita la aplicación clonada al lado con `npm ci` hecho (o `CODEMAKER_APP`),
como los Reels: las mascotas, el logotipo, los colores y las tipografías salen
de ella, no se copian. Si cambia la marca, se vuelve a lanzar y ya.

| Fichero de `generador/` | Qué es |
|---|---|
| `familia-3d.html` | la escena: dónde va cada mascota, el terreno y los detalles de cada studio |
| `mascota3d.js` | la mascota en 3D, y la de cada studio, con los ojos donde los pone la marca |
| `escena3d.js` | renderer, cámara isométrica, luces, fondo y bloom |
| `render.mjs` | trae la marca de la aplicación, sirve la escena y la fotografía |

Sin tarjeta gráfica, WebGL va por SwiftShader: las tres tardan un par de minutos.
