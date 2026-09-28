# Calendario de Instagram (@codemaker_3d)

Lo lee y lo actualiza `/publicar-semana` cada domingo: qué hay publicado, qué
está programado y qué toca después. Se edita a mano cuando haga falta: el
orden de la cola manda.

**Ritmo:** un Reel de ejemplo cada dos días a las **19:30** (Europe/Madrid).
Los días de en medio quedan para lo demás: carruseles del blog y de
situaciones de aprendizaje, y fotos de clase.

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

## Programado en Metricool

| Fecha | Qué | Publicación |
|---|---|---|
| Mar 29/09 19:30 | Parkour sobre la lava · Game | `publicaciones/ejemplo-parkour` |
| Jue 01/10 19:30 | Laberinto · Robotic | `publicaciones/ejemplo-laberinto` |

## Cola de Reels (en orden)

Cada uno con la acción que se ve hacer, no solo una vuelta:

| Fecha prevista | Ejemplo (id del catálogo) | Qué se ve |
|---|---|---|
| Sáb 03/10 | Castillo medieval · `voxel-castillo-medieval` | El cursor pone las últimas almenas y la bandera; la cámara se abre al castillo |
| Lun 05/10 | Museo de la pintura española · `game-museo` | Recorrido en primera persona; ante un Velázquez, la audioguía lo explica |
| Mié 07/10 | Puente atirantado · `modeling-puente-atirantado` | Se duplican y colocan los últimos tirantes; la cámara recorre el puente |
| Vie 09/10 | Funciones y la pila: el factorial · `code-factorial` | Dentro de la máquina, la pila crece con cada llamada y se deshace al volver |
| Dom 11/10 | Pingüinos en el hielo · `form-pinguinos` | Se estira el pico o una aleta tirando de caras; la malla se suaviza |
| Mar 13/10 | Templo griego · `modeling-templo-griego` | Se colocan las últimas columnas del pórtico |

**Reserva**, cuando se acabe la cola: Sistema solar, Policubos, Isla flotante
(Voxel); Parque de renovables, El faro, Mano robótica, Célula robotizada
(Modeling); Bodegón (Form). Y los ejemplos nuevos que vayan entrando en el
catálogo de la aplicación (`ejemplos/catalogo.mjs` en Codemaker_App).

## Que no se repitan

- **Ya publicados**: los de la tabla de arriba.
- **Los usa el anuncio del showreel** (`showreel/planos/` en la aplicación):
  Pirámides (la esfinge), Pulpo, Valle, Casa con jardín (la pérgola), Soporte
  en L, Clasificador, Siguelíneas con garra, Notas de la clase.
- Los siguelíneas sencillos se parecen demasiado al de la garra.

## Otras publicaciones pendientes

- Carrusel del blog «Robótica sin kits» (`publicaciones/blog-robotica-sin-kits`,
  maquetado; volver a renderizar, ya sale en oscuro).
- Situaciones de aprendizaje: las publica otro agente en la web y las apunta en
  `docs/situaciones-publicadas.md` de Codemaker_NewWeb. Cada una nueva, un
  carrusel con la plantilla `blog`.
- Fotos de clase: las manda Daniel (o las deja en `entrada/` con una nota del
  centro). Recortar a 4:5 y 9:16, comprobar que no se vean caras, nombres ni
  códigos de clase, y publicar tal cual.
