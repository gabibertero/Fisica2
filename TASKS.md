# TASKS — fisica2

Una tarea por sesión (~30 min). Formato: `[ ] Txx · agente · qué → hecho cuando`.
Prioridad: U6–U9 primero, para el P2 del 03/11. Meta: tener algo usable publicado antes del 20/10.

## A. Fuentes faltantes
- [x] T01 · redactor · Leer como imagen `teoria/Resumen - Teórico 2 - Andrade.pdf` y las clases de teórico (`Fisica 2/Fisica 2/*Teórico*.pdf`, `13-10 … Capacitores`) → `../apuntes/_fuentes/demostraciones-andrade-indice.md`: lista de demostraciones de U1–U9 con archivo y página. Además, contrastar con las deducciones marcadas "desarrollo propio — verificar" en U05–U09.md (confirmada / difiere / no aparece).
- [x] T02 · redactor · Transcribir como imagen los ejercicios de Brandán (`Fisica 2/Fisica 2/Práctico/*.pdf`) → `../apuntes/_fuentes/practico-brandan-limpio.md`, con enunciado, datos, resultado de clase y unidad.
- [x] T03 · operario · Recalcular con Python los resultados de T02 y marcar los que no cierran → `tests/check_brandan.py` + salida en Notas.

## B. Base del sitio
- [x] T04 · sonnet · `package.json` (katex y marked como devDependencies), `build.mjs` (inline de KaTeX con fuentes en base64, shared.css y shared.js, datos JSON), `src/shared.css` (paleta AGA, header de navegación, celular, print) → `node build.mjs` genera 5 HTML vacíos que se pueden navegar offline.
- [x] T05 · sonnet · `src/shared.js`: storage `fis2:`, render KaTeX, barra de IA (ChatGPT, Claude, Gemini con portapapeles), cronómetro con autoentrega, tabla de nota → tests mínimos con assert.
- [x] T06 · operario · Instalar Playwright en el scratchpad y armar `tests/e2e.mjs` base (desktop 1280 / celular 390, consola sin errores, sin `$` crudo, offline, capturas) → que pase sobre los HTML vacíos.

## C. U6–U9 (P2)
- [x] T07 · redactor · `src/data/machete/U06.md` a partir de `apuntes/U06.md`, con el formato del SPEC (fichas de 2 renglones, ¿Qué me piden?, deducciones ⭐ según T01).
- [x] T08 · redactor · Machete U07.
- [x] T09 · redactor · Machete U08.
- [x] T10 · redactor · Machete U09.
- [x] T11 · graficos · Dibujos esquemáticos de U6–U9 (dieléctrico en capacitor, mallas de Kirchhoff, B de un conductor recto, espira, solenoide, barra móvil, RL i(t)) → PNG o SVG en `assets/fig/`.
- [x] T12 · sonnet · `index.html`: Inicio ("Hoy toca"), pestañas del machete y botón PDF → captura en desktop y celular, PDF de prueba.
- [ ] T13 · verificador + profe · Auditar el machete U6–U9 (preguntas 1, 2, 4, 5 y 16) → corregir los NO.
- [ ] T14 · redactor · Preguntas U06 y U07: 25 por unidad, con los 4 tipos y las 3 dificultades, ≥30 % con redacción Andrade → `src/data/preguntas/U06.json`, `U07.json`.
- [ ] T15 · redactor · Preguntas U08 y U09: 25 por unidad.
- [ ] T16 · sonnet · `preguntero.html`: filtros, modos (práctica, ⭐, 🔁), pista, corrección inmediata o al final, IA.
- [ ] T17 · redactor · Tarjetas U6–U9 (~25 por unidad) y hoja en blanco para cada deducción ⭐ con sus puntos clave → `tarjetas/*.json`, `deducciones.json`.
- [ ] T18 · sonnet · `estudio.html`: SRS Leitner de 5 cajas y hoja en blanco con puntaje.
- [ ] T19 · sonnet · Laboratorio, parte 1: núcleo (parser de respuestas, comprobar, procedimiento) + generadores de U6 y U7 + `tests/lab.test.mjs`.
- [ ] T20 · sonnet · Laboratorio, parte 2: generadores de U8 y U9.
- [ ] T21 · profe · Simulacros del P2: 3 teóricos (6×0,5 + 2×1) y 2 prácticos (3 ejercicios + lab, basados en T02) con rúbrica → `simulacros.json`.
- [ ] T22 · sonnet · `parciales.html`: simulacros con cronómetro, Bien / A medias / Mal y nota.
- [ ] T23 · sonnet · Plan de estudio del 14/10 al 03/11 en bloques de 45 min, con checklist e indicador de atrasado, más el recup.
- [ ] T24 · profe + verificador + ecc:e2e-runner + ecc:code-reviewer · **Auditoría U6–U9** (las 18 preguntas con evidencia) → corregir y volver a auditar hasta que no quede ningún NO.
- [ ] T25 · operario · **Publicación parcial** (preguntar antes): `brew install gh`, Gabi hace `gh auth login`, `gh repo create gabibertero/fisica2 --public`, Pages en main/root.

## D. U1–U5 (recuperatorio)
- [ ] T26 · profe · P1 teórico real resuelto (6 preguntas modelo de 2 renglones + desarrollos A y B con dibujo + checklist de por qué salió 0) → `p1.json`.
- [ ] T27 · redactor · Machete U01 y U02 (las figuras ya están en `apuntes/figuras`).
- [ ] T28 · redactor · Machete U03 y U04.
- [ ] T29 · redactor · Machete U05.
- [ ] T30 · redactor · Preguntas U01–U03 (20 por unidad).
- [ ] T31 · redactor · Preguntas U04–U05, tarjetas U1–U5 y deducciones ⭐ (PV=nRT, W isotérmico, Meyer, adiabática, Carnot, E de cargas puntuales, Gauss, dipolo).
- [ ] T32 · sonnet · Generadores de laboratorio U1–U5 con sus tests.
- [ ] T33 · profe · Simulacros del recup: 3 teóricos y 2 prácticos.

## E. Cierre
- [ ] T34 · profe + verificador + e2e + code-reviewer · **Auditoría final**: las 18 preguntas, informe en `AUDITORIA.md`.
- [ ] T35 · operario · README como el de AGA (capturas, badges, tabla de temas, plan, aviso de IA, Claudio 🧉), LICENSE MIT, push.
- [ ] T36 · operario · Notion: fetch del hub de Física II y `update_content` puntual con el link en 🗂️ Otras páginas. `Fisica 2.zip` a `_archivo/` (preguntar antes).

## Notas
- 2026-10-13: Fase 0 + 0.5 + SPEC aprobado. Los apuntes de clase están convertidos en `_fuentes/Fisica_2__*.md`, pero el OCR del manuscrito tiene mucho ruido (por eso T01 y T02 los leen como imagen). El P1 teórico está transcripto en `_fuentes/parciales__P1-teorico-2026-09-29.md`.
- 2026-10-13: Repo creado por Gabi: <https://github.com/gabibertero/Fisica2> (público, vacío). Local: `git init` + `origin` hecho, sin push. T25 queda en: push (preguntar antes) + Pages en main/root. `gh` no está instalado (no hace falta si se pushea con git).
- 2026-10-13 · T01 hecha (redactor; auditó verificador: 2 NO corregidos). `_fuentes/demostraciones-andrade-indice.md`. El "Resumen Teórico 2" es el cuaderno completo U1→U8 (p.35 arranca U10): **U9 (inducción) no tiene ninguna demostración de Andrade** → en T10 marcar todo U9 "verificar con el apunte de clase". Contraste U05–U09: 8 confirmadas, 0 difieren, 20 no aparecen. Errores de la fuente: γ=1,41 (usar 1,40); torque "se anula a 90°" (está mal). Los PDFs escaneados se leen pasándolos a PNG con PyMuPDF (`fitz`), sin pdftoppm.
- Agente `auditor` (despachante) creado en `UTN/.claude/agents/auditor.md`: correrlo al inicio de cada sesión. Asignación: las tareas "sonnet" van a general-purpose (sonnet); en T13 corrige redactor; el README de T35 lo escribe redactor.
- 2026-10-13 · T03: `tests/check_brandan.py` da 40 OK, 1 NO CIERRA y 1 SIN DATOS. E33: la guía divide por T_c; vale P≈184 W, como en el apunte de la clase 4, y no 167,2. E42: sin datos. Además, E36: q4 tiene que ser +12 µC (la guía dice −).
- 2026-10-13 · T04+T06: build OK (auditó code-reviewer, corregidos 2 HIGH y 7 MEDIUM). e2e 10/10 en desktop y celular, offline, con chequeo de que el nav sea visible. Playwright está en el scratchpad (`PW_PATH`), así que en otra sesión hay que reinstalarlo o pasar `PW_PATH`.
- 2026-10-13 · Brandán solo tiene ejercicios de U1–U4: para T21 (práctico del P2) no hay ejercicios de clase de U6–U9.
- 2026-10-13 · T11: `assets/fig/` (+ `INDICE.md` marcador→archivo). Todas las ⭐ tienen figura. Pendientes 4 de U09 (galvanómetro, solenoides coaxiales, volumen u, transformador), ninguna ⭐.
- 2026-10-13 · T02: 42 ejercicios U1–U4 (auditó verificador; corregidas citas de Práctica.pdf, E07, E33, E36 = −12 µC por geometría, E42). check_brandan: 41 OK, E42 sin datos.
- 2026-10-13 · T05: `src/shared.js` ya implementaba las funciones; se ampliaron los asserts para KaTeX, apertura/copia de IA (incluido fallback), y restauración del cronómetro. Pasaron `node tests/shared.test.mjs`, `node build.mjs`, `node tests/e2e.mjs` (10/10) y `python3 tests/check_brandan.py` (41 OK, E42 sin datos).
- 2026-10-13 · T07: creado `src/data/machete/U06.md`, auditado por agente independiente; se completó cita de la dependencia de la capacidad con el material (Andrade p.25). Build y e2e pasan; `tests/check.py` y `tests/lab.test.mjs` todavía no existen. Queda reportada para reconciliar en perfil/rúbrica la discrepancia entre `apuntes/perfil.md` y el índice T01 sobre material Andrade U6; no se modificó `apuntes/`.
- 2026-10-13 · T08: creado/corregido `src/data/machete/U07.md`; auditoría independiente y reauditoría completadas. Corregidas páginas 2R4/Andrade, descarga RC, fuentes en U7-24/U7-25, respuestas breves y esquemas de Ohm/Joule/asociaciones (`assets/fig/U07-*.svg`). Build, shared tests, e2e (10/10), check_brandan (41 OK, E42 sin datos), XML SVG y referencias a figuras pasan; `tests/check.py` y `tests/lab.test.mjs` no existen. Este avance todavía no se volvió a subir a GitHub.
- 2026-10-13 · T09: completado `src/data/machete/U08.md`, auditado y re-auditado de forma independiente. Cobertura de conceptos de peso 3, fichas breves, fórmulas y páginas contrastadas; corrección explícita del error Andrade sobre torque a 90°, definición operacional de B y referencia integral de Biot–Savart. Build, shared tests, e2e (10/10), check_brandan (41 OK, E42 sin datos), referencias de 21 figuras y `git diff --check` pasan. `tests/check.py` y `tests/lab.test.mjs` no existen. Pendiente fuera de alcance: `apuntes/perfil.md` afirma que no hay material Andrade U5–U13, contradicho por T01 (U8, Teórico 2 pp.29–35); se preservó el material original. Cambios locales aún no subidos a GitHub.
- 2026-10-13 · T10: completado `src/data/machete/U09.md` con auditoría independiente y reauditoría aprobada. Corregidas las respuestas de Faraday/Foucault, el balance de fuerza y potencia de la barra, los signos, la definición de inductancia y las citas; incorporados esquemas accesibles para barra, inductancia propia y mutua. Índice de figuras actualizado. Build, shared tests, E2E (10/10), check_brandan (41 OK, E42 sin datos) y `git diff --check` pasan. Avance local aún no subido a GitHub.
- 2026-10-13 · T12: Inicio con resumen “Hoy toca”, pestañas accesibles U6–U9, render de fórmulas/figuras desde los machetes y botón de imprimir la unidad seleccionada. Build y `shared.test.mjs` pasan; E2E 10/10 comprueba tabs, teclado, carga de figuras, capturas desktop/celular y PDF. PDF de prueba: 16 páginas A4, escala de grises, solo U7 seleccionada, con dibujos. `tests/check.py` y `tests/lab.test.mjs` no existen. Cambios locales aún no subidos a GitHub.
- Pendiente de Gabi: fecha del recup, duración de los parciales, puntajes del práctico, P1 práctico (si lo tiene).
