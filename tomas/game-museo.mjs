/**
 * Reel de Instagram · GameStudio: el museo de la pintura española, jugado en
 * PRIMERA PERSONA. El visitante cruza la Sala 1, el Siglo de Oro, rodeando el
 * banco, hasta Las Meninas: al acercarse, el cuadro «habla» —la audioguía lo
 * explica en un bocadillo— y el visitante se queda mirándolo.
 *
 * Todo es el juego de verdad: anda porque se pulsa la W, hacia donde mira la
 * cámara, que se gira con el ratón como lo haría el alumno; la audioguía y el
 * sello son las reglas del propio proyecto. Lo único preparado: el visitante
 * empieza ya dentro de la Sala 1 —en la receta está en la puerta del museo—
 * y anda algo más despacio.
 */
const INICIO = [-8.6, 2.6];
// Rodeando el banco (−13,5 a −10,5 en x; −1,9 a −1,1 en z) por su derecha,
// hasta quedarse bien dentro de los 3 de Las Meninas (−12, −7,8), la distancia a la
// que el cuadro «habla». Ahí se para, mirándolo.
const RUTA = [[-9.6, -1.8], [-11.4, -4.4], [-12, -5.5]];
const MIRADA = [-12, -7.8];

export default {
    id: 'game-museo',
    ejemplo: 'game-museo',
    duracion: 12,
    // El mensaje de bienvenida dura cuatro segundos: se deja pasar.
    previo: 6,
    ratonQuieto: true,
    lienzo: { ancho: 720, alto: 900 },

    preparar(escena) {
        const objects = escena.objects.map((o) => (o.type === 'player'
            ? { ...o, position: [INICIO[0], o.position[1], INICIO[1]], gameplay: { ...o.gameplay, moveSpeed: 2.2 } }
            : o));
        return { escena: { ...escena, objects }, datos: { INICIO, RUTA, MIRADA } };
    },

    fotograma(t, api, { INICIO, RUTA, MIRADA }) {
        const boton = (texto) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === texto);
        if (t >= -5.5) api.una('jugar', () => boton('Jugar')?.click());

        // La primera persona solo gira la vista con el puntero bloqueado: se le
        // dice a la página que lo está, sobre el lienzo de la partida.
        const lienzoActual = api.raices()[0]?.gl.domElement;
        if (lienzoActual) window.__lienzoFP = lienzoActual;
        api.una('bloqueo', () => {
            Object.defineProperty(document, 'pointerLockElement', { configurable: true, get: () => window.__lienzoFP ?? null });
            HTMLCanvasElement.prototype.requestPointerLock = function () {};
        });
        const girar = (dx, dy = 0) => document.dispatchEvent(new MouseEvent('mousemove', { movementX: dx, movementY: dy, bubbles: true }));
        const SENS = 0.0035;
        const T = window.__THREE;
        const raiz = api.raices()[0];
        const cam = raiz?.camera;
        const rumbo = () => { const d = cam.getWorldDirection(new T.Vector3()); return Math.atan2(-d.x, -d.z); };
        const hacia = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
        const corto = (a) => Math.atan2(Math.sin(a), Math.cos(a));

        // En el preámbulo, la vista hacia el primer punto de la ruta.
        if (t >= -2.5 && t < -1 && cam) {
            const mx = Math.max(-80, Math.min(80, corto(rumbo() - hacia(INICIO, RUTA[0])) / SENS));
            if (Math.abs(mx) > 0.2) girar(mx);
        }
        // La vista algo alzada: el bocadillo de la audioguía sale encima del
        // cuadro y, mirando de frente, se cortaba por arriba.
        if (t >= -0.9) api.una('cabeceo', () => girar(0, -45));
        if (t >= -1.1) api.una('anda', () => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' })));
        if (t < 0 || !cam) return;

        const jugador = window.__jugador ?? (() => {
            const id = window.__store.getState().objects.find((o) => o.type === 'player')?.id;
            let hallado = null;
            raiz.scene.traverse((o) => { if (!hallado && o.userData?.id === id) hallado = o; });
            return (window.__jugador = hallado);
        })();
        if (!jugador) return;
        const p = jugador.getWorldPosition(new T.Vector3());
        let i = window.__paso ?? 0;
        while (i < RUTA.length - 1 && Math.hypot(RUTA[i][0] - p.x, RUTA[i][1] - p.z) < 0.9) i++;
        const dist = Math.hypot(RUTA[i][0] - p.x, RUTA[i][1] - p.z);
        const m = window.__mejor;
        if (!m || m.i !== i || dist < m.d - 0.15) window.__mejor = { i, d: dist, t };
        else if (t - m.t > 0.8 && i < RUTA.length - 1) { i++; window.__mejor = null; }
        window.__paso = i;

        // Hacia el punto siguiente. Al llegar al último, el cuadro ya ha
        // «hablado»: el visitante da unos pasos atrás, sin dejar de mirarlo,
        // para que quepan el cuadro y el bocadillo, que sale encima y de cerca
        // se quedaba fuera de plano. Y la cabeza se mueve despacio.
        if (i === RUTA.length - 1 && dist < 0.5 && window.__parado === undefined) {
            window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));
            window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS' }));
            window.__parado = t;
        }
        if (window.__parado !== undefined && t - window.__parado > 1.4) {
            api.una('quieto', () => window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyS' })));
        }
        const objetivo = window.__parado !== undefined
            ? hacia([p.x, p.z], MIRADA) + 0.12 * Math.sin((t - window.__parado) * 0.7)
            : hacia([p.x, p.z], RUTA[i]);
        const dt = Math.max(1 / 120, t - (window.__tAnterior ?? t - 1 / 60));
        window.__tAnterior = t;
        const tope = (1.6 * dt) / SENS;
        const mx = Math.max(-tope, Math.min(tope, corto(rumbo() - objetivo) / SENS));
        if (Math.abs(mx) > 0.2) girar(mx);
        window.__traza = { t: +t.toFixed(2), x: +p.x.toFixed(1), z: +p.z.toFixed(1), i };
    },
};
