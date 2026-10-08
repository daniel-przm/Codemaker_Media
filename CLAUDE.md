# Codemaker_Media — cómo se trabaja aquí

Las imágenes y los vídeos de las redes sociales de Codemaker 3D (Instagram
@codemaker_3d), sus plantillas y sus textos. Todo lo que hay que saber para
hacer una publicación está en `README.md`.

## Sobre `main`, a base de commits

**No es un repositorio de código: aquí no hay ramas ni pull requests.** Se
trabaja directamente sobre `main`: cada publicación es uno o varios commits
—sus datos, su texto, sus imágenes y su vídeo— y se sube con `git push origin main`.

- Nada de ramas de trabajo: no aportan nada, y una publicación que se queda en
  una rama no la ve nadie. Si una sesión arranca en otra rama, lo suyo es
  pasarlo a `main` y seguir ahí.
- Metricool lee los medios por su URL de `raw.githubusercontent.com`, **fijada
  al SHA del commit** (`…/Codemaker_Media/<sha>/ImagenesRRSS/…`): primero se
  sube, luego se programa. Así, lo publicado no cambia aunque después se
  regenere el fichero.

## Sin GitHub Actions ni CI. Nunca

**No se añade `.github/workflows/`, ni ninguna otra forma de CI**, ni para
comprobar nada. Cuestan minutos de GitHub, y aquí no hay nada que compilar ni
que testear: se comprueba mirando la imagen o el vídeo antes de subirlo.

## Normas de contenido

Las de `README.md` («Normas de contenido»): sin planes, precios ni licencias;
«Pruébalo gratis» sí; los ejemplos se presentan como lo que son; @codemaker_3d.

## La newsletter

Los correos a los usuarios viven en `newsletter/`. Antes de escribir uno, lee
`newsletter/README.md`: el procedimiento y, sobre todo, «Cómo se escribe», el
estilo que Dani fijó en la de octubre de 2026.
