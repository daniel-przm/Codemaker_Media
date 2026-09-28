/**
 * La música de los Reels de Instagram: la del anuncio «Imagina», a la medida
 * de cada vídeo.
 *
 * No hace falta llamarla: `npm run reel` la genera sola, a la medida del
 * Reel, si la publicación no tiene su `musica.wav`.
 *
 * Un Reel de ejemplo es el proyecto en movimiento y, al final, el cierre con la
 * marca. La música hace lo mismo que el anuncio en pequeño: mientras se ve el
 * proyecto, el groove en re menor a 100 pulsaciones —i–VI–III–VII— va sumando
 * capas (bombo y bajo; palmada y charles; el arpegio; el bombo en cada pulso
 * y la subida); y en el cierre cae el golpe en re MAYOR, con el acorde abierto
 * y el guiño de la sintonía de la marca. Mismos instrumentos (`motor/sintesis.mjs`),
 * misma progresión y el mismo «pep» que los tutoriales: suena a la misma casa.
 * Los instrumentos se cogen de la aplicación (`app.mjs`): no se copian.
 *
 * Sintetizada entera: sin muestras de nadie, sin licencias ni Content ID.
 *
 * `accion`: segundos hasta el fundido al cierre (lo que dura la toma menos el
 * fundido). `cierre`: lo que dura el cierre desde ahí, fundido incluido.
 * El golpe cae en un pulso: la música empieza lo justo después del cero para
 * que un primer tiempo de compás coincida con el fundido.
 */
import { deLaApp } from './app.mjs';

// Los instrumentos y la sintonía son los de la aplicación: los mismos del anuncio.
const { construirSintonia, SINTONIA, SINTONIAS } = await deLaApp('tutoriales/motor/audio.mjs');
const {
    SR, TAU, acabar, bombo, cuerda, escribirWav, muestra, nota, percusion, reverberar, ruido, sierra, sumar,
} = await deLaApp('showreel/motor/sintesis.mjs');

const BPM = 100;
const PULSO = 60 / BPM;
const COMPAS = 4 * PULSO;
/** i–VI–III–VII en re menor, un acorde por compás: la del anuncio. Notas MIDI. */
const PROGRESION = [
    { raiz: 38, notas: [62, 65, 69] },   // Rem
    { raiz: 34, notas: [62, 65, 70] },   // Sib
    { raiz: 41, notas: [60, 65, 69] },   // Fa
    { raiz: 36, notas: [60, 64, 67] },   // Do
];

const pista = (n) => [new Float32Array(n), new Float32Array(n)];

/**
 * @param {number} accion  segundos de proyecto, hasta el golpe
 * @param {number} cierre  segundos de cierre, desde el golpe
 */
export function musicaDeReel(accion, cierre = 1.9) {
    const duracion = accion + cierre;
    const n = Math.ceil((duracion + 0.01) * SR);
    const musica = pista(n + SR * 2);
    const eco = pista(n + SR * 2);
    const golpe = accion;

    // Los pulsos hasta el golpe, contados hacia atrás desde él: el golpe cae
    // en el primer tiempo de un compás, y el primer compás, si no cabe entero,
    // empieza a medias.
    const pulsos = Math.floor(golpe / PULSO + 1e-6);
    const compases = Math.ceil(pulsos / 4);
    const inicio = golpe - pulsos * PULSO;
    for (let p = 0; p < pulsos; p++) {
        const t = inicio + p * PULSO;
        // Contados desde el golpe: el compás 0 es el último.
        const desdeElFinal = Math.floor((pulsos - 1 - p) / 4);
        const enCompas = (4 - ((pulsos - p) % 4)) % 4;
        const indice = compases - 1 - desdeElFinal;
        const ac = PROGRESION[((indice % 4) + 4) % 4];
        // Una capa más por compás, hasta la cuarta; la cuarta, en el último.
        const nivel = desdeElFinal === 0 && compases > 1 ? 4 : Math.min(3, 1 + indice);

        // El dron grave, siempre.
        if (enCompas === 0 || p === 0) {
            const dur = (4 - enCompas) * PULSO + 0.1;
            sumar(musica, t, dur, (i, s) => {
                const e = Math.min(s / 0.4, 1) * Math.min(1, (dur - s) / 0.3);
                return e * (0.6 * Math.sin(TAU * nota(ac.raiz - 12) * s) + 0.25 * Math.sin(TAU * nota(ac.raiz - 5) * s));
            }, { vol: 0.16 });
        }
        // Bombo en el 1 y el 3; en el último compás, en cada pulso.
        if (enCompas % 2 === 0 || nivel >= 4) sumar(musica, t, 0.6, bombo(0.65, 46), { vol: 0.6 });
        // Bajo en corcheas, con el filtro abriéndose capa a capa.
        const bajo = sierra([nota(ac.raiz)], { corte: (s) => 200 + (250 + nivel * 180) * Math.exp(-s * 9), desafine: 0.05 });
        [0, 0.5].forEach((m) => sumar(musica, t + m * PULSO, PULSO / 2, (i, s) => bajo(i, s) * percusion(0.003, 0.12)(s), { vol: 0.42 }));
        // Colchón del acorde.
        if (enCompas === 0 || p === 0) {
            const dur = (4 - enCompas) * PULSO;
            const pad = sierra(ac.notas.map((m) => nota(m - 12)), { corte: 500 + nivel * 260, desafine: 0.15 });
            const v = (i, s) => pad(i, s) * Math.min(s / 0.6, 1) * Math.min(1, (dur - s) / 0.4);
            sumar(eco, t, dur, v, { vol: 0.1 });
            sumar(musica, t, dur, v, { vol: 0.09 });
        }
        if (nivel >= 2) {
            if (enCompas % 2 === 1) {
                const palmada = ruido({ semilla: 300 + p, tipo: 'bp', Q: 0.9, hz: 1500, env: (s) => percusion(0.001, 0.05)(s) + 0.5 * percusion(0.001, 0.04)(Math.max(0, s - 0.012)) });
                sumar(musica, t, 0.3, palmada, { vol: 0.2 });
                sumar(eco, t, 0.3, palmada, { vol: 0.12 });
            }
            const pasos = nivel >= 3 ? 4 : 2;
            for (let k = 0; k < pasos; k++) {
                sumar(musica, t + (k * PULSO) / pasos, 0.06, ruido({ semilla: 400 + p * 4 + k, tipo: 'hp', hz: 8000, env: percusion(0.001, 0.02) }), { vol: k % 2 ? 0.05 : 0.08, pan: 0.3 });
            }
        }
        if (nivel >= 3) {
            // Arpegio de cuerda en semicorcheas, por las notas del acorde.
            for (let k = 0; k < 4; k++) {
                const m = ac.notas[(p * 4 + k) % 3] + 12 * ((k + p) % 2);
                const c = cuerda(nota(m), { semilla: 500 + p * 4 + k, brillo: 0.55 });
                const v = (i, s) => c() * percusion(0.001, 0.22)(s);
                sumar(musica, t + (k * PULSO) / 4, 0.4, v, { vol: 0.09, pan: k % 2 ? 0.35 : -0.35 });
                sumar(eco, t + (k * PULSO) / 4, 0.4, v, { vol: 0.07 });
            }
        }
    }
    // Un golpe al entrar, para que el Reel no empiece a medio sonar.
    sumar(musica, inicio, 1.4, bombo(0.9, 40), { vol: 0.7 });
    sumar(eco, inicio, 1.4, ruido({ semilla: 9, tipo: 'hp', hz: 2500, env: percusion(0.002, 0.5) }), { vol: 0.22 });

    // La subida del último compás: redoble que acelera y un barrido.
    const subida = Math.min(COMPAS, golpe - inicio);
    const desde = golpe - subida;
    for (let s = 0, k = 0; s < subida - 0.01; k++) {
        const av = s / subida;
        sumar(musica, desde + s, 0.12, ruido({ semilla: 900 + k, tipo: 'bp', Q: 0.8, hz: 1800, env: percusion(0.001, 0.04) }), { vol: 0.05 + 0.2 * av, pan: k % 2 ? 0.2 : -0.2 });
        s += 0.15 * (1 - av) + 0.03;
    }
    sumar(musica, desde, subida, ruido({ semilla: 990, tipo: 'hp', hz: 4500, env: (x) => (x / subida) ** 3 }), { vol: 0.24 });

    // ── El cierre, en re mayor ───────────────────────────────────────────────
    // El groove se corta en el golpe; lo que suena después es solo el cierre.
    const tras = pista(n + SR * 2);
    const ecoTras = pista(n + SR * 2);
    sumar(tras, golpe, 1.6, bombo(1, 36), { vol: 1.1 });
    sumar(tras, golpe, 2.4, (i, s) => Math.sin(TAU * (32 + 20 * Math.exp(-s * 4)) * s) * percusion(0.01, 0.8)(s), { vol: 0.6 });
    const choque = ruido({ semilla: 21, tipo: 'hp', Q: 0.7, hz: 3000, env: percusion(0.002, 0.8) });
    sumar(tras, golpe, 3, choque, { vol: 0.16 });
    sumar(ecoTras, golpe, 3, choque, { vol: 0.28 });
    const pad = sierra([50, 57, 62, 66, 69].map(nota), { corte: (s) => 700 + 1800 * Math.min(1, s / 1.5), desafine: 0.14 });
    const envPad = (s) => Math.min(s / 0.08, 1) * (0.55 + 0.45 * Math.exp(-s * 1.5));
    sumar(tras, golpe, cierre + 0.5, (i, s) => pad(i, s) * envPad(s), { vol: 0.3 });
    sumar(ecoTras, golpe, cierre + 0.5, (i, s) => pad(i, s) * envPad(s), { vol: 0.12 });
    [74, 78, 81, 86].forEach((m, k) => {
        const c = cuerda(nota(m), { semilla: 120 + k, brillo: 0.75, sostener: 0.998 });
        const v = (i, s) => c() * percusion(0.001, 0.9)(s);
        sumar(tras, golpe + 0.08 + k * 0.12, 2, v, { vol: 0.16, pan: [-0.3, -0.1, 0.1, 0.3][k] });
        sumar(ecoTras, golpe + 0.08 + k * 0.12, 2, v, { vol: 0.16 });
    });
    // El guiño de la marca, cuando el logotipo ya está en pantalla.
    const pep = construirSintonia(SINTONIA, 0.5);
    sumar(tras, golpe + 0.55 - SINTONIAS[SINTONIA].acento, pep.length / SR, muestra(pep), { vol: 0.9 });

    // ── La mezcla ────────────────────────────────────────────────────────────
    const revMusica = reverberar(eco);
    const revTras = reverberar(ecoTras);
    const suma = pista(n);
    const iGolpe = Math.round(golpe * SR);
    const suave = Math.round(0.03 * SR);
    for (let i = 0; i < n; i++) {
        const antes = i < iGolpe - suave ? 1 : i < iGolpe ? (iGolpe - i) / suave : 0;
        const despues = i >= iGolpe ? 1 : 0;
        for (const c of [0, 1]) {
            suma[c][i] = (musica[c][i] + revMusica[c][i] * 3.2) * antes + (tras[c][i] + revTras[c][i] * 3.2) * despues;
        }
    }
    return acabar(suma, { umbral: 0.6, ratio: 3, colaFinal: 0.5 });
}

/** La música de un Reel, en un WAV de 24 bits. */
export const escribirMusica = (ruta, accion, cierre) => escribirWav(musicaDeReel(accion, cierre), ruta);
