/**
 * Fuente única de la documentación de diegofo-ui.
 * La usan: la web (docs/index.html), y scripts/docs.mjs para generar docs/COMPONENTES.md y los tipos .d.ts.
 * Las propiedades (tipo y valor por defecto) NO se escriben aquí: se leen de `static properties` de cada clase.
 */
(function (root) {
  const DOCS = {
    categorias: ['Acciones y formularios', 'Superposiciones y feedback', 'Datos y presentación', 'Estructura'],
    componentes: [
      // ───────────────────────────── Acciones y formularios
      {
        tag: 'df-button', clase: 'DfButton', categoria: 'Acciones y formularios',
        resumen: 'Botón con variantes, tamaños, estado de carga y envío de formularios.',
        descripcion: 'El botón de la marca, con la forma de pestaña recortada por defecto. Dentro de un <form> puede enviarlo o resetearlo con type="submit" o type="reset", igual que un botón nativo.',
        props: {
          variant: 'Color del botón.', size: 'Tamaño.', shape: 'Forma: recortada, redondeada o píldora.',
          type: 'Comportamiento dentro de un formulario.', disabled: 'Desactiva el botón.',
          loading: 'Muestra un spinner y bloquea los clics.', block: 'Ocupa todo el ancho disponible.',
        },
        opciones: {
          variant: ['primary', 'secondary', 'success', 'danger', 'warning', 'ghost'],
          size: ['sm', 'md', 'lg'], shape: ['tab', 'rounded', 'pill'], type: ['button', 'submit', 'reset'],
        },
        ejemplos: [
          { titulo: 'Variantes', html: '<df-button>Guardar</df-button>\n<df-button variant="secondary">Cancelar</df-button>\n<df-button variant="success">Publicar</df-button>\n<df-button variant="danger">Eliminar</df-button>\n<df-button variant="ghost">Más tarde</df-button>' },
          { titulo: 'Formas y tamaños', html: '<df-button size="sm" shape="rounded">Pequeño</df-button>\n<df-button shape="pill">Píldora</df-button>\n<df-button size="lg">Grande</df-button>' },
          { titulo: 'Estado de carga', descripcion: 'Mientras loading está activo, el botón no responde a clics.', html: '<df-button id="b-carga" variant="success">Enviar</df-button>', script: "const b = document.getElementById('b-carga');\nb.addEventListener('df-click', () => {\n  b.loading = true;\n  setTimeout(() => (b.loading = false), 1500);\n});" },
        ],
        eventos: [{ nombre: 'df-click', detalle: '{ variant: string }', cuando: 'Al pulsar. No se lanza si está disabled o loading.' }],
        metodos: [{ nombre: 'focus', firma: 'focus(options?: FocusOptions): void', desc: 'Pone el foco en el botón interno.' }],
        slots: [{ nombre: '(por defecto)', desc: 'Texto e iconos del botón.' }],
        partes: [{ nombre: 'button', desc: 'El <button> interno.' }],
        a11y: ['Usa un <button> nativo por dentro: funciona con Tab, Enter y Espacio.', 'En loading se marca aria-busy="true".', 'Foco visible con contorno azul.'],
      },
      {
        tag: 'df-input', clase: 'DfInput', categoria: 'Acciones y formularios',
        resumen: 'Campo de texto con etiqueta, ayuda y validación integrada.',
        descripcion: 'Valida campos obligatorios, correos, números, longitud mínima y patrones. Muestra el error debajo y lo quita en cuanto el valor es correcto.',
        props: {
          label: 'Texto de la etiqueta.', type: 'Tipo de campo (textarea crea un área de texto).', name: 'Nombre del campo; lo usa DfInput.collect().',
          value: 'Valor actual.', placeholder: 'Texto de ejemplo.', hint: 'Ayuda bajo el campo.', required: 'Obligatorio.',
          disabled: 'Desactivado.', pattern: 'Expresión regular que debe cumplir el valor completo.', minlength: 'Longitud mínima.',
          rows: 'Filas cuando type="textarea".', errorMessage: 'Sustituye al mensaje de error automático.', invalid: 'Lo activa validate() cuando falla.',
        },
        opciones: { type: ['text', 'email', 'password', 'number', 'date', 'textarea'] },
        ejemplos: [
          { titulo: 'Con validación', descripcion: 'Escribe y sal del campo para validar.', html: '<df-input label="Correo" type="email" placeholder="ana@ejemplo.com" hint="Te escribiremos aquí" required></df-input>' },
          { titulo: 'Patrón propio', html: '<df-input label="Código postal" pattern="[0-9]{5}" error-message="Debe tener 5 números" placeholder="28001"></df-input>' },
          { titulo: 'Área de texto', html: '<df-input label="Comentarios" type="textarea" rows="3" placeholder="Escribe aquí…"></df-input>' },
        ],
        eventos: [
          { nombre: 'df-input', detalle: '{ value: string, name: string }', cuando: 'En cada pulsación.' },
          { nombre: 'df-change', detalle: '{ value: string, name: string, valid: boolean }', cuando: 'Al salir del campo tras cambiarlo (valida).' },
          { nombre: 'df-enter', detalle: '{ value: string, name: string }', cuando: 'Al pulsar Enter (no en textarea).' },
          { nombre: 'df-invalid', detalle: '{ value: string, name: string, message: string }', cuando: 'Cuando validate() falla.' },
        ],
        metodos: [
          { nombre: 'validate', firma: 'validate(options?: { silent?: boolean }): boolean', desc: 'Valida, muestra el error y lanza df-invalid si falla.' },
          { nombre: 'checkValidity', firma: 'checkValidity(): boolean', desc: 'Valida sin mostrar nada.' },
          { nombre: 'clear', firma: 'clear(): void', desc: 'Vacía el campo y quita el error.' },
          { nombre: 'focus', firma: 'focus(options?: FocusOptions): void', desc: 'Foco en el campo interno.' },
          { nombre: 'DfInput.validateAll', firma: 'static validateAll(container: ParentNode): boolean', desc: 'Valida todos los df-input y df-select de un contenedor y enfoca el primero con error.' },
          { nombre: 'DfInput.collect', firma: 'static collect(container: ParentNode): Record<string, string | boolean>', desc: 'Devuelve { name: valor } de los df-input, df-select y df-switch.' },
        ],
        partes: [{ nombre: 'field', desc: 'El <input> o <textarea>.' }, { nombre: 'label', desc: 'La etiqueta.' }],
        a11y: ['La etiqueta está asociada al campo.', 'aria-invalid refleja el estado de error y el mensaje se anuncia con aria-live.', 'Participa en formularios nativos (form-associated custom element).'],
      },
      {
        tag: 'df-select', clase: 'DfSelect', categoria: 'Acciones y formularios',
        resumen: 'Desplegable con estilo propio, búsqueda por letra y navegación con teclado.',
        descripcion: 'Sustituye al <select> nativo manteniendo su comportamiento: se usa con <option> hijas o con la propiedad options, y envía su valor dentro de un formulario.',
        props: {
          value: 'Valor seleccionado.', label: 'Etiqueta encima.', placeholder: 'Texto cuando no hay selección.', name: 'Nombre en el formulario.',
          hint: 'Texto de ayuda.', required: 'Obligatorio.', disabled: 'Desactivado.', invalid: 'Lo activa validate().', open: 'Si la lista está desplegada.',
        },
        propsExtra: [{ nombre: 'options', tipo: 'Array<{ value: string, label: string, disabled?: boolean }>', desc: 'Opciones por JavaScript (si no se asigna, se leen las <option> hijas).' }],
        ejemplos: [
          { titulo: 'Con <option>', html: '<df-select label="Tipo de perfil" placeholder="Elige uno" style="max-width:280px">\n  <option value="cliente">Cliente</option>\n  <option value="proveedor">Proveedor</option>\n  <option value="alumno">Alumno</option>\n  <option value="admin" disabled>Administrador</option>\n</df-select>' },
          { titulo: 'Opciones por JavaScript', html: '<df-select id="s-modelo" label="Modelo de IA" style="max-width:280px"></df-select>', script: "document.getElementById('s-modelo').options = [\n  { value: 'qwen', label: 'qwen2.5-coder:7b' },\n  { value: 'llava', label: 'llava:latest' },\n];" },
        ],
        eventos: [
          { nombre: 'df-change', detalle: '{ value: string, label: string, name: string }', cuando: 'Cuando el usuario elige otra opción.' },
          { nombre: 'df-invalid', detalle: '{ name: string, message: string }', cuando: 'Cuando validate() falla.' },
        ],
        metodos: [
          { nombre: 'show', firma: 'show(): void', desc: 'Despliega la lista.' },
          { nombre: 'close', firma: 'close(): void', desc: 'Cierra la lista.' },
          { nombre: 'validate', firma: 'validate(options?: { silent?: boolean }): boolean', desc: 'Comprueba required y muestra el error.' },
          { nombre: 'focus', firma: 'focus(options?: FocusOptions): void', desc: 'Foco en el botón.' },
        ],
        partes: [{ nombre: 'trigger', desc: 'El botón que abre la lista.' }, { nombre: 'listbox', desc: 'La lista.' }, { nombre: 'option', desc: 'Cada opción.' }],
        a11y: ['Patrón ARIA combobox de solo selección con aria-activedescendant.', 'Teclado: ↑ ↓ Inicio Fin para moverse, Enter o Espacio para elegir, Escape para cerrar, una letra para saltar.', 'Se cierra al pulsar fuera o con Tab.'],
      },
      {
        tag: 'df-switch', clase: 'DfSwitch', categoria: 'Acciones y formularios',
        resumen: 'Interruptor on/off, alternativa visual a una casilla.',
        descripcion: 'Para ajustes que se aplican al momento. Dentro de un formulario envía value cuando está encendido.',
        props: { checked: 'Encendido.', disabled: 'Desactivado.', label: 'Texto junto al interruptor.', name: 'Nombre en el formulario.', value: 'Valor enviado cuando está encendido.', size: 'Tamaño.' },
        opciones: { size: ['sm', 'md', 'lg'] },
        ejemplos: [
          { titulo: 'Básico', html: '<df-switch label="Recibir avisos por correo" checked></df-switch>\n<df-switch label="Modo compacto"></df-switch>\n<df-switch label="No disponible" disabled></df-switch>' },
          { titulo: 'Tamaños', html: '<df-switch size="sm" checked></df-switch>\n<df-switch checked></df-switch>\n<df-switch size="lg" checked></df-switch>' },
        ],
        eventos: [{ nombre: 'df-change', detalle: '{ checked: boolean, name: string }', cuando: 'Cuando el usuario lo cambia.' }],
        metodos: [
          { nombre: 'toggle', firma: 'toggle(force?: boolean): boolean', desc: 'Cambia el estado por código (sin lanzar evento).' },
          { nombre: 'focus', firma: 'focus(options?: FocusOptions): void', desc: 'Foco en el interruptor.' },
        ],
        slots: [{ nombre: '(por defecto)', desc: 'Contenido propio en lugar de label.' }],
        partes: [{ nombre: 'track', desc: 'La pista.' }, { nombre: 'thumb', desc: 'El círculo.' }],
        a11y: ['role="switch" con aria-checked.', 'Se cambia con Espacio o Enter.'],
      },

      // ───────────────────────────── Superposiciones y feedback
      {
        tag: 'df-modal', clase: 'DfModal', categoria: 'Superposiciones y feedback',
        resumen: 'Diálogos modales y atajos con promesas que sustituyen a confirm() y prompt().',
        descripcion: 'Se puede declarar en HTML o crear al vuelo con DfModal.confirm() y DfModal.prompt(), que devuelven una promesa con la respuesta del usuario.',
        props: {
          open: 'Visible o no.', heading: 'Título.', confirmText: 'Texto del botón principal.', cancelText: 'Texto del botón secundario.',
          variant: 'Color del botón principal y del borde.', hideCancel: 'Oculta el botón Cancelar.',
          persistent: 'No se cierra con Escape ni pulsando fuera.', width: 'Ancho máximo de la caja.',
        },
        opciones: { variant: ['primary', 'danger', 'success'] },
        ejemplos: [
          { titulo: 'Confirmación', html: '<df-button id="m-confirm" variant="danger">Eliminar cliente</df-button>', script: "document.getElementById('m-confirm').addEventListener('df-click', async () => {\n  const ok = await DfModal.confirm({\n    heading: 'Eliminar cliente',\n    message: 'Esta acción no se puede deshacer.',\n    confirmText: 'Eliminar',\n    variant: 'danger',\n  });\n  DfToastStack.notify(ok ? 'Cliente eliminado' : 'Cancelado', ok ? 'success' : 'info');\n});" },
          { titulo: 'Formulario rápido', descripcion: 'Valida los campos antes de cerrar.', html: '<df-button id="m-prompt">Nuevo producto</df-button>', script: "document.getElementById('m-prompt').addEventListener('df-click', async () => {\n  const datos = await DfModal.prompt({\n    heading: 'Nuevo producto',\n    fields: [\n      { name: 'nombre', label: 'Nombre', required: true },\n      { name: 'categoria', label: 'Categoría', type: 'select',\n        options: [{ value: 'saas', label: 'SaaS' }, { value: 'plugin', label: 'Plugin' }] },\n      { name: 'precio', label: 'Precio (€)', type: 'number' },\n      { name: 'destacado', label: 'Destacado', type: 'switch' },\n    ],\n  });\n  if (datos) DfToastStack.notify(JSON.stringify(datos), 'success');\n});" },
          { titulo: 'Declarado en HTML', html: '<df-button id="m-html" variant="secondary">Ver detalles</df-button>\n<df-modal id="m-detalle" heading="Detalles del pedido" hide-cancel confirm-text="Cerrar">\n  <p>Pedido #1042 · 3 artículos · 89,90 €</p>\n</df-modal>', script: "document.getElementById('m-html').addEventListener('df-click', () => {\n  document.getElementById('m-detalle').show();\n});" },
        ],
        eventos: [
          { nombre: 'df-open', detalle: '{}', cuando: 'Al abrirse.' },
          { nombre: 'df-confirm', detalle: '{}', cuando: 'Al pulsar Aceptar. Es cancelable: preventDefault() impide que se cierre.' },
          { nombre: 'df-cancel', detalle: '{}', cuando: 'Al pulsar Cancelar, la X, Escape o fuera de la caja.' },
          { nombre: 'df-close', detalle: "{ reason: 'confirm' | 'cancel' | 'method' }", cuando: 'Al cerrarse.' },
        ],
        metodos: [
          { nombre: 'show', firma: 'show(): void', desc: 'Abre.' },
          { nombre: 'close', firma: "close(reason?: 'confirm' | 'cancel' | 'method'): void", desc: 'Cierra.' },
          { nombre: 'toggle', firma: 'toggle(): void', desc: 'Alterna.' },
          { nombre: 'confirm', firma: 'confirm(): void', desc: 'Equivale a pulsar Aceptar.' },
          { nombre: 'cancel', firma: 'cancel(): void', desc: 'Equivale a pulsar Cancelar.' },
          { nombre: 'DfModal.confirm', firma: 'static confirm(options?: { heading?: string, message?: string, confirmText?: string, cancelText?: string, variant?: string }): Promise<boolean>', desc: 'Pregunta de sí o no.' },
          { nombre: 'DfModal.prompt', firma: 'static prompt(options: { heading?: string, message?: string, confirmText?: string, fields: Array<{ name: string, label?: string, type?: string, value?: string | number | boolean, required?: boolean, placeholder?: string, pattern?: string, options?: Array<{ value: string, label: string }> }> }): Promise<Record<string, string | boolean> | null>', desc: 'Formulario con validación; null si se cancela.' },
        ],
        slots: [{ nombre: '(por defecto)', desc: 'Cuerpo del diálogo.' }, { nombre: 'footer', desc: 'Sustituye a los botones.' }],
        partes: [{ nombre: 'overlay', desc: 'Fondo oscuro.' }, { nombre: 'box', desc: 'La caja.' }],
        a11y: ['role="dialog" y aria-modal con el título como nombre.', 'El foco queda atrapado dentro mientras está abierto y vuelve al elemento que lo abrió al cerrar.', 'Escape cierra solo el modal de arriba si hay varios; el scroll de la página se bloquea.'],
      },
      {
        tag: 'df-toast-stack', clase: 'DfToastStack', categoria: 'Superposiciones y feedback',
        resumen: 'Notificaciones flotantes que se cierran solas.',
        descripcion: 'Se coloca una vez en la página y se llama a show(). DfToastStack.notify() lo crea si no existe.',
        props: { position: 'Esquina de la pantalla.', duration: 'Milisegundos visibles (0 = no se cierran solas).', max: 'Máximo a la vez; se quita la más antigua.' },
        opciones: { position: ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'top-center', 'bottom-center'] },
        ejemplos: [
          { titulo: 'Tipos', html: '<df-button size="sm" variant="success" data-toast="success">Éxito</df-button>\n<df-button size="sm" variant="secondary" data-toast="info">Información</df-button>\n<df-button size="sm" variant="warning" data-toast="warning">Aviso</df-button>\n<df-button size="sm" variant="danger" data-toast="danger">Error</df-button>', script: "const textos = { success: 'Cambios guardados', info: 'Hay una versión nueva', warning: 'Quedan 2 unidades', danger: 'No se pudo conectar' };\ndocument.querySelectorAll('[data-toast]').forEach((b) =>\n  b.addEventListener('df-click', () => DfToastStack.notify(textos[b.dataset.toast], b.dataset.toast)));" },
        ],
        eventos: [
          { nombre: 'df-toast-show', detalle: '{ message: string, type: string }', cuando: 'Al mostrar una notificación.' },
          { nombre: 'df-toast-hide', detalle: "{ message: string, type: string, reason: 'timeout' | 'click' | 'overflow' | 'clear' }", cuando: 'Al quitarla.' },
        ],
        metodos: [
          { nombre: 'show', firma: "show(message: string, type?: 'success' | 'info' | 'warning' | 'danger', duration?: number): HTMLElement", desc: 'Muestra una notificación.' },
          { nombre: 'dismiss', firma: 'dismiss(toast: HTMLElement, reason?: string): void', desc: 'Quita una notificación concreta.' },
          { nombre: 'clear', firma: 'clear(): void', desc: 'Quita todas.' },
          { nombre: 'DfToastStack.notify', firma: "static notify(message: string, type?: 'success' | 'info' | 'warning' | 'danger'): HTMLElement", desc: 'Usa o crea el contenedor de la página.' },
        ],
        partes: [{ nombre: 'toast', desc: 'Cada notificación.' }],
        a11y: ['Contenedor con role="status" y aria-live="polite".', 'El mensaje se inserta como texto, nunca como HTML.', 'Pulsar una notificación la cierra.'],
      },
      {
        tag: 'df-tooltip', clase: 'DfTooltip', categoria: 'Superposiciones y feedback',
        resumen: 'Texto de ayuda al pasar el ratón o enfocar con teclado.',
        descripcion: 'Envuelve cualquier elemento. Ideal para botones que solo tienen icono.',
        props: { text: 'Texto del tooltip.', placement: 'Posición respecto al elemento.', delay: 'Milisegundos antes de aparecer.', disabled: 'No se muestra.' },
        opciones: { placement: ['top', 'bottom', 'left', 'right'] },
        ejemplos: [
          { titulo: 'Posiciones', html: '<df-tooltip text="Arriba"><df-button variant="ghost" size="sm">top</df-button></df-tooltip>\n<df-tooltip text="Abajo" placement="bottom"><df-button variant="ghost" size="sm">bottom</df-button></df-tooltip>\n<df-tooltip text="Izquierda" placement="left"><df-button variant="ghost" size="sm">left</df-button></df-tooltip>\n<df-tooltip text="Derecha" placement="right"><df-button variant="ghost" size="sm">right</df-button></df-tooltip>' },
        ],
        eventos: [{ nombre: 'df-show', detalle: '{}', cuando: 'Al aparecer.' }, { nombre: 'df-hide', detalle: '{}', cuando: 'Al ocultarse.' }],
        metodos: [{ nombre: 'show', firma: 'show(): void', desc: 'Muestra al instante.' }, { nombre: 'hide', firma: 'hide(): void', desc: 'Oculta.' }],
        slots: [{ nombre: '(por defecto)', desc: 'El elemento que dispara el tooltip.' }],
        partes: [{ nombre: 'tip', desc: 'La burbuja.' }],
        a11y: ['El texto se enlaza al disparador con aria-describedby, así los lectores de pantalla lo leen.', 'Aparece también con el foco del teclado y Escape lo cierra.'],
      },
      {
        tag: 'df-progress', clase: 'DfProgress', categoria: 'Superposiciones y feedback',
        resumen: 'Barra de progreso, con modo indeterminado.',
        descripcion: 'Para subidas, procesos por pasos o cargas de duración desconocida.',
        props: { value: 'Valor actual.', max: 'Valor máximo.', label: 'Texto encima (y nombre accesible).', variant: 'Color.', indeterminate: 'Animación sin valor concreto.', showValue: 'Muestra el porcentaje.', size: 'Grosor.' },
        opciones: { variant: ['default', 'success', 'warning', 'danger'], size: ['sm', 'md', 'lg'] },
        ejemplos: [
          { titulo: 'Con valor', html: '<df-progress label="Subiendo informe.pdf" value="64" show-value></df-progress>\n<df-progress label="Espacio usado" value="92" variant="warning" show-value></df-progress>' },
          { titulo: 'Indeterminado', html: '<df-progress label="Conectando con Ollama…" indeterminate></df-progress>' },
          { titulo: 'Animado', html: '<df-progress id="p-demo" label="Instalando" show-value variant="success"></df-progress>\n<df-button id="p-start" size="sm" shape="rounded">Empezar</df-button>', script: "const p = document.getElementById('p-demo');\np.addEventListener('df-complete', () => DfToastStack.notify('Instalación completada', 'success'));\ndocument.getElementById('p-start').addEventListener('df-click', () => {\n  p.value = 0;\n  const t = setInterval(() => { p.value += 10; if (p.value >= 100) clearInterval(t); }, 200);\n});" },
        ],
        eventos: [{ nombre: 'df-complete', detalle: '{ value: number, max: number }', cuando: 'Una vez, al llegar al máximo.' }],
        metodos: [],
        partes: [{ nombre: 'track', desc: 'El fondo.' }, { nombre: 'bar', desc: 'La parte rellena.' }],
        a11y: ['role="progressbar" con aria-valuenow, aria-valuemin y aria-valuemax.', 'En modo indeterminado se quita aria-valuenow y se marca aria-busy.', 'Respeta prefers-reduced-motion.'],
      },

      // ───────────────────────────── Datos y presentación
      {
        tag: 'df-data-table', clase: 'DfDataTable', categoria: 'Datos y presentación',
        resumen: 'Tabla con ordenación por columnas, búsqueda y paginación.',
        descripcion: 'Recibe columnas y filas por JavaScript. La búsqueda ignora mayúsculas y tildes; las columnas pueden formatear moneda, números y fechas, o pintar lo que quieras con render.',
        props: {
          pageSize: 'Filas por página (0 = sin paginar).', searchable: 'Muestra la caja de búsqueda.', searchPlaceholder: 'Texto de la búsqueda.',
          emptyText: 'Texto cuando no hay datos.', sortKey: 'Columna por la que se ordena.', sortDir: 'Dirección del orden.',
          striped: 'Filas alternas sombreadas.', clickable: 'Las filas se pueden pulsar.', caption: 'Título accesible de la tabla.',
        },
        opciones: { sortDir: ['asc', 'desc'] },
        propsExtra: [
          { nombre: 'columns', tipo: "Array<{ key: string, label?: string, sortable?: boolean, align?: 'left' | 'right' | 'center', type?: 'text' | 'number' | 'currency' | 'date', render?: (row) => string | Node }>", desc: 'Definición de columnas.' },
          { nombre: 'rows', tipo: 'Array<object>', desc: 'Datos.' },
        ],
        ejemplos: [
          { titulo: 'Clientes', html: '<df-data-table id="t-demo" searchable page-size="4" striped clickable caption="Clientes"></df-data-table>', script: "const t = document.getElementById('t-demo');\nt.columns = [\n  { key: 'nombre', label: 'Nombre' },\n  { key: 'tipo', label: 'Tipo', render: (r) => `<df-badge size=\"sm\" variant=\"soft\" color=\"${r.tipo === 'Cliente' ? 'blue' : 'green'}\">${r.tipo}</df-badge>` },\n  { key: 'alta', label: 'Alta', type: 'date' },\n  { key: 'facturado', label: 'Facturado', type: 'currency' },\n];\nt.rows = [\n  { nombre: 'Ana Gómez', tipo: 'Cliente', alta: '2026-03-12', facturado: 1240 },\n  { nombre: 'Sodire Tech', tipo: 'Proveedor', alta: '2026-04-01', facturado: 8900 },\n  { nombre: 'Íñigo Pérez', tipo: 'Cliente', alta: '2026-05-20', facturado: 310.5 },\n  { nombre: 'Lucía Ruiz', tipo: 'Cliente', alta: '2026-06-02', facturado: 2050 },\n  { nombre: 'TAME Formación', tipo: 'Proveedor', alta: '2026-07-15', facturado: 15400 },\n  { nombre: 'Marcos Alonso', tipo: 'Cliente', alta: '2026-09-09', facturado: 95 },\n];\nt.addEventListener('df-row-click', (e) => DfToastStack.notify(`Has pulsado ${e.detail.row.nombre}`));" },
        ],
        eventos: [
          { nombre: 'df-sort', detalle: "{ key: string, direction: 'asc' | 'desc' }", cuando: 'Al ordenar por una columna.' },
          { nombre: 'df-search', detalle: '{ query: string, total: number }', cuando: 'Al escribir en la búsqueda.' },
          { nombre: 'df-page', detalle: '{ page: number, pages: number }', cuando: 'Al cambiar de página.' },
          { nombre: 'df-row-click', detalle: '{ row: object, index: number }', cuando: 'Al pulsar una fila (con clickable).' },
        ],
        metodos: [
          { nombre: 'setData', firma: 'setData(rows: object[]): void', desc: 'Cambia los datos.' },
          { nombre: 'search', firma: 'search(text: string): void', desc: 'Busca por código.' },
          { nombre: 'sortBy', firma: "sortBy(key: string, direction?: 'asc' | 'desc'): void", desc: 'Ordena; si ya estaba ordenada por esa columna, invierte.' },
          { nombre: 'goToPage', firma: 'goToPage(page: number): void', desc: 'Va a una página.' },
        ],
        slots: [{ nombre: 'toolbar', desc: 'Acciones a la derecha de la búsqueda.' }],
        partes: [{ nombre: 'table', desc: 'La tabla.' }],
        a11y: ['Cabeceras con scope="col" y aria-sort en la columna ordenada.', 'La paginación es un <nav> con aria-current en la página actual.', 'El recuento de resultados se anuncia con aria-live.'],
      },
      {
        tag: 'df-stat-card', clase: 'DfStatCard', categoria: 'Datos y presentación',
        resumen: 'Tarjeta de métrica con formato automático de moneda, número o porcentaje.',
        descripcion: 'Le pasas el número tal cual y lo formatea en español (1.234,50 €, 42,5 %).',
        props: { label: 'Título de la métrica.', value: 'Valor (texto o número).', format: 'Cómo se muestra el valor.', currency: 'Moneda si format="currency".', unit: 'Unidad detrás del valor.', hint: 'Texto pequeño debajo.', variant: 'Color.', interactive: 'Se puede pulsar y enfocar.' },
        opciones: { format: ['text', 'number', 'currency', 'percent'], variant: ['default', 'success', 'warning', 'danger', 'info'] },
        ejemplos: [
          { titulo: 'Formatos', html: '<div class="demo-grid">\n  <df-stat-card label="Facturación" value="12480.5" format="currency" variant="success" hint="Este mes"></df-stat-card>\n  <df-stat-card label="Pedidos" value="1534" format="number" unit="u."></df-stat-card>\n  <df-stat-card label="Conversión" value="3.8" format="percent" variant="info"></df-stat-card>\n</div>' },
        ],
        eventos: [{ nombre: 'df-select', detalle: '{ label: string, value: string }', cuando: 'Al pulsar una tarjeta interactive (clic, Enter o Espacio).' }],
        metodos: [],
        slots: [{ nombre: 'icon', desc: 'Icono a la derecha.' }],
        partes: [{ nombre: 'card', desc: 'La tarjeta.' }, { nombre: 'value', desc: 'El valor.' }],
        a11y: ['Con interactive pasa a ser role="button" enfocable y responde a Enter y Espacio.'],
      },
      {
        tag: 'df-badge', clase: 'DfBadge', categoria: 'Datos y presentación',
        resumen: 'Etiqueta de color para estados y categorías.',
        descripcion: 'Acepta los colores de la paleta por nombre o cualquier color CSS.',
        props: { color: 'Color de la paleta o cualquier color CSS.', variant: 'Relleno.', size: 'Tamaño.', dot: 'Punto delante del texto.' },
        opciones: { color: ['teal', 'blue', 'green', 'orange', 'red', 'yellow', 'purple', 'magenta', 'gray'], variant: ['solid', 'soft', 'outline'], size: ['sm', 'md'] },
        ejemplos: [
          { titulo: 'Colores y estilos', html: '<df-badge>teal</df-badge>\n<df-badge color="blue">blue</df-badge>\n<df-badge color="purple">purple</df-badge>\n<df-badge color="green" variant="soft" dot>Activo</df-badge>\n<df-badge color="red" variant="soft" dot>Inactivo</df-badge>\n<df-badge color="orange" variant="outline">Pendiente</df-badge>\n<df-badge color="#7c3aed" size="sm">IPE II</df-badge>' },
        ],
        eventos: [], metodos: [],
        slots: [{ nombre: '(por defecto)', desc: 'Texto.' }],
        partes: [{ nombre: 'badge', desc: 'El contenedor.' }],
        a11y: ['El texto es contenido normal; no transmitas información solo con el color.'],
      },
      {
        tag: 'df-avatar', clase: 'DfAvatar', categoria: 'Datos y presentación',
        resumen: 'Foto de usuario o iniciales con un color calculado a partir del nombre.',
        descripcion: 'Si no hay imagen, o no carga, muestra las iniciales. El mismo nombre siempre tiene el mismo color.',
        props: { name: 'Nombre de la persona.', src: 'URL de la imagen.', size: 'Tamaño.', shape: 'Forma.', status: 'Punto de estado.' },
        opciones: { size: ['sm', 'md', 'lg', 'xl'], shape: ['circle', 'square'], status: ['', 'online', 'away', 'busy', 'offline'] },
        ejemplos: [
          { titulo: 'Iniciales y estados', html: '<df-avatar name="Diego Fernández" status="online"></df-avatar>\n<df-avatar name="Ana Gómez" status="away"></df-avatar>\n<df-avatar name="Sodire Tech" shape="square" status="busy"></df-avatar>\n<df-avatar name="Marcos Alonso" status="offline"></df-avatar>' },
          { titulo: 'Tamaños', html: '<df-avatar name="Lucía Ruiz" size="sm"></df-avatar>\n<df-avatar name="Lucía Ruiz"></df-avatar>\n<df-avatar name="Lucía Ruiz" size="lg"></df-avatar>\n<df-avatar name="Lucía Ruiz" size="xl"></df-avatar>' },
        ],
        eventos: [{ nombre: 'df-error', detalle: '{ src: string }', cuando: 'Si la imagen no se puede cargar.' }],
        metodos: [],
        partes: [{ nombre: 'avatar', desc: 'El círculo o cuadrado.' }],
        a11y: ['role="img" con el nombre y el estado como etiqueta accesible.'],
      },

      // ───────────────────────────── Estructura
      {
        tag: 'df-tabs', clase: 'DfTabs', categoria: 'Estructura',
        resumen: 'Pestañas generadas a partir de paneles <df-tab-panel>.',
        descripcion: 'Cada <df-tab-panel label="…"> se convierte en una pestaña. Incluye df-tab-panel.',
        props: { selected: 'Índice de la pestaña activa.', variant: 'Estilo: subrayado o píldoras.' },
        opciones: { variant: ['line', 'pill'] },
        ejemplos: [
          { titulo: 'Subrayado', html: '<df-tabs>\n  <df-tab-panel label="Perfil">Nombre, foto y datos de contacto.</df-tab-panel>\n  <df-tab-panel label="Seguridad">Contraseña y verificación en dos pasos.</df-tab-panel>\n  <df-tab-panel label="Facturación" disabled>Disponible en el plan Pro.</df-tab-panel>\n  <df-tab-panel label="Avisos">Qué correos quieres recibir.</df-tab-panel>\n</df-tabs>' },
          { titulo: 'Píldoras', html: '<df-tabs variant="pill">\n  <df-tab-panel label="Semana">Resumen de los últimos 7 días.</df-tab-panel>\n  <df-tab-panel label="Mes">Resumen de los últimos 30 días.</df-tab-panel>\n  <df-tab-panel label="Año">Resumen del curso.</df-tab-panel>\n</df-tabs>' },
        ],
        eventos: [{ nombre: 'df-tab-change', detalle: '{ index: number, label: string }', cuando: 'Cuando el usuario cambia de pestaña.' }],
        metodos: [
          { nombre: 'select', firma: 'select(index: number): void', desc: 'Selecciona por código (sin evento).' },
          { nombre: 'refresh', firma: 'refresh(): void', desc: 'Regenera las pestañas (se llama sola al añadir o quitar paneles).' },
        ],
        slots: [{ nombre: '(por defecto)', desc: 'Los <df-tab-panel> (props: label, disabled).' }],
        partes: [{ nombre: 'tablist', desc: 'La fila de pestañas.' }, { nombre: 'tab', desc: 'Cada pestaña.' }],
        a11y: ['Patrón ARIA tabs: role tablist/tab/tabpanel y aria-selected.', 'Teclado: ← → Inicio Fin, saltando las pestañas desactivadas; solo la activa está en el orden de Tab.'],
      },
      {
        tag: 'df-theme-toggle', clase: 'DfThemeToggle', categoria: 'Estructura',
        resumen: 'Interruptor de tema claro y oscuro que recuerda la elección.',
        descripcion: 'Pone data-theme="dark" en el elemento objetivo. Como todos los componentes leen variables CSS, el modo oscuro funciona solo.',
        props: { theme: 'Tema actual.', target: 'Selector del elemento al que se aplica.', storageKey: 'Clave de localStorage para recordarlo.' },
        opciones: { theme: ['light', 'dark'] },
        ejemplos: [
          { titulo: 'Aplicado a una zona', descripcion: 'Aquí el tema solo afecta a esta caja.', html: '<div id="zona-tema" class="demo-zona">\n  <df-theme-toggle target="#zona-tema" class="toggle-oscuro"></df-theme-toggle>\n  <df-stat-card label="Visitas" value="2380" format="number"></df-stat-card>\n</div>' },
        ],
        eventos: [{ nombre: 'df-theme-change', detalle: "{ theme: 'light' | 'dark' }", cuando: 'Cuando el usuario lo cambia (asignar theme por código no lo lanza).' }],
        metodos: [
          { nombre: 'toggle', firma: "toggle(): 'light' | 'dark'", desc: 'Cambia al tema contrario.' },
          { nombre: 'applyTheme', firma: 'applyTheme(): void', desc: 'Vuelve a aplicar el tema actual.' },
        ],
        partes: [{ nombre: 'button', desc: 'El botón.' }],
        cssVars: ['--df-toggle-color', '--df-toggle-bg', '--df-toggle-bg-hover'],
        a11y: ['aria-label cambia según la acción ("Cambiar a tema oscuro").'],
      },
    ],
  };
  root.DF_DOCS = DOCS;
})(typeof window !== 'undefined' ? window : globalThis);
