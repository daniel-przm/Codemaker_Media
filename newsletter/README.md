# Newsletter

Los correos a los usuarios de Codemaker 3D. Son pocos, así que se mandan a
mano desde Gmail: un HTML que se abre en el navegador, se copia y se pega.

## Un correo, una carpeta

```
newsletter/<AAAA-MM-tema>/
├── correo.html     El correo
└── img/            La marca y las mascotas, en PNG
```

Una al mes. Y aparte, `bienvenida/correo.html`: el que se manda a mano a cada
profe que se registra. Ese no lleva `img/` propia: usa las de la de octubre de
2026, ya fijadas a su SHA. Antes de enviarlo se cambia **[Nombre]**.

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
4. **Se envía**: abrir `correo.html` en Chrome **con doble clic** —tiene que
   verse el correo, no el código—, Ctrl+A, Ctrl+C y Ctrl+V en un correo nuevo
   de Gmail. Copiado desde un editor, desde GitHub o desde `raw.…`, Gmail
   recibe el código fuente y lo enseña tal cual (pasó en octubre de 2026).
   Primero a uno mismo, y mirarlo también en el móvil.
5. **Destinatarios**: uno mismo en «Para» y los profes en **CCO**. Nunca en CC:
   cada uno vería los correos de los demás, y «Responder a todos» se lo
   mandaría a todos.

## Cómo se escribe

Así quedó la de octubre de 2026 después de que Dani la retocara a mano. Es el
modelo: `2026-10-estado-de-codemaker/correo.html`.

- **La firma Dani, en primera persona y cercano.** Saludo «¡Hola, profes!»,
  presentación corta («Soy Dani, de Codemaker») y cierre «¡Seguimos!» con
  «Daniel Pérez · Codemaker 3D». No es un comunicado de empresa.
- **A los lectores se les trata de vosotros, en todo el correo.** «Os cuento»,
  «podéis», «encendéis y apagáis». Ni «tú» ni imperativos en singular. La única
  excepción es el pie («respóndeme y te quito de la lista»).
- **La bienvenida es la excepción: va a una sola persona, así que de tú**
  («a este sí puedes contestar», «escríbeme»). Lo demás, igual.
- **Que se pueda contestar se dice dos veces, y en negrita**: en la
  introducción («a diferencia de otras newsletters que recibís, **a esta sí
  podéis contestar**») y otra vez en el cierre («Y recordad: **a esta newsletter
  sí podéis contestar**… dadle a "Responder"»). Para Dani es lo más importante
  del correo.
- **El estado de cada studio se cuenta con franqueza**: «Os lo contamos tal
  cual». Las etiquetas son *Estable* (verde) y *En desarrollo* (naranja). Si un
  studio está en desarrollo, se dice lo que ya se puede hacer y lo que falta.
- **Frases cortas y concretas, para un docente.** Cada punto lleva un arranque
  en negrita y una frase que dice qué hace el profesor («Asignáis un trabajo…
  y las corregís con nota y comentarios»). Sin jerga técnica: «modelos 3D», no
  «assets»; «comentarios», no «feedback»; «el alumnado», «los profes».
- **Lo que viene, con detalle tangible** entre paréntesis cuando ayuda
  («línea del tiempo, fotogramas clave, rigging con huesos...»).
- **Los planes, en un recuadro BASIC/PRO** con lo esencial y la prueba de 14
  días sin tarjeta, recordando que las clases se guardan. Para centros, formación
  o más de 150 alumnos: «escribidme y lo vemos».
- **Ortografía con cuidado**: tildes en los verbos de vosotros (activáis,
  podéis) y en «básico», «usándose»… Fue lo que más se escapó en el borrador.

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
