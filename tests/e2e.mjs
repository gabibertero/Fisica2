// E2E de las 5 páginas de la raíz (file://, offline, desktop + celular).
// Playwright vive fuera del repo: PW_PATH lo sobreescribe. Uso: node tests/e2e.mjs
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PW_PATH = process.env.PW_PATH || '/private/tmp/claude-501/-Users-gabrielagustinberterojarchum-Desktop-UTN-2--A-o-Fisica-2-github/557106c8-c788-46b7-bf29-41d7350563bb/scratchpad/pw';
const { chromium } = createRequire(join(PW_PATH, 'package.json'))('playwright');

const PAGES = ['index', 'estudio', 'preguntero', 'parciales', 'laboratorio'];
const VIEWPORTS = { desktop: { width: 1280, height: 800 }, celular: { width: 390, height: 844 } };
const NAV_LINKS = ['Inicio', 'Estudio', 'Preguntero', 'Parciales', 'Laboratorio'];
const CAPTURAS = join(ROOT, 'tests', 'capturas');
mkdirSync(CAPTURAS, { recursive: true });

async function probar(browser, name, vpName) {
  const fallas = [];
  const context = await browser.newContext({ viewport: VIEWPORTS[vpName] });
  await context.setOffline(true);
  const page = await context.newPage();

  page.on('request', (req) => {
    const url = req.url();
    if (!/^(file|data):/.test(url)) fallas.push(`request no permitido: ${url}`);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') fallas.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => fallas.push(`pageerror: ${err.message}`));

  await page.goto(pathToFileURL(join(ROOT, `${name}.html`)).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  const texto = await page.evaluate(() => document.body.innerText);
  const crudo = texto.match(/.{0,30}(\$|\\frac).{0,30}/g) || [];
  for (const t of crudo.slice(0, 5)) fallas.push(`texto crudo sin renderizar: "${t.replace(/\n/g, ' ')}"`);

  const nav = await page.evaluate(() => {
    const links = [...document.querySelectorAll('header.nav nav a')];
    return {
      textos: links.map((a) => a.textContent.trim()),
      marcados: links.filter((a) => a.classList.contains('on') && a.getAttribute('aria-current') === 'page')
        .map((a) => a.textContent.trim()),
    };
  });
  if (JSON.stringify(nav.textos) !== JSON.stringify(NAV_LINKS)) {
    fallas.push(`nav: links ${JSON.stringify(nav.textos)} (esperado ${JSON.stringify(NAV_LINKS)})`);
  }
  const actual = NAV_LINKS[PAGES.indexOf(name)];
  if (JSON.stringify(nav.marcados) !== JSON.stringify([actual])) {
    fallas.push(`nav: marcados ${JSON.stringify(nav.marcados)} (esperado [${actual}])`);
  }

  const layout = await page.evaluate(() => {
    const fuera = [...document.querySelectorAll('header.nav nav a')].map((a) => {
      const r = a.getBoundingClientRect();
      return { t: a.textContent.trim(), left: r.left, right: r.right };
    }).filter((l) => l.left < 0 || l.right > window.innerWidth);
    return { fuera, scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth };
  });
  for (const l of layout.fuera) {
    fallas.push(`nav: link "${l.t}" fuera del viewport (left ${l.left.toFixed(0)}, right ${l.right.toFixed(0)}, ancho ${layout.innerW})`);
  }
  if (layout.scrollW > layout.innerW) {
    fallas.push(`scroll horizontal: scrollWidth ${layout.scrollW} > innerWidth ${layout.innerW}`);
  }

  const captura = join(CAPTURAS, `${name}-${vpName}.png`);
  await page.screenshot({ path: captura, fullPage: true });
  await context.close();
  return { fallas, captura };
}

const browser = await chromium.launch();
const resumen = [];
let fallaron = false;
try {
  for (const name of PAGES) {
    for (const vpName of Object.keys(VIEWPORTS)) {
      const { fallas, captura } = await probar(browser, name, vpName);
      if (fallas.length) fallaron = true;
      resumen.push({ pagina: name, vp: vpName, ok: fallas.length === 0, fallas, captura });
    }
  }
} finally {
  await browser.close();
}

for (const r of resumen) {
  console.log(`${r.ok ? 'OK  ' : 'FAIL'} ${r.pagina.padEnd(12)} ${r.vp.padEnd(8)} -> ${r.captura}`);
  for (const f of r.fallas) console.log(`       - ${f}`);
}
console.log(fallaron ? '\nE2E: FALLÓ' : '\nE2E: todo OK');
process.exit(fallaron ? 1 : 0);
