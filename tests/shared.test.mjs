// Tests de src/shared.js sin dependencias. Uso: node tests/shared.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const mem = new Map();
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
let now = 1_000_000, cb = null;
Date.now = () => now;
globalThis.setInterval = (f) => { cb = f; return 1; };
globalThis.clearInterval = () => { cb = null; };
const nodes = { 'a/b': { textContent: '{"x":1}' } };
let copied = '', copyFallbacks = 0;
globalThis.document = {
  addEventListener() {},
  querySelector: (s) => nodes[s.match(/"(.+)"/)[1]] || null,
  body: { appendChild() {} },
  createElement: () => ({ style: {}, value: '', select() {}, remove() {} }),
  execCommand: (command) => { if (command === 'copy') copyFallbacks++; return command === 'copy'; },
};
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: { clipboard: { writeText: async (text) => { copied = text; } } },
});
const opened = [];
globalThis.open = (...args) => opened.push(args);

const source = readFileSync(new URL('../src/shared.js', import.meta.url), 'utf8');
const load = () => (0, eval)(source);
load();
const { store, grade, finalGrade, timer, json, html, ai } = FIS2;

// storage
assert.equal(store.set('a', { n: 1 }), true);
assert.deepEqual(store.get('a'), { n: 1 });
assert.ok(mem.has('fis2:a'), 'prefijo fis2:');
assert.equal(store.get('nada', 7), 7);
mem.set('fis2:roto', '{no json');
assert.equal(store.get('roto', 'def'), 'def');
store.del('a'); assert.equal(store.get('a'), null);
const ls = globalThis.localStorage; globalThis.localStorage = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }, removeItem() { throw new Error('x'); } };
assert.equal(store.get('a', 1), 1); assert.equal(store.set('a', 1), false); store.del('a');
globalThis.localStorage = ls;

// json/html
assert.deepEqual(json('a/b'), { x: 1 }); assert.deepEqual(html('a/b'), { x: 1 });
assert.throws(() => json('no'), /FIS2: falta data-id="no"/);

// KaTeX
let rendered = null;
globalThis.renderMathInElement = (el, options) => { rendered = { el, options }; };
FIS2.render(nodes['a/b']);
assert.equal(rendered.el, nodes['a/b']);
assert.deepEqual(rendered.options.delimiters, [
  { left: '$$', right: '$$', display: true },
  { left: '$', right: '$', display: false },
]);
assert.equal(rendered.options.throwOnError, false);
delete globalThis.renderMathInElement;
assert.doesNotThrow(() => FIS2.render());

// nota
assert.equal(grade(69, 100).nota, 6); assert.equal(grade(69, 100).aprobado, true);
assert.equal(grade(100, 100).nota, 10); assert.equal(grade(0, 100).nota, 0);
assert.equal(grade(68, 100).aprobado, false); assert.equal(grade(3.45, 5).nota, 6);
assert.ok(grade(1, 2).verificar);
assert.equal(finalGrade(grade(100, 100), grade(50, 100)).aprobado, false);
assert.equal(finalGrade(grade(100, 100), grade(69, 100)).nota, 8);

// prompt
assert.match(ai.prompt({ tema: 'U6', pregunta: 'Q?' }), /Tema: U6[\s\S]*Pregunta:\nQ\?/);
const prompt = ai.prompt({ tema: 'U6', pregunta: 'Q?' });
assert.equal(await ai.ask('chatgpt', { tema: 'U6', pregunta: 'Q?' }), true);
assert.equal(new URL(opened.at(-1)[0]).searchParams.get('q'), prompt);
assert.equal(opened.at(-1)[1], '_blank');
assert.equal(opened.at(-1)[2], 'noopener');
assert.equal(copied, prompt);
assert.equal(await ai.ask('claude', { tema: 'U6', pregunta: 'Q?' }), true);
assert.equal(new URL(opened.at(-1)[0]).searchParams.get('q'), prompt);
assert.equal(await ai.ask('gemini', { tema: 'U6', pregunta: 'Q?' }), true);
assert.equal(opened.at(-1)[0], 'https://gemini.google.com/app');
assert.throws(() => ai.ask('desconocida', {}), /IA desconocida/);

navigator.clipboard.writeText = async () => { throw new Error('clipboard bloqueado'); };
assert.equal(await ai.copy('fallback'), true);
assert.equal(copyFallbacks, 1);

// cronómetro
const ticks = []; let ended = 0;
timer.start(10, (l) => ticks.push(l), () => ended++);
assert.deepEqual(ticks, [10]); assert.ok(timer.running());
now += 4000; cb(); assert.equal(ticks.at(-1), 6);
timer.pause(); assert.equal(timer.running(), false);
now += 60000; assert.equal(timer.left(), 6, 'en pausa no corre');
timer.resume((l) => ticks.push(l), () => ended++);
now += 5000; cb(); assert.equal(ticks.at(-1), 1); assert.equal(ended, 0);
now += 1000; cb(); assert.equal(ticks.at(-1), 0); assert.equal(ended, 1, 'autoentrega');
assert.equal(timer.left(), null); assert.equal(timer.running(), false);
timer.start(20, () => {}, () => {});
now += 5000; cb(); timer.pause();
assert.equal(timer.left(), 15);
load();
let resumedEnd = 0;
FIS2.timer.resume(() => {}, () => resumedEnd++);
assert.equal(FIS2.timer.left(), 15, 'restaura el tiempo guardado al recargar');
now += 15000; cb();
assert.equal(resumedEnd, 1, 'autoentrega tras reanudar el timer guardado');
assert.equal(FIS2.timer.left(), null);
console.log('shared.test.mjs: OK');
