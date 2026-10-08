// Las imágenes de un correo: la marca y las seis mascotas, en PNG.
//
// Gmail no pinta SVG, y una imagen de correo tiene que estar en una URL
// pública: salen a newsletter/<correo>/img/ y el correo las enlaza por
// raw.githubusercontent.com, fijadas al SHA del commit (como Metricool).
//
// Se dibujan con los componentes de la aplicación, no copiados: si una
// mascota cambia, se vuelve a lanzar esto.
//
//   node newsletter/scripts/generar-imagenes.mjs newsletter/<correo>
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { APP, MEDIA } from '../../plantilla/app.mjs';

const correo = process.argv[2];
if (!correo) throw new Error('Uso: node newsletter/scripts/generar-imagenes.mjs newsletter/<correo>');
const SALIDA = resolve(correo, 'img');

// vite-node solo sirve ficheros de dentro de la aplicación: svgs.tsx se copia
// un momento a su node_modules/.cache, que no versiona nadie.
const temporal = join(APP, 'node_modules/.cache/newsletter-svgs.tsx');
mkdirSync(join(APP, 'node_modules/.cache'), { recursive: true });
copyFileSync(join(MEDIA, 'newsletter/scripts/svgs.tsx'), temporal);
let piezas;
try {
  piezas = JSON.parse(execFileSync('npx', ['vite-node', temporal],
    { cwd: APP, encoding: 'utf8', env: { ...process.env, CODEMAKER_APP: APP } }));
} finally {
  rmSync(temporal, { force: true });
}

// Playwright, el de la aplicación. En las sesiones remotas su Chromium está aparte.
const { chromium } = createRequire(join(APP, 'package.json'))('playwright');
const chromiumDelEntorno = () => {
  const base = '/opt/pw-browsers';
  if (!existsSync(base)) return undefined;
  const dir = readdirSync(base).find((d) => /^chromium-\d+$/.test(d));
  return dir ? `${base}/${dir}/chrome-linux/chrome` : undefined;
};

mkdirSync(SALIDA, { recursive: true });
const navegador = await chromium.launch({ executablePath: chromiumDelEntorno() });
const pagina = await navegador.newPage({ deviceScaleFactor: 3 });
for (const [nombre, svg] of Object.entries(piezas)) {
  await pagina.setContent(`<style>body{margin:0;background:transparent}#p{display:inline-block}</style><div id="p">${svg}</div>`);
  await pagina.locator('#p').screenshot({ path: join(SALIDA, `${nombre}.png`), omitBackground: true });
}
await navegador.close();
console.log(`Imágenes en ${SALIDA}: ${Object.keys(piezas).join(', ')}`);
