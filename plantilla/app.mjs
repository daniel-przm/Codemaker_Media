// Dónde está la aplicación (Codemaker_App) en esta máquina.
//
// Este repositorio no copia nada de la aplicación: la usa como herramienta.
// Graba las tomas con su motor de planos, contra sus emuladores, y la música
// sale de sus instrumentos. Por defecto, al lado de este repositorio; si no,
// donde diga CODEMAKER_APP. Tiene que tener sus dependencias instaladas
// (`npm ci` dentro).
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const MEDIA = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const APP = resolve(process.env.CODEMAKER_APP ?? join(MEDIA, '..', 'Codemaker_App'));

if (!existsSync(join(APP, 'showreel', 'planos', 'grabar.mjs'))) {
    throw new Error(`No encuentro la aplicación en ${APP}.\n`
        + 'Clónala al lado de este repositorio (git clone …/Codemaker_App, y npm ci dentro), o di dónde está con CODEMAKER_APP.');
}

/** Un módulo de la aplicación, por su ruta dentro de ella. */
export const deLaApp = (ruta) => import(pathToFileURL(join(APP, ruta)).href);
