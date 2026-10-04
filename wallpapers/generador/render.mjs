// Saca los wallpapers en PNG: 1920×1080, 2560×1440 y 3840×2160.
//
//   npm run wallpaper                    # las tres, en wallpapers/familia-3d/
//   npm run wallpaper -- --borrador      # una sola a 1280×720, para mirar
//
// La escena es familia-3d.html, en three.js. Las mascotas, el logotipo, los
// colores de los studios y las tipografías no se copian: salen de la
// aplicación (Codemaker_App, al lado o donde diga CODEMAKER_APP), igual que la
// intro del showreel. Por eso, si cambia la marca, basta con volver a lanzarlo.
import http from 'node:http';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { APP, MEDIA } from '../../plantilla/app.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const CACHE = join(AQUI, '.cache');
const SALIDA = join(MEDIA, 'wallpapers', 'familia-3d');
const borrador = process.argv.includes('--borrador');
const ESCALAS = borrador ? [2 / 3] : [1, 4 / 3, 2];

// 1 · La marca y las fuentes, desde la aplicación. Se ejecuta con su vite-node
// —las mascotas son componentes de React en TypeScript— y desde dentro de su
// carpeta, porque Vite no sirve ficheros de fuera de la raíz del proyecto.
mkdirSync(CACHE, { recursive: true });
const volcado = join(APP, 'showreel', 'salida', 'wallpaper-marca.mjs');
mkdirSync(dirname(volcado), { recursive: true });
writeFileSync(volcado, `
import { writeFileSync } from 'node:fs';
import { cargarMarca } from '../motor/marca.mjs';
import { fuentesLocales } from '../motor/fuentes.mjs';
const [cache] = process.argv.slice(2);
writeFileSync(cache + '/marca.js', 'window.M = ' + JSON.stringify(cargarMarca()) + ';');
writeFileSync(cache + '/fuentes.css', fuentesLocales(cache + '/fuentes').split(${JSON.stringify(pathToFileURL(join(CACHE, 'fuentes')).href)}).join('/fuentes'));
`);
const r = spawnSync('npx', ['vite-node', volcado, '--', CACHE], { cwd: APP, stdio: 'inherit' });
rmSync(volcado);
if (r.status !== 0) process.exit(r.status ?? 1);

// 2 · Un servidor local: los módulos de three.js no cargan desde file://.
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' };
const servidor = http.createServer((pet, res) => {
  const u = decodeURIComponent(pet.url.split('?')[0]);
  const f = u.startsWith('/nm/') ? join(APP, 'node_modules', u.slice(4))
    : u === '/marca.js' || u === '/fuentes.css' || u.startsWith('/fuentes/') ? join(CACHE, u)
    : join(AQUI, u);
  if (!existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TIPOS[extname(f)] ?? 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(0);
const url = `http://localhost:${servidor.address().port}/familia-3d.html`;

// 3 · Las fotos. Sin tarjeta gráfica, WebGL va por SwiftShader: tarda, pero sale igual.
const opciones = { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
let navegador;
try { navegador = await chromium.launch(opciones); }
catch (e) {
  // En las sesiones remotas el Chromium preinstalado no es el de esta versión de Playwright.
  if (!existsSync('/opt/pw-browsers/chromium')) throw e;
  navegador = await chromium.launch({ ...opciones, executablePath: '/opt/pw-browsers/chromium' });
}
mkdirSync(SALIDA, { recursive: true });
for (const e of ESCALAS) {
  const ancho = Math.round(1920 * e), alto = Math.round(1080 * e);
  const p = await navegador.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: e });
  p.on('pageerror', (err) => console.error('Error en la página:', err.message));
  await p.goto(url);
  await p.waitForFunction(() => window.LISTO === true, null, { timeout: 600000 });
  // Que la tipografía sea la de verdad y no la de reserva: falla sin avisar.
  if (!(await p.evaluate(() => document.fonts.check('18px "IBM Plex Mono"')))) throw new Error('No cargó IBM Plex Mono');
  const destino = borrador ? join(CACHE, `borrador-${ancho}x${alto}.png`) : join(SALIDA, `codemaker-wallpaper-${ancho}x${alto}.png`);
  await p.screenshot({ path: destino });
  console.log(destino);
  await p.close();
}
await navegador.close();
servidor.close();
