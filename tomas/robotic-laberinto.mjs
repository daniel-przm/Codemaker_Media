/**
 * Reel de Instagram · RoboticStudio: el laberinto, resuelto por el robot con la
 * regla de la mano derecha, sin mapa, solo con su sensor de distancia.
 *
 * El programa corre de verdad en el simulador, con el reloj virtual. La cámara
 * va con el robot y lo mira de cara (`api.seguirDeFrente`), desde arriba para
 * que los muros no lo tapen; y se va elevando para que al final se vea el
 * laberinto entero y por dónde va.
 */
export default {
    id: 'robotic-laberinto',
    ejemplo: 'robotics-laberinto',
    duracion: 14,
    // Cinco segundos de calma: lo que tarda el robot en asentarse tras el
    // salto del reloj virtual.
    previo: 5.5,
    lienzo: { ancho: 720, alto: 900 },

    /**
     * A 720 de ancho, los paneles de sensores y de bloques tapan el robot:
     * fuera todo lo que no sea el 3D, y el lienzo a pantalla completa (lo
     * mismo que hace `ejemplos:grabar`). Los botones siguen ahí, invisibles:
     * «Ejecutar» se pulsa igual.
     */
    async antes(p) {
        await p.evaluate(() => {
            const lienzo = [...document.querySelectorAll('canvas')].sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0];
            for (const el of document.body.querySelectorAll('*')) {
                if (el !== lienzo && !el.contains(lienzo)) el.style.setProperty('visibility', 'hidden', 'important');
            }
            const caja = lienzo.parentElement.parentElement;
            caja.style.cssText += ';position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;z-index:2147483647!important;';
            window.dispatchEvent(new Event('resize'));
        });
        await p.waitForTimeout(1500);
    },

    fotograma(t, api) {
        if (t >= -0.5) api.una('ejecutar', () => { window.__seguir = undefined; [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Ejecutar')?.click(); });
        const r = api.robot();
        if (!r) return;
        const k = api.E.inOutSine(api.tramo(t, 7, 14));
        api.seguirDeFrente(r, { t, angulo: 35, distancia: 3.2 + 3 * k, altura: 3.8 + 6 * k, fov: 45 + 10 * k });
    },
};
