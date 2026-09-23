// Convierte cada <section class="lamina"> de un carrusel en un PNG de 1080×1350.
//
//   node plantilla/render.mjs publicaciones/01-presentacion
//
// Las imágenes salen en ImagenesRRSS/<publicación>/01.png, 02.png…, que es
// la carpeta de la que Metricool las recoge por su URL pública.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const carpeta = process.argv[2];
if (!carpeta) { console.error('Uso: node plantilla/render.mjs publicaciones/<nombre>'); process.exit(1); }

const salida = resolve('ImagenesRRSS', basename(carpeta));
mkdirSync(salida, { recursive: true });

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 1500 } });
await pagina.goto(pathToFileURL(resolve(carpeta, 'carrusel.html')).href);
await pagina.evaluate(() => document.fonts.ready);

const laminas = await pagina.$$('.lamina');
for (const [i, lamina] of laminas.entries()) {
  const fichero = resolve(salida, `${String(i + 1).padStart(2, '0')}.png`);
  await lamina.screenshot({ path: fichero });
  console.log(fichero);
}
await navegador.close();
