/* Web de documentación de diegofo-ui.
   Pequeña SPA con rutas por hash (funciona abriendo el archivo directamente y en GitHub Pages). */
(() => {
  const { DfModal, DfToastStack, DfInput, VERSION, TAGS } = window.DiegofoUI;
  const { categorias, componentes } = window.DF_DOCS;
  const META = window.DF_META ?? { version: VERSION, gzipKB: 17, tests: 150 };
  const porTag = Object.fromEntries(componentes.map((c) => [c.tag, c]));
  const main = document.getElementById('contenido');
  const marco = document.getElementById('marco');
  const CDN = `https://cdn.jsdelivr.net/gh/DiegoFdzOrtega/diegofo-ui@main/diegofo-ui/dist/diegofo-ui.min.js`;

  document.getElementById('version').textContent = `v${VERSION}`;

  // ───────────────────────── utilidades
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const kebab = (n) => n.replace(/[A-Z]/g, (l) => `-${l.toLowerCase()}`);

  /** Resaltado mínimo de HTML y JavaScript (sin dependencias). */
  function resaltar(codigo, lenguaje) {
    let s = esc(codigo);
    if (lenguaje === 'html') {
      s = s.replace(/(&lt;\/?)([\w-]+)([\s\S]*?)(\/?&gt;)/g, (_, a, tag, attrs, b) => {
        const at = attrs.replace(/([\w-]+)(=)(&quot;[\s\S]*?&quot;)/g, '<span class="tk-attr">$1</span>$2<span class="tk-str">$3</span>')
          .replace(/(\s)([\w-]+)(?=\s|$)/g, '$1<span class="tk-attr">$2</span>');
        return `<span class="tk-tag">${a}${tag}</span>${at}<span class="tk-tag">${b}</span>`;
      });
    } else {
      const trozos = [];
      s = s.replace(/(\/\/[^\n]*)|('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|&quot;(?:[^&]|&(?!quot;))*&quot;)/g, (m, com) => {
        trozos.push(com ? `<span class="tk-com">${m}</span>` : `<span class="tk-str">${m}</span>`);
        return `\u0000${trozos.length - 1}\u0000`;
      });
      s = s.replace(/\b(const|let|await|async|new|return|if|else|true|false|null|import|from|export|document|setTimeout|setInterval|clearInterval)\b/g, '<span class="tk-kw">$1</span>');
      s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => trozos[i]);
    }
    return s;
  }

  function bloqueCodigo(codigo, lenguaje) {
    return `<div class="codigo"><button class="copiar" type="button">Copiar</button><pre><code>${resaltar(codigo, lenguaje)}</code></pre></div>`;
  }

  // Botones "Copiar" (delegación).
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copiar');
    if (!btn) return;
    const texto = btn.parentElement.querySelector('pre').textContent;
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const area = document.createElement('textarea');
      area.value = texto;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    btn.textContent = 'Copiado';
    setTimeout(() => { btn.textContent = 'Copiar'; }, 1400);
  });

  /** Ejecuta el script de un ejemplo con acceso a la librería. */
  function ejecutar(script) {
    if (!script) return;
    try {
      new Function('DfModal', 'DfToastStack', 'DfInput', script)(DfModal, DfToastStack, DfInput);
    } catch (err) {
      console.error('Error en el ejemplo:', err);
    }
  }

  // ───────────────────────── menú lateral
  const menu = document.getElementById('menu');
  const buscar = document.getElementById('buscar');
  function pintarMenu(filtro = '') {
    const f = filtro.trim().toLowerCase();
    const ruta = location.hash;
    const base = ruta.startsWith('#/banco') ? '#/banco/' : '#/c/';
    let html = '';
    for (const cat of categorias) {
      const lista = componentes.filter((c) => c.categoria === cat && (c.tag.includes(f) || c.resumen.toLowerCase().includes(f)));
      if (!lista.length) continue;
      html += `<div class="menu-grupo"><h2>${esc(cat)}</h2>${lista.map((c) => {
        const href = base + c.tag;
        const actual = ruta === href || (ruta === '#/banco' && c.tag === 'df-button' && base === '#/banco/');
        return `<a href="${href}"${actual ? ' aria-current="page"' : ''}>&lt;${c.tag}&gt;</a>`;
      }).join('')}</div>`;
    }
    menu.innerHTML = html || '<p class="menu-vacio">Ningún componente coincide.</p>';
  }
  buscar.addEventListener('input', () => pintarMenu(buscar.value));

  // ───────────────────────── páginas
  function portada() {
    marco.classList.add('sin-lateral');
    const grupos = categorias.map((cat) => {
      const piezas = componentes.filter((c) => c.categoria === cat).map((c) => `
        <a class="pieza" href="#/c/${c.tag}">
          <div class="pieza-vista" aria-hidden="true">${miniatura(c.tag)}</div>
          <div class="pieza-texto"><strong>&lt;${c.tag}&gt;</strong><p>${esc(c.resumen)}</p></div>
        </a>`).join('');
      return `<div class="catalogo-grupo"><h3>${esc(cat)}</h3><div class="catalogo">${piezas}</div></div>`;
    }).join('');

    main.innerHTML = `
      <section class="hero">
        <div class="hero-in">
          <div>
            <h1>Componentes web que funcionan en cualquier página.</h1>
            <p class="hero-sub">${TAGS.length} etiquetas HTML propias, accesibles con teclado y con tema oscuro. Sin frameworks ni dependencias: un solo archivo de ${META.gzipKB} KB.</p>
            <div class="acciones">
              <a href="#/empezar"><df-button size="lg">Empezar</df-button></a>
              <a href="#/c/df-button"><df-button size="lg" variant="secondary" class="btn-claro">Ver componentes</df-button></a>
            </div>
            <div class="hero-instalar">${bloqueCodigo(`<script src="${CDN}"></script>`, 'html')}</div>
          </div>

          <div class="panel" id="panel-demo">
            <span class="panel-pestana">Panel hecho con diegofo-ui · pruébalo</span>
            <div class="panel-cab">
              <df-avatar name="Diego Fernández" status="online"></df-avatar>
              <div class="quien"><strong>Diego Fernández</strong><span>Tienda online · noviembre</span></div>
              <df-badge color="green" variant="soft" dot id="demo-estado">Abierta</df-badge>
            </div>
            <df-tabs variant="pill" id="demo-tabs">
              <df-tab-panel label="Resumen">
                <div class="panel-stats">
                  <df-stat-card label="Ventas" value="12480.5" format="currency" variant="success" hint="+18 % que octubre"></df-stat-card>
                  <df-stat-card label="Pedidos" value="342" format="number" interactive id="demo-pedidos" hint="Pulsa para ver detalle"></df-stat-card>
                </div>
                <df-progress label="Objetivo del mes" value="78" show-value></df-progress>
              </df-tab-panel>
              <df-tab-panel label="Ajustes">
                <div class="panel-fila">
                  <df-select label="Envío por defecto" value="std" id="demo-envio">
                    <option value="std">Estándar · 48 h</option>
                    <option value="exp">Exprés · 24 h</option>
                    <option value="rec">Recogida en tienda</option>
                  </df-select>
                </div>
                <div class="panel-fila"><df-switch label="Tienda abierta" checked id="demo-abierta"></df-switch></div>
              </df-tab-panel>
            </df-tabs>
            <div class="panel-pie">
              <df-tooltip text="Se pedirá confirmación"><df-button variant="danger" shape="rounded" size="sm" id="demo-borrar">Vaciar carrito</df-button></df-tooltip>
              <df-button shape="rounded" size="sm" id="demo-nuevo">Nuevo producto</df-button>
            </div>
          </div>
        </div>
      </section>

      <section class="seccion" aria-labelledby="t-catalogo">
        <h2 id="t-catalogo">Catálogo</h2>
        <p>Cada pieza es una etiqueta que se usa como cualquier otra de HTML. Abre una para ver ejemplos, su API completa y cómo se maneja con teclado.</p>
        ${grupos}
      </section>

      <section class="seccion" aria-labelledby="t-razones">
        <h2 id="t-razones">Pensada para usarse de verdad</h2>
        <div class="razones">
          <div class="razon"><div class="cifra">${META.gzipKB} KB</div><h3>Ligera y sin dependencias</h3><p>JavaScript estándar del navegador: Custom Elements y Shadow DOM. Funciona en HTML plano, en React, en Vue o en una app de escritorio con WebView.</p></div>
          <div class="razon"><div class="cifra">${META.tests}</div><h3>Pruebas automáticas</h3><p>Cada componente tiene sus pruebas con Vitest: valores por defecto, eventos, teclado y casos límite. Se ejecutan en cada cambio con GitHub Actions.</p></div>
          <div class="razon"><div class="cifra">${TAGS.length}/${TAGS.length}</div><h3>Usables con teclado</h3><p>Todo se puede usar con teclado y lector de pantalla: roles ARIA, foco visible, foco atrapado en los modales y navegación con flechas en pestañas y desplegables.</p></div>
        </div>
      </section>

      <section class="seccion empezar" aria-labelledby="t-empezar">
        <div>
          <h2 id="t-empezar">Empieza en un minuto</h2>
          <p style="color:var(--text-muted);margin-top:10px">Añade el script, escribe la etiqueta y escucha sus eventos. Si usas TypeScript, el paquete trae los tipos.</p>
          <div class="acciones"><a href="#/empezar"><df-button variant="secondary">Leer la guía</df-button></a></div>
        </div>
        <div class="codigo-solo">${bloqueCodigo(`<df-button id="guardar">Guardar</df-button>

<script>
  const { DfModal, DfToastStack } = window.DiegofoUI;

  document.getElementById('guardar').addEventListener('df-click', async () => {
    if (await DfModal.confirm({ message: '¿Guardar los cambios?' })) {
      DfToastStack.notify('Cambios guardados', 'success');
    }
  });
</script>`, 'html')}</div>
      </section>
      ${pie()}`;

    // Interacciones del panel de la portada.
    const $ = (id) => document.getElementById(id);
    $('demo-pedidos').addEventListener('df-select', () => DfToastStack.notify('342 pedidos: 296 enviados, 46 pendientes', 'info'));
    $('demo-abierta').addEventListener('df-change', (e) => {
      const b = $('demo-estado');
      b.textContent = e.detail.checked ? 'Abierta' : 'Cerrada';
      b.color = e.detail.checked ? 'green' : 'red';
      DfToastStack.notify(e.detail.checked ? 'Tienda abierta' : 'Tienda cerrada', e.detail.checked ? 'success' : 'warning');
    });
    $('demo-envio').addEventListener('df-change', (e) => DfToastStack.notify(`Envío por defecto: ${e.detail.label}`, 'info'));
    $('demo-borrar').addEventListener('df-click', async () => {
      const ok = await DfModal.confirm({ heading: 'Vaciar carrito', message: 'Se quitarán los 3 productos del carrito.', confirmText: 'Vaciar', variant: 'danger' });
      if (ok) DfToastStack.notify('Carrito vaciado', 'success');
    });
    $('demo-nuevo').addEventListener('df-click', async () => {
      const datos = await DfModal.prompt({
        heading: 'Nuevo producto',
        fields: [
          { name: 'nombre', label: 'Nombre', required: true, placeholder: 'Taza de cerámica' },
          { name: 'precio', label: 'Precio (€)', type: 'number', required: true },
          { name: 'categoria', label: 'Categoría', type: 'select', value: 'hogar', options: [{ value: 'hogar', label: 'Hogar' }, { value: 'regalo', label: 'Regalo' }] },
        ],
      });
      if (datos) DfToastStack.notify(`"${datos.nombre}" creado a ${datos.precio} €`, 'success');
    });
  }

  /** Vista pequeña de cada componente para el catálogo de la portada. */
  function miniatura(tag) {
    const m = {
      'df-button': '<df-button size="sm">Guardar</df-button><df-button size="sm" variant="ghost" shape="rounded">Cancelar</df-button>',
      'df-input': '<df-input label="Correo" placeholder="ana@ejemplo.com" style="width:200px"></df-input>',
      'df-select': '<df-select label="Tipo" value="c" style="width:200px"><option value="c">Cliente</option></df-select>',
      'df-switch': '<df-switch label="Avisos" checked></df-switch>',
      'df-modal': '<div style="background:var(--bg-card);border:1px solid var(--border-color);border-top:3px solid var(--petroleo-2);border-radius:8px;padding:10px 14px;font-size:.78rem;width:190px;box-shadow:0 8px 20px -10px rgba(0,0,0,.3)"><strong>¿Eliminar?</strong><div style="display:flex;gap:6px;justify-content:flex-end;margin-top:10px"><df-button size="sm" variant="ghost" shape="rounded">No</df-button><df-button size="sm" variant="danger" shape="rounded">Sí</df-button></div></div>',
      'df-toast-stack': '<div style="display:flex;align-items:center;gap:8px;background:var(--bg-card);border:1px solid var(--border-color);border-left:4px solid var(--accent-green);border-radius:8px;padding:8px 12px;font-size:.78rem;box-shadow:0 8px 20px -10px rgba(0,0,0,.3)"><span style="width:18px;height:18px;border-radius:50%;background:var(--accent-green);color:#fff;display:grid;place-items:center;font-size:.65rem;font-weight:800">✓</span>Cambios guardados</div>',
      'df-tooltip': '<div style="display:flex;flex-direction:column;align-items:center;gap:6px"><span style="background:#0f172a;color:#f8fafc;font-size:.72rem;padding:4px 8px;border-radius:5px">Exportar CSV</span><df-button size="sm" variant="ghost" shape="rounded">CSV</df-button></div>',
      'df-progress': '<df-progress label="Subiendo" value="64" show-value style="width:210px"></df-progress>',
      'df-data-table': '<div style="font-size:.72rem;width:220px;border:1px solid var(--border-color);border-radius:6px;overflow:hidden;background:var(--bg-card)"><div style="display:flex;justify-content:space-between;padding:5px 8px;background:var(--bg-input);font-weight:700;color:var(--text-muted)"><span>Nombre ▲</span><span>Importe</span></div><div style="display:flex;justify-content:space-between;padding:5px 8px;border-top:1px solid var(--border-color)"><span>Ana Gómez</span><span>1.240 €</span></div><div style="display:flex;justify-content:space-between;padding:5px 8px;border-top:1px solid var(--border-color)"><span>Lucía Ruiz</span><span>2.050 €</span></div></div>',
      'df-stat-card': '<df-stat-card label="Ventas" value="12480" format="currency" variant="success" style="width:190px"></df-stat-card>',
      'df-badge': '<df-badge color="green" variant="soft" dot>Activo</df-badge><df-badge color="blue">Cliente</df-badge><df-badge color="orange" variant="outline">Pendiente</df-badge>',
      'df-avatar': '<df-avatar name="Diego Fernández" status="online"></df-avatar><df-avatar name="Ana Gómez"></df-avatar><df-avatar name="Sodire Tech" shape="square"></df-avatar>',
      'df-tabs': '<df-tabs variant="pill"><df-tab-panel label="Semana"></df-tab-panel><df-tab-panel label="Mes"></df-tab-panel><df-tab-panel label="Año"></df-tab-panel></df-tabs>',
      'df-theme-toggle': '<span style="display:inline-flex;gap:8px"><span style="width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--bg-card);border:1px solid var(--border-color)">☀</span><span style="width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#13262c;color:#e6f0f2">☾</span></span>',
    };
    return m[tag] ?? '';
  }

  function pie() {
    return `<footer class="pie"><span>Diseñada y programada por Diego Fernández Ortega · Licencia MIT</span><span><a href="https://github.com/DiegoFdzOrtega/diegofo-ui">Código en GitHub</a> · <a href="../../app/index.html">App de ejemplo</a></span></footer>`;
  }

  function guia() {
    marco.classList.remove('sin-lateral');
    main.innerHTML = `<article class="doc">
      <h1>Guía de inicio</h1>
      <p class="lead">diegofo-ui son etiquetas HTML nuevas. No hay que compilar nada: se cargan con un script y se usan como un &lt;button&gt; o un &lt;input&gt;.</p>
      <ol class="pasos">
        <li><h3>Carga la librería</h3>
          <p>Con un script clásico (funciona abriendo el HTML con doble clic):</p>
          <div class="codigo-solo">${bloqueCodigo(`<script src="${CDN}"></script>\n<!-- o una copia local -->\n<script src="dist/diegofo-ui.min.js"></script>`, 'html')}</div>
          <p style="margin-top:12px">O como paquete, si usas un empaquetador (Vite, webpack…):</p>
          <div class="codigo-solo">${bloqueCodigo(`npm install github:DiegoFdzOrtega/diegofo-ui\n\nimport 'diegofo-ui';                       // registra todas las etiquetas\nimport { DfModal } from 'diegofo-ui';      // y además da acceso a las clases`, 'js')}</div>
        </li>
        <li><h3>Escribe las etiquetas</h3>
          <p>Configúralas con atributos, como cualquier elemento HTML. Todos tienen valores por defecto razonables.</p>
          <div class="codigo-solo">${bloqueCodigo(`<df-input label="Correo" type="email" required></df-input>\n<df-select label="Tipo">\n  <option value="cliente">Cliente</option>\n  <option value="proveedor">Proveedor</option>\n</df-select>\n<df-button variant="success">Guardar</df-button>`, 'html')}</div>
        </li>
        <li><h3>Escucha sus eventos</h3>
          <p>Todos los eventos empiezan por <code>df-</code>, burbujean y llevan sus datos en <code>event.detail</code>.</p>
          <div class="codigo-solo">${bloqueCodigo(`document.querySelector('df-select').addEventListener('df-change', (e) => {\n  console.log(e.detail.value, e.detail.label);\n});`, 'js')}</div>
        </li>
        <li><h3>Cambia propiedades desde JavaScript</h3>
          <p>Cada atributo tiene su propiedad (en camelCase) y están sincronizados.</p>
          <div class="codigo-solo">${bloqueCodigo(`const boton = document.querySelector('df-button');\nboton.loading = true;          // equivale a <df-button loading>\nboton.variant = 'danger';      // equivale a variant="danger"`, 'js')}</div>
        </li>
      </ol>
      <h2>Formularios</h2>
      <p><code>df-input</code>, <code>df-select</code> y <code>df-switch</code> funcionan dentro de un <code>&lt;form&gt;</code> nativo. Dos utilidades ahorran código:</p>
      <div class="codigo-solo">${bloqueCodigo(`form.addEventListener('submit', (e) => {\n  e.preventDefault();\n  if (!DfInput.validateAll(form)) return;   // marca los errores y enfoca el primero\n  const datos = DfInput.collect(form);      // { nombre: '…', tipo: '…', avisos: true }\n});`, 'js')}</div>
      <h2>TypeScript</h2>
      <p>El paquete incluye <code>types/diegofo-ui.d.ts</code>: VS Code autocompleta las etiquetas, sus propiedades (con los valores permitidos) y el <code>detail</code> de cada evento.</p>
      <h2>Compatibilidad</h2>
      <p>Navegadores actuales: Chrome, Edge, Firefox y Safari. No necesita polyfills.</p>
    </article>`;
  }

  function temas() {
    marco.classList.remove('sin-lateral');
    main.innerHTML = `<article class="doc">
      <h1>Temas y estilos</h1>
      <p class="lead">Los componentes usan Shadow DOM: el CSS de tu página no los rompe. Para personalizarlos hay tres niveles.</p>
      <h2>1. Variables CSS</h2>
      <p>Los componentes leen las variables de la página. Si no existen, usan los colores de diegofo-ui.</p>
      <div class="codigo-solo">${bloqueCodigo(`:root {\n  --bg-card: #ffffff;        /* superficies */\n  --bg-input: #f4f8fa;       /* campos */\n  --border-color: #d3e1e6;\n  --text-main: #1e293b;\n  --text-muted: #5b6b7f;\n  --accent-teal: #0d9488;    /* también --accent-blue, --accent-red, --accent-green… */\n\n  --df-color-primary: #1a4d59;    /* solo para los componentes */\n  --df-color-secondary: #6b9eac;\n}`, 'js').replace(/tk-kw/g, '')}</div>
      <h2>2. Modo oscuro</h2>
      <p>Redefine las variables bajo <code>[data-theme="dark"]</code> y añade <code>&lt;df-theme-toggle&gt;</code>. Pruébalo aquí:</p>
      <div class="ejemplo"><div class="ejemplo-vista">${porTag['df-theme-toggle'].ejemplos[0].html}</div></div>
      <h2>3. Partes internas con ::part()</h2>
      <p>Cada componente expone sus piezas internas. Mira la sección "Partes CSS" de cada uno.</p>
      <div class="codigo-solo">${bloqueCodigo(`df-button::part(button) { letter-spacing: .04em; }\ndf-modal::part(box) { border-radius: 0; }\ndf-badge::part(badge) { white-space: normal; }`, 'js').replace(/tk-kw/g, '')}</div>
    </article>`;
  }

  function filaProps(c) {
    const clase = customElements.get(c.tag);
    const filas = Object.entries(clase.properties).map(([nombre, def]) => {
      const opciones = c.opciones?.[nombre];
      const tipo = opciones ? opciones.map((o) => `'${o}'`).join(' | ') : def.type.name.toLowerCase();
      const attr = def.attribute ?? kebab(nombre);
      return `<tr><td><code>${attr}</code>${attr !== nombre ? `<br><small style="color:var(--text-muted)">.${nombre}</small>` : ''}</td><td class="tipo"><code>${esc(tipo)}</code></td><td><code>${esc(JSON.stringify(def.default))}</code></td><td>${esc(c.props?.[nombre] ?? '')}</td></tr>`;
    });
    for (const p of c.propsExtra ?? []) filas.push(`<tr><td><code>.${p.nombre}</code><br><small style="color:var(--text-muted)">solo JS</small></td><td class="tipo"><code>${esc(p.tipo)}</code></td><td></td><td>${esc(p.desc)}</td></tr>`);
    return filas.join('');
  }

  const tabla = (cab, filas) => `<div class="tabla-api"><table><thead><tr>${cab.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${filas}</tbody></table></div>`;

  function paginaComponente(tag) {
    const c = porTag[tag];
    if (!c) return noEncontrada();
    marco.classList.remove('sin-lateral');
    const i = componentes.indexOf(c);
    const prev = componentes[i - 1];
    const sig = componentes[i + 1];
    const ejemplos = c.ejemplos.map((ej, n) => `
      <h3 id="ej-${n}">${esc(ej.titulo)}</h3>
      ${ej.descripcion ? `<p class="ejemplo-desc">${esc(ej.descripcion)}</p>` : ''}
      <div class="ejemplo">
        <div class="ejemplo-vista">${ej.html}</div>
        ${bloqueCodigo(ej.html, 'html')}
        ${ej.script ? bloqueCodigo(ej.script, 'js') : ''}
      </div>`).join('');

    main.innerHTML = `<article class="doc">
      <h1><code>&lt;${c.tag}&gt;</code></h1>
      <p class="lead">${esc(c.resumen)}</p>
      <p class="desc">${esc(c.descripcion)}</p>
      <div class="acciones"><a href="#/banco/${c.tag}"><df-button variant="secondary" size="sm" shape="rounded">Abrir en el banco de pruebas</df-button></a></div>

      <h2>Ejemplos</h2>
      ${ejemplos}

      <h2>Propiedades</h2>
      <p>Úsalas como atributo en HTML o como propiedad en JavaScript.</p>
      ${tabla(['Atributo', 'Tipo', 'Por defecto', 'Descripción'], filaProps(c))}

      ${c.eventos?.length ? `<h2>Eventos</h2>${tabla(['Evento', 'detail', 'Cuándo'], c.eventos.map((e) => `<tr><td><code>${e.nombre}</code></td><td class="tipo"><code>${esc(e.detalle)}</code></td><td>${esc(e.cuando)}</td></tr>`).join(''))}` : ''}
      ${c.metodos?.length ? `<h2>Métodos</h2>${tabla(['Firma', 'Descripción'], c.metodos.map((m) => `<tr><td class="tipo"><code>${esc(m.firma)}</code></td><td>${esc(m.desc)}</td></tr>`).join(''))}` : ''}
      ${c.slots?.length ? `<h2>Slots</h2>${tabla(['Slot', 'Contenido'], c.slots.map((s) => `<tr><td><code>${esc(s.nombre)}</code></td><td>${esc(s.desc)}</td></tr>`).join(''))}` : ''}
      ${c.partes?.length ? `<h2>Partes CSS</h2>${tabla(['::part()', 'Elemento'], c.partes.map((s) => `<tr><td><code>${esc(s.nombre)}</code></td><td>${esc(s.desc)}</td></tr>`).join(''))}` : ''}
      ${c.cssVars?.length ? `<h2>Variables CSS</h2><p>${c.cssVars.map((v) => `<code>${v}</code>`).join(' ')}</p>` : ''}

      <h2>Accesibilidad</h2>
      <ul class="a11y">${c.a11y.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>

      <nav class="paginador" aria-label="Otros componentes">
        ${prev ? `<a href="#/c/${prev.tag}"><small>Anterior</small><span>&lt;${prev.tag}&gt;</span></a>` : '<span></span>'}
        ${sig ? `<a class="sig" href="#/c/${sig.tag}"><small>Siguiente</small><span>&lt;${sig.tag}&gt;</span></a>` : ''}
      </nav>
    </article>`;
    c.ejemplos.forEach((ej) => ejecutar(ej.script));
    document.title = `<${c.tag}> · diegofo-ui`;
  }

  // ───────────────────────── banco de pruebas
  const EVENTOS = ['df-click', 'df-input', 'df-change', 'df-enter', 'df-invalid', 'df-open', 'df-close', 'df-confirm', 'df-cancel',
    'df-toast-show', 'df-toast-hide', 'df-select', 'df-theme-change', 'df-show', 'df-hide', 'df-complete', 'df-error',
    'df-tab-change', 'df-sort', 'df-search', 'df-page', 'df-row-click'];

  function banco(tag = 'df-button') {
    const c = porTag[tag];
    if (!c) return noEncontrada();
    marco.classList.remove('sin-lateral');
    main.innerHTML = `<div class="banco">
      <h1>Banco de pruebas</h1>
      <p class="lead">Cambia las propiedades de <code>&lt;${c.tag}&gt;</code> y mira cómo responde. Los controles se generan solos a partir de <code>static properties</code> de la clase; abajo tienes el HTML resultante y los eventos que lanza.</p>
      <div class="banco-grid">
        <section class="caja"><h2>Vista previa</h2><div class="escenario" id="escenario"></div></section>
        <section class="caja"><h2>Propiedades</h2><div class="controles" id="controles"></div></section>
      </div>
      <div class="banco-abajo">
        <section class="caja"><h2>HTML</h2>${bloqueCodigo('', 'html')}</section>
        <section class="caja"><div class="caja-cab"><h2>Eventos</h2><button type="button" id="limpiar">Limpiar</button></div><div class="registro" id="registro"><div class="vacio">Interactúa con el componente para ver sus eventos.</div></div></section>
      </div>
    </div>`;

    const escenario = document.getElementById('escenario');
    // Usamos el primer ejemplo que contenga el componente y nos quedamos solo con él.
    const ejemplo = c.ejemplos.find((ej) => ej.html.includes(`<${c.tag}`));
    escenario.innerHTML = ejemplo ? ejemplo.html : '';
    const el = escenario.querySelector(c.tag) ?? document.createElement(c.tag);
    escenario.replaceChildren(el);
    if (c.tag === 'df-data-table') ejecutar(ejemplo.script); // la tabla necesita sus datos
    if (c.tag === 'df-modal') {
      const abrir = document.createElement('df-button');
      abrir.textContent = 'show()';
      abrir.addEventListener('df-click', () => el.show());
      escenario.appendChild(abrir);
      el.textContent = 'Contenido del diálogo.';
    }
    if (c.tag === 'df-toast-stack') {
      const abrir = document.createElement('df-button');
      abrir.textContent = "show('Hola', 'success')";
      abrir.addEventListener('df-click', () => el.show('Hola desde el banco de pruebas', 'success'));
      escenario.appendChild(abrir);
    }

    const pre = main.querySelector('.banco-abajo pre code');
    const pintarHtml = () => {
      const copia = el.cloneNode(true);
      copia.removeAttribute('style');
      copia.querySelectorAll('[data-df-tooltip-desc]').forEach((n) => n.remove());
      pre.innerHTML = resaltar(copia.outerHTML.replace(/=""/g, ''), 'html');
    };

    const controles = document.getElementById('controles');
    const clase = customElements.get(c.tag);
    Object.entries(clase.properties).forEach(([nombre, def]) => {
      const attr = def.attribute ?? kebab(nombre);
      const fila = document.createElement('div');
      fila.className = 'ctrl';
      const id = `ctrl-${attr}`;
      let input;
      const opciones = c.opciones?.[nombre];
      if (def.type === Boolean) {
        input = Object.assign(document.createElement('input'), { type: 'checkbox', checked: el[nombre] });
        input.addEventListener('change', () => { el[nombre] = input.checked; });
      } else if (opciones) {
        input = document.createElement('select');
        opciones.forEach((o) => input.add(new Option(o || '(ninguno)', o)));
        input.value = el[nombre];
        input.addEventListener('change', () => { el[nombre] = input.value; });
      } else {
        input = Object.assign(document.createElement('input'), { type: def.type === Number ? 'number' : 'text', value: el[nombre] });
        input.addEventListener('input', () => { el[nombre] = def.type === Number ? Number(input.value) : input.value; });
      }
      input.id = id;
      new MutationObserver(() => {
        if (def.type === Boolean) input.checked = el[nombre];
        else if (document.activeElement !== input) input.value = el[nombre];
        pintarHtml();
      }).observe(el, { attributes: true, attributeFilter: [attr] });
      fila.innerHTML = `<label for="${id}">${attr}</label>`;
      fila.appendChild(input);
      const pista = document.createElement('small');
      pista.textContent = `${def.type.name} · por defecto ${JSON.stringify(def.default)}`;
      fila.appendChild(pista);
      controles.appendChild(fila);
    });

    const registro = document.getElementById('registro');
    EVENTOS.forEach((n) => el.addEventListener(n, (e) => {
      if (e.target !== el) return;
      registro.querySelector('.vacio')?.remove();
      const fila = document.createElement('div');
      fila.innerHTML = `<span style="color:var(--text-muted)">${new Date().toLocaleTimeString('es-ES')}</span> <span class="ev"></span> <span></span>`;
      fila.children[1].textContent = n;
      fila.children[2].textContent = JSON.stringify(e.detail, (k, v) => (v instanceof Node ? undefined : v));
      registro.prepend(fila);
    }));
    document.getElementById('limpiar').addEventListener('click', () => {
      registro.innerHTML = '<div class="vacio">Interactúa con el componente para ver sus eventos.</div>';
    });
    pintarHtml();
    document.title = `Banco de pruebas · <${c.tag}> · diegofo-ui`;
  }

  function noEncontrada() {
    marco.classList.remove('sin-lateral');
    main.innerHTML = `<article class="doc"><h1>Esta página no existe</h1><p class="lead">Puede que el enlace esté mal escrito. Elige un componente en el menú o vuelve a la <a href="#/">portada</a>.</p></article>`;
  }

  // ───────────────────────── router
  function router() {
    const [, seccion = '', param] = location.hash.replace(/^#/, '').split('/');
    document.querySelectorAll('.top-nav a[data-ruta]').forEach((a) => {
      if (a.dataset.ruta === seccion) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.title = 'diegofo-ui · Componentes web accesibles y sin dependencias';
    if (seccion === '') portada();
    else if (seccion === 'empezar') guia();
    else if (seccion === 'temas') temas();
    else if (seccion === 'c') paginaComponente(param);
    else if (seccion === 'banco') banco(param);
    else noEncontrada();
    pintarMenu(buscar.value);
    window.scrollTo(0, 0);
    if (seccion) main.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', router);
  router();
})();
