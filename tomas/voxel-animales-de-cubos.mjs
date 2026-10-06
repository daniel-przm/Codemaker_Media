/**
 * Reel de Instagram · VoxelStudio: los animales de cubos, sin el perro. El
 * cursor lo construye de perfil, como se copia en clase: las patas, el cuerpo,
 * la cola, la cabeza y la oreja negra, cubo a cubo. Después la cámara se abre
 * a la pradera con los nueve animales.
 *
 * Los cubos se colocan con `placeVoxel`, que es lo que hace el studio al
 * hacer clic en una cara con la herramienta de construir.
 */
export default {
    id: 'voxel-animales-de-cubos',
    ejemplo: 'voxel-granja-de-animales',
    duracion: 11,
    lienzo: { ancho: 720, alto: 900 },

    preparar(escena) {
        // El perro: los cubos de su sitio (x 3…7, z 3) por encima de la hierba.
        const quitar = (v) => v.position[0] >= 3 && v.position[0] <= 7 && v.position[2] === 3 && v.position[1] > 2;
        const quitados = escena.voxels.filter(quitar);
        const quedan = escena.voxels.filter((v) => !quitar(v));
        // El orden en que se ponen: de abajo arriba, y siempre uno que toque a otro
        // ya puesto (como se hace en el studio: se hace clic en una cara).
        const clave = (p) => p.join(',');
        const hay = new Set(quedan.map((v) => clave(v.position)));
        const pendientes = quitados.slice().sort((a, b) => a.position[1] - b.position[1] || a.position[2] - b.position[2] || a.position[0] - b.position[0]);
        const VECINOS = [[0, -1, 0], [-1, 0, 0], [1, 0, 0], [0, 0, -1], [0, 0, 1], [0, 1, 0]];
        const CUBOS = [];
        while (pendientes.length) {
            const i = pendientes.findIndex((v) => VECINOS.some((d) => hay.has(clave(v.position.map((x, k) => x + d[k])))));
            const v = pendientes.splice(i < 0 ? 0 : i, 1)[0];
            const d = VECINOS.find((d) => hay.has(clave(v.position.map((x, k) => x + d[k])))) ?? [0, -1, 0];
            // El clic, en la cara del vecino que toca al cubo nuevo.
            CUBOS.push({ pos: v.position, color: v.color, cara: v.position.map((x, k) => x + d[k] / 2) });
            hay.add(clave(v.position));
        }
        return {
            escena: { ...escena, voxels: quedan },
            datos: { CUBOS, PASO: 0.55, DURACION: 11, CERCA: {"p0":[9,9.5,18.5],"p1":[7,8.5,16],"m0":[5.2,3.8,3],"m1":[5.2,4,3],"fov":40}, LEJOS: {"p":[0.5,23,29],"m":[0.5,1,0],"fov":46} },
        };
    },

    async antes(p) {
        // A 720 de ancho, los paneles del studio tapan media escena: fuera todo
        // lo que no sea el 3D, y el lienzo a pantalla completa (como en
        // `voxel-policubos`). Las acciones van por el store: no hacen falta.
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

    fotograma(t, api, { CUBOS, PASO, DURACION, CERCA, LEJOS }) {
        const { E, tramo, lerp3 } = api;
        const T0 = 1.1;
        const fin = T0 + CUBOS.length * PASO;
        // De cerca, mientras se construye; después, hacia atrás hasta verlo todo.
        const k1 = E.inOutSine(tramo(t, 0, fin));
        const k2 = E.inOutCubic(tramo(t, fin + 0.2, DURACION));
        const pos = lerp3(lerp3(CERCA.p0, CERCA.p1, k1), LEJOS.p, k2);
        const mira = lerp3(lerp3(CERCA.m0, CERCA.m1, k1), LEJOS.m, k2);
        api.camara({ pos, mira, fov: CERCA.fov + (LEJOS.fov - CERCA.fov) * k2 });

        const centro = CUBOS.reduce((s, c) => s.map((x, k) => x + c.pos[k] / CUBOS.length), [0, 0, 0]);
        const fuera = api.proyectar([centro[0] + 3, centro[1] - 2, centro[2] + 3]);
        const puntos = [[0.3, fuera.x, fuera.y]];
        CUBOS.forEach((c, i) => { const q = api.proyectar(c.cara); puntos.push([T0 + i * PASO - PASO * 0.4, q.x, q.y], [T0 + i * PASO + PASO * 0.15, q.x, q.y]); });
        const sale = api.proyectar([centro[0] + 4, centro[1] - 3, centro[2] + 4]);
        puntos.push([fin + 0.4, sale.x, sale.y]);
        const p = api.recorrido(t, puntos);

        const clics = CUBOS.map((c, i) => api.clic(t, T0 + i * PASO, `cubo-${i}`, () => window.__store.getState().placeVoxel(c.pos, c.color)));
        api.cursor({ x: p.x, y: p.y, pulsado: Math.max(...clics.map((c) => c.pulsado)), visible: t > 0.3 && t < fin + 0.4 });
        const o = clics.find((c) => c.onda > 0 && c.onda < 1);
        api.onda(p.x, p.y, o ? o.onda : 0);
    },
};
