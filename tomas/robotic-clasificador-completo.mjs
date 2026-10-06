/**
 * Reel de Instagram · RoboticStudio: el clasificador de totems, de principio a
 * fin. El robot avanza hasta tener un totem delante, lo coge con la garra, mira
 * su color y lo deja en su lado: los morados a la izquierda, los azules a la
 * derecha. Y otra vez, sin contar casillas.
 *
 * El anuncio del showreel enseña de cerca el primer totem; aquí se ve el
 * programa entero corriendo: la cámara va con el robot y se eleva para que al
 * final se vean los totems ya clasificados. Como \`robotic-laberinto\`.
 */
export default {
    id: 'robotic-clasificador-completo',
    ejemplo: 'robotics-clasificador',
    duracion: 17,
    // Cinco segundos de calma: lo que tarda el robot en asentarse tras el
    // salto del reloj virtual.
    previo: 5.5,
    lienzo: { ancho: 720, alto: 900 },

    /** A 720 de ancho, los paneles tapan el robot: fuera todo lo que no sea el 3D. */
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
        // De cara y por encima de los muros de los carriles; al final, más alto.
        const k = api.E.inOutSine(api.tramo(t, 8, 16));
        api.seguirDeFrente(r, { t, angulo: 38, distancia: 4.6 + 3.5 * k, altura: 5.2 + 7 * k, alturaMira: 0.2, fov: 44 + 12 * k });
    },
};
