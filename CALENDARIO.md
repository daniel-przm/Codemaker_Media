# Calendario de Instagram (@codemaker_3d)

Lo lee y lo actualiza `/publicar-semana` cada domingo: qué hay publicado, qué
está programado y qué toca después. Se edita a mano cuando haga falta: el
orden de la cola manda.

**Ritmo** (desde octubre de 2026), todo a las **19:30** (Europe/Madrid):

| Día | Qué |
|---|---|
| Lunes | Carrusel del blog (artículos y situaciones de aprendizaje) |
| Martes y jueves | Reel de un ejemplo de la Galería |
| Viernes | Foto de un centro que usa la aplicación |

Son 16–17 publicaciones al mes: el plan gratuito de Metricool programa 20.

## Publicado

| Fecha | Qué | Enlace |
|---|---|---|
| 24/09 | Presentación (carrusel) | https://www.instagram.com/p/DdqRjb6CHNp/ |
| 24/09 | Pirámides de Egipto · Voxel (vuelta 360°) | https://www.instagram.com/reel/DdqiBSjkXdP/ |
| 24/09 | Casa con jardín · Modeling (vuelta 360°) | https://www.instagram.com/reel/Ddqkf74jEco/ |
| 24/09 | Diplodocus · Form (vuelta 360°) | https://www.instagram.com/reel/DdqpHFgjeeR/ |
| 24/09 | Siguelíneas con garra · Robotic | https://www.instagram.com/reel/DdqrvatkkXm/ |
| 24/09 | Foto de clase · @codemaker_jaen | https://www.instagram.com/p/Ddq-oELirw5/ |
| 24/09 | Notas de la clase · Code | https://www.instagram.com/reel/DdrBg30ETfP/ |
| 24/09 | Blog: currículo español (carrusel) | https://www.instagram.com/p/DdrJ5Jaigjv/ |
| 25/09 | El valle escondido · Game (vuelta 360°) | https://www.instagram.com/reel/DdtxujWCc-P/ |
| 29/09 | Parkour sobre la lava · Game | https://www.instagram.com/reel/Dd4TUkDj-6R/ |
| 01/10 | Laberinto · Robotic | https://www.instagram.com/reel/Dd9c1rYDj1d/ |
| 05/10 | Blog: situación de aprendizaje del siguelíneas (carrusel) | (ya no sale en Metricool como programado; enlace por apuntar) |
| 06/10 | Museo de la pintura española · Game | https://www.instagram.com/reel/DeKU0uIipbd/ |

## Programado en Metricool

| Fecha | Qué | Publicación |
|---|---|---|
| Jue 08/10 | Puente atirantado · Modeling | `publicaciones/ejemplo-puente-atirantado` |
| Lun 12/10 | Blog: robótica sin kits (carrusel) | `publicaciones/blog-robotica-sin-kits` |
| Mar 13/10 | Funciones y la pila: el factorial · Code | `publicaciones/ejemplo-factorial` |
| Jue 15/10 | Pingüinos en el hielo · Form | `publicaciones/ejemplo-pinguinos` |
| Lun 19/10 | Blog: alternativas a Tinkercad (carrusel) | `publicaciones/blog-alternativa-tinkercad` |
| Mar 20/10 | El sistema solar · Voxel | `publicaciones/ejemplo-sistema-solar` |
| Jue 22/10 | Templo griego · Modeling | `publicaciones/ejemplo-templo-griego` |
| Lun 26/10 | Blog: alternativa a Blender (carrusel) | `publicaciones/blog-alternativa-blender` |
| Mar 27/10 | Policubos · Voxel | `publicaciones/ejemplo-policubos` |
| Jue 29/10 | Bodegón de frutas · Form | `publicaciones/ejemplo-bodegon` |

Los viernes de octubre (2, 9, 16, 23 y 30), fotos de centros: sin programar
todavía.

## Preparado, sin programar (noviembre)

Grabados, con su portada, rótulo, cierre, `reel.mp4` y `texto.txt`, y subidos
a `main` el 06/10. Daniel decidirá cuándo se programan: se programan con el
SHA del commit en que están (`/publicar-semana`, §3). Propuesta de días,
alternando para que no salgan dos de Voxel seguidos:

| Día propuesto | Qué | Publicación |
|---|---|---|
| Mar 03/11 | Célula robotizada · Modeling | `publicaciones/ejemplo-celula-robotizada` |
| Jue 05/11 | Isla flotante · Voxel | `publicaciones/ejemplo-isla-flotante` |
| Mar 10/11 | Parque de renovables · Modeling | `publicaciones/ejemplo-parque-renovables` |
| Jue 12/11 | Animales de cubos · Voxel | `publicaciones/ejemplo-animales-de-cubos` |
| Mar 17/11 | Pulpo · Form *(reserva)* | `publicaciones/ejemplo-pulpo` |
| Jue 19/11 | Animales de la selva · Voxel | `publicaciones/ejemplo-selva` |
| Mar 24/11 | Clasificador de totems · Robotic *(reserva)* | `publicaciones/ejemplo-clasificador` |
| Jue 26/11 | El castillo · Voxel | `publicaciones/ejemplo-castillo` |

Pulpo y Clasificador son de la reserva (salen en el anuncio), pero sus Reels
enseñan otra cosa: el pulpo estira un brazo (el anuncio sube la coronilla) y
el clasificador corre entero (el anuncio, el primer totem de cerca). Si entra
algún ejemplo nuevo en el catálogo antes, ocupa su sitio.

Lunes de noviembre (carruseles del blog, sin preparar todavía): los «Qué
es…» de VoxelStudio, ModelingStudio, FormStudio, GameStudio y RoboticStudio,
uno por lunes (2, 9, 16, 23 y 30).

## Cola de Reels (en orden)

Con lo de noviembre preparado, de la Galería ya no queda nada nuevo sin
publicar: ni de Game, ni de Code, ni de Robotic.

**Reserva**: Soporte en L sale en el anuncio del showreel; el Siguelíneas
sencillo se parece al de la garra. Solo si se acaba lo demás. El Castillo
medieval, El faro, Mano robótica y la serie del bloque 2×4 no están en la
Galería (`galeria: false`): no se pueden presentar como «ejemplo de la
Galería». Y los ejemplos nuevos que vayan entrando en el catálogo de la
aplicación (`ejemplos/catalogo.mjs` en Codemaker_App) tienen preferencia.

## Que no se repitan

- **Ya publicados, programados o preparados**: los de las tablas de arriba.
- **Los usa el anuncio del showreel** (`showreel/planos/` en la aplicación):
  Pirámides (la esfinge), Pulpo, Valle, Casa con jardín (la pérgola), Soporte
  en L, Clasificador, Siguelíneas con garra, Notas de la clase.
- Los siguelíneas sencillos se parecen demasiado al de la garra.

## Otras publicaciones pendientes

- Blog, para los lunes de noviembre: los «Qué es…» de VoxelStudio,
  ModelingStudio, FormStudio, GameStudio y RoboticStudio (sus páginas
  responden, comprobado el 06/10). Son justo cinco: después no queda ninguno.
  «Después de Scratch» y «Programas de diseño 3D para el aula» siguen en
  borrador en la web (sus URL dan la portada): cuando se publiquen, van delante.
- Situaciones de aprendizaje: las publica otro agente en la web y las apunta en
  `docs/situaciones-publicadas.md` de Codemaker_NewWeb. Cada una nueva, un
  carrusel con la plantilla `blog`.
- Fotos de clase: las manda Daniel (o las deja en `entrada/` con una nota del
  centro). Recortar a 4:5 y 9:16, comprobar que no se vean caras, nombres ni
  códigos de clase, y publicar tal cual.
