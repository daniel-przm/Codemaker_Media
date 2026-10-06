/**
 * Reel de Instagram · ModelingStudio: la célula robotizada, con el brazo sin
 * terminar: llega hasta el codo. El alumno lo monta pieza a pieza —el
 * antebrazo, la muñeca, la brida, el cuerpo de la pinza y sus dedos— y, al
 * final, sube la pieza azul de la cinta hasta la pinza. Después la cámara se
 * abre a la célula entera.
 *
 * Cada pieza llega como llega una figura nueva: aparece seleccionada a un lado
 * (`setObjects` + `selectObject`) y se arrastra a su sitio con `updateObject`
 * en modo continuo, que es lo que hace el tirador de mover. Su forma y su sitio
 * son los de la receta.
 */
const PASOS = [
    ['Antebrazo', 'Carcasa antebrazo', 'Cable'],
    ['Muñeca'],
    ['Brida', 'Aro brida'],
    ['Cuerpo pinza', 'Guía pinza'],
    ['Dedo pinza', 'Garra'],
    ['Pieza', 'Etiqueta'],
];

export default {
    id: 'modeling-celula-robotizada',
    ejemplo: 'modeling-celula-robotizada',
    duracion: 11,
    lienzo: { ancho: 720, alto: 900 },

    preparar(escena) {
        // Hay dos cables: el del antebrazo es el que queda más lejos de la base.
        const lejos = (o) => Math.hypot(o.position[0], o.position[2]) + o.position[1];
        const cables = escena.objects.filter((o) => o.name === 'Cable').sort((a, b) => lejos(a) - lejos(b));
        const cableAntebrazo = cables[cables.length - 1];
        const muneca = escena.objects.find((o) => o.name === 'Muñeca');
        const pieza = escena.objects.find((o) => o.name === 'Pieza');
        const grupos = PASOS.map((nombres) => escena.objects.filter((o) => nombres.includes(o.name) && (o.name !== 'Cable' || o === cableAntebrazo)));
        const quitar = new Set(grupos.flat().map((o) => o.id));
        // De dónde llega cada grupo: de fuera y de arriba; la pieza, de la cinta.
        const bandaY = escena.objects.find((o) => o.name === 'Banda').position[1] + 0.03;
        const desde = grupos.map((g, i) => (i === grupos.length - 1
            ? [0, bandaY + pieza.scale[1] / 2 - pieza.position[1], 0]
            : [1.2, 1.0, 0.9]));
        return {
            escena: { ...escena, objects: escena.objects.filter((o) => !quitar.has(o.id)) },
            datos: { grupos, desde, muneca: muneca.position },
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
        const T0 = 1.0, PASO = 0.85, DUR = 0.6;
        const fin = T0 + d.grupos.length * PASO;
        // De cerca, de tres cuartos sobre la pinza; después, la célula entera.
        const M = d.muneca;
        const k1 = E.inOutSine(tramo(t, 0, fin));
        const k2 = E.inOutCubic(tramo(t, fin + 0.2, 11));
        const pos = lerp3(lerp3([M[0] + 7.5, M[1] + 2.6, M[2] + 9.5], [M[0] + 6.5, M[1] + 2.2, M[2] + 8.2], k1), [14.5, 11, 19], k2);
        const mira = lerp3([M[0] - 0.6, M[1] - 1.1, M[2]], [1.6, 2.8, 0.6], k2);
        api.camara({ pos, mira, fov: 40 + 4 * k2 });

        // Cada grupo: aparece en `t0`, seleccionado, y se arrastra a su sitio.
        let arrastra = false;
        const centro = (g) => g.reduce((acc, o) => acc.map((x, j) => x + o.position[j] / g.length), [0, 0, 0]);
        const entra = api.proyectar([M[0] + 3, M[1] - 2.5, M[2] + 3]);
        const puntos = [[0.25, entra.x, entra.y]];
        d.grupos.forEach((g, i) => {
            const t0 = T0 + i * PASO;
            const k = E.inOutCubic(tramo(t, t0 + 0.1, t0 + DUR));
            const off = d.desde[i].map((x) => x * (1 - k));
            if (t >= t0) {
                api.una(`llega-${i}`, () => {
                    s().setObjects([...s().objects, ...g.map((o) => ({ ...o, position: o.position.map((x, j) => x + d.desde[i][j]) }))]);
                    g.forEach((o, j) => s().selectObject(o.id, j > 0));
                    s().setTransformMode('translate');
                });
            }
            if (t >= t0 && t <= t0 + DUR + 0.05) {
                g.forEach((o) => s().updateObject(o.id, { position: o.position.map((x, j) => x + off[j]) }, { continua: true }));
                arrastra = t >= t0 + 0.1 && t <= t0 + DUR;
            }
            // El cursor: va a donde aparece el grupo y lo acompaña hasta su sitio.
            const c = centro(g);
            const a = api.proyectar(c.map((x, j) => x + d.desde[i][j]));
            const b = api.proyectar(c);
            puntos.push([t0 - 0.05, a.x, a.y], [t0 + 0.1, a.x, a.y], [t0 + DUR, b.x, b.y]);
        });
        const suelta = api.clic(t, fin + 0.1, 'suelta', () => s().selectObject(null, false));
        puntos.push([fin + 0.7, entra.x, entra.y]);
        const p = api.recorrido(t, puntos);
        api.cursor({ x: p.x, y: p.y, pulsado: Math.max(suelta.pulsado, arrastra ? 1 : 0), visible: t > 0.25 && t < fin + 0.6 });
    },
};
