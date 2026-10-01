/**
 * Reel de Instagram · CodeStudio: el factorial, dentro de la máquina. Se entra
 * en el ordenador y se camina hasta la pila; al pulsar «Ejecutar», cada
 * llamada a `factorial` apila un marco nuevo con su propia `n` —la pila crece
 * como una torre— y al volver se deshacen de arriba abajo. Con el bucle de
 * `main`, la torre es cada vez más alta.
 *
 * Como `code-memoria` del showreel: el paseo, antes de congelar el reloj
 * (`visitarLaMaquina`, el de las capturas de la galería, con la visita de su
 * línea del catálogo); después, «Ejecutar» y un giro lento de cabeza con los
 * mismos eventos de ratón que mandaría el alumno.
 */
const VISITA = { desde: [0.75, 0.15], mira: [1.5, 3.72, 0.46] };

export default {
    id: 'code-factorial',
    ejemplo: 'code-factorial',
    duracion: 15,
    ratonQuieto: true,
    lienzo: { ancho: 720, alto: 900 },

    async antes(p) {
        await p.click('[data-testid="entrar-en-la-maquina"]');
        await p.waitForTimeout(800);
        // En 4:5 la máquina y el editor van uno encima del otro, a medias, y en
        // la mitad de la máquina no cabían los marcos de la pila. Más sitio para
        // ella: es lo mismo que arrastrar el reparto en pantalla ancha.
        await p.evaluate(() => {
            document.querySelector('[data-testid="mitad-de-la-maquina"]').style.flex = '0 0 60%';
            document.querySelector('[data-testid="mitad-del-editor"]').style.flex = '0 0 40%';
            window.dispatchEvent(new Event('resize'));
        });
        await p.waitForTimeout(800);
        await p.evaluate(([a, b]) => window.visitarLaMaquina(a, b), [VISITA.desde, VISITA.mira]);
        await p.waitForTimeout(1500);
    },

    fotograma(t, api) {
        api.una('ejecutar', () => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Ejecutar')?.click());
        const giro = (tt) => 18 * api.E.inOutSine(api.tramo(tt, 0, 15));
        const antes = window.__giro ?? 0;
        const ahora = Math.round(giro(t));
        if (ahora !== antes) document.dispatchEvent(new MouseEvent('mousemove', { movementX: ahora - antes, movementY: 0 }));
        window.__giro = ahora;
    },
};
