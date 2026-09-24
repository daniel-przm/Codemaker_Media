// Convierte las láminas de una publicación en PNG.
//
//   npm run render -- publicaciones/02-blog-curriculo
//
// Una publicación es una carpeta con:
//   datos.json    — { "plantilla": "blog" | "studio" | "ejemplo" | "destacada", …textos e imágenes }
//   img/          — sus imágenes, con rutas relativas a la carpeta
// (La 01-presentacion es anterior a las plantillas y trae su propio carrusel.html.)
//
// Cada <section class="lamina"> sale como un PNG en ImagenesRRSS/<publicación>/:
// 01.png, 02.png… o con su nombre si la plantilla se lo da (portada.png…).
// Es la carpeta de la que Metricool recoge las imágenes por su URL pública.
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const carpeta = process.argv[2];
if (!carpeta) { console.error('Uso: npm run render -- publicaciones/<nombre>'); process.exit(1); }

const dirPublicacion = resolve(carpeta);
const salida = resolve('ImagenesRRSS', basename(dirPublicacion));
mkdirSync(salida, { recursive: true });

/** Las rutas de imagen del JSON pasan a URL absolutas, relativas a la publicación. */
function resolverImagenes(valor) {
  if (typeof valor === 'string' && /\.(png|jpe?g|webp|svg)$/i.test(valor) && !/^https?:/.test(valor)) {
    const ruta = resolve(dirPublicacion, valor);
    if (!existsSync(ruta)) throw new Error(`No existe la imagen ${valor} (buscada en ${ruta})`);
    return pathToFileURL(ruta).href;
  }
  if (Array.isArray(valor)) return valor.map(resolverImagenes);
  if (valor && typeof valor === 'object') return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, resolverImagenes(v)]));
  return valor;
}

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 2000 } });
pagina.on('pageerror', (e) => { console.error('Error en la plantilla:', e.message); process.exitCode = 1; });

const ficheroDatos = resolve(dirPublicacion, 'datos.json');
if (existsSync(ficheroDatos)) {
  const datos = resolverImagenes(JSON.parse(readFileSync(ficheroDatos, 'utf8')));
  const plantilla = resolve('plantilla', `${datos.plantilla}.html`);
  if (!existsSync(plantilla)) throw new Error(`No hay plantilla «${datos.plantilla}» en plantilla/`);
  await pagina.addInitScript((d) => { window.DATOS = d; }, datos);
  await pagina.goto(pathToFileURL(plantilla).href);
  await pagina.waitForSelector('body[data-listo]', { state: 'attached', timeout: 15000 });
} else {
  await pagina.goto(pathToFileURL(resolve(dirPublicacion, 'carrusel.html')).href);
  await pagina.evaluate(() => document.fonts.ready);
}

// El gris del body es solo para verlo en el navegador; así los rótulos salen transparentes
await pagina.addStyleTag({ content: 'body { background: transparent !important; }' });

const laminas = await pagina.$$('.lamina');
for (const [i, lamina] of laminas.entries()) {
  const nombre = (await lamina.getAttribute('data-nombre')) || String(i + 1).padStart(2, '0');
  const fichero = resolve(salida, `${nombre}.png`);
  await lamina.screenshot({ path: fichero, omitBackground: true });
  console.log(fichero);
}
await navegador.close();
