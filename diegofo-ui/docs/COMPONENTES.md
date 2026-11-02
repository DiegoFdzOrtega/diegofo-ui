# Referencia de componentes · diegofo-ui v2.0.0

> Archivo generado con `npm run docs` a partir del código. No lo edites a mano.

Cada propiedad se puede usar como **atributo HTML** (kebab-case) o como **propiedad JavaScript** (camelCase); están sincronizadas.
Los eventos son `CustomEvent` que burbujean y atraviesan el Shadow DOM; los datos van en `event.detail`.

- **Acciones y formularios:** [`<df-button>`](#df-button), [`<df-input>`](#df-input), [`<df-select>`](#df-select), [`<df-switch>`](#df-switch)
- **Superposiciones y feedback:** [`<df-modal>`](#df-modal), [`<df-toast-stack>`](#df-toast-stack), [`<df-tooltip>`](#df-tooltip), [`<df-progress>`](#df-progress)
- **Datos y presentación:** [`<df-data-table>`](#df-data-table), [`<df-stat-card>`](#df-stat-card), [`<df-badge>`](#df-badge), [`<df-avatar>`](#df-avatar)
- **Estructura:** [`<df-tabs>`](#df-tabs), [`<df-theme-toggle>`](#df-theme-toggle)

---

## df-button

Botón con variantes, tamaños, estado de carga y envío de formularios. El botón de la marca, con la forma de pestaña recortada por defecto. Dentro de un <form> puede enviarlo o resetearlo con type="submit" o type="reset", igual que un botón nativo.

```html
<df-button>Guardar</df-button>
<df-button variant="secondary">Cancelar</df-button>
<df-button variant="success">Publicar</df-button>
<df-button variant="danger">Eliminar</df-button>
<df-button variant="ghost">Más tarde</df-button>
```

### Propiedades

| Propiedad | Atributo | Tipo | Por defecto | Descripción |
|---|---|---|---|---|
| `variant` | `variant` | `'primary' \| 'secondary' \| 'success' \| 'danger' \| 'warning' \| 'ghost'` | `"primary"` | Color del botón. |
| `size` | `size` | `'sm' \| 'md' \| 'lg'` | `"md"` | Tamaño. |
| `shape` | `shape` | `'tab' \| 'rounded' \| 'pill'` | `"tab"` | Forma: recortada, redondeada o píldora. |
| `type` | `type` | `'button' \| 'submit' \| 'reset'` | `"button"` | Comportamiento dentro de un formulario. |
| `disabled` | `disabled` | `boolean` | `false` | Desactiva el botón. |
| `loading` | `loading` | `boolean` | `false` | Muestra un spinner y bloquea los clics. |
| `block` | `block` | `boolean` | `false` | Ocupa todo el ancho disponible. |

### Eventos

| Evento | `detail` | Cuándo |
|---|---|---|
| `df-click` | `{ variant: string }` | Al pulsar. No se lanza si está disabled o loading. |

### Métodos

| Método | Descripción |
|---|---|
| `focus(options?: FocusOptions): void` | Pone el foco en el botón interno. |

**Slots:** `(por defecto)` (Texto e iconos del botón.)

**Partes CSS (`::part`):** `button` (El <button> interno.)

**Accesibilidad:**

- Usa un <button> nativo por dentro: funciona con Tab, Enter y Espacio.
- En loading se marca aria-busy="true".
- Foco visible con contorno azul.

---

## df-input

Campo de texto con etiqueta, ayuda y validación integrada. Valida campos obligatorios, correos, números, longitud mínima y patrones. Muestra el error debajo y lo quita en cuanto el valor es correcto.

```html
<df-input label="Correo" type="email" placeholder="ana@ejemplo.com" hint="Te escribiremos aquí" required></df-input>
```

### Propiedades

| Propiedad | Atributo | Tipo | Por defecto | Descripción |
|---|---|---|---|---|
| `label` | `label` | `string` | `""` | Texto de la etiqueta. |
| `type` | `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'date' \| 'textarea'` | `"text"` | Tipo de campo (textarea crea un área de texto). |
| `name` | `name` | `string` | `""` | Nombre del campo; lo usa DfInput.collect(). |
| `value` | `value` | `string` | `""` | Valor actual. |
| `placeholder` | `placeholder` | `string` | `""` | Texto de ejemplo. |
| `hint` | `hint` | `string` | `""` | Ayuda bajo el campo. |
| `required` | `required` | `boolean` | `false` | Obligatorio. |
| `disabled` | `disabled` | `boolean` | `false` | Desactivado. |
| `pattern` | `pattern` | `string` | `""` | Expresión regular que debe cumplir el valor completo. |
| `minlength` | `minlength` | `number` | `0` | Longitud mínima. |
| `rows` | `rows` | `number` | `3` | Filas cuando type="textarea". |
| `errorMessage` | `error-message` | `string` | `""` | Sustituye al mensaje de error automático. |
| `invalid` | `invalid` | `boolean` | `false` | Lo activa validate() cuando falla. |

### Eventos

| Evento | `detail` | Cuándo |
|---|---|---|
| `df-input` | `{ value: string, name: string }` | En cada pulsación. |
| `df-change` | `{ value: string, name: string, valid: boolean }` | Al salir del campo tras cambiarlo (valida). |
| `df-enter` | `{ value: string, name: string }` | Al pulsar Enter (no en textarea). |
| `df-invalid` | `{ value: string, name: string, message: string }` | Cuando validate() falla. |

### Métodos

| Método | Descripción |
|---|---|
| `validate(options?: { silent?: boolean }): boolean` | Valida, muestra el error y lanza df-invalid si falla. |
| `checkValidity(): boolean` | Valida sin mostrar nada. |
| `clear(): void` | Vacía el campo y quita el error. |
| `focus(options?: FocusOptions): void` | Foco en el campo interno. |
| `static validateAll(container: ParentNode): boolean` | Valida todos los df-input y df-select de un contenedor y enfoca el primero con error. |
| `static collect(container: ParentNode): Record<string, string \| boolean>` | Devuelve { name: valor } de los df-input, df-select y df-switch. |

**Partes CSS (`::part`):** `field` (El <input> o <textarea>.), `label` (La etiqueta.)

**Accesibilidad:**

- La etiqueta está asociada al campo.
- aria-invalid refleja el estado de error y el mensaje se anuncia con aria-live.
- Participa en formularios nativos (form-associated custom element).

---

## df-select

Desplegable con estilo propio, búsqueda por letra y navegación con teclado. Sustituye al <select> nativo manteniendo su comportamiento: se usa con <option> hijas o con la propiedad options, y envía su valor dentro de un formulario.

```html
<df-select label="Tipo de perfil" placeholder="Elige uno" style="max-width:280px">
  <option value="cliente">Cliente</option>
  <option value="proveedor">Proveedor</option>
  <option value="alumno">Alumno</option>
  <option value="admin" disabled>Administrador</option>
</df-select>
```

### Propiedades

| Propiedad | Atributo | Tipo | Por defecto | Descripción |
|---|---|---|---|---|
| `value` | `value` | `string` | `""` | Valor seleccionado. |
| `label` | `label` | `string` | `""` | Etiqueta encima. |
| `placeholder` | `placeholder` | `string` | `"Selecciona una opción"` | Texto cuando no hay selección. |
| `name` | `name` | `string` | `""` | Nombre en el formulario. |
| `hint` | `hint` | `string` | `""` | Texto de ayuda. |
| `required` | `required` | `boolean` | `false` | Obligatorio. |
| `disabled` | `disabled` | `boolean` | `false` | Desactivado. |
| `invalid` | `invalid` | `boolean` | `false` | Lo activa validate(). |
| `open` | `open` | `boolean` | `false` | Si la lista está desplegada. |
| `options` | — (solo JS) | `Array<{ value: string, label: string, disabled?: boolean }>` | | Opciones por JavaScript (si no se asigna, se leen las <option> hijas). |

### Eventos

| Evento | `detail` | Cuándo |
|---|---|---|
| `df-change` | `{ value: string, label: string, name: string }` | Cuando el usuario elige otra opción. |
| `df-invalid` | `{ name: string, message: string }` | Cuando validate() falla. |

### Métodos

| Método | Descripción |
|---|---|
| `show(): void` | Despliega la lista. |
| `close(): void` | Cierra la lista. |
| `validate(options?: { silent?: boolean }): boolean` | Comprueba required y muestra el error. |
| `focus(options?: FocusOptions): void` | Foco en el botón. |

**Partes CSS (`::part`):** `trigger` (El botón que abre la lista.), `listbox` (La lista.), `option` (Cada opción.)

**Accesibilidad:**

- Patrón ARIA combobox de solo selección con aria-activedescendant.
- Teclado: ↑ ↓ Inicio Fin para moverse, Enter o Espacio para elegir, Escape para cerrar, una letra para saltar.
- Se cierra al pulsar fuera o con Tab.

---

## df-switch

Interruptor on/off, alternativa visual a una casilla. Para ajustes que se aplican al momento. Dentro de un formulario envía value cuando está encendido.

```html
<df-switch label="Recibir avisos por correo" checked></df-switch>
<df-switch label="Modo compacto"></df-switch>
<df-switch label="No disponible" disabled></df-switch>
```

### Propiedades

| Propiedad | Atributo | Tipo | Por defecto | Descripción |
|---|---|---|---|---|
| `checked` | `checked` | `boolean` | `false` | Encendido. |
| `disabled` | `disabled` | `boolean` | `false` | Desactivado. |
| `label` | `label` | `string` | `""` | Texto junto al interruptor. |
| `name` | `name` | `string` | `""` | Nombre en el formulario. |
| `value` | `value` | `string` | `"on"` | Valor enviado cuando está encendido. |
| `size` | `size` | `'sm' \| 'md' \| 'lg'` | `"md"` | Tamaño. |

### Eventos

| Evento | `detail` | Cuándo |
|---|---|---|
| `df-change` | `{ checked: boolean, name: string }` | Cuando el usuario lo cambia. |

### Métodos

| Método | Descripción |
|---|---|
| `toggle(force?: boolean): boolean` | Cambia el estado por código (sin lanzar evento). |
| `focus(options?: FocusOptions): void` | Foco en el interruptor. |

**Slots:** `(por defecto)` (Contenido propio en lugar de label.)

**Partes CSS (`::part`):** `track` (La pista.), `thumb` (El círculo.)

**Accesibilidad:**

- role="switch" con aria-checked.
- Se cambia con Espacio o Enter.

---

## df-modal

Diálogos modales y atajos con promesas que sustituyen a confirm() y prompt(). Se puede declarar en HTML o crear al vuelo con DfModal.confirm() y DfModal.prompt(), que devuelven una promesa con la respuesta del usuario.

```html
<df-button id="m-confirm" variant="danger">Eliminar cliente</df-button>
```

### Propiedades

| Propiedad | Atributo | Tipo | Por defecto | Descripción |
|---|---|---|---|---|
| `open` | `open` | `boolean` | `false` | Visible o no. |
| `heading` | `heading` | `string` | `"Diálogo"` | Título. |
| `confirmText` | `confirm-text` | `string` | `"Aceptar"` | Texto del botón principal. |
| `cancelText` | `cancel-text` | `string` | `"Cancelar"` | Texto del botón secundario. |
| `variant` | `variant` | `'primary' \| 'danger' \| 'success'` | `"primary"` | Color del botón principal y del borde. |
| `hideCancel` | `hide-cancel` | `boolean` | `false` | Oculta el botón Cancelar. |
| `persistent` | `persistent` | `boolean` | `false` | No se cierra con Escape ni pulsando fuera. |
| `width` | `width` | `string` | `"460px"` | Ancho máximo de la caja. |

### Eventos

| Evento | `detail` | Cuándo |
|---|---|---|
| `df-open` | `{}` | Al abrirse. |
| `df-confirm` | `{}` | Al pulsar Aceptar. Es cancelable: preventDefault() impide que se cierre. |
| `df-cancel` | `{}` | Al pulsar Cancelar, la X, Escape o fuera de la caja. |
| `df-close` | `{ reason: 'confirm' \| 'cancel' \| 'method' }` | Al cerrarse. |

### Métodos

| Método | Descripción |
|---|---|
| `show(): void` | Abre. |
| `close(reason?: 'confirm' \| 'cancel' \| 'method'): void` | Cierra. |
| `toggle(): void` | Alterna. |
| `confirm(): void` | Equivale a pulsar Aceptar. |
| `cancel(): void` | Equivale a pulsar Cancelar. |
| `static confirm(options?: { heading?: string, message?: string, confirmText?: string, cancelText?: string, variant?: string }): Promise<boolean>` | Pregunta de sí o no. |
| `static prompt(options: { heading?: string, message?: string, confirmText?: string, fields: Array<{ name: string, label?: string, type?: string, value?: string \| number \| boolean, required?: boolean, placeholder?: string, pattern?: string, options?: Array<{ value: string, label: string }> }> }): Promise<Record<string, string \| boolean> \| null>` | Formulario con validación; null si se cancela. |

**Slots:** `(por defecto)` (Cuerpo del diálogo.), `footer` (Sustituye a los botones.)

**Partes CSS (`::part`):** `overlay` (Fondo oscuro.), `box` (La caja.)

**Accesibilidad:**

- role="dialog" y aria-modal con el título como nombre.
- El foco queda atrapado dentro mientras está abierto y vuelve al elemento que lo abrió al cerrar.
- Escape cierra solo el modal de arriba si hay varios; el scroll de la página se bloquea.

---

## df-toast-stack

Notificaciones flotantes que se cierran solas. Se coloca una vez en la página y se llama a show(). DfToastStack.notify() lo crea si no existe.

```html
<df-button size="sm" variant="success" data-toast="success">Éxito</df-button>
<df-button size="sm" variant="secondary" data-toast="info">Información</df-button>
<df-button size="sm" variant="warning" data-toast="warning">Aviso</df-button>
<df-button size="sm" variant="danger" data-toast="danger">Error</df-button>
```

### Propiedades

| Propiedad | Atributo | Tipo | Por defecto | Descripción |
|---|---|---|---|---|
| `position` | `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left' \| 'top-center' \| 'bottom-center'` | `"bottom-right"` | Esquina de la pantalla. |
| `duration` | `duration` | `number` | `3000` | Milisegundos visibles (0 = no se cierran solas). |
| `max` | `max` | `number` | `5` | Máximo a la vez; se quita la más antigua. |

### Eventos

| Evento | `detail` | Cuándo |
|---|---|---|
| `df-toast-show` | `{ message: string, type: string }` | Al mostrar una notificación. |
| `df-toast-hide` | `{ message: string, type: string, reason: 'timeout' \| 'click' \| 'overflow' \| 'clear' }` | Al quitarla. |

### Métodos

| Método | Descripción |
|---|---|
| `show(message: string, type?: 'success' \| 'info' \| 'warning' \| 'danger', duration?: number): HTMLElement` | Muestra una notificación. |
| `dismiss(toast: HTMLElement, reason?: string): void` | Quita una notificación concreta. |
| `clear(): void` | Quita todas. |
| `static notify(message: string, type?: 'success' \| 'info' \| 'warning' \| 'danger'): HTMLElement` | Usa o crea el contenedor de la página. |

**Partes CSS (`::part`):** `toast` (Cada notificación.)

**Accesibilidad:**

- Contenedor con role="status" y aria-live="polite".
- El mensaje se inserta como texto, nunca como HTML.
- Pulsar una notificación la cierra.

---

## df-tooltip

Texto de ayuda al pasar el ratón o enfocar con teclado. Envuelve cualquier elemento. Ideal para botones que solo tienen icono.

```html
<df-tooltip text="Arriba"><df-button variant="ghost" size="sm">top</df-button></df-tooltip>
<df-tooltip text="Abajo" placement="bottom"><df-button variant="ghost" size="sm">bottom</df-button></df-tooltip>
<df-tooltip text="Izquierda" placement="left"><df-button variant="ghost" size="sm">left</df-button></df-tooltip>
<df-tooltip text="Derecha" placement="right"><df-button variant="ghost" size="sm">right</df-button></df-tooltip>
```

### Propiedades

| Propiedad | Atributo | Tipo | Por defecto | Descripción |
|---|---|---|---|---|
| `text` | `text` | `string` | `""` | Texto del tooltip. |
| `placement` | `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `"top"` | Posición respecto al elemento. |
| `delay` | `delay` | `number` | `150` | Milisegundos antes de aparecer. |
| `disabled` | `disabled` | `boolean` | `false` | No se muestra. |

### Eventos

| Evento | `detail` | Cuándo |
|---|---|---|
| `df-show` | `{}` | Al aparecer. |
| `df-hide` | `{}` | Al ocultarse. |

### Métodos

| Método | Descripción |
|---|---|
| `show(): void` | Muestra al instante. |
| `hide(): void` | Oculta. |

**Slots:** `(por defecto)` (El elemento que dispara el tooltip.)

**Partes CSS (`::part`):** `tip` (La burbuja.)

**Accesibilidad:**

- El texto se enlaza al disparador con aria-describedby, así los lectores de pantalla lo leen.
- Aparece también con el foco del teclado y Escape lo cierra.

---

## df-progress

Barra de progreso, con modo indeterminado. Para subidas, procesos por pasos o cargas de duración desconocida.

```html
<df-progress label="Subiendo informe.pdf" value="64" show-value></df-progress>
<df-progress label="Espacio usado" value="92" variant="warning" show-value></df-progress>
```

### Propiedades

| Propiedad | Atributo | Tipo | Por defecto | Descripción |
|---|---|---|---|---|
| `value` | `value` | `number` | `0` | Valor actual. |
| `max` | `max` | `number` | `100` | Valor máximo. |
| `label` | `label` | `string` | `""` | Texto encima (y nombre accesible). |
| `variant` | `variant` | `'default' \| 'success' \| 'warning' \| 'danger'` | `"default"` | Color. |
| `indeterminate` | `indeterminate` | `boolean` | `false` | Animación sin valor concreto. |
| `showValue` | `show-value` | `boolean` | `false` | Muestra el porcentaje. |
| `size` | `size` | `'sm' \| 'md' \| 'lg'` | `"md"` | Grosor. |

### Eventos

| Evento | `detail` | Cuándo |
|---|---|---|
| `df-complete` | `{ value: number, max: number }` | Una vez, al llegar al máximo. |

**Partes CSS (`::part`):** `track` (El fondo.), `bar` (La parte rellena.)

**Accesibilidad:**

- role="progressbar" con aria-valuenow, aria-valuemin y aria-valuemax.
- En modo indeterminado se quita aria-valuenow y se marca aria-busy.
- Respeta prefers-reduced-motion.

---

## df-data-table

Tabla con ordenación por columnas, búsqueda y paginación. Recibe columnas y filas por JavaScript. La búsqueda ignora mayúsculas y tildes; las columnas pueden formatear moneda, números y fechas, o pintar lo que quieras con render.

```html
<df-data-table id="t-demo" searchable page-size="4" striped clickable caption="Clientes"></df-data-table>
```

### Propiedades

| Propiedad | Atributo | Tipo | Por defecto | Descripción |
|---|---|---|---|---|
| `pageSize` | `page-size` | `number` | `10` | Filas por página (0 = sin paginar). |
| `searchable` | `searchable` | `boolean` | `false` | Muestra la caja de búsqueda. |
| `searchPlaceholder` | `search-placeholder` | `string` | `"Buscar…"` | Texto de la búsqueda. |
| `emptyText` | `empty-text` | `string` | `"No hay datos"` | Texto cuando no hay datos. |
| `sortKey` | `sort-key` | `string` | `""` | Columna por la que se ordena. |
| `sortDir` | `sort-dir` | `'asc' \| 'desc'` | `"asc"` | Dirección del orden. |
| `striped` | `striped` | `boolean` | `false` | Filas alternas sombreadas. |
| `clickable` | `clickable` | `boolean` | `false` | Las filas se pueden pulsar. |
| `caption` | `caption` | `string` | `""` | Título accesible de la tabla. |
| `columns` | — (solo JS) | `Array<{ key: string, label?: string, sortable?: boolean, align?: 'left' \| 'right' \| 'center', type?: 'text' \| 'number' \| 'currency' \| 'date', render?: (row) => string \| Node }>` | | Definición de columnas. |
| `rows` | — (solo JS) | `Array<object>` | | Datos. |

### Eventos

| Evento | `detail` | Cuándo |
|---|---|---|
| `df-sort` | `{ key: string, direction: 'asc' \| 'desc' }` | Al ordenar por una columna. |
| `df-search` | `{ query: string, total: number }` | Al escribir en la búsqueda. |
| `df-page` | `{ page: number, pages: number }` | Al cambiar de página. |
| `df-row-click` | `{ row: object, index: number }` | Al pulsar una fila (con clickable). |

### Métodos

| Método | Descripción |
|---|---|
| `setData(rows: object[]): void` | Cambia los datos. |
| `search(text: string): void` | Busca por código. |
| `sortBy(key: string, direction?: 'asc' \| 'desc'): void` | Ordena; si ya estaba ordenada por esa columna, invierte. |
| `goToPage(page: number): void` | Va a una página. |

**Slots:** `toolbar` (Acciones a la derecha de la búsqueda.)

**Partes CSS (`::part`):** `table` (La tabla.)

**Accesibilidad:**

- Cabeceras con scope="col" y aria-sort en la columna ordenada.
- La paginación es un <nav> con aria-current en la página actual.
- El recuento de resultados se anuncia con aria-live.

---

## df-stat-card

Tarjeta de métrica con formato automático de moneda, número o porcentaje. Le pasas el número tal cual y lo formatea en español (1.234,50 €, 42,5 %).

```html
<div class="demo-grid">
  <df-stat-card label="Facturación" value="12480.5" format="currency" variant="success" hint="Este mes"></df-stat-card>
  <df-stat-card label="Pedidos" value="1534" format="number" unit="u."></df-stat-card>
  <df-stat-card label="Conversión" value="3.8" format="percent" variant="info"></df-stat-card>
</div>
```

### Propiedades

| Propiedad | Atributo | Tipo | Por defecto | Descripción |
|---|---|---|---|---|
| `label` | `label` | `string` | `""` | Título de la métrica. |
| `value` | `value` | `string` | `"0"` | Valor (texto o número). |
| `format` | `format` | `'text' \| 'number' \| 'currency' \| 'percent'` | `"text"` | Cómo se muestra el valor. |
| `currency` | `currency` | `string` | `"EUR"` | Moneda si format="currency". |
| `unit` | `unit` | `string` | `""` | Unidad detrás del valor. |
| `hint` | `hint` | `string` | `""` | Texto pequeño debajo. |
| `variant` | `variant` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `"default"` | Color. |
| `interactive` | `interactive` | `boolean` | `false` | Se puede pulsar y enfocar. |

### Eventos

| Evento | `detail` | Cuándo |
|---|---|---|
| `df-select` | `{ label: string, value: string }` | Al pulsar una tarjeta interactive (clic, Enter o Espacio). |

**Slots:** `icon` (Icono a la derecha.)

**Partes CSS (`::part`):** `card` (La tarjeta.), `value` (El valor.)

**Accesibilidad:**

- Con interactive pasa a ser role="button" enfocable y responde a Enter y Espacio.

---

## df-badge

Etiqueta de color para estados y categorías. Acepta los colores de la paleta por nombre o cualquier color CSS.

```html
<df-badge>teal</df-badge>
<df-badge color="blue">blue</df-badge>
<df-badge color="purple">purple</df-badge>
<df-badge color="green" variant="soft" dot>Activo</df-badge>
<df-badge color="red" variant="soft" dot>Inactivo</df-badge>
<df-badge color="orange" variant="outline">Pendiente</df-badge>
<df-badge color="#7c3aed" size="sm">Urgente</df-badge>
```

### Propiedades

| Propiedad | Atributo | Tipo | Por defecto | Descripción |
|---|---|---|---|---|
| `color` | `color` | `'teal' \| 'blue' \| 'green' \| 'orange' \| 'red' \| 'yellow' \| 'purple' \| 'magenta' \| 'gray'` | `"teal"` | Color de la paleta o cualquier color CSS. |
| `variant` | `variant` | `'solid' \| 'soft' \| 'outline'` | `"solid"` | Relleno. |
| `size` | `size` | `'sm' \| 'md'` | `"md"` | Tamaño. |
| `dot` | `dot` | `boolean` | `false` | Punto delante del texto. |

**Slots:** `(por defecto)` (Texto.)

**Partes CSS (`::part`):** `badge` (El contenedor.)

**Accesibilidad:**

- El texto es contenido normal; no transmitas información solo con el color.

---

## df-avatar

Foto de usuario o iniciales con un color calculado a partir del nombre. Si no hay imagen, o no carga, muestra las iniciales. El mismo nombre siempre tiene el mismo color.

```html
<df-avatar name="Diego Fernández" status="online"></df-avatar>
<df-avatar name="Ana Gómez" status="away"></df-avatar>
<df-avatar name="Sodire Tech" shape="square" status="busy"></df-avatar>
<df-avatar name="Marcos Alonso" status="offline"></df-avatar>
```

### Propiedades

| Propiedad | Atributo | Tipo | Por defecto | Descripción |
|---|---|---|---|---|
| `name` | `name` | `string` | `""` | Nombre de la persona. |
| `src` | `src` | `string` | `""` | URL de la imagen. |
| `size` | `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `"md"` | Tamaño. |
| `shape` | `shape` | `'circle' \| 'square'` | `"circle"` | Forma. |
| `status` | `status` | `'' \| 'online' \| 'away' \| 'busy' \| 'offline'` | `""` | Punto de estado. |

### Eventos

| Evento | `detail` | Cuándo |
|---|---|---|
| `df-error` | `{ src: string }` | Si la imagen no se puede cargar. |

**Partes CSS (`::part`):** `avatar` (El círculo o cuadrado.)

**Accesibilidad:**

- role="img" con el nombre y el estado como etiqueta accesible.

---

## df-tabs

Pestañas generadas a partir de paneles <df-tab-panel>. Cada <df-tab-panel label="…"> se convierte en una pestaña. Incluye df-tab-panel.

```html
<df-tabs>
  <df-tab-panel label="Perfil">Nombre, foto y datos de contacto.</df-tab-panel>
  <df-tab-panel label="Seguridad">Contraseña y verificación en dos pasos.</df-tab-panel>
  <df-tab-panel label="Facturación" disabled>Disponible en el plan Pro.</df-tab-panel>
  <df-tab-panel label="Avisos">Qué correos quieres recibir.</df-tab-panel>
</df-tabs>
```

### Propiedades

| Propiedad | Atributo | Tipo | Por defecto | Descripción |
|---|---|---|---|---|
| `selected` | `selected` | `number` | `0` | Índice de la pestaña activa. |
| `variant` | `variant` | `'line' \| 'pill'` | `"line"` | Estilo: subrayado o píldoras. |

### Eventos

| Evento | `detail` | Cuándo |
|---|---|---|
| `df-tab-change` | `{ index: number, label: string }` | Cuando el usuario cambia de pestaña. |

### Métodos

| Método | Descripción |
|---|---|
| `select(index: number): void` | Selecciona por código (sin evento). |
| `refresh(): void` | Regenera las pestañas (se llama sola al añadir o quitar paneles). |

**Slots:** `(por defecto)` (Los <df-tab-panel> (props: label, disabled).)

**Partes CSS (`::part`):** `tablist` (La fila de pestañas.), `tab` (Cada pestaña.)

**Accesibilidad:**

- Patrón ARIA tabs: role tablist/tab/tabpanel y aria-selected.
- Teclado: ← → Inicio Fin, saltando las pestañas desactivadas; solo la activa está en el orden de Tab.

---

## df-theme-toggle

Interruptor de tema claro y oscuro que recuerda la elección. Pone data-theme="dark" en el elemento objetivo. Como todos los componentes leen variables CSS, el modo oscuro funciona solo.

```html
<div id="zona-tema" class="demo-zona">
  <df-theme-toggle target="#zona-tema" class="toggle-oscuro"></df-theme-toggle>
  <df-stat-card label="Visitas" value="2380" format="number"></df-stat-card>
</div>
```

### Propiedades

| Propiedad | Atributo | Tipo | Por defecto | Descripción |
|---|---|---|---|---|
| `theme` | `theme` | `'light' \| 'dark'` | `"light"` | Tema actual. |
| `target` | `target` | `string` | `"body"` | Selector del elemento al que se aplica. |
| `storageKey` | `storage-key` | `string` | `""` | Clave de localStorage para recordarlo. |

### Eventos

| Evento | `detail` | Cuándo |
|---|---|---|
| `df-theme-change` | `{ theme: 'light' \| 'dark' }` | Cuando el usuario lo cambia (asignar theme por código no lo lanza). |

### Métodos

| Método | Descripción |
|---|---|
| `toggle(): 'light' \| 'dark'` | Cambia al tema contrario. |
| `applyTheme(): void` | Vuelve a aplicar el tema actual. |

**Partes CSS (`::part`):** `button` (El botón.)

**Variables CSS:** `--df-toggle-color`, `--df-toggle-bg`, `--df-toggle-bg-hover`

**Accesibilidad:**

- aria-label cambia según la acción ("Cambiar a tema oscuro").

---

## Temas

Los componentes leen variables CSS de la página: `--bg-navbar`, `--bg-card`, `--bg-input`, `--border-color`, `--text-main`, `--text-muted`, `--accent-teal`, `--accent-blue`… (las de la interfaz diegofo-ui). Para cambiar solo el color principal de los componentes usa `--df-color-primary` y `--df-color-secondary`. Para retocar piezas internas, `::part()`.
