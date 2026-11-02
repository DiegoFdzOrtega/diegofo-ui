/**
 * @file Clase base de todos los componentes de diegofo-ui.
 *
 * Se encarga de lo que todos los componentes tienen en común:
 *  - Crear el Shadow DOM (encapsulación de estilos y marcado).
 *  - Declarar propiedades con tipo y VALOR POR DEFECTO a partir de `static properties`.
 *    Cada propiedad queda sincronizada con su atributo HTML (kebab-case).
 *  - Volver a pintar las partes necesarias cuando cambia un atributo.
 *  - Lanzar eventos personalizados (`emit`) que atraviesan el Shadow DOM.
 *
 * @example
 * class MiComponente extends DfElement {
 *   static properties = {
 *     texto:    { type: String,  default: 'Hola' },
 *     cantidad: { type: Number,  default: 0 },
 *     activo:   { type: Boolean, default: false },
 *   };
 *   template() { return `<p></p>`; }
 *   update() { this.$('p').textContent = `${this.texto} (${this.cantidad})`; }
 * }
 * MiComponente.define('mi-componente');
 */

/**
 * Convierte camelCase a kebab-case: `errorMessage` → `error-message`.
 * @param {string} name
 * @returns {string}
 */
export function toKebab(name) {
  return name.replace(/[A-Z]/g, (letra) => `-${letra.toLowerCase()}`);
}

/**
 * Convierte el valor de un atributo HTML (siempre texto o null) al tipo de la propiedad.
 * @param {string|null} raw   Valor del atributo.
 * @param {Function} type     String, Number o Boolean.
 * @param {*} defaultValue    Valor que se devuelve si el atributo no existe o no es válido.
 * @returns {*}
 */
export function fromAttribute(raw, type, defaultValue) {
  if (type === Boolean) return raw !== null;
  if (raw === null) return defaultValue;
  if (type === Number) {
    const n = Number(raw);
    return Number.isNaN(n) ? defaultValue : n;
  }
  return raw;
}

/**
 * Escapa texto para poder insertarlo de forma segura con innerHTML.
 * @param {*} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Estilos comunes que se inyectan en el Shadow DOM de todos los componentes. */
export const baseStyles = `
  :host {
    /* Paleta: si la página define las variables de diegofo-ui (RA2) se usan; si no, valores por defecto. */
    --df-primary: var(--df-color-primary, var(--bg-navbar, #1a4d59));
    --df-secondary: var(--df-color-secondary, var(--bg-secondary-nav, #6b9eac));
    --df-teal: var(--accent-teal, #0d9488);
    --df-blue: var(--accent-blue, #0284c7);
    --df-green: var(--accent-green, #16a34a);
    --df-orange: var(--accent-orange, #ea580c);
    --df-red: var(--accent-red, #e11d48);
    --df-yellow: var(--accent-yellow, #ca8a04);
    --df-purple: var(--accent-purple, #9333ea);
    --df-magenta: var(--accent-magenta, #c026d3);
    --df-surface: var(--bg-card, #ffffff);
    --df-surface-alt: var(--bg-input, #f4f8fa);
    --df-border: var(--border-color, #cbdbe0);
    --df-text: var(--text-main, #1e293b);
    --df-text-muted: var(--text-muted, #64748b);
    --df-radius: 6px;
    --df-font: var(--font-family, 'Plus Jakarta Sans', system-ui, sans-serif);
    font-family: var(--df-font);
    box-sizing: border-box;
  }
  *, *::before, *::after { box-sizing: border-box; }
  :host([hidden]), [hidden] { display: none !important; }
`;

/**
 * Clase base. No se usa directamente: se extiende.
 * @abstract
 */
export class DfElement extends HTMLElement {
  /**
   * Definición de propiedades públicas.
   * `{ nombre: { type: String|Number|Boolean, default: valor, attribute?: 'nombre-atributo' } }`
   * @type {Object<string, {type: Function, default: *, attribute?: string}>}
   */
  static properties = {};

  /** CSS propio del componente (se añade a `baseStyles`). */
  static styles = '';

  /** Atributos que el navegador vigila: se generan a partir de `properties`. */
  static get observedAttributes() {
    return Object.entries(this.properties).map(([name, def]) => def.attribute ?? toKebab(name));
  }

  /**
   * Registra el componente con su etiqueta (si no estaba ya registrado)
   * y crea los getters/setters de cada propiedad.
   * @param {string} tagName  Nombre de la etiqueta, debe contener un guion.
   * @returns {typeof DfElement}
   */
  static define(tagName) {
    this.createAccessors();
    if (!customElements.get(tagName)) customElements.define(tagName, this);
    return this;
  }

  /** Crea en el prototipo un getter/setter por propiedad, enlazado con su atributo. */
  static createAccessors() {
    if (Object.prototype.hasOwnProperty.call(this, '_accessorsCreated')) return;
    this._accessorsCreated = true;
    for (const [name, def] of Object.entries(this.properties)) {
      const attr = def.attribute ?? toKebab(name);
      // Si una subclase ya define su propio getter/setter (p. ej. df-input.value), se respeta.
      if (Object.prototype.hasOwnProperty.call(this.prototype, name)) continue;
      Object.defineProperty(this.prototype, name, {
        configurable: true,
        enumerable: true,
        get() {
          return fromAttribute(this.getAttribute(attr), def.type, def.default);
        },
        set(value) {
          if (def.type === Boolean) {
            this.toggleAttribute(attr, Boolean(value));
          } else if (value === null || value === undefined) {
            this.removeAttribute(attr);
          } else {
            this.setAttribute(attr, String(value));
          }
        },
      });
    }
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._rendered = false;
  }

  /**
   * Si alguien asignó una propiedad ANTES de que el componente se registrara,
   * la instancia tiene una propiedad propia que tapa el setter: la re-aplicamos.
   */
  upgradeProperties() {
    for (const name of Object.keys(this.constructor.properties)) {
      if (Object.prototype.hasOwnProperty.call(this, name)) {
        const value = this[name];
        delete this[name];
        this[name] = value;
      }
    }
  }

  /** Ciclo de vida: el elemento se ha insertado en el documento. */
  connectedCallback() {
    if (!this._rendered) {
      this.upgradeProperties();
      this.render();
      this._rendered = true;
      this.firstRender();
    }
    this.update(null);
  }

  /** Ciclo de vida: un atributo observado ha cambiado. */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._rendered) return;
    this.update(name);
  }

  /** Pinta el Shadow DOM con los estilos y la plantilla. */
  render() {
    this.shadowRoot.innerHTML = `<style>${baseStyles}${this.constructor.styles}</style>${this.template()}`;
  }

  /**
   * Marcado HTML del componente (se sobrescribe).
   * @returns {string}
   */
  template() {
    return '<slot></slot>';
  }

  /** Se llama una sola vez tras el primer render: sitio para añadir listeners internos. */
  firstRender() {}

  /**
   * Sincroniza el DOM interno con las propiedades.
   * @param {string|null} changedAttribute  Atributo que cambió, o null si es una actualización completa.
   */
  // eslint-disable-next-line no-unused-vars
  update(changedAttribute) {}

  /**
   * Atajo para buscar dentro del Shadow DOM.
   * @param {string} selector
   * @returns {Element|null}
   */
  $(selector) {
    return this.shadowRoot.querySelector(selector);
  }

  /**
   * Lanza un CustomEvent que burbujea y atraviesa el Shadow DOM.
   * @param {string} name                 Nombre del evento (por convenio empieza por `df-`).
   * @param {object} [detail={}]          Datos del evento (`event.detail`).
   * @param {{cancelable?: boolean}} [options]
   * @returns {boolean} `false` si algún listener llamó a `preventDefault()`.
   */
  emit(name, detail = {}, options = {}) {
    return this.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: Boolean(options.cancelable),
      }),
    );
  }
}
