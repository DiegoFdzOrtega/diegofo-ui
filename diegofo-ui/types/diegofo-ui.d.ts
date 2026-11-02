// Tipos de diegofo-ui v2.0.0. Generado con `npm run docs`: no editar a mano.

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

/** Botón con variantes, tamaños, estado de carga y envío de formularios. */
export declare class DfButton extends DfElement {
  /** Color del botón. Por defecto `"primary"`. */
  variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
  /** Tamaño. Por defecto `"md"`. */
  size: 'sm' | 'md' | 'lg';
  /** Forma: recortada, redondeada o píldora. Por defecto `"tab"`. */
  shape: 'tab' | 'rounded' | 'pill';
  /** Comportamiento dentro de un formulario. Por defecto `"button"`. */
  type: 'button' | 'submit' | 'reset';
  /** Desactiva el botón. Por defecto `false`. */
  disabled: boolean;
  /** Muestra un spinner y bloquea los clics. Por defecto `false`. */
  loading: boolean;
  /** Ocupa todo el ancho disponible. Por defecto `false`. */
  block: boolean;
  /** Pone el foco en el botón interno. */
  focus(options?: FocusOptions): void;
}

/** Campo de texto con etiqueta, ayuda y validación integrada. */
export declare class DfInput extends DfElement {
  /** Texto de la etiqueta. Por defecto `""`. */
  label: string;
  /** Tipo de campo (textarea crea un área de texto). Por defecto `"text"`. */
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea';
  /** Nombre del campo; lo usa DfInput.collect(). Por defecto `""`. */
  name: string;
  /** Valor actual. Por defecto `""`. */
  value: string;
  /** Texto de ejemplo. Por defecto `""`. */
  placeholder: string;
  /** Ayuda bajo el campo. Por defecto `""`. */
  hint: string;
  /** Obligatorio. Por defecto `false`. */
  required: boolean;
  /** Desactivado. Por defecto `false`. */
  disabled: boolean;
  /** Expresión regular que debe cumplir el valor completo. Por defecto `""`. */
  pattern: string;
  /** Longitud mínima. Por defecto `0`. */
  minlength: number;
  /** Filas cuando type="textarea". Por defecto `3`. */
  rows: number;
  /** Sustituye al mensaje de error automático. Por defecto `""`. */
  errorMessage: string;
  /** Lo activa validate() cuando falla. Por defecto `false`. */
  invalid: boolean;
  /** Valida, muestra el error y lanza df-invalid si falla. */
  validate(options?: { silent?: boolean }): boolean;
  /** Valida sin mostrar nada. */
  checkValidity(): boolean;
  /** Vacía el campo y quita el error. */
  clear(): void;
  /** Foco en el campo interno. */
  focus(options?: FocusOptions): void;
  /** Valida todos los df-input y df-select de un contenedor y enfoca el primero con error. */
  static validateAll(container: ParentNode): boolean;
  /** Devuelve { name: valor } de los df-input, df-select y df-switch. */
  static collect(container: ParentNode): Record<string, string | boolean>;
}

/** Desplegable con estilo propio, búsqueda por letra y navegación con teclado. */
export declare class DfSelect extends DfElement {
  /** Valor seleccionado. Por defecto `""`. */
  value: string;
  /** Etiqueta encima. Por defecto `""`. */
  label: string;
  /** Texto cuando no hay selección. Por defecto `"Selecciona una opción"`. */
  placeholder: string;
  /** Nombre en el formulario. Por defecto `""`. */
  name: string;
  /** Texto de ayuda. Por defecto `""`. */
  hint: string;
  /** Obligatorio. Por defecto `false`. */
  required: boolean;
  /** Desactivado. Por defecto `false`. */
  disabled: boolean;
  /** Lo activa validate(). Por defecto `false`. */
  invalid: boolean;
  /** Si la lista está desplegada. Por defecto `false`. */
  open: boolean;
  /** Opciones por JavaScript (si no se asigna, se leen las <option> hijas). */
  options: Array<{ value: string, label: string, disabled?: boolean }>;
  /** Despliega la lista. */
  show(): void;
  /** Cierra la lista. */
  close(): void;
  /** Comprueba required y muestra el error. */
  validate(options?: { silent?: boolean }): boolean;
  /** Foco en el botón. */
  focus(options?: FocusOptions): void;
}

/** Interruptor on/off, alternativa visual a una casilla. */
export declare class DfSwitch extends DfElement {
  /** Encendido. Por defecto `false`. */
  checked: boolean;
  /** Desactivado. Por defecto `false`. */
  disabled: boolean;
  /** Texto junto al interruptor. Por defecto `""`. */
  label: string;
  /** Nombre en el formulario. Por defecto `""`. */
  name: string;
  /** Valor enviado cuando está encendido. Por defecto `"on"`. */
  value: string;
  /** Tamaño. Por defecto `"md"`. */
  size: 'sm' | 'md' | 'lg';
  /** Cambia el estado por código (sin lanzar evento). */
  toggle(force?: boolean): boolean;
  /** Foco en el interruptor. */
  focus(options?: FocusOptions): void;
}

/** Diálogos modales y atajos con promesas que sustituyen a confirm() y prompt(). */
export declare class DfModal extends DfElement {
  /** Visible o no. Por defecto `false`. */
  open: boolean;
  /** Título. Por defecto `"Diálogo"`. */
  heading: string;
  /** Texto del botón principal. Por defecto `"Aceptar"`. */
  confirmText: string;
  /** Texto del botón secundario. Por defecto `"Cancelar"`. */
  cancelText: string;
  /** Color del botón principal y del borde. Por defecto `"primary"`. */
  variant: 'primary' | 'danger' | 'success';
  /** Oculta el botón Cancelar. Por defecto `false`. */
  hideCancel: boolean;
  /** No se cierra con Escape ni pulsando fuera. Por defecto `false`. */
  persistent: boolean;
  /** Ancho máximo de la caja. Por defecto `"460px"`. */
  width: string;
  /** Abre. */
  show(): void;
  /** Cierra. */
  close(reason?: 'confirm' | 'cancel' | 'method'): void;
  /** Alterna. */
  toggle(): void;
  /** Equivale a pulsar Aceptar. */
  confirm(): void;
  /** Equivale a pulsar Cancelar. */
  cancel(): void;
  /** Pregunta de sí o no. */
  static confirm(options?: { heading?: string, message?: string, confirmText?: string, cancelText?: string, variant?: string }): Promise<boolean>;
  /** Formulario con validación; null si se cancela. */
  static prompt(options: { heading?: string, message?: string, confirmText?: string, fields: Array<{ name: string, label?: string, type?: string, value?: string | number | boolean, required?: boolean, placeholder?: string, pattern?: string, options?: Array<{ value: string, label: string }> }> }): Promise<Record<string, string | boolean> | null>;
}

/** Notificaciones flotantes que se cierran solas. */
export declare class DfToastStack extends DfElement {
  /** Esquina de la pantalla. Por defecto `"bottom-right"`. */
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'top-center' | 'bottom-center';
  /** Milisegundos visibles (0 = no se cierran solas). Por defecto `3000`. */
  duration: number;
  /** Máximo a la vez; se quita la más antigua. Por defecto `5`. */
  max: number;
  /** Muestra una notificación. */
  show(message: string, type?: 'success' | 'info' | 'warning' | 'danger', duration?: number): HTMLElement;
  /** Quita una notificación concreta. */
  dismiss(toast: HTMLElement, reason?: string): void;
  /** Quita todas. */
  clear(): void;
  /** Usa o crea el contenedor de la página. */
  static notify(message: string, type?: 'success' | 'info' | 'warning' | 'danger'): HTMLElement;
}

/** Texto de ayuda al pasar el ratón o enfocar con teclado. */
export declare class DfTooltip extends DfElement {
  /** Texto del tooltip. Por defecto `""`. */
  text: string;
  /** Posición respecto al elemento. Por defecto `"top"`. */
  placement: 'top' | 'bottom' | 'left' | 'right';
  /** Milisegundos antes de aparecer. Por defecto `150`. */
  delay: number;
  /** No se muestra. Por defecto `false`. */
  disabled: boolean;
  /** Muestra al instante. */
  show(): void;
  /** Oculta. */
  hide(): void;
}

/** Barra de progreso, con modo indeterminado. */
export declare class DfProgress extends DfElement {
  /** Valor actual. Por defecto `0`. */
  value: number;
  /** Valor máximo. Por defecto `100`. */
  max: number;
  /** Texto encima (y nombre accesible). Por defecto `""`. */
  label: string;
  /** Color. Por defecto `"default"`. */
  variant: 'default' | 'success' | 'warning' | 'danger';
  /** Animación sin valor concreto. Por defecto `false`. */
  indeterminate: boolean;
  /** Muestra el porcentaje. Por defecto `false`. */
  showValue: boolean;
  /** Grosor. Por defecto `"md"`. */
  size: 'sm' | 'md' | 'lg';
}

/** Tabla con ordenación por columnas, búsqueda y paginación. */
export declare class DfDataTable extends DfElement {
  /** Filas por página (0 = sin paginar). Por defecto `10`. */
  pageSize: number;
  /** Muestra la caja de búsqueda. Por defecto `false`. */
  searchable: boolean;
  /** Texto de la búsqueda. Por defecto `"Buscar…"`. */
  searchPlaceholder: string;
  /** Texto cuando no hay datos. Por defecto `"No hay datos"`. */
  emptyText: string;
  /** Columna por la que se ordena. Por defecto `""`. */
  sortKey: string;
  /** Dirección del orden. Por defecto `"asc"`. */
  sortDir: 'asc' | 'desc';
  /** Filas alternas sombreadas. Por defecto `false`. */
  striped: boolean;
  /** Las filas se pueden pulsar. Por defecto `false`. */
  clickable: boolean;
  /** Título accesible de la tabla. Por defecto `""`. */
  caption: string;
  /** Definición de columnas. */
  columns: Array<{ key: string, label?: string, sortable?: boolean, align?: 'left' | 'right' | 'center', type?: 'text' | 'number' | 'currency' | 'date', render?: (row: any) => string | Node }>;
  /** Datos. */
  rows: Array<object>;
  /** Cambia los datos. */
  setData(rows: object[]): void;
  /** Busca por código. */
  search(text: string): void;
  /** Ordena; si ya estaba ordenada por esa columna, invierte. */
  sortBy(key: string, direction?: 'asc' | 'desc'): void;
  /** Va a una página. */
  goToPage(page: number): void;
}

/** Tarjeta de métrica con formato automático de moneda, número o porcentaje. */
export declare class DfStatCard extends DfElement {
  /** Título de la métrica. Por defecto `""`. */
  label: string;
  /** Valor (texto o número). Por defecto `"0"`. */
  value: string;
  /** Cómo se muestra el valor. Por defecto `"text"`. */
  format: 'text' | 'number' | 'currency' | 'percent';
  /** Moneda si format="currency". Por defecto `"EUR"`. */
  currency: string;
  /** Unidad detrás del valor. Por defecto `""`. */
  unit: string;
  /** Texto pequeño debajo. Por defecto `""`. */
  hint: string;
  /** Color. Por defecto `"default"`. */
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
  /** Se puede pulsar y enfocar. Por defecto `false`. */
  interactive: boolean;
}

/** Etiqueta de color para estados y categorías. */
export declare class DfBadge extends DfElement {
  /** Color de la paleta o cualquier color CSS. Por defecto `"teal"`. */
  color: 'teal' | 'blue' | 'green' | 'orange' | 'red' | 'yellow' | 'purple' | 'magenta' | 'gray';
  /** Relleno. Por defecto `"solid"`. */
  variant: 'solid' | 'soft' | 'outline';
  /** Tamaño. Por defecto `"md"`. */
  size: 'sm' | 'md';
  /** Punto delante del texto. Por defecto `false`. */
  dot: boolean;
}

/** Foto de usuario o iniciales con un color calculado a partir del nombre. */
export declare class DfAvatar extends DfElement {
  /** Nombre de la persona. Por defecto `""`. */
  name: string;
  /** URL de la imagen. Por defecto `""`. */
  src: string;
  /** Tamaño. Por defecto `"md"`. */
  size: 'sm' | 'md' | 'lg' | 'xl';
  /** Forma. Por defecto `"circle"`. */
  shape: 'circle' | 'square';
  /** Punto de estado. Por defecto `""`. */
  status: '' | 'online' | 'away' | 'busy' | 'offline';
}

/** Pestañas generadas a partir de paneles <df-tab-panel>. */
export declare class DfTabs extends DfElement {
  /** Índice de la pestaña activa. Por defecto `0`. */
  selected: number;
  /** Estilo: subrayado o píldoras. Por defecto `"line"`. */
  variant: 'line' | 'pill';
  /** Selecciona por código (sin evento). */
  select(index: number): void;
  /** Regenera las pestañas (se llama sola al añadir o quitar paneles). */
  refresh(): void;
}

/** Interruptor de tema claro y oscuro que recuerda la elección. */
export declare class DfThemeToggle extends DfElement {
  /** Tema actual. Por defecto `"light"`. */
  theme: 'light' | 'dark';
  /** Selector del elemento al que se aplica. Por defecto `"body"`. */
  target: string;
  /** Clave de localStorage para recordarlo. Por defecto `""`. */
  storageKey: string;
  /** Cambia al tema contrario. */
  toggle(): 'light' | 'dark';
  /** Vuelve a aplicar el tema actual. */
  applyTheme(): void;
}

/** Panel de un <df-tabs>. */
export declare class DfTabPanel extends DfElement {
  label: string;
  disabled: boolean;
}

declare global {
  interface HTMLElementTagNameMap {
    'df-button': DfButton;
    'df-input': DfInput;
    'df-select': DfSelect;
    'df-switch': DfSwitch;
    'df-modal': DfModal;
    'df-toast-stack': DfToastStack;
    'df-tooltip': DfTooltip;
    'df-progress': DfProgress;
    'df-data-table': DfDataTable;
    'df-stat-card': DfStatCard;
    'df-badge': DfBadge;
    'df-avatar': DfAvatar;
    'df-tabs': DfTabs;
    'df-theme-toggle': DfThemeToggle;
    'df-tab-panel': DfTabPanel;
  }
  interface HTMLElementEventMap {
    'df-click': CustomEvent<{ variant: string }>;
    'df-input': CustomEvent<{ value: string, name: string }>;
    'df-change': CustomEvent<{ value: string, name: string, valid: boolean } | { value: string, label: string, name: string } | { checked: boolean, name: string }>;
    'df-enter': CustomEvent<{ value: string, name: string }>;
    'df-invalid': CustomEvent<{ value: string, name: string, message: string } | { name: string, message: string }>;
    'df-open': CustomEvent<Record<string, never>>;
    'df-confirm': CustomEvent<Record<string, never>>;
    'df-cancel': CustomEvent<Record<string, never>>;
    'df-close': CustomEvent<{ reason: 'confirm' | 'cancel' | 'method' }>;
    'df-toast-show': CustomEvent<{ message: string, type: string }>;
    'df-toast-hide': CustomEvent<{ message: string, type: string, reason: 'timeout' | 'click' | 'overflow' | 'clear' }>;
    'df-show': CustomEvent<Record<string, never>>;
    'df-hide': CustomEvent<Record<string, never>>;
    'df-complete': CustomEvent<{ value: number, max: number }>;
    'df-sort': CustomEvent<{ key: string, direction: 'asc' | 'desc' }>;
    'df-search': CustomEvent<{ query: string, total: number }>;
    'df-page': CustomEvent<{ page: number, pages: number }>;
    'df-row-click': CustomEvent<{ row: object, index: number }>;
    'df-select': CustomEvent<{ label: string, value: string }>;
    'df-error': CustomEvent<{ src: string }>;
    'df-tab-change': CustomEvent<{ index: number, label: string }>;
    'df-theme-change': CustomEvent<{ theme: 'light' | 'dark' }>;
  }
  interface Window {
    DiegofoUI: typeof import('./diegofo-ui');
  }
}
