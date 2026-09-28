// Graba la toma de un Reel con la aplicación, y deja sus fotogramas en la
// publicación.
//
//   npm run grabar -- publicaciones/ejemplo-parkour             # la buena, a 30 fps
//   npm run grabar -- publicaciones/ejemplo-parkour --rapido    # borrador, para mirar
//
// La toma es un fichero de `tomas/` —el que diga `"toma"` en datos.json—: qué
// ejemplo carga, qué se hace en cada fotograma, la cámara. La graba el motor de
// planos del showreel de Codemaker_App (`showreel/planos/grabar.mjs`), contra
// sus emuladores y fotograma a fotograma, sin tocar nada de la aplicación: se
// le pasa la carpeta de tomas de aquí. Ver `tomas/LEEME.md`.
//
// Deja el vídeo en `grabaciones/<toma>.mp4` (no se versiona), sus fotogramas en
// `publicaciones/<nombre>/fotogramas/` y, si no la hay, la imagen de la portada
// en `img/fotograma.png` (un fotograma del 70 %: cámbiala si hay otro mejor).
import ffmpeg from 'ffmpeg-static';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { APP, MEDIA } from './app.mjs';

const carpeta = process.argv[2];
if (!carpeta) { console.error('Uso: npm run grabar -- publicaciones/<nombre> [--rapido]'); process.exit(1); }
const pub = resolve(carpeta);
const datos = JSON.parse(readFileSync(join(pub, 'datos.json'), 'utf8'));
if (!datos.toma) { console.error(`${carpeta}/datos.json no dice qué toma grabar ("toma": "<id de tomas/>")`); process.exit(1); }
const rapido = process.argv.includes('--rapido');
const grabaciones = join(MEDIA, 'grabaciones');

const r = spawnSync('npm', ['run', 'showreel:planos', '--', '--planos', join(MEDIA, 'tomas'), '--salida', grabaciones, datos.toma, ...(rapido ? ['--rapido'] : [])], {
    cwd: APP, stdio: 'inherit', env: { FPS: String(datos.fps ?? 30), ...process.env },
});
if (r.status !== 0) process.exit(r.status ?? 1);

const video = join(grabaciones, `${datos.toma}.mp4`);
const fotogramas = resolve(pub, datos.fotogramas ?? 'fotogramas');
rmSync(fotogramas, { recursive: true, force: true });
mkdirSync(fotogramas, { recursive: true });
spawnSync(ffmpeg, ['-v', 'error', '-i', video, '-start_number', '0', join(fotogramas, '%04d.png')], { stdio: 'inherit' });
const n = readdirSync(fotogramas).length;
const portada = resolve(pub, datos.imagen ?? 'img/fotograma.png');
if (!existsSync(portada)) {
    mkdirSync(resolve(portada, '..'), { recursive: true });
    spawnSync(ffmpeg, ['-v', 'error', '-y', '-i', join(fotogramas, `${String(Math.floor(n * 0.7)).padStart(4, '0')}.png`), portada]);
}
console.log(`${video}\n${n} fotogramas en ${fotogramas}`);
