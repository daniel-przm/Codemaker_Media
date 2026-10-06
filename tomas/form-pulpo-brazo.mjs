/**
 * Reel de Instagram · FormStudio: el pulpo, hecho de una sola esfera. Uno de
 * los brazos de delante está recogido: el alumno entra en edición, coge la
 * cara de la punta y tira de ella hacia fuera; con la simetría, el brazo del
 * otro lado se estira a la vez. Al salir de edición, la malla suavizada se
 * hace brazo y la cámara rodea al pulpo.
 *
 * Distinto del plano del anuncio (`form-pulpo` del showreel, que sube la
 * coronilla). Como en `form-pinguinos`: la cara se mueve con `moveFace`, y la
 * versión «sin terminar» es el mismo gesto al revés antes de grabar.
 */
const ESTIRON = 0.45;

export default {
    id: 'form-pulpo-brazo',
    ejemplo: 'form-pulpo',
    duracion: 9,
    lienzo: { ancho: 720, alto: 900 },

    preparar(escena) {
        const cuerpo = escena.objects[0];
        const v = (i) => [cuerpo.vertices[3 * i], cuerpo.vertices[3 * i + 1], cuerpo.vertices[3 * i + 2]];
        const centro = (f) => f.indices.map(v).reduce((a, b) => a.map((x, k) => x + b[k] / f.indices.length), [0, 0, 0]);
        // La punta de un brazo del lado +x: la cara más lejos del eje en
        // horizontal, de las que quedan delante (z > 0) y por debajo del manto.
        let punta = -1, mejor = -1;
        cuerpo.faces.forEach((f, i) => {
            const [x, y, z] = centro(f);
            const r = Math.hypot(x, z);
            if (x > 0 && z > 0 && y < 0.6 && r > mejor) { mejor = r; punta = i; }
        });
        const [cx, cy, cz] = centro(cuerpo.faces[punta]);
        // Hacia fuera, en horizontal, y un poco hacia arriba: el brazo se alarga.
        const r = Math.hypot(cx, cz);
        const TIRON = [ESTIRON * cx / r, 0.12, ESTIRON * cz / r];
        const [sx, sy, sz] = cuerpo.scale, g = cuerpo.rotation[1];
        const mundo = (dx, dy, dz) => {
            const lx = (cx + dx) * sx, lz = (cz + dz) * sz;
            return [
                cuerpo.position[0] + lx * Math.cos(g) + lz * Math.sin(g),
                cuerpo.position[1] + (cy + dy) * sy,
                cuerpo.position[2] - lx * Math.sin(g) + lz * Math.cos(g),
            ];
        };
        return { escena, datos: { id: cuerpo.id, punta, TIRON, antes: mundo(-TIRON[0], -TIRON[1], -TIRON[2]), despues: mundo(0, 0, 0) } };
    },

    async antes(p, d) {
        await p.evaluate(({ id, punta, TIRON }) => {
            const s = () => window.__store.getState();
            s().enterEditMode(id);
            s().selectFace(punta, false);
            s().startFaceDrag();
            s().moveFace(new window.__THREE.Vector3(-TIRON[0], -TIRON[1], -TIRON[2]));
            s().endFaceDrag();
            s().exitEditMode();
            window.__store.setState({ selectedObjectId: null });
        }, d);
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

    fotograma(t, api, { id, punta, TIRON, antes, despues }) {
        const { E, tramo, lerp3 } = api;
        const s = () => window.__store.getState();
        window.__ocultarTexto?.('Modo Edición');
        // De cerca, mirando la punta del brazo; después, alrededor del pulpo.
        const k1 = E.inOutSine(tramo(t, 0, 4.4));
        const k2 = E.inOutCubic(tramo(t, 4.4, 9));
        const P = despues;
        const cerca = lerp3([4.4, 5.0, 8.6], [4.0, 4.6, 7.8], k1);
        const giro = 0.9 * k2;
        const lejos = [6.6 * Math.sin(0.55 + giro), 5.0, 6.6 * Math.cos(0.55 + giro)];
        const pos = lerp3(cerca, lejos, E.inOutCubic(tramo(t, 4.4, 6.4)));
        const mira = lerp3([P[0] * 0.2, 1.0, P[2] * 0.2], [0, 0.9, 0], k2);
        api.camara({ pos, mira, fov: 40 });

        // El gesto: doble clic para editar, clic en la punta del brazo, arrastrar.
        const D0 = 1.6, D1 = 2.9;
        const k = E.inOutCubic(tramo(t, D0, D1));
        const brazo = api.proyectar(lerp3(antes, despues, k));
        const entra = api.proyectar([P[0] + 0.6, P[1] - 0.6, P[2] + 1]);
        const sale = api.proyectar([P[0] + 0.9, P[1] - 0.7, P[2] + 1.2]);
        const c1 = api.clic(t, 0.85, 'editar', () => s().enterEditMode(id));
        const c2 = api.clic(t, 1.25, 'cara', () => s().selectFace(punta, false));
        if (t >= D0 && t <= D1 + 0.02) {
            api.una('agarra', () => s().startFaceDrag());
            const hecho = window.__hecho ?? 0;
            const dk = k - hecho;
            if (Math.abs(dk) > 1e-6) s().moveFace(new window.__THREE.Vector3(TIRON[0] * dk, TIRON[1] * dk, TIRON[2] * dk));
            window.__hecho = k;
        }
        if (t > D1 + 0.02) {
            api.una('remata', () => {
                const falta = 1 - (window.__hecho ?? 0);
                if (Math.abs(falta) > 1e-6) s().moveFace(new window.__THREE.Vector3(TIRON[0] * falta, TIRON[1] * falta, TIRON[2] * falta));
                window.__hecho = 1;
                s().endFaceDrag();
            });
        }
        const c3 = api.clic(t, 3.4, 'salir', () => { s().exitEditMode(); window.__store.setState({ selectedObjectId: null }); });

        const p = t < 0.85 ? api.recorrido(t, [[0.25, entra.x, entra.y], [0.8, brazo.x, brazo.y]])
            : t < 3.4 ? brazo
                : api.recorrido(t, [[3.45, brazo.x, brazo.y], [4.2, sale.x, sale.y]]);
        const arrastra = t >= D0 && t <= D1;
        api.cursor({ x: p.x, y: p.y, pulsado: Math.max(c1.pulsado, c2.pulsado, c3.pulsado, arrastra ? 1 : 0), visible: t > 0.25 && t < 4.2 });
        const o = [c1, c2, c3].find((c) => c.onda > 0 && c.onda < 1);
        api.onda(p.x, p.y, o ? o.onda : 0);
    },
};
