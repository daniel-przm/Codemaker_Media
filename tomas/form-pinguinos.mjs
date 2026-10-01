/**
 * Reel de Instagram · FormStudio: los pingüinos en el hielo. El pingüino
 * grande tiene las aletas pegadas al cuerpo: el alumno entra en edición, coge
 * la punta de una aleta y tira de ella hacia fuera y abajo; con la simetría,
 * la otra aleta sale a la vez. Al salir de edición, la malla suavizada se hace
 * aleta, y la cámara se abre a la familia.
 *
 * La cara se mueve con `moveFace`, que es lo que hace el tirador de mover. La
 * versión «sin terminar» es el mismo gesto al revés antes de grabar (como el
 * pulpo del showreel): la forma final es exactamente la de la receta.
 */
const TIRON = [0.32, -0.3, 0];

export default {
    id: 'form-pinguinos',
    ejemplo: 'form-pinguinos',
    duracion: 9,
    lienzo: { ancho: 720, alto: 900 },

    preparar(escena) {
        // El pingüino grande de la izquierda: el primer cuerpo negro con aletas (más vértices que una esfera).
        const cuerpos = escena.objects.filter((o) => o.color === '#1f2937' && o.vertices.length > 80);
        const cuerpo = cuerpos[0];
        const v = (i) => [cuerpo.vertices[3 * i], cuerpo.vertices[3 * i + 1], cuerpo.vertices[3 * i + 2]];
        const centro = (f) => f.indices.map(v).reduce((a, b) => a.map((x, k) => x + b[k] / f.indices.length), [0, 0, 0]);
        // La punta de la aleta del lado +x: la cara más alejada del eje.
        let punta = 0;
        cuerpo.faces.forEach((f, i) => { if (centro(f)[0] > centro(cuerpo.faces[punta])[0]) punta = i; });
        // Dónde queda en el mundo, para el cursor: la receta pone el cuerpo en su
        // sitio con posición, giro (en y) y escala.
        const [cx, cy, cz] = centro(cuerpo.faces[punta]);
        const [sx, sy, sz] = cuerpo.scale, g = cuerpo.rotation[1];
        const lx = cx * sx, lz = cz * sz;
        const mundo = (dx, dy, dz) => [
            cuerpo.position[0] + (lx + dx * sx) * Math.cos(g) + (lz + dz * sz) * Math.sin(g),
            cuerpo.position[1] + (cy + dy) * sy,
            cuerpo.position[2] - (lx + dx * sx) * Math.sin(g) + (lz + dz * sz) * Math.cos(g),
        ];
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
        // Después, hacia atrás, la familia entera.
        const k1 = E.inOutSine(tramo(t, 0, 4.4));
        const k2 = E.inOutCubic(tramo(t, 4.4, 9));
        // De frente al grande y desde su izquierda, para que el polluelo no lo tape.
        const pos = lerp3(lerp3([-2.6, 2.4, 4.4], [-2.2, 2.1, 3.7], k1), [3.2, 3.3, 7.6], k2);
        const mira = lerp3(lerp3([-1.1, 1.2, -0.2], [-1.1, 1.1, -0.2], k1), [0, 1.2, 0], k2);
        api.camara({ pos, mira, fov: 40 });

        // El gesto: doble clic para editar, clic en la punta de la aleta, arrastrar.
        const D0 = 1.6, D1 = 2.9;
        const k = E.inOutCubic(tramo(t, D0, D1));
        const aleta = api.proyectar(lerp3(antes, despues, k));
        const entra = api.proyectar([0.6, 0.3, 2]);
        const sale = api.proyectar([0.9, 0.4, 2.2]);
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

        const p = t < 0.85 ? api.recorrido(t, [[0.25, entra.x, entra.y], [0.8, aleta.x, aleta.y]])
            : t < 3.4 ? aleta
                : api.recorrido(t, [[3.45, aleta.x, aleta.y], [4.2, sale.x, sale.y]]);
        const arrastra = t >= D0 && t <= D1;
        api.cursor({ x: p.x, y: p.y, pulsado: Math.max(c1.pulsado, c2.pulsado, c3.pulsado, arrastra ? 1 : 0), visible: t > 0.25 && t < 4.2 });
        const o = [c1, c2, c3].find((c) => c.onda > 0 && c.onda < 1);
        api.onda(p.x, p.y, o ? o.onda : 0);
    },
};
