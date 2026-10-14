// Genera los HTML autocontenidos en la raíz: node build.mjs
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

process.chdir(fileURLToPath(new URL('.', import.meta.url)));
const nm = 'node_modules/';
const b64 = (p) => readFileSync(p).toString('base64');
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

// Fuentes propias (Instrument Sans + STIX) y las de KaTeX, todo en base64.
const face = (family, file, weight, style) =>
  `@font-face{font-family:'${family}';font-weight:${weight};font-style:${style};font-display:swap;` +
  `src:url(data:font/woff2;base64,${b64(file)}) format('woff2')}`;
const fs = nm + '@fontsource/';
const fonts = [
  ...[400, 600, 700].map((w) => face('Instrument Sans', `${fs}instrument-sans/files/instrument-sans-latin-${w}-normal.woff2`, w, 'normal')),
  face('STIX Two Text', `${fs}stix-two-text/files/stix-two-text-latin-400-normal.woff2`, 400, 'normal'),
  face('STIX Two Text', `${fs}stix-two-text/files/stix-two-text-latin-400-italic.woff2`, 400, 'italic'),
].join('\n');

// KaTeX CSS: deja solo el woff2 de cada @font-face, inline.
const katexCss = readFileSync(nm + 'katex/dist/katex.min.css', 'utf8').replace(
  /src:[^;}]*?url\(fonts\/([\w-]+)\.woff2\)[^;}]*/g,
  (_, f) => `src:url(data:font/woff2;base64,${b64(nm + `katex/dist/fonts/${f}.woff2`)}) format('woff2')`,
);

// Datos: .json y .md (pasado por marked) se inyectan como JSON dentro de <script type="application/json">.
// Cada página recibe solo los ids que le corresponden (prefijo con "/" final, o id exacto).
const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
const jsSafe = (s) => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const escapeAttr = (s) => s.replace(/[&"<>]/g, (c) => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[c]);
const figureImages = (body, source, marker) => {
  const files = [...body.matchAll(/(?:assets\/fig\/)?([A-Za-z0-9][\w.-]*\.(?:png|svg))/g)];
  if (!files.length) throw new Error(`${source}: marcador de figura sin archivo: ${marker}`);
  const caption = body.slice(0, files[0].index).replace(/[·\s`]+$/g, '').trim();
  return files.map((match, index) => {
    const file = match[1];
    if (!existsSync(join('assets/fig', file))) throw new Error(`${source}: no existe assets/fig/${file}`);
    const alt = files.length > 1 ? `${caption} (${index + 1} de ${files.length})` : caption;
    return `<img src="assets/fig/${file}" alt="${escapeAttr(alt)}" loading="lazy">`;
  }).join('');
};
const renderFigures = (raw, source) => raw
  .replace(/^[ \t]*-?[ \t]*\[FIGURA:\s*([^\]]+)\][ \t]*$/gm, (marker, body) =>
    `\n<figure class="machete-figure"><span class="machete-figures">${figureImages(body, source, marker)}</span></figure>\n`)
  .replace(/\[FIGURA:\s*([^\]]+)\]/g, (marker, body) =>
    `<span class="machete-figures">${figureImages(body, source, marker)}</span>`);
const all = new Map();
for (const p of walk('src/data')) {
  const base = p.split(sep).pop();
  if (base.startsWith('.')) continue;
  if (!/\.(json|md)$/.test(p)) throw new Error(`src/data: extensión no soportada: ${p}`);
  const id = relative('src/data', p).split(sep).join('/').replace(/\.(json|md)$/, '');
  if (all.has(id)) throw new Error(`src/data: id duplicado: ${id}`);
  const raw = readFileSync(p, 'utf8');
  const content = p.endsWith('.json') ? JSON.parse(raw) : marked.parse(
    p.startsWith('src/data/machete/') ? renderFigures(raw, p) : raw,
  );
  all.set(id, json(content)); // JSON.parse falla el build si el json está roto
}
const PAGE_DATA = {
  index: ['machete/'], preguntero: ['preguntas/'], estudio: ['tarjetas/', 'deducciones'],
  parciales: ['simulacros', 'p1'], laboratorio: [],
};
const dataFor = (page) => [...all].filter(([id]) => PAGE_DATA[page].some((k) => (k.endsWith('/') ? id.startsWith(k) : id === k)))
  .map(([id, j]) => `<script type="application/json" data-id="${id}">${j}</script>`).join('\n');

const NAV = [['index', 'Inicio'], ['estudio', 'Estudio'], ['preguntero', 'Preguntero'], ['parciales', 'Parciales'], ['laboratorio', 'Laboratorio']];
const nav = (cur) => `<a class="skip" href="#main">Saltar al contenido</a><header class="nav"><a class="brand" href="index.html">Física II</a><nav aria-label="Principal">` +
  NAV.map(([f, t]) => `<a href="${f}.html"${f === cur ? ' class="on" aria-current="page"' : ''}>${t}</a>`).join('') + `</nav></header>`;

const head = `<style>\n${fonts}\n${katexCss}\n${readFileSync('src/shared.css', 'utf8')}\n</style>`;
const katexJs = jsSafe(readFileSync(nm + 'katex/dist/katex.min.js', 'utf8'));
const autoJs = jsSafe(readFileSync(nm + 'katex/dist/contrib/auto-render.min.js', 'utf8'));
const sharedJs = jsSafe(readFileSync('src/shared.js', 'utf8'));

for (const [name] of NAV) {
  const vals = { head, nav: nav(name), scripts: `${dataFor(name)}\n<script>${katexJs}</script>\n<script>${autoJs}</script>\n<script>${sharedJs}</script>` };
  const html = readFileSync(`src/pages/${name}.html`, 'utf8').replace(/\{\{(\w+)\}\}/g, (m, k) => {
    if (!(k in vals)) throw new Error(`${name}.html: placeholder sin reemplazar: ${m}`);
    return vals[k];
  });
  writeFileSync(`${name}.html`, html);
  console.log(`${name}.html  ${(html.length / 1024).toFixed(0)} KB`);
}
