# fisica2 — sitio de estudio Física II (P2 03/11 + recup P1)

Spec completo: `SPEC.md`. Tareas: `TASKS.md` (una por sesión; al terminar, marcarla `[x]`, anotar en "Notas" qué quedó y recomendar `/clear`).

## Rutas
- Material: `../apuntes/` (U01–U09.md ya verificados = fuente principal, NO rehacer), `../apuntes/_fuentes/INDICE.md` (PDFs convertidos), `../apuntes/figuras/`, `../apuntes/perfil.md`, `../apuntes/rubrica.md`.
- Nunca modificar ni borrar el material original de la materia. Lo que sobre va a `../_archivo/`.
- No cargar PDFs enteros: leer el .md de `_fuentes/`; manuscritos y escaneados, como imagen solo las páginas necesarias.

## Reglas de contenido
- Cada dato con fuente (`archivo p.N`). Sin fuente → "verificar con el apunte de clase". No inventar.
- Convención del profe: W = trabajo SOBRE el gas, W = −∫P dV, Q + W = ΔU. La guía de TP/Machete usa la opuesta: avisarlo donde aparezca.
- T en K (K = °C + 273,15) · 1 cal = 4,186 J · R = 0,082 atm·L/mol·K = 8,314 J/mol·K · γ biatómico 1,40.
- Teórico (Andrade): respuestas de máx. 2 renglones con palabras clave; desarrollos = solo lógica matemática + dibujo esquemático.
- Práctico (Brandán): ejercicios similares a los de clase + 1 pregunta de laboratorio.
- Sin datos personales (nombre, legajo, foto del parcial): el repo es público.
- Español rioplatense.

## Código
- Vanilla JS, sin frameworks. Código compartido en `src/shared.js` y `src/shared.css`. Cada página está en `src/pages/*.html` y sus datos en `src/data/`.
- `node build.mjs` genera los HTML autocontenidos en la raíz (KaTeX inline, offline). Nunca editar los HTML de la raíz a mano.
- localStorage siempre con try/catch y prefijo `fis2:`.
- Antes de cerrar una tarea, correr `python3 tests/check.py`, `node tests/lab.test.mjs` y `node tests/e2e.mjs` (si ya existen) y mirar las capturas.

## Agentes
- `operario`: archivos, build y publicación.
- `redactor`: machete, preguntas y tarjetas.
- `profe`: simulacros y auditoría.
- `graficos`: dibujos.
- `verificador`: fidelidad.
- `ecc:code-reviewer` y `ecc:e2e-runner`: el JS.
- Audita siempre un agente distinto del que construyó.
