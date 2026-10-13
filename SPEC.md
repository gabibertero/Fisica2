# SPEC — Sitio de estudio Física II (2do parcial + recuperatorio del 1ro)

## Contexto
Gabi (2R5, UTN FRC) rinde dos exámenes con el mismo sitio:
- **P2, mar 03/11/2026**: U6–U9, "aproximadamente" (U6 propiedades eléctricas de la materia, U7 corriente continua, U8 magnetostática, U9 inducción). Faltan 21 días.
- **Recuperatorio P1**: U1–U5, una o dos semanas después del P2 (~10 a 17/11, fecha a confirmar). En el P1 teórico del 29/09 sacó **4+0=4**: 0 en los desarrollos.
- Cada parcial tiene una parte teórica (Andrade) y una práctica (Brandán) que se rinden por separado. La nota final es 50 % teoría y 50 % práctica, pero **cada parte necesita un 6 (≈69/100)**. No se puede llevar formulario.
- Lo que más le cuesta: **deducciones** y **U6–U9**. El tiempo diario varía, así que el plan se arma en bloques de 45 minutos.
- Usó todas las secciones de AGA y de legislación. El repo es **público, solo para Gabi**: puede tener plan personalizado, pero sin nombre, legajo ni la foto del parcial.

## Cómo toma la cátedra (evidencia)
- **Teórico de Andrade** (parcial real del 29/09, `_fuentes/parciales__P1-teorico-2026-09-29.md`):
  - 6 preguntas conceptuales de 0,5 punto, "máximo dos renglones, palabras clave".
  - 2 desarrollos de 1 punto, "solo la lógica matemática + dibujo esquemático".
  - Total 5 puntos (verificar cómo pasa a la escala de 10: el "4+0" podría ser preguntas+desarrollos sobre otra escala).
  - Según Gabi, "toma las demostraciones que vemos en clase".
- **Práctico de Brandán** (apunte de la clase 1 del práctico):
  - 3 o 4 ejercicios "similares a los del aula" y 1 pregunta de laboratorio. Según Gabi, "toma lo que da".
  - Puntajes por ejercicio: sin dato, se marcan "verificar".
- Convenciones (`apuntes/perfil.md`):
  - W es el trabajo **sobre** el gas y Q + W = ΔU. La guía de TP usa el signo opuesto: se avisa en cada lugar donde aparece.
  - T en K; 1 cal = 4,186 J; R = 0,082 / 8,314.

## Fuentes (en orden de prioridad)
1. `apuntes/U01–U09.md` y `U0N-practica.md`. Ya pasaron verificador y profe, así que **no se rehacen, se transforman**. `apuntes/figuras/*.png`, `rubrica.md`, `perfil.md`.
2. Parcial real del P1 + Demostraciones Andrade + Machete práctico.
3. Apuntes de clase recién convertidos (`_fuentes/Fisica_2__*.md`). El OCR del manuscrito tiene mucho ruido, así que se leen **como imagen, página por página**:
   - `Práctico/Práctica.pdf` y las clases 1–5 de práctico: son los ejercicios que da Brandán.
   - Clases 2 y 4 de teórico y la de Capacitores 13-10: son las demostraciones que vio Andrade.
4. `teoria/Resumen - Teórico 2 - Andrade.pdf` (35 págs., escaneado). Se lee como imagen **solo para hacer el índice de demostraciones de U5–U9**, porque en los apuntes de U5–U9 hay deducciones marcadas "desarrollo propio — verificar".
- Lo que no esté en ninguna fuente se marca **"verificar con el apunte de clase"**. Cada dato lleva su fuente (archivo y página).

## Arquitectura (simple, sin frameworks)
AGA usa React y Babel comprimidos. Este sitio **no**: va con vanilla JS y un build mínimo.
```
github/                      → repo gabibertero/fisica2
  index.html                 Inicio + 🗓️ plan + 📘 machete U1–U9 (pestañas por unidad, botón PDF)
  estudio.html               🧠 tarjetas con repetición espaciada + hoja en blanco por deducción
  preguntero.html            ❓ banco 180+
  parciales.html             📄 P1 real resuelto + ⏱️ simulacros (teórico Andrade / práctico Brandán, P2 y recup)
  laboratorio.html           ∑ generador infinito + comprobar + procedimiento
  src/  shared.css  shared.js (storage, KaTeX render, IA, nav, timer)  pages/*.html  data/*.json  lab/*.js
  build.mjs                  inlinea KaTeX (JS+CSS+fuentes woff2 en base64) + shared + data en cada HTML
  tests/ check.py (recalcula números) · lab.test.mjs (generadores contra fórmula independiente) · e2e.mjs (Playwright)
  README.md  LICENSE  SPEC.md  CLAUDE.md  TASKS.md  assets/ (capturas)
```
- **Offline**: cada HTML es autocontenido (KaTeX inline, ~500–700 KB cada uno, igual que AGA). No usa CDN ni fetch.
- **Datos**: los JSON en `src/data/` (`preguntas/U0N.json`, `tarjetas/U0N.json`, `deducciones.json`, `simulacros.json`, `p1.json`) se pueden revisar y diffear.
- **Esquema de pregunta**: `{id,u,tipo:mc|multi|vf|dev,dif:1|2|3,q,ops,a,exp,porQueNo[],pista,modelo,fuente}`.
- **Machete**: se arma en `src/data/machete/U0N.md` (markdown con `$…$`) y `build.mjs` lo pasa con `marked`. `marked` y `katex` son devDependencies; lo que se commitea es el HTML ya armado.
- **localStorage** con try/catch y prefijo `fis2:`:
  - `fis2:pregs {marc,fall,hist}`
  - `fis2:srs {id:{box,due}}`: Leitner de 5 cajas; la que fallás vuelve a la caja 1 y reaparece en la misma sesión.
  - `fis2:plan {dia:[hechos]}`
  - `fis2:sim`, `fis2:lab`, `fis2:ui`
- **IA**: arma el prompt (tema + material del machete + pregunta + mi respuesta), lo copia al portapapeles y abre:
  - `chatgpt.com/?q=`
  - `claude.ai/new?q=`
  - `gemini.google.com/app` (no acepta query, así que se pega).
- **Estilo**: paleta y tipografías de AGA (#f5f2ec / #1d1b18, Instrument Sans + STIX inline en woff2), color por unidad y un header de navegación común. A diferencia de AGA, suma `@media` para celular.
- **PDF**: `@media print` por clases (no por estilos inline, que es el punto débil de AGA), en gris, A4, márgenes espejados, numeración de página, sin botones y con `break-inside: avoid` en cada bloque.

## Secciones (qué tiene cada una)
- **📘 Machete U1–U9**, por unidad:
  - definiciones;
  - fórmulas con el significado de cada término;
  - tarjetas "¿Qué me piden?" (me dan → me piden → entonces);
  - deducciones paso a paso, ⭐ las de Andrade, cada una con su **dibujo esquemático** (lo exige el parcial);
  - gráficos de `apuntes/figuras` o SVG nuevos;
  - errores comunes, frases para justificar y un repaso al final.
  - Además, una ficha **"respuesta de 2 renglones"** para cada concepto preguntable (formato Andrade).
- **🧠 Estudio activo**:
  - tarjetas con repetición espaciada, ~25 por unidad;
  - **hoja en blanco** para cada deducción ⭐: escribís la deducción, después marcás los puntos clave que tenías y te da un puntaje. Es lo que más necesita Gabi.
- **❓ Preguntero, 180+** (~20 por unidad, más en U6–U9):
  - tipos: opción múltiple, varias correctas, V/F con justificación y desarrollo con modelo;
  - filtros por unidad, tipo y dificultad 🟢🟡🔴;
  - modos práctica, ⭐ difíciles y 🔁 mis errores;
  - pista; corrección inmediata o al final;
  - explicación de por qué las otras opciones están mal.
  - Al menos un 30 % imita la redacción de Andrade ("¿Por qué…?", "¿De dónde proviene…?", "¿Cómo es geométricamente…?").
- **📄 Parcial anterior**:
  - el P1 teórico real resuelto, con respuesta modelo en 2 renglones y desarrollos A y B completos con dibujo;
  - un "por qué sacaste 0 en desarrollos": checklist de lo que pide la consigna.
  - El P1 práctico no está: queda marcado como pendiente por si Gabi lo sube.
- **⏱️ Simulacros**:
  - **Teórico**: 6 preguntas × 0,5 + 2 desarrollos × 1, con 60 min supuestos (verificar). Hay 3 para el P2 (U6–U9) y 3 para el recup (U1–U5).
  - **Práctico**: 3 ejercicios + 1 pregunta de laboratorio, armados con los ejercicios de clase de Brandán, con 2 para el P2 y 2 para el recup.
  - Cronómetro con **autoentrega al llegar a 0** (AGA no la tiene).
  - Autocorrección Bien / A medias / Mal, nota sobre 10 y aviso de aprobado si llega a 6.
  - La tabla de puntos a nota va con "6 ≈ 69" según Gabi, marcada verificar.
- **∑ Laboratorio**: ~18 tipos de ejercicio.
  - U1: escalas y dilatación; calorimetría con mezcla o hielo hasta vapor.
  - U2: ecuación de estado; trabajo isotérmico e isobárico.
  - U3: 1er principio; Carnot y heladera.
  - U4: Coulomb; E y V de cargas puntuales.
  - U5: capacitores en serie y paralelo; energía.
  - U6: dieléctrico (C, Q, V, E antes y después).
  - U7: R(T); serie y paralelo; Kirchhoff con 2 mallas; potencia.
  - U8: B de un conductor recto, una espira y un solenoide; radio de una carga en B; fuerza sobre un conductor.
  - U9: barra móvil; bobina rotante; Faraday con ΔΦ/Δt; RL con τ e i(t); energía en la bobina.
  - "Comprobar" acepta fracciones, coma decimal, √, notación científica (`2,5e-3`, `2,5·10^-3`) y una tolerancia relativa del 1 %. Avisa si la unidad o el signo están mal.
  - "Ver procedimiento" va paso a paso y termina con una verificación.
- **🗓️ Plan** (14/10 → 03/11 para el P2; después, ~1,5 semanas para el recup):
  - bloques de 45 min con checklist y un indicador de "atrasado";
  - una lista de "si te atrasás, sacá esto".
  - Al abrir el sitio, el Inicio muestra "**Hoy toca:**" con el primer bloque sin hacer.

## Fase 2 — Construcción (modelo más barato que alcance)
| Trabajo | Agente |
|---|---|
| Copiar figuras, build, capturas, publicar | `operario` (haiku) |
| Índice de demostraciones (Teórico 2 Andrade y apuntes de clase, como imagen) y transcripción de los ejercicios de Brandán | `redactor` (sonnet) |
| Machete por unidad, preguntas, tarjetas, hoja en blanco | `redactor` (sonnet) |
| Simulacros, P1 resuelto, rúbrica de los desarrollos | `profe` (sonnet) |
| SVG o PNG de dibujos esquemáticos (circuitos, B de un conductor, espira, barra móvil) | `graficos` (sonnet) |
| JS: shared, preguntero, simulacro, laboratorio | Sonnet (yo orquesto; te sugiero cambiar a Sonnet para implementar) |
| Fidelidad de cada JSON y de cada .md | `verificador` (haiku) |

**Orden**:
1. Fuentes faltantes (índice de demostraciones y ejercicios de Brandán).
2. Base: shared, build, `index.html` con U6.
3. U6–U9 completo en todas las secciones (es lo urgente, para el 03/11).
4. U1–U5.
5. Publicación.

Se publica algo usable **antes del 20/10** con U6–U9.

## Fase 2.5 — Auditoría
- Después de cada sección y al final, la hace un agente que **no construyó** esa sección:
  - contenido y estilo: `profe` + `verificador`;
  - funcionamiento: `ecc:e2e-runner`;
  - JS: `ecc:code-reviewer`.
- Responde las 18 preguntas con evidencia (archivo:línea, captura o salida de Python). Si alguna da NO, se corrige y se vuelve a auditar.
- `tests/check.py` recalcula todos los números de los JSON y de los ejercicios resueltos.
- `lab.test.mjs` corre 200 veces cada generador y compara contra una fórmula escrita aparte.
- Objetivo de la rúbrica: ≥90.

## Fase 3 — Publicación (pregunto antes de cada paso irreversible)
1. Instalar `gh`: hace falta `brew install gh`, y vos hacés `gh auth login`.
2. `gh repo create gabibertero/fisica2 --public` y activar Pages en main/root.
3. README como el de AGA: capturas, badges, tabla de temas, plan, aviso de IA, Claudio 🧉. Licencia MIT.
4. Notion: fetch del hub de Física II y `update_content` puntual en 🗂️ Otras páginas.
5. Lo que sobra va a `_archivo/`. Ejemplo: `Fisica 2.zip`, que es un duplicado de la carpeta `Fisica 2/` (no se borra nada).

## Verificación
- `node build.mjs`, después `python3 tests/check.py` y `node tests/lab.test.mjs`.
- `tests/e2e.mjs` con Playwright, que se instala en el scratchpad con `npm i playwright`:
  - desktop 1280 y celular 390;
  - 0 errores de consola;
  - ningún `$` ni `\frac` crudo en el texto visible;
  - filtros, timer, SRS, Comprobar(8/3 = 2,666…) y que el progreso siga tras recargar;
  - modo offline (`context.setOffline(true)`);
  - PDF con `page.pdf()`.
- Miro todas las capturas antes de dar algo por terminado.

## Supuestos marcados "verificar"
- Duración de cada parcial.
- Puntaje por ejercicio del práctico.
- Escala exacta de la nota (cómo se pasa de 5 puntos del teórico a 10, y la tabla de "6 ≈ 69").
- Si el P2 llega exactamente hasta U9.
- Fecha del recuperatorio.

## Después de la aprobación
Escribo SPEC.md (este documento), CLAUDE.md (reglas del repo, convenciones de signos, cómo buildear) y TASKS.md (~35 tareas de ~30 min, retomables, cada una con su agente y el criterio de hecho). Arranco por la tarea 1. Al terminar cada tarea recomiendo `/clear`.

## Preguntas de auditoría
Las 18 preguntas de la Fase 2.5. Cada una se responde **SÍ o NO** con la evidencia indicada; sin evidencia pegada cuenta como NO. Una pregunta con NO se corrige y se vuelve a auditar (la audita un agente distinto del que construyó). Los números 1, 2, 4 y 5 son las del machete (T13) y la 16 también aplica al machete.

### Contenido
1. **Fidelidad.** ¿Cada fórmula, valor numérico y enunciado del machete coincide con `apuntes/U0N.md` (o con su fuente en `_fuentes/`), sin cambiar un signo, un exponente ni una unidad? Evidencia: tabla `machete archivo:línea ↔ apunte archivo:línea` para todas las fórmulas de la unidad auditada, y salida de `python3 tests/check.py` sin diferencias.
2. **Fuentes.** ¿Cada dato lleva su fuente (`archivo p.N`) o, si no la tiene, dice "verificar con el apunte de clase", y no hay ningún dato inventado? Evidencia: salida de un `grep` que lista los bloques del machete sin fuente ni marca "verificar" (debe estar vacía), con `archivo:línea`.
3. **Convención de signos.** ¿Todo lugar con W, Q o ΔU usa la convención del profe (W sobre el gas, W = −∫P dV, Q + W = ΔU) y avisa de la opuesta donde aparecen la guía de TP o el Machete? Evidencia: `grep` de `W`/`ΔU` en `src/data/` y `src/pages/` con `archivo:línea` de cada aviso; T en K, 1 cal = 4,186 J y R = 0,082 / 8,314 verificados por `check.py`.
4. **⭐ de Andrade.** ¿Cada deducción que `rubrica.md` marca CLAVE o IMPORTANTE (tipo `demostración`, peso 3) está en el machete con ⭐, paso a paso, solo con la lógica matemática, y con su dibujo esquemático (el parcial lo exige)? Evidencia: lista `ID de rúbrica → archivo:línea de la deducción → archivo del dibujo`, y captura de al menos un dibujo por unidad.
5. **Dos renglones.** ¿Cada concepto preguntable (tipos `definición`, `enunciado`, `interpretación` de peso 3 en `rubrica.md`) tiene su ficha "respuesta de 2 renglones", con palabras clave y sin pasar los 2 renglones renderizados? Evidencia: lista `ID de rúbrica → archivo:línea de la ficha` y captura a 1280 px y a 390 px de una ficha larga.
6. **Sin datos personales.** ¿El repo (HTML de la raíz, `src/`, `assets/`, `tests/`, README) está libre de nombre, legajo y foto del parcial? Evidencia: salida de `git ls-files` más `grep -ril` de nombre y legajo (vacía), y revisión visual de cada imagen de `assets/`.

### Utilidad para el parcial
7. **Cobertura de la rúbrica.** ¿Cada fila de peso 3 de `rubrica.md` de la unidad auditada aparece en el machete y en al menos una tarjeta o pregunta (cobertura ≥ 90 % en U6–U9 y en U1–U5)? Evidencia: tabla `ID de rúbrica → archivo:línea` y el porcentaje calculado.
8. **Preguntero estilo Andrade.** ¿El banco cumple lo del SPEC (180+ preguntas, ~20 por unidad y más en U6–U9, al menos 30 % con la redacción de Andrade, esquema `{id,u,tipo,dif,q,ops,a,exp,porQueNo[],pista,modelo,fuente}` completo y respuesta correcta recalculada)? Evidencia: salida de un script de conteo por unidad, tipo y dificultad, y de `check.py` para las preguntas con números.
9. **Práctico tipo Brandán.** ¿Cada simulacro práctico tiene 3 ejercicios similares a los de clase de Brandán más 1 pregunta de laboratorio, con la fuente (`archivo p.N`) de cada ejercicio base y la resolución paso a paso con resultado numérico recalculado? Evidencia: `archivo:línea` en `simulacros.json`, la fuente de cada ejercicio, y salida de `check.py` sobre ellos.
10. **Simulacro teórico con la estructura real.** ¿Cada simulacro teórico es 6 preguntas × 0,5 + 2 desarrollos × 1 (5 puntos), con las consignas "máximo dos renglones, palabras clave" y "solo la lógica matemática + dibujo esquemático", cronómetro con autoentrega en 0, autocorrección Bien / A medias / Mal y aviso de aprobado en 6, con la escala y la duración marcadas "verificar"? Evidencia: `archivo:línea` de la estructura, y captura de e2e del cronómetro llegando a 0 y entregando solo.
11. **P1 resuelto.** ¿`parciales.html` trae el P1 teórico real con respuestas modelo de 2 renglones, los desarrollos A y B completos con dibujo, el checklist "por qué sacaste 0 en desarrollos", el P1 práctico marcado como pendiente y los desarrollos de Gabi comparados con la rúbrica? Evidencia: captura de las tres secciones y `archivo:línea` de la fuente (`_fuentes/parciales__P1-teorico-2026-09-29.md`).

### Funcionamiento
12. **Offline.** ¿Cada HTML funciona sin red, sin CDN, sin `fetch` y sin recursos externos (salvo los enlaces de IA, que solo se abren al hacer clic)? Evidencia: `grep` de `http` y `fetch` en los HTML generados con solo los enlaces permitidos, y corrida de `tests/e2e.mjs` con `context.setOffline(true)` sin errores de consola.
13. **Celular.** ¿Las 5 páginas se usan a 390 px: sin scroll horizontal, fórmulas que no se cortan, botones y casillas tocables (≥ 44 px) y navegación común accesible? Evidencia: capturas de las 5 páginas a 390 px, y el chequeo de `scrollWidth <= innerWidth` de `e2e.mjs`.
14. **KaTeX.** ¿En ninguna página queda un `$`, `\frac` u otro comando crudo en el texto visible, ni errores de KaTeX en consola, a 1280 px y a 390 px? Evidencia: salida de `e2e.mjs` con el recorrido del texto visible de cada página y 0 errores de consola.
15. **localStorage.** ¿Todo acceso a `localStorage` usa try/catch y el prefijo `fis2:`, la página funciona con el almacenamiento bloqueado, y el progreso (preguntero, SRS, plan, simulacros, laboratorio) sigue tras recargar? Evidencia: `grep` de `localStorage` en `src/` con `archivo:línea` de cada uso, y salida de `e2e.mjs` con recarga.
16. **Print y PDF.** ¿El machete (y las hojas que se imprimen) sale en A4, en gris, con márgenes espejados y numeración, sin botones ni navegación, con `break-inside: avoid` en cada bloque, y sin fórmulas ni dibujos cortados entre páginas? Evidencia: PDF generado con `page.pdf()` y captura de al menos 3 páginas (una por tipo de bloque: fórmula, deducción con dibujo, ficha de 2 renglones), y `archivo:línea` del `@media print`.
17. **Tests verdes.** ¿Pasan `python3 tests/check.py`, `node tests/lab.test.mjs` (200 corridas por generador contra la fórmula independiente) y `node tests/e2e.mjs`, y el laboratorio acepta Comprobar(8/3 = 2,666…), coma decimal, √ y notación científica y avisa unidad o signo mal? Evidencia: salida completa de los tres comandos con código de salida 0, hecha después de `node build.mjs` y con los HTML de la raíz regenerados.
18. **Accesibilidad.** ¿Hay contraste suficiente (≥ 4,5:1 en texto), foco visible, uso completo con teclado (pestañas, tarjetas, preguntero, cronómetro), `alt` o descripción en cada dibujo, etiquetas en inputs y botones, y el color nunca es la única señal (🟢🟡🔴 y Bien / A medias / Mal llevan texto)? Evidencia: reporte de Lighthouse o axe por página, y captura con el foco visible.
