/**
 * Reel de Instagram · ModelingStudio: el puente atirantado, con el abanico de
 * un lado sin terminar. Faltan los dos últimos tirantes de cada lado del
 * tablero: el alumno selecciona la pareja del extremo, la duplica y la lleva
 * a su anclaje —moviéndola, girándola y alargándola—, dos veces. Después, la
 * cámara recorre el puente.
 *
 * Con las acciones del studio: `selectObject` (con mayúsculas, la pareja),
 * `duplicateObject` —la copia sale encima y seleccionada, como Ctrl+D— y
 * `updateObject` en modo continuo, que es lo que hacen los tiradores mientras
 * se arrastran. El destino de cada copia es el tirante de la receta.
 */
export default {
    id: 'modeling-puente-atirantado',
    ejemplo: 'modeling-puente-atirantado',
    duracion: 11,
    lienzo: { ancho: 720, alto: 900 },

    preparar(escena) {
        // Los tirantes del lado +x, de dentro afuera, por parejas (z − y z +).
        const tirantes = escena.objects.filter((o) => o.name === 'Tirante' && o.position[0] > 0);
        const xs = [...new Set(tirantes.map((o) => Math.round(o.position[0] * 100)))].sort((a, b) => a - b);
        const pareja = (x) => tirantes.filter((o) => Math.round(o.position[0] * 100) === x).sort((a, b) => a.position[2] - b.position[2]);
        const ultimos = xs.slice(-2).map(pareja);
        const origen = pareja(xs[xs.length - 3]);
        const quitar = new Set(ultimos.flat().map((o) => o.id));
        const forma = (o) => ({ position: o.position, rotation: o.rotation, scale: o.scale });
        return {
            escena: { ...escena, objects: escena.objects.filter((o) => !quitar.has(o.id)) },
            datos: { origen: origen.map((o) => o.id), desde: [origen.map(forma), ultimos[0].map(forma)], hasta: ultimos.map((p) => p.map(forma)) },
        };
    },

    async antes(p) {
        // A 720 de ancho, los paneles del studio tapan media escena: fuera todo
        // lo que no sea el 3D, y el lienzo a pantalla completa (como en
        // `robotic-laberinto`). Las acciones van por el store: no hacen falta.
        // Con una hoja de estilo y no elemento a elemento: los paneles que salen
        // después (el de edición, al entrar en una figura) también se esconden.
        await p.evaluate(() => {
            const lienzo = [...document.querySelectorAll('canvas')].sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0];
            for (let el = lienzo.parentElement; el; el = el.parentElement) el.classList.add('__camino');
            lienzo.parentElement.classList.add('__lienzo');
            const hoja = document.createElement('style');
            hoja.textContent = 'body * { visibility: hidden !important; } .__camino { visibility: visible !important; } .__lienzo, .__lienzo * { visibility: visible !important; }';
            document.head.appendChild(hoja);
            const caja = lienzo.parentElement.parentElement;
            caja.style.cssText += ';position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;z-index:2147483646!important;';
            window.dispatchEvent(new Event('resize'));
        });
        await p.waitForTimeout(1500);
    },

    fotograma(t, api, d) {
        const { E, tramo, lerp3 } = api;
        const s = () => window.__store.getState();
        // Primero, desde la orilla, mirando el abanico; después, hacia atrás,
        // hasta ver el puente entero con el pilono.
        const k1 = E.inOutSine(tramo(t, 0, 5));
        const k2 = E.inOutCubic(tramo(t, 5, 11));
        // El abanico del lado +x entero en cuadro, del pilono a los anclajes:
        // más cerca, los tirantes que se mueven se salían por arriba.
        const pos = lerp3(lerp3([17, 7, 31], [15.5, 7.5, 27], k1), [30, 16, 40], k2);
        const mira = lerp3(lerp3([9, 9, 0], [9.5, 9, 0], k1), [0, 7.5, 0], k2);
        api.camara({ pos, mira, fov: 44 });

        const COPIAS = [1.4, 2.9];
        const DUR = 0.95;
        const mezcla = (a, b, k) => ({
            position: lerp3(a.position, b.position, k),
            rotation: lerp3(a.rotation, b.rotation, k),
            scale: lerp3(a.scale, b.scale, k),
        });
        const c = api.clic(t, 0.8, 'selecciona', () => { d.origen.forEach((id, i) => s().selectObject(id, i > 0)); s().setTransformMode('translate'); });
        let ancla = d.desde[0][1].position;
        COPIAS.forEach((t0, i) => {
            const k = E.inOutCubic(tramo(t, t0 + 0.05, t0 + DUR));
            if (t >= t0) {
                api.una(`copia-${i}`, () => { s().duplicateObject(s().selectedIds); window.__copia = s().selectedIds.slice().sort((a, b) => s().objects.find((o) => o.id === a).position[2] - s().objects.find((o) => o.id === b).position[2]); });
                ancla = mezcla(d.desde[i][1], d.hasta[i][1], k).position;
            }
            if (t >= t0 && t <= t0 + DUR + 0.05) {
                (window.__copia ?? []).forEach((id, j) => s().updateObject(id, mezcla(d.desde[i][j], d.hasta[i][j], k), { continua: true }));
            }
        });
        const fin = api.clic(t, 4.3, 'suelta', () => s().selectObject(null, false));

        // El cursor, sobre el tirante que se mueve (el de delante), a un tercio
        // de su anclaje: en su centro caía encima del tirador de mover.
        const sobre = api.proyectar([ancla[0] + 2.5, ancla[1] - 1.4, ancla[2]]);
        const entra = api.proyectar([18, 2, 9]);
        const sale = api.proyectar([19, 1.8, 9]);
        const p = t < 0.8 ? api.recorrido(t, [[0.25, entra.x, entra.y], [0.75, sobre.x, sobre.y]])
            : t < 4.3 ? sobre
                : api.recorrido(t, [[4.35, sobre.x, sobre.y], [5, sale.x, sale.y]]);
        const arrastra = COPIAS.some((t0) => t >= t0 && t <= t0 + DUR);
        api.cursor({ x: p.x, y: p.y, pulsado: Math.max(c.pulsado, fin.pulsado, arrastra ? 1 : 0), visible: t > 0.25 && t < 5 });
        api.onda(p.x, p.y, c.onda > 0 && c.onda < 1 ? c.onda : 0);
    },
};
