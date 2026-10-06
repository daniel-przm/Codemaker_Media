/**
 * Reel de Instagram · ModelingStudio: el parque de renovables, con el huerto
 * solar a medias. Faltan las dos últimas filas de placas: el alumno selecciona
 * la fila entera —cada placa con sus juntas y sus dos soportes—, la duplica y
 * la desliza a su sitio, dos veces. Después, la cámara se abre al parque, con
 * los aerogeneradores en las colinas.
 *
 * Todo con las acciones del studio, como el templo griego: `selectObject` (con
 * mayúsculas, la fila entera), `duplicateObject` —que deja la copia encima y
 * seleccionada, como Ctrl+D— y `updateObject` en modo continuo, que es lo que
 * hace el tirador de mover mientras se arrastra.
 */
const PIEZAS = ['Placa solar', 'Junta', 'Soporte'];

export default {
    id: 'modeling-parque-renovables',
    ejemplo: 'modeling-parque-renovables',
    duracion: 10,
    lienzo: { ancho: 720, alto: 900 },

    preparar(escena) {
        // Las filas, por la z de sus placas (de atrás adelante: hacia +z).
        const zs = [...new Set(escena.objects.filter((o) => o.name === 'Placa solar').map((o) => o.position[2]))].sort((a, b) => a - b);
        const deLaFila = (o, z) => PIEZAS.includes(o.name) && Math.abs(o.position[2] - z) < 0.75;
        const ultimas = zs.slice(-2);
        const quitar = new Set(escena.objects.filter((o) => ultimas.some((z) => deLaFila(o, z))).map((o) => o.id));
        const origen = zs[zs.length - 3];
        const fila = escena.objects.filter((o) => deLaFila(o, origen)).map((o) => o.id);
        const xs = escena.objects.filter((o) => o.name === 'Placa solar').map((o) => o.position[0]);
        return {
            escena: { ...escena, objects: escena.objects.filter((o) => !quitar.has(o.id)) },
            datos: { fila, desde: [origen, ultimas[0]], hasta: ultimas, X: (Math.min(...xs) + Math.max(...xs)) / 2 },
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
        // Desde el sur, delante de las placas; al final, el parque entero.
        const k1 = E.inOutSine(tramo(t, 0, 5.2));
        const k2 = E.inOutCubic(tramo(t, 5.2, 10));
        const pos = lerp3(lerp3([d.X + 2, 12, 25], [d.X + 1, 11, 22.5], k1), [24, 30, 46], k2);
        const mira = lerp3([d.X, 0.5, 7.5], [1, 3, -1], k2);
        api.camara({ pos, mira, fov: 42 + 6 * k2 });

        // Cada copia: duplicar en `t0` y arrastrarla en z hasta su sitio.
        const COPIAS = [1.5, 3.0];
        const DUR = 0.8;
        const zDe = (i) => d.desde[i] + (d.hasta[i] - d.desde[i]) * E.inOutCubic(tramo(t, COPIAS[i] + 0.05, COPIAS[i] + DUR));
        let z = d.desde[0];
        COPIAS.forEach((t0, i) => { if (t >= t0) z = zDe(i); });

        const c = api.clic(t, 0.9, 'selecciona', () => { d.fila.forEach((id, i) => s().selectObject(id, i > 0)); s().setTransformMode('translate'); });
        COPIAS.forEach((t0, i) => {
            if (t >= t0) api.una(`copia-${i}`, () => { s().duplicateObject(s().selectedIds); window.__copia = s().selectedIds.slice(); window.__base = s().selectedIds.map((id) => s().objects.find((o) => o.id === id).position.slice()); window.__z0 = d.desde[i]; });
            if (t >= t0 && t <= t0 + DUR + 0.05) {
                const dz = zDe(i) - window.__z0;
                (window.__copia ?? []).forEach((id, j) => {
                    const b = window.__base[j];
                    s().updateObject(id, { position: [b[0], b[1], b[2] + dz] }, { continua: true });
                });
            }
        });
        const fin = api.clic(t, 4.3, 'suelta', () => s().selectObject(null, false));

        // El cursor, sobre una placa de la fila que se arrastra.
        const sobre = api.proyectar([d.X + 2.4, 1.05, z]);
        const entra = api.proyectar([d.X + 5, 0.5, 13]);
        const sale = api.proyectar([d.X + 5, 0.5, 14]);
        const pos2d = t < 0.9 ? api.recorrido(t, [[0.25, entra.x, entra.y], [0.85, sobre.x, sobre.y]])
            : t < 4.3 ? sobre
                : api.recorrido(t, [[4.35, sobre.x, sobre.y], [5, sale.x, sale.y]]);
        const arrastra = COPIAS.some((t0) => t >= t0 && t <= t0 + DUR);
        api.cursor({ x: pos2d.x, y: pos2d.y, pulsado: Math.max(c.pulsado, fin.pulsado, arrastra ? 1 : 0), visible: t > 0.25 && t < 5 });
        api.onda(pos2d.x, pos2d.y, c.onda > 0 && c.onda < 1 ? c.onda : 0);
    },
};
