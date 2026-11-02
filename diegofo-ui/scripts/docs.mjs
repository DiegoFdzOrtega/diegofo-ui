/**
 * Genera, a partir de las clases (static properties) y de docs/assets/componentes.js:
 *   - docs/COMPONENTES.md      → referencia de la API en Markdown
 *   - types/diegofo-ui.d.ts    → tipos de TypeScript (autocompletado en VS Code)
 *
 * Se ejecuta con `npm run docs` (y automáticamente en `npm run build`).
 */
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Entorno mínimo para poder importar los componentes en Node (solo leemos sus metadatos estáticos).
globalThis.HTMLElement ??= class {};
const registro = new Map();
globalThis.customElements ??= { get: (t) => registro.get(t), define: (t, c) => registro.set(t, c) };

const lib = await import(pathToFileURL(path.join(raiz, 'src/index.js')).href);
await import(pathToFileURL(path.join(raiz, 'docs/assets/componentes.js')).href);
const { categorias, componentes } = globalThis.DF_DOCS;
const pkg = JSON.parse(await readFile(path.join(raiz, 'package.json'), 'utf8'));

const kebab = (n) => n.replace(/[A-Z]/g, (l) => `-${l.toLowerCase()}`);
const tipoTs = (def, opciones) => {
  if (opciones?.length) return opciones.map((o) => `'${o}'`).join(' | ');
  return def.type === Boolean ? 'boolean' : def.type === Number ? 'number' : 'string';
};
const celda = (t) => String(t ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** Propiedades de un componente combinando la clase y la documentación. */
function propiedades(c) {
  const clase = customElements.get(c.tag);
  return Object.entries(clase.properties).map(([nombre, def]) => ({
    nombre,
    atributo: def.attribute ?? kebab(nombre),
    tipo: tipoTs(def, c.opciones?.[nombre]),
    porDefecto: JSON.stringify(def.default),
    desc: c.props?.[nombre] ?? '',
  }));
}

// ─────────────────────────────── Markdown
let md = `# Referencia de componentes · diegofo-ui v${pkg.version}

> Archivo generado con \`npm run docs\` a partir del código. No lo edites a mano.

Cada propiedad se puede usar como **atributo HTML** (kebab-case) o como **propiedad JavaScript** (camelCase); están sincronizadas.
Los eventos son \`CustomEvent\` que burbujean y atraviesan el Shadow DOM; los datos van en \`event.detail\`.

`;
for (const cat of categorias) {
  md += `- **${cat}:** ${componentes.filter((c) => c.categoria === cat).map((c) => `[\`<${c.tag}>\`](#${c.tag})`).join(', ')}\n`;
}
for (const c of componentes) {
  md += `\n---\n\n## ${c.tag}\n\n${c.resumen} ${c.descripcion}\n\n\`\`\`html\n${c.ejemplos[0].html}\n\`\`\`\n`;
  md += `\n### Propiedades\n\n| Propiedad | Atributo | Tipo | Por defecto | Descripción |\n|---|---|---|---|---|\n`;
  for (const p of propiedades(c)) md += `| \`${p.nombre}\` | \`${p.atributo}\` | \`${celda(p.tipo)}\` | \`${p.porDefecto}\` | ${celda(p.desc)} |\n`;
  for (const p of c.propsExtra ?? []) md += `| \`${p.nombre}\` | — (solo JS) | \`${celda(p.tipo)}\` | | ${celda(p.desc)} |\n`;
  if (c.eventos?.length) {
    md += `\n### Eventos\n\n| Evento | \`detail\` | Cuándo |\n|---|---|---|\n`;
    for (const e of c.eventos) md += `| \`${e.nombre}\` | \`${celda(e.detalle)}\` | ${celda(e.cuando)} |\n`;
  }
  if (c.metodos?.length) {
    md += `\n### Métodos\n\n| Método | Descripción |\n|---|---|\n`;
    for (const m of c.metodos) md += `| \`${celda(m.firma)}\` | ${celda(m.desc)} |\n`;
  }
  if (c.slots?.length) md += `\n**Slots:** ${c.slots.map((s) => `\`${s.nombre}\` (${s.desc})`).join(', ')}\n`;
  if (c.partes?.length) md += `\n**Partes CSS (\`::part\`):** ${c.partes.map((s) => `\`${s.nombre}\` (${s.desc})`).join(', ')}\n`;
  if (c.cssVars?.length) md += `\n**Variables CSS:** ${c.cssVars.map((v) => `\`${v}\``).join(', ')}\n`;
  if (c.a11y?.length) md += `\n**Accesibilidad:**\n\n${c.a11y.map((a) => `- ${a}`).join('\n')}\n`;
}
md += `\n---\n\n## Temas\n\nLos componentes leen variables CSS de la página: \`--bg-navbar\`, \`--bg-card\`, \`--bg-input\`, \`--border-color\`, \`--text-main\`, \`--text-muted\`, \`--accent-teal\`, \`--accent-blue\`… (las de la interfaz diegofo-ui). Para cambiar solo el color principal de los componentes usa \`--df-color-primary\` y \`--df-color-secondary\`. Para retocar piezas internas, \`::part()\`.\n`;
await writeFile(path.join(raiz, 'docs/COMPONENTES.md'), md);

// ─────────────────────────────── Tipos TypeScript
let ts = `// Tipos de diegofo-ui v${pkg.version}. Generado con \`npm run docs\`: no editar a mano.

export declare const VERSION: string;
export declare const TAGS: string[];

export declare class DfElement extends HTMLElement {
  static properties: Record<string, { type: StringConstructor | NumberConstructor | BooleanConstructor; default: unknown; attribute?: string }>;
  static define(tagName: string): typeof DfElement;
  emit(name: string, detail?: object, options?: { cancelable?: boolean }): boolean;
}

export declare function escapeHtml(value: unknown): string;
export declare function validateValue(value: string, rules?: { required?: boolean; type?: string; pattern?: string; minlength?: number; errorMessage?: string }): { valid: boolean; message: string };
export declare function formatValue(value: string | number, format?: 'text' | 'number' | 'currency' | 'percent', currency?: string): string;
export declare function queryRows<T extends object>(rows: T[], opts?: { query?: string; keys?: string[]; sortKey?: string; sortDir?: 'asc' | 'desc'; page?: number; pageSize?: number }): { rows: T[]; total: number; pages: number; page: number };
export declare function initials(name: string): string;
export declare function colorFor(name: string): string;
export declare const BADGE_COLORS: string[];
`;
const eventosMap = new Map(); // mismo evento en varios componentes → unión de tipos
const clasesTs = [...componentes.map((c) => ({ ...c })), { tag: 'df-tab-panel', clase: 'DfTabPanel', props: {}, metodos: [], eventos: [] }];
for (const c of clasesTs) {
  const clase = customElements.get(c.tag);
  ts += `\n/** ${c.resumen ?? 'Panel de un <df-tabs>.'} */\nexport declare class ${c.clase} extends DfElement {\n`;
  for (const [nombre, def] of Object.entries(clase.properties)) {
    const desc = c.props?.[nombre];
    if (desc) ts += `  /** ${desc} Por defecto \`${JSON.stringify(def.default)}\`. */\n`;
    ts += `  ${nombre}: ${tipoTs(def, c.opciones?.[nombre])};\n`;
  }
  for (const p of c.propsExtra ?? []) ts += `  /** ${p.desc} */\n  ${p.nombre}: ${p.tipo.replace(/\(row\)/g, '(row: any)')};\n`;
  for (const m of c.metodos ?? []) {
    const firma = m.firma.replace(/\(row\)/g, '(row: any)');
    ts += `  /** ${m.desc} */\n  ${firma};\n`;
  }
  ts += `}\n`;
  for (const e of c.eventos ?? []) {
    const lista = eventosMap.get(e.nombre) ?? new Set();
    lista.add(e.detalle === '{}' ? 'Record<string, never>' : e.detalle);
    eventosMap.set(e.nombre, lista);
  }
}
ts += `
declare global {
  interface HTMLElementTagNameMap {
${clasesTs.map((c) => `    '${c.tag}': ${c.clase};`).join('\n')}
  }
  interface HTMLElementEventMap {
${[...eventosMap].map(([n, tipos]) => `    '${n}': CustomEvent<${[...tipos].join(' | ')}>;`).join('\n')}
  }
  interface Window {
    DiegofoUI: typeof import('./diegofo-ui');
  }
}
`;
await mkdir(path.join(raiz, 'types'), { recursive: true });
await writeFile(path.join(raiz, 'types/diegofo-ui.d.ts'), ts);

console.log(`  docs/COMPONENTES.md y types/diegofo-ui.d.ts generados (${componentes.length} componentes, ${lib.TAGS.length} etiquetas)`);
