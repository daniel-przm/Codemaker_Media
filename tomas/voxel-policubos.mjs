/**
 * Reel de Instagram · VoxelStudio: los policubos. La figura roja está a un lado
 * del espejo y su imagen, al otro, sin hacer: el cursor la construye cubo a
 * cubo, cada uno a la misma distancia del eje que su pareja. Al acabar, la
 * cámara se abre a las tres mesas: simetría, las piezas de cuatro cubos y los
 * cubos de lado 1, 2 y 3.
 *
 * Es la idea para clase de su descripción —construir la imagen al otro lado
 * del espejo—, hecha con `placeVoxel`, que es lo que hace el studio al hacer
 * clic con la herramienta de construir, en rojo, como la figura.
 */
export default {
    id: 'voxel-policubos',
    ejemplo: 'voxel-policubos',
    duracion: 11,
    lienzo: { ancho: 720, alto: 900 },

    preparar(escena) {
        // El eje del espejo está en x = −19: la imagen son los cubos rojos a su derecha.
        const EJE = -19;
        const esImagen = (v) => v.color === '#ef4444' && v.position[0] > EJE && v.position[0] < EJE + 5;
        const IMAGEN = escena.voxels.filter(esImagen).map((v) => v.position)
            // De abajo arriba y de dentro afuera: cada cubo apoyado en otro ya puesto.
            .sort((a, b) => a[1] - b[1] || a[0] - b[0] || a[2] - b[2]);
        return { escena: { ...escena, voxels: escena.voxels.filter((v) => !esImagen(v)) }, datos: { IMAGEN, EJE, ROJO: '#ef4444' } };
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

    fotograma(t, api, { IMAGEN, EJE, ROJO }) {
        const { E, tramo, lerp3 } = api;
        const T0 = 1.1, PASO = 0.55;
        const fin = T0 + IMAGEN.length * PASO;
        // Delante del espejo, un poco desde arriba y del lado de la imagen;
        // después, hacia atrás hasta ver el espejo y las piezas de cuatro cubos.
        const k1 = E.inOutSine(tramo(t, 0, fin));
        const k2 = E.inOutCubic(tramo(t, fin + 0.2, 11));
        const pos = lerp3(lerp3([EJE + 7, 9, 13], [EJE + 5, 8, 11], k1), [-6, 26, 30], k2);
        const mira = lerp3([EJE, 1.8, 0], [-6, 0, -3], k2);
        api.camara({ pos, mira, fov: 40 + 4 * k2 });

        // El clic, en la cara de abajo del cubo nuevo (la de arriba del que lo sostiene).
        const cara = (v) => api.proyectar([v[0], v[1] - 0.5, v[2]]);
        const fuera = api.proyectar([EJE + 6, 0.5, 6]);
        const puntos = [[0.3, fuera.x, fuera.y]];
        IMAGEN.forEach((v, i) => { const q = cara(v); puntos.push([T0 + i * PASO - 0.22, q.x, q.y], [T0 + i * PASO + 0.08, q.x, q.y]); });
        const sale = api.proyectar([EJE + 7, 0.5, 7]);
        puntos.push([fin + 0.4, sale.x, sale.y]);
        const p = api.recorrido(t, puntos);

        const clics = IMAGEN.map((v, i) => api.clic(t, T0 + i * PASO, `cubo-${i}`, () => window.__store.getState().placeVoxel(v, ROJO)));
        api.cursor({ x: p.x, y: p.y, pulsado: Math.max(...clics.map((c) => c.pulsado)), visible: t > 0.3 && t < fin + 0.4 });
        const o = clics.find((c) => c.onda > 0 && c.onda < 1);
        api.onda(p.x, p.y, o ? o.onda : 0);
    },
};
