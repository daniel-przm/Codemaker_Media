// Pinta en SVG la marca y las seis mascotas con los MISMOS componentes de la
// aplicación (src/components/marca). Lo lanza generar-imagenes.mjs, con
// vite-node desde la aplicación para que resuelva sus imports.
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const APP = process.env.CODEMAKER_APP!;
const { CaraCodemaker, CaraDeStudio } = await import(`${APP}/src/components/marca/index.ts`);
const { default: logoCrudo } = await import(`${APP}/public/img/logo.svg?raw`);

// El correo va sobre blanco: el logotipo con sus colores de origen («CODE» en
// #00477A), y «maker», que en el fichero es blanco, en el negro de la app.
const logotipoSobreBlanco = (logoCrudo as string)
  .replace(/\s(width|height)="\d+"/g, '')
  .replace(/<svg /, '<svg style="height:40px;width:auto;display:block" ')
  .replace(/fill="white"/gi, 'fill="#111111"');

const studios = ['voxel', 'modeling', 'form', 'game', 'robotics', 'code'];
const piezas: Record<string, string> = {
  marca: `<div style="display:flex;align-items:center;gap:12px">${renderToStaticMarkup(<CaraCodemaker size={54} />)}${logotipoSobreBlanco}</div>`,
};
for (const s of studios) piezas[s] = renderToStaticMarkup(<CaraDeStudio studio={s} size={64} />);
console.log(JSON.stringify(piezas));
