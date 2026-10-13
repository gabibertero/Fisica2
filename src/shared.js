// FIS2: storage fis2:, KaTeX, barra de IA, cronómetro, nota. Vanilla, sin dependencias.
(function (root) {
  const P = 'fis2:';

  // Storage: nunca tira (modo privado, cuota, JSON roto).
  const store = {
    get(k, def = null) { try { const v = root.localStorage.getItem(P + k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } },
    set(k, v) { try { root.localStorage.setItem(P + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { root.localStorage.removeItem(P + k); } catch (e) { /* sin storage */ } },
  };

  // Datos inyectados por build.mjs: <script data-id="preguntas/U06" type="application/json">
  const data = (id) => {
    const el = root.document.querySelector(`script[data-id="${id}"]`);
    if (!el) throw new Error(`FIS2: falta data-id="${id}"`);
    return JSON.parse(el.textContent);
  };

  // KaTeX: renderMathInElement (auto-render inlineado por el build), sin tirar ante TeX inválido.
  const render = (el = root.document.body) => {
    if (typeof root.renderMathInElement !== 'function') return;
    root.renderMathInElement(el, {
      delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
      throwOnError: false,
    });
  };

  // IA: arma el prompt, lo copia y abre el chat en pestaña nueva.
  const AI = {
    chatgpt: (q) => 'https://chatgpt.com/?q=' + encodeURIComponent(q),
    claude: (q) => 'https://claude.ai/new?q=' + encodeURIComponent(q),
    gemini: () => 'https://gemini.google.com/app', // no acepta query: se pega
  };
  const prompt = ({ tema, material, pregunta, respuesta }) => [
    `Soy estudiante de Física II (UTN). Tema: ${tema || '-'}.`,
    material && `Material de mi machete:\n${material}`,
    pregunta && `Pregunta:\n${pregunta}`,
    respuesta && `Mi respuesta:\n${respuesta}`,
    'Corregime: decime qué está bien, qué está mal y por qué, con el razonamiento paso a paso. Convención: W es trabajo sobre el gas, Q + W = ΔU.',
  ].filter(Boolean).join('\n\n');

  const copy = async (text) => {
    try { await root.navigator.clipboard.writeText(text); return true; } catch (e) { /* cae al fallback */ }
    try {
      const d = root.document, t = d.createElement('textarea');
      t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      d.body.appendChild(t); t.select();
      const ok = d.execCommand('copy');
      t.remove();
      return ok;
    } catch (e) { return false; }
  };

  // Abre primero (sincrónico, para no perder el gesto del usuario y que no lo bloquee el navegador) y copia después.
  const askAI = (which, fields) => {
    if (!AI[which]) throw new Error(`FIS2: IA desconocida "${which}"`);
    const text = prompt(fields);
    root.open(AI[which](text), '_blank', 'noopener');
    return copy(text);
  };

  // Nota: shortcut: escala lineal por tramos con 6 ≈ 69/100 (según Gabi), verificar con la cátedra.
  const CORTE = 69;
  const grade = (puntos, max) => {
    const pct = Math.max(0, Math.min(100, (puntos / max) * 100));
    const nota = pct < CORTE ? (6 * pct) / CORTE : 6 + (4 * (pct - CORTE)) / (100 - CORTE);
    return { pct, nota: Math.round(nota * 100) / 100, aprobado: pct >= CORTE, verificar: 'escala 6 ≈ 69/100 según Gabi; verificar con la cátedra' };
  };
  // Final: 50 % teoría + 50 % práctica, y cada parte necesita aprobar.
  const finalGrade = (teo, prac) => ({
    nota: Math.round(((teo.nota + prac.nota) / 2) * 100) / 100,
    aprobado: teo.aprobado && prac.aprobado,
  });

  // Cronómetro persistido (fis2:timer = {end} corriendo | {left} en pausa). Se reanuda tras recargar.
  const timer = (() => {
    let iv = null, onTick, onEnd;
    const left = (s) => Math.max(0, s.end ? Math.ceil((s.end - Date.now()) / 1000) : s.left);
    const halt = () => { if (iv !== null) root.clearInterval(iv); iv = null; };
    const tick = () => {
      const s = store.get('timer');
      if (!s) return halt();
      const l = left(s);
      if (onTick) onTick(l);
      if (l <= 0) { halt(); store.del('timer'); if (onEnd) onEnd(); }
    };
    const run = (s, t, e) => { halt(); onTick = t; onEnd = e; store.set('timer', s); iv = root.setInterval(tick, 250); tick(); };
    return {
      start: (seg, t, e) => run({ end: Date.now() + seg * 1000 }, t, e),
      pause() { const s = store.get('timer'); if (!s || !s.end) return; halt(); store.set('timer', { left: left(s) }); },
      resume(t, e) { const s = store.get('timer'); if (s) run({ end: s.end || Date.now() + s.left * 1000 }, t, e); },
      stop() { halt(); store.del('timer'); },
      left: () => { const s = store.get('timer'); return s ? left(s) : null; }, // null = no hay cronómetro
      running: () => iv !== null,
    };
  })();

  root.FIS2 = { json: data, html: data, store, render, ai: { prompt, ask: askAI, copy }, grade, finalGrade, timer };
  if (root.document) root.document.addEventListener('DOMContentLoaded', () => render());
})(globalThis);
