/**
 * Reel de Instagram · GameStudio: el parkour sobre la lava, jugado.
 *
 * En tercera persona —aquí no hay casas ni árboles con los que choque la
 * cámara, y se ve al jugador saltar sobre la lava—: de la salida a dos piedras,
 * cogiendo sus monedas; espera a la plataforma azul, se sube, viaja con ella
 * y salta a la piedra del otro lado; y espera al ascensor, que lo sube.
 *
 * Todo es el juego de verdad: el jugador anda porque se pulsa la W, hacia
 * donde mira la cámara, que se orienta arrastrando como lo haría el alumno; y
 * salta con la barra espaciadora. Lo único escrito a mano es cuándo: cada
 * punto de la ruta dice a qué distancia se salta hacia él y, si se mueve, a
 * qué esperar antes de ir.
 */
export default {
    id: 'game-parkour',
    ejemplo: 'game-parkour',
    duracion: 15,
    // Las plataformas van a su ritmo desde «Jugar»: con este preámbulo, el
    // jugador llega a cada una casi cuando ella llega a él.
    previo: 5,
    ratonQuieto: true,
    // 4:5, pintado a 1,5×: 1080×1350.
    lienzo: { ancho: 720, alto: 900 },

    preparar(escena) {
        // x, z del centro; `salto`: a qué distancia del centro se salta;
        // `hasta`: esperar parado a que se cumpla (la plataforma que viene).
        const RUTA = [
            { x: 0, z: 16, salto: 4.3 },
            { x: 3.5, z: 11.5, salto: 4.3 },
            { id: 'plataforma-1', salto: 5.3, hasta: 'derecha' },
            { x: -7, z: 2, salto: 5.3, hasta: 'izquierda' },
            { id: 'ascensor', salto: 5.3, hasta: 'abajo' },
        ];
        return { escena, datos: { RUTA } };
    },

    fotograma(t, api, { RUTA }) {
        const boton = (texto) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === texto);
        if (t >= -4.9) api.una('jugar', () => boton('Jugar')?.click());
        if (t < -0.2) return;

        const raiz = api.raices()[0];
        const cam = raiz?.camera;
        const lienzo = raiz?.gl.domElement;
        if (!cam || !lienzo) return;
        const T = window.__THREE;
        const porId = (id) => {
            window.__objetos ??= {};
            if (window.__objetos[id]?.parent) return window.__objetos[id];
            let hallado = null;
            raiz.scene.traverse((o) => { if (!hallado && o.userData?.id === id) hallado = o; });
            return (window.__objetos[id] = hallado);
        };
        const idJugador = window.__store.getState().objects.find((o) => o.type === 'player')?.id;
        const jugador = porId(idJugador);
        if (!jugador) return;
        const p = jugador.getWorldPosition(new T.Vector3());
        const tecla = (code, bajar) => window.dispatchEvent(new KeyboardEvent(bajar ? 'keydown' : 'keyup', { code }));

        // Arrastrar para orientar la cámara, como el alumno: un botón pulsado
        // sobre el lienzo y el ratón moviéndose de lado.
        api.una('agarra', () => lienzo.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true })));
        const arrastra = (dx) => window.dispatchEvent(new PointerEvent('pointermove', { movementX: dx, movementY: 0, bubbles: true }));

        // Dónde está cada punto ahora: las plataformas que se mueven, donde estén.
        const donde = (w) => {
            if (!w.id) return { x: w.x, z: w.z, y: null };
            const o = porId(w.id)?.getWorldPosition(new T.Vector3());
            return o ? { x: o.x, z: o.z, y: o.y } : { x: 0, z: 0, y: 0 };
        };
        const listo = (w) => {
            if (!w.hasta) return true;
            const pl1 = donde({ id: 'plataforma-1' });
            const asc = donde({ id: 'ascensor' });
            if (w.hasta === 'derecha') return pl1.x > -1.2;
            if (w.hasta === 'izquierda') return pl1.x < -5.8;
            if (w.hasta === 'abajo') return asc.y < 3.4;
            return true;
        };

        const e = (window.__estado ??= { i: 0, anda: false, salto: null });
        const w = RUTA[e.i];
        const d = w && donde(w);
        const dist = d ? Math.hypot(d.x - p.x, d.z - p.z) : 0;

        // Llegado al punto: al siguiente. En uno que se mueve, se queda quieto
        // encima mientras viaja.
        if (w && e.saltado && dist < 1.3 && p.y > 2) { e.i++; e.saltado = false; }
        const sig = RUTA[e.i];
        const va = sig && listo(sig);
        const quieto = !sig || !va;
        if (quieto && e.anda) { tecla('KeyW', false); e.anda = false; }
        if (!quieto && !e.anda) { tecla('KeyW', true); e.anda = true; }

        // La vista hacia el punto siguiente, a ritmo de persona (2 rad/s).
        if (sig) {
            const s = donde(sig);
            const dir = cam.getWorldDirection(new T.Vector3());
            const actual = Math.atan2(-dir.x, -dir.z);
            const objetivo = Math.atan2(-(s.x - p.x), -(s.z - p.z));
            let da = objetivo - actual;
            da = Math.atan2(Math.sin(da), Math.cos(da));
            const tope = 2 * (1 / 60);
            const giro = Math.max(-tope, Math.min(tope, da));
            if (Math.abs(giro) > 0.004) arrastra(-giro / 0.005);
            // El salto, a su distancia: pulsar y soltar.
            const ds = Math.hypot(s.x - p.x, s.z - p.z);
            if (va && !e.saltado && ds < sig.salto) { tecla('Space', true); e.salto = t; e.saltado = true; }
        }
        if (e.salto !== null && t - e.salto > 0.15) { tecla('Space', false); e.salto = null; }
        window.__traza = { t: +t.toFixed(2), i: e.i, x: +p.x.toFixed(1), y: +p.y.toFixed(1), z: +p.z.toFixed(1), anda: e.anda };
    },
};
