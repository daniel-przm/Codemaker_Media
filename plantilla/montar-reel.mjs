// Monta el Reel de un proyecto de ejemplo.
//
//   npm run render -- publicaciones/ejemplo-<nombre>      # antes: portada, rótulo y cierre
//   npm run reel   -- publicaciones/ejemplo-<nombre>
//
// Coge los fotogramas de la vuelta al diseño —los graba la aplicación con
// `npm run ejemplos:grabar`, en el repositorio Codemaker_App— y deja en
// ImagenesRRSS/<publicación>/reel.mp4:
//
//   la vuelta, con el rótulo encima  →  fundido  →  el cierre, 1,5 segundos
//
// 1080×1920, H.264 y una pista de audio en silencio: Instagram acepta vídeos
// mudos, pero algunos pasos intermedios fallan con uno sin pista de audio.
//
// En datos.json:
//   "fotogramas": carpeta con 0000.png, 0001.png… (relativa a la publicación, o absoluta)
//   "fps": los de la grabación (24 si no se dice)
import ffmpeg from 'ffmpeg-static';
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const carpeta = process.argv[2];
if (!carpeta) { console.error('Uso: npm run reel -- publicaciones/<nombre>'); process.exit(1); }
const dirPublicacion = resolve(carpeta);
const datos = JSON.parse(readFileSync(join(dirPublicacion, 'datos.json'), 'utf8'));
const salida = resolve('ImagenesRRSS', basename(dirPublicacion));

const fotogramas = resolve(dirPublicacion, datos.fotogramas ?? 'fotogramas');
const fps = datos.fps ?? 24;
const CIERRE = 1.5, FUNDIDO = 0.4;
const n = existsSync(fotogramas) ? readdirSync(fotogramas).filter((f) => /^\d{4}\.png$/.test(f)).length : 0;
if (!n) { console.error(`No hay fotogramas en ${fotogramas}`); process.exit(1); }
for (const f of ['rotulo.png', 'cierre.png']) {
  if (!existsSync(join(salida, f))) { console.error(`Falta ${f}: antes, npm run render -- ${carpeta}`); process.exit(1); }
}
const vuelta = n / fps;

const r = spawnSync(ffmpeg, [
  '-y', '-loglevel', 'error',
  '-framerate', String(fps), '-i', join(fotogramas, '%04d.png'),
  '-i', join(salida, 'rotulo.png'),
  '-loop', '1', '-framerate', String(fps), '-t', String(CIERRE + FUNDIDO), '-i', join(salida, 'cierre.png'),
  '-f', 'lavfi', '-t', String(vuelta + CIERRE), '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
  '-filter_complex', [
    `[0:v]scale=1080:1920,setsar=1[v0]`,
    `[v0][1:v]overlay=0:0,format=yuv420p[vuelta]`,
    `[2:v]scale=1080:1920,setsar=1,format=yuv420p[fin]`,
    `[vuelta][fin]xfade=transition=fade:duration=${FUNDIDO}:offset=${(vuelta - FUNDIDO).toFixed(3)},format=yuv420p[v]`,
  ].join(';'),
  '-map', '[v]', '-map', '3:a',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-r', String(fps), '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart',
  join(salida, 'reel.mp4'),
], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(join(salida, 'reel.mp4'), `(${(vuelta + CIERRE).toFixed(1)} s)`);
