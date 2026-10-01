/**
 * Reel de Instagram · FormStudio: el bodegón de frutas. La pera del frutero es
 * todavía una bola: el alumno entra en edición, coge las caras de arriba y
 * tira de ellas hacia arriba; al salir de edición, la malla suavizada se hace
 * pera. Después, la cámara rodea el bodegón.
 *
 * Las caras se mueven con `moveFace`, que es lo que hace el tirador de mover.
 * La versión «sin terminar» es el mismo gesto al revés antes de grabar (como
 * el pulpo del showreel): la forma final es exactamente la de la receta.
 */
const SUBIDA = 0.55;

export default {
    id: 'form-bodegon',
    ejemplo: 'form-bodegon',
    duracion: 9,
    lienzo: { ancho: 720, alto: 900 },

    preparar(escena) {
        const pera = escena.objects.find((o) => o.color === '#a3e635');
        const v = (i) => [pera.vertices[3 * i], pera.vertices[3 * i + 1], pera.vertices[3 * i + 2]];
        const centro = (f) => f.indices.map(v).reduce((a, b) => a.map((x, k) => x + b[k] / f.indices.length), [0, 0, 0]);
        // Las cuatro caras de más arriba: la tapa del cuello de la pera.
        const CUELLO = pera.faces.map((f, i) => [i, centro(f)[1]]).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([i]) => i);
        const alto = Math.max(...CUELLO.map((i) => centro(pera.faces[i])[1]));
        // La punta, en el mundo (aprox.): la pera está escalada y apenas girada.
        const k = pera.scale[1];
        const punta = (dy) => [pera.position[0] + Math.sin(0.35) * (alto + dy) * k, pera.position[1] + Math.cos(0.35) * (alto + dy) * k, pera.position[2]];
        return { escena, datos: { id: pera.id, CUELLO, SUBIDA, antes: punta(-SUBIDA), despues: punta(0) } };
    },

    async antes(p, d) {
        await p.evaluate(({ id, CUELLO, SUBIDA }) => {
            const s = () => window.__store.getState();
            s().enterEditMode(id);
            CUELLO.forEach((c, i) => s().selectFace(c, i > 0));
            s().startFaceDrag();
            s().moveFace(new window.__THREE.Vector3(0, -SUBIDA, 0));
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

    fotograma(t, api, { id, CUELLO, SUBIDA, antes, despues }) {
        const { E, tramo, lerp3 } = api;
        const s = () => window.__store.getState();
        window.__ocultarTexto?.('Modo Edición');
        // De cerca del frutero; después, una vuelta lenta alrededor de la mesa.
        const k1 = E.inOutSine(tramo(t, 0, 4.4));
        const k2 = E.inOutCubic(tramo(t, 4.4, 9));
        const ang = 0.45 - 0.9 * k2;
        const r = 3.2 + 3.2 * k2;
        const lejos = [Math.sin(ang) * r, 2.2 + 1.2 * k2, Math.cos(ang) * r];
        const pos = lerp3(lerp3([2.0, 2.6, 3.4], [1.5, 2.3, 2.8], k1), lejos, k2);
        const mira = lerp3([0.15, 1.25, 0.3], [0, 0.8, 0], k2);
        api.camara({ pos, mira, fov: 40 });

        const D0 = 1.6, D1 = 2.9;
        const k = E.inOutCubic(tramo(t, D0, D1));
        const cima = api.proyectar(lerp3(antes, despues, k));
        const entra = api.proyectar([0.9, 0.3, 1.5]);
        const sale = api.proyectar([1.1, 0.4, 1.6]);
        const c1 = api.clic(t, 0.85, 'editar', () => s().enterEditMode(id));
        const c2 = api.clic(t, 1.25, 'caras', () => CUELLO.forEach((c, i) => s().selectFace(c, i > 0)));
        if (t >= D0 && t <= D1 + 0.02) {
            api.una('agarra', () => s().startFaceDrag());
            const hecho = window.__hecho ?? 0;
            const dk = k - hecho;
            if (Math.abs(dk) > 1e-6) s().moveFace(new window.__THREE.Vector3(0, SUBIDA * dk, 0));
            window.__hecho = k;
        }
        if (t > D1 + 0.02) {
            api.una('remata', () => {
                const falta = 1 - (window.__hecho ?? 0);
                if (Math.abs(falta) > 1e-6) s().moveFace(new window.__THREE.Vector3(0, SUBIDA * falta, 0));
                window.__hecho = 1;
                s().endFaceDrag();
            });
        }
        const c3 = api.clic(t, 3.4, 'salir', () => { s().exitEditMode(); window.__store.setState({ selectedObjectId: null }); });

        const p = t < 0.85 ? api.recorrido(t, [[0.25, entra.x, entra.y], [0.8, cima.x, cima.y]])
            : t < 3.4 ? cima
                : api.recorrido(t, [[3.45, cima.x, cima.y], [4.2, sale.x, sale.y]]);
        const arrastra = t >= D0 && t <= D1;
        api.cursor({ x: p.x, y: p.y, pulsado: Math.max(c1.pulsado, c2.pulsado, c3.pulsado, arrastra ? 1 : 0), visible: t > 0.25 && t < 4.2 });
        const o = [c1, c2, c3].find((c) => c.onda > 0 && c.onda < 1);
        api.onda(p.x, p.y, o ? o.onda : 0);
    },
};
