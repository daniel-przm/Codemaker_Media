# Las tomas de los Reels

Cada fichero es **una toma**: qué ejemplo de la Galería se carga y qué pasa en
cada fotograma. Las graba el motor de planos del showreel de la aplicación
(`showreel/planos/grabar.mjs` en Codemaker_App) con `npm run grabar`, desde
aquí y sin tocar la aplicación. El formato completo y la `api` están en
`showreel/README.md` de la aplicación, §3 «Los planos»; lo de aquí es lo que
hace falta para escribir una nueva.

```js
export default {
    id: 'robotic-laberinto',            // = el nombre del fichero
    ejemplo: 'robotics-laberinto',       // id del catálogo: <studio>-<slug>
    duracion: 14,                        // segundos de toma
    previo: 5.5,                         // segundos que corren sin grabarse
    lienzo: { ancho: 720, alto: 900 },   // 4:5 a 1,5× = 1080×1350. Siempre así
    preparar(escena) { … },              // opcional: quitar lo último, para terminarlo en la toma
    async antes(p) { … },                // opcional: Playwright antes de grabar
    fotograma(t, api, datos) { … },      // en la página, en cada fotograma
};
```

**Una toma no puede importar nada**: se copia dentro de la aplicación para
cargarla, y `fotograma` viaja como texto a la página. Lo que necesite de fuera
va en `datos`, que devuelve `preparar`.

## Lo que ya sabemos

- **Enseñar a hacer algo, no dar una vuelta.** Jugar el juego, ver el robot
  resolver, colocar las últimas piezas. Ver las del showreel en la aplicación
  (`showreel/planos/*.mjs`): la esfinge (Voxel, `placeVoxel` con cursor), la
  pérgola (Modeling, duplicar y mover), el pulpo (Form, `moveFace`).
- **Primero `--rapido`, y mirar los fotogramas.** Casi nunca sale a la primera.
  `TRAZA=1` saca por consola lo que la toma deje en `window.__traza`.
- **En 4:5, los paneles de Robotic tapan el robot**: se esconde todo lo que no
  sea el lienzo (`antes` de `robotic-laberinto.mjs`).
- **Game**: en tercera persona si no hay nada con lo que choque la cámara
  (`game-parkour`), en primera si hay casas o árboles (el valle del showreel).
  El jugador sigue una ruta de puntos: cada uno dice a qué distancia se salta y
  a qué plataforma esperar. Un personaje parado mucho rato parece un vídeo
  congelado.
- **Robotic**: pulsar «Ejecutar» con `api.una` al principio de la toma y seguir
  al robot de cara con `api.seguirDeFrente`, desde arriba si hay muros.
- **Game con modelos del catálogo** (el valle, el museo) necesita el inventario
  de modelos en la aplicación: `ejemplos/salida/inventario-modelos.jsonl`.
  Se saca del log del último run del workflow «Publicar la galería de
  ejemplos» (paso «Inventario de modelos»), restaurando lo que GitHub tapa
  como `***`: el `{` y el `}` de cada línea y el id del proyecto en las URL
  (`codemaker-21830`). Ver `ejemplos/README.md` de la aplicación.
