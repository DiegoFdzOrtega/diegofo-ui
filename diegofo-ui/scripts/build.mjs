/**
 * Empaqueta la librería con esbuild:
 *  - dist/diegofo-ui.esm.js  → módulo ES (import { DfModal } from 'diegofo-ui')
 *  - dist/diegofo-ui.min.js  → script clásico minificado (<script src="...">), expone window.DiegofoUI
 *
 * Además:
 *  - genera docs/COMPONENTES.md y types/diegofo-ui.d.ts (scripts/docs.mjs),
 *  - escribe docs/assets/meta.js con la versión y el tamaño (lo muestra la web),
 *  - copia el .min.js a la app de ejemplo (../app/lib).
 */
import { build } from 'esbuild';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const banner = { js: `/*! diegofo-ui v${pkg.version} · ${pkg.author} · ${pkg.license} */` };
const common = { entryPoints: ['src/index.js'], bundle: true, target: 'es2022', banner, logLevel: 'info' };

await build({ ...common, format: 'esm', outfile: 'dist/diegofo-ui.esm.js', sourcemap: true });
await build({ ...common, format: 'iife', globalName: 'DiegofoUI', minify: true, outfile: 'dist/diegofo-ui.min.js', sourcemap: true });

const min = await readFile('dist/diegofo-ui.min.js');
const meta = {
  version: pkg.version,
  minKB: +(min.length / 1024).toFixed(1),
  gzipKB: +(gzipSync(min, { level: 9 }).length / 1024).toFixed(1),
  // número de pruebas (cuenta las llamadas a it( en test/)
  tests: readdirSync('test').filter((f) => f.endsWith('.test.js'))
    .reduce((n, f) => n + (readFileSync(`test/${f}`, 'utf8').match(/^\s*it\(/gm) ?? []).length, 0),
};
await writeFile('docs/assets/meta.js', `// Generado por scripts/build.mjs\nwindow.DF_META = ${JSON.stringify(meta)};\n`);
console.log(`  tamaño: ${meta.minKB} KB minificado · ${meta.gzipKB} KB gzip · ${meta.tests} pruebas`);

await import('./docs.mjs');

if (existsSync('../app')) {
  await mkdir('../app/lib', { recursive: true });
  await copyFile('dist/diegofo-ui.min.js', '../app/lib/diegofo-ui.min.js');
  console.log('  → copiado a ../app/lib/diegofo-ui.min.js');
}
