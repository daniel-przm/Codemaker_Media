/**
 * Reel de Instagram · VoxelStudio: el sistema solar. Júpiter, sin su Gran
 * Mancha Roja; el cursor se la pone, cubo a cubo, y la cámara se abre hasta
 * que se ve la fila entera, del Sol a Neptuno.
 *
 * Los cubos se colocan con `placeVoxel`, que es lo que hace el studio al hacer
 * clic en una cara con la herramienta de construir, del color de la paleta
 * (rojo, elegido en `antes` como lo elegiría el alumno).
 */
export default {
    id: 'voxel-sistema-solar',
    ejemplo: 'voxel-sistema-solar',
    duracion: 11,
    lienzo: { ancho: 720, alto: 900 },

    preparar(escena) {
        // La mancha: los cuatro cubos rojos delante de Júpiter (x 50–51, z 6).
        const esMancha = (v) => v.color === '#ef4444' && v.position[0] >= 49.5 && v.position[0] <= 51.5 && Math.abs(v.position[2] - 6) < 0.1;
        const MANCHA = escena.voxels.filter(esMancha).map((v) => v.position)
            // De arriba abajo y de izquierda a derecha, como se pondrían.
            .sort((a, b) => b[1] - a[1] || a[0] - b[0]);
        return { escena: { ...escena, voxels: escena.voxels.filter((v) => !esMancha(v)) }, datos: { MANCHA, ROJO: '#ef4444' } };
    },

    async antes(p) {
        await p.click('button[aria-label^="Abrir la paleta"]');
        await p.click('button[aria-label="Rojo"]');
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

    fotograma(t, api, { MANCHA, ROJO }) {
        const { E, tramo, lerp3 } = api;
        const [mx, my] = [50.5, MANCHA.reduce((s, v) => s + v[1], 0) / MANCHA.length];
        // De cerca de Júpiter, de frente a la mancha; y luego, hacia atrás y
        // arriba, hasta la fila entera de planetas.
        const k1 = E.inOutSine(tramo(t, 0, 4.6));
        const k2 = E.inOutCubic(tramo(t, 4.6, 11));
        const cerca = lerp3([58, my + 7, 26], [53.5, my + 3, 19], k1);
        const pos = lerp3(cerca, [46, my + 26, 92], k2);
        const mira = lerp3(lerp3([50, my, 4], [50.5, my, 5], k1), [44, my + 2, 0], k2);
        api.camara({ pos, mira, fov: 42 });

        // Cada clic, en la cara de Júpiter que queda detrás del cubo nuevo.
        const cara = (v) => api.proyectar([v[0], v[1], v[2] - 0.5]);
        const fuera = api.proyectar([57, my - 6, 12]);
        const T0 = 1.2, PASO = 0.7;
        const puntos = [[0.3, fuera.x, fuera.y]];
        MANCHA.forEach((v, i) => { const q = cara(v); puntos.push([T0 + i * PASO - 0.3, q.x, q.y], [T0 + i * PASO + 0.15, q.x, q.y]); });
        const fin = T0 + MANCHA.length * PASO;
        const sale = api.proyectar([56, my - 7, 10]);
        puntos.push([fin + 0.5, sale.x, sale.y]);
        const pos2d = api.recorrido(t, puntos);

        const clics = MANCHA.map((v, i) => api.clic(t, T0 + i * PASO, `mancha-${i}`, () => window.__store.getState().placeVoxel(v, ROJO)));
        api.cursor({ x: pos2d.x, y: pos2d.y, pulsado: Math.max(...clics.map((c) => c.pulsado)), visible: t > 0.3 && t < fin + 0.5 });
        const o = clics.find((c) => c.onda > 0 && c.onda < 1);
        api.onda(pos2d.x, pos2d.y, o ? o.onda : 0);
    },
};
