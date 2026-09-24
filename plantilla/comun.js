/*
 * Piezas comunes de las plantillas.
 *
 * Cada plantilla (blog.html, studio.html, ejemplo.html, destacada.html) lee sus
 * textos e imágenes de `window.DATOS`, que render.mjs rellena con el
 * `datos.json` de la publicación. La plantilla solo decide la maquetación.
 */

const RAIZ = new URL('.', document.currentScript.src).href;

/** Crea un elemento: h('p.clase', {style: '…'}, 'texto', otroNodo…) */
function h(etiqueta, atributos, ...hijos) {
  const [nombre, ...clases] = etiqueta.split('.');
  const el = document.createElement(nombre || 'div');
  if (clases.length) el.className = clases.join(' ');
  if (atributos && (typeof atributos !== 'object' || atributos instanceof Node || Array.isArray(atributos))) { hijos.unshift(atributos); atributos = null; }
  for (const [k, v] of Object.entries(atributos || {})) {
    if (v === undefined || v === null || v === false) continue;
    el.setAttribute(k, v);
  }
  for (const hijo of hijos.flat()) {
    if (hijo === undefined || hijo === null || hijo === false) continue;
    el.append(hijo instanceof Node ? hijo : document.createTextNode(String(hijo)));
  }
  return el;
}

const logo = (clase = '') => h('img.logo' + (clase ? '.' + clase : ''), { src: RAIZ + 'marca/logo-blanco.svg', alt: 'Codemaker 3D' });
const flechas = () => h('img.flechas', { src: RAIZ + 'marca/flechas.svg', alt: '' });
const icono = (nombre, clase = 'icono') => h('img.' + clase, { src: RAIZ + 'iconos/' + nombre + '.svg', alt: '' });

function pie(web = 'codemaker.es') {
  return h('div.pie', h('span', '@codemaker_3d'), h('span', web));
}

function lamina(clase, ...hijos) {
  return h('section.lamina' + (clase ? '.' + clase : ''), ...hijos);
}

/** Da nombre al PNG de una lámina (portada.png en vez de 01.png). */
function nombrar(el, nombre) { el.dataset.nombre = nombre; return el; }

function checks(lista) {
  return h('ul.checks', lista.map((t) => h('li', t)));
}

/** Etiqueta de un studio: su nombre y, si hace falta, PRO. */
function pildoraStudio(studio) {
  return h('span.grupo-pildoras',
    h('span.pildora', studio.nombre),
    studio.pro && h('span.pildora.pro', 'PRO'));
}

/**
 * Reduce la letra de cada `[data-alto]` hasta que su texto quepa en esa
 * altura. Así un título largo no pisa lo de debajo: se encoge.
 */
function ajustarTextos() {
  for (const el of document.querySelectorAll('[data-alto]')) {
    const alto = Number(el.dataset.alto);
    let tam = parseFloat(getComputedStyle(el).fontSize);
    while (el.scrollHeight > alto && tam > 22) {
      tam -= 2;
      el.style.fontSize = tam + 'px';
    }
  }
}

/** Monta las láminas en el body y avisa a render.mjs de que ha terminado. */
async function montar(laminas) {
  document.body.append(...laminas.flat().filter(Boolean));
  await document.fonts.ready;
  await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
  ajustarTextos();
  document.body.dataset.listo = 'si';
}
