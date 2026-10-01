/**
 * Reel de Instagram · ModelingStudio: el templo griego, con el pórtico a medias.
 * En la fachada del altar faltan las dos columnas de en medio: el alumno
 * selecciona una columna entera —fuste, collarino, equino y ábaco—, la duplica
 * y la desliza a su sitio, dos veces. Después, la cámara se abre al templo.
 *
 * Todo con las acciones del studio, como la pérgola del showreel:
 * `selectObject` (con mayúsculas, para coger las cuatro piezas), `duplicateObject`
 * —que deja la copia encima y seleccionada, como Ctrl+D— y `updateObject` en
 * modo continuo, que es lo que hace el tirador de mover mientras se arrastra.
 */
const PIEZAS = ['Fuste', 'Collarino', 'Equino', 'Ábaco'];

export default {
    id: 'modeling-templo-griego',
    ejemplo: 'modeling-templo-griego',
    duracion: 10,
    lienzo: { ancho: 720, alto: 900 },

    preparar(escena) {
        // La fachada del este (la del altar) es la de mayor x. Sus columnas, por z.
        const xs = escena.objects.filter((o) => o.name === 'Fuste').map((o) => o.position[0]);
        const X = Math.max(...xs);
        const deLaFachada = (o) => PIEZAS.includes(o.name) && Math.abs(o.position[0] - X) < 0.75;
        const zs = [...new Set(escena.objects.filter((o) => o.name === 'Fuste' && Math.abs(o.position[0] - X) < 0.01).map((o) => o.position[2]))].sort((a, b) => b - a);
        // zs: de la esquina de delante (+z) a la de detrás. Las de en medio se quitan.
        const [esquina, ...resto] = zs;
        const medias = resto.slice(0, -1);
        const quitar = new Set(escena.objects.filter((o) => deLaFachada(o) && medias.some((z) => Math.abs(o.position[2] - z) < 0.01)).map((o) => o.id));
        const columna = escena.objects.filter((o) => deLaFachada(o) && Math.abs(o.position[2] - esquina) < 0.01).map((o) => o.id);
        return {
            escena: { ...escena, objects: escena.objects.filter((o) => !quitar.has(o.id)) },
            datos: { X, columna, esquina, medias },
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
        // Delante de la fachada del altar, de tres cuartos; al final, más lejos y alto.
        const k1 = E.inOutSine(tramo(t, 0, 5.2));
        const k2 = E.inOutCubic(tramo(t, 5.2, 10));
        const pos = lerp3(lerp3([19, 6, 11], [17, 5.5, 8.5], k1), [24, 13, 22], k2);
        const mira = lerp3([d.X, 4, 0.5], [0, 4, 0], k2);
        api.camara({ pos, mira, fov: 42 });

        // Cada copia: duplicar en `t0` y arrastrarla en z hasta su sitio.
        const COPIAS = [1.5, 3.0];
        const DUR = 0.8;
        const desde = [d.esquina, d.medias[0]];
        const zDe = (i) => desde[i] + (d.medias[i] - desde[i]) * E.inOutCubic(tramo(t, COPIAS[i] + 0.05, COPIAS[i] + DUR));
        let z = d.esquina;
        COPIAS.forEach((t0, i) => { if (t >= t0) z = zDe(i); });

        const c = api.clic(t, 0.9, 'selecciona', () => { d.columna.forEach((id, i) => s().selectObject(id, i > 0)); s().setTransformMode('translate'); });
        COPIAS.forEach((t0, i) => {
            if (t >= t0) api.una(`copia-${i}`, () => { s().duplicateObject(s().selectedIds); window.__copia = s().selectedIds.slice(); window.__base = s().selectedIds.map((id) => s().objects.find((o) => o.id === id).position.slice()); window.__z0 = desde[i]; });
            if (t >= t0 && t <= t0 + DUR + 0.05) {
                const dz = zDe(i) - window.__z0;
                (window.__copia ?? []).forEach((id, j) => {
                    const b = window.__base[j];
                    s().updateObject(id, { position: [b[0], b[1], b[2] + dz] }, { continua: true });
                });
            }
        });
        const fin = api.clic(t, 4.3, 'suelta', () => s().selectObject(null, false));

        // El cursor, sobre el fuste que se arrastra, a media altura.
        const sobre = api.proyectar([d.X, 3.6, z]);
        const entra = api.proyectar([d.X + 3, 1.5, 6]);
        const sale = api.proyectar([d.X + 3, 1, 7]);
        const pos2d = t < 0.9 ? api.recorrido(t, [[0.25, entra.x, entra.y], [0.85, sobre.x, sobre.y]])
            : t < 4.3 ? sobre
                : api.recorrido(t, [[4.35, sobre.x, sobre.y], [5, sale.x, sale.y]]);
        const arrastra = COPIAS.some((t0) => t >= t0 && t <= t0 + DUR);
        api.cursor({ x: pos2d.x, y: pos2d.y, pulsado: Math.max(c.pulsado, fin.pulsado, arrastra ? 1 : 0), visible: t > 0.25 && t < 5 });
        api.onda(pos2d.x, pos2d.y, c.onda > 0 && c.onda < 1 ? c.onda : 0);
    },
};
