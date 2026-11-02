# diegofo-ui

Librería de **Web Components** accesibles y sin dependencias. 15 etiquetas HTML propias que funcionan en cualquier página.

📖 **Documentación con ejemplos en vivo:** https://diegofdzortega.github.io/diegofo-ui/
📄 Referencia completa de la API: [`docs/COMPONENTES.md`](docs/COMPONENTES.md)

## Instalación

**Con un script** (sin herramientas, funciona abriendo el HTML con doble clic):

```html
<script src="https://cdn.jsdelivr.net/gh/DiegoFdzOrtega/diegofo-ui@main/diegofo-ui/dist/diegofo-ui.min.js"></script>
```

Expone `window.DiegofoUI` con todas las clases (`DfModal`, `DfToastStack`…).

**Como paquete** (Vite, webpack…):

```bash
npm install github:DiegoFdzOrtega/diegofo-ui
# o desde el paquete local
npm install ./paquete/diegofo-ui-2.0.0.tgz
```

```js
import 'diegofo-ui';                    // registra todas las etiquetas
import { DfModal, DfInput } from 'diegofo-ui';
```

## Componentes

| Etiqueta | Para qué sirve |
|---|---|
| `<df-button>` | Botón con variantes, tamaños, carga y envío de formularios |
| `<df-input>` | Campo con etiqueta, ayuda y validación |
| `<df-select>` | Desplegable accesible con búsqueda por letra |
| `<df-switch>` | Interruptor on/off |
| `<df-modal>` | Diálogos + `DfModal.confirm()` / `DfModal.prompt()` |
| `<df-toast-stack>` | Notificaciones flotantes |
| `<df-tooltip>` | Ayuda al pasar el ratón o enfocar |
| `<df-progress>` | Barra de progreso, con modo indeterminado |
| `<df-data-table>` | Tabla con orden, búsqueda y paginación |
| `<df-stat-card>` | Métrica con formato de moneda, número o % |
| `<df-badge>` | Etiqueta de color |
| `<df-avatar>` | Foto o iniciales con estado |
| `<df-tabs>` + `<df-tab-panel>` | Pestañas |
| `<df-theme-toggle>` | Tema claro / oscuro |

## Uso básico

```html
<df-input label="Correo" name="email" type="email" required></df-input>
<df-button variant="success">Guardar</df-button>
```

```js
// Propiedades sincronizadas con los atributos
boton.loading = true;

// Eventos con prefijo df-, datos en event.detail
select.addEventListener('df-change', (e) => console.log(e.detail.value));

// Formularios
if (DfInput.validateAll(form)) enviar(DfInput.collect(form));
```

## Scripts

```bash
npm install          # instala las herramientas de desarrollo
npm test             # pruebas unitarias (Vitest + jsdom)
npm run coverage     # pruebas + informe de cobertura en coverage/
npm run build        # dist/ + types/ + docs/COMPONENTES.md + copia a ../app/lib
npm run docs         # solo regenera la referencia y los tipos
npm run empaquetar   # build + npm pack → paquete/diegofo-ui-2.0.0.tgz
npm run dev          # servidor local en http://localhost:5173
```

## Estructura

```
src/core/df-element.js   clase base: Shadow DOM, propiedades con valor por defecto, eventos
src/components/          un archivo por componente
src/index.js             punto de entrada
test/                    pruebas (una por componente)
docs/                    web de documentación + banco de pruebas
docs/assets/componentes.js  fuente única de la documentación
scripts/                 build (esbuild) y generador de docs/tipos
dist/                    librería empaquetada
types/                   tipos de TypeScript
```

## Cómo crear un componente

```js
import { DfElement } from '../core/df-element.js';

export class DfContador extends DfElement {
  static properties = {
    valor: { type: Number, default: 0 },
    paso: { type: Number, default: 1 },
  };
  static styles = `button { font: inherit; }`;

  template() { return `<button part="button"></button>`; }

  firstRender() {
    this.$('button').addEventListener('click', () => {
      this.valor += this.paso;
      this.emit('df-change', { valor: this.valor });
    });
  }

  update() { this.$('button').textContent = `Pulsado ${this.valor} veces`; }
}
DfContador.define('df-contador');
```

`DfElement` crea los getters/setters de cada propiedad, los enlaza con su atributo (`paso` ↔ `paso="2"`), llama a `update()` cuando cambian y `emit()` lanza eventos que atraviesan el Shadow DOM.

## Herramientas

| Herramienta | Para qué |
|---|---|
| Custom Elements + Shadow DOM | Etiquetas propias con estilos encapsulados, sin frameworks |
| Visual Studio Code + Live Server | Edición con recarga al momento |
| Web de documentación y banco de pruebas (`docs/`) | Diseñar y probar cada componente aislado; los controles se generan desde `static properties` (la idea de Storybook, sin dependencias) |
| DevTools de Chrome / Edge | Inspeccionar el `#shadow-root`, eventos y estilos |
| Vitest + jsdom | Pruebas unitarias simulando el navegador en Node |
| @vitest/coverage-v8 | Cobertura de las pruebas |
| esbuild | Empaquetado en ESM y script minificado |
| TypeScript (solo tipos) | Autocompletado y comprobación para quien use la librería |
| npm (`npm pack`) | Paquete `.tgz` instalable |
| GitHub Actions | Pruebas en cada push y despliegue de la web en GitHub Pages |

Alternativas valoradas: **Lit** (añade una dependencia y oculta cómo funcionan los Web Components), **Storybook** (muy completo pero pesado para 15 componentes) y **Jest** (peor soporte de módulos ES que Vitest).

## Licencia

MIT © Diego Fernández Ortega
