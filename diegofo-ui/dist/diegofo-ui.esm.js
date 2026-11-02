/*! diegofo-ui v2.0.0 · Diego Fernández Ortega · MIT */

// src/core/df-element.js
function toKebab(name) {
  return name.replace(/[A-Z]/g, (letra) => `-${letra.toLowerCase()}`);
}
function fromAttribute(raw, type, defaultValue) {
  if (type === Boolean) return raw !== null;
  if (raw === null) return defaultValue;
  if (type === Number) {
    const n = Number(raw);
    return Number.isNaN(n) ? defaultValue : n;
  }
  return raw;
}
function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
var baseStyles = `
  :host {
    /* Paleta: si la p\xE1gina define las variables de diegofo-ui se usan; si no, valores por defecto. */
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
var DfElement = class extends HTMLElement {
  /**
   * Definición de propiedades públicas.
   * `{ nombre: { type: String|Number|Boolean, default: valor, attribute?: 'nombre-atributo' } }`
   * @type {Object<string, {type: Function, default: *, attribute?: string}>}
   */
  static properties = {};
  /** CSS propio del componente (se añade a `baseStyles`). */
  static styles = "";
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
    if (Object.prototype.hasOwnProperty.call(this, "_accessorsCreated")) return;
    this._accessorsCreated = true;
    for (const [name, def] of Object.entries(this.properties)) {
      const attr = def.attribute ?? toKebab(name);
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
          } else if (value === null || value === void 0) {
            this.removeAttribute(attr);
          } else {
            this.setAttribute(attr, String(value));
          }
        }
      });
    }
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
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
    return "<slot></slot>";
  }
  /** Se llama una sola vez tras el primer render: sitio para añadir listeners internos. */
  firstRender() {
  }
  /**
   * Sincroniza el DOM interno con las propiedades.
   * @param {string|null} changedAttribute  Atributo que cambió, o null si es una actualización completa.
   */
  // eslint-disable-next-line no-unused-vars
  update(changedAttribute) {
  }
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
        cancelable: Boolean(options.cancelable)
      })
    );
  }
};

// src/components/df-button.js
var DfButton = class extends DfElement {
  static properties = {
    variant: { type: String, default: "primary" },
    size: { type: String, default: "md" },
    shape: { type: String, default: "tab" },
    type: { type: String, default: "button" },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    block: { type: Boolean, default: false }
  };
  static styles = `
    :host { display: inline-block; vertical-align: middle; }
    :host([block]) { display: block; }
    button {
      --_bg: var(--df-primary);
      --_fg: #fff;
      all: unset;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 10px 22px 10px 18px;
      font: 600 0.85rem var(--df-font);
      color: var(--_fg);
      background: var(--_bg);
      border-radius: var(--df-radius);
      cursor: pointer;
      user-select: none;
      transition: filter .15s ease, transform .1s ease, opacity .15s ease;
      white-space: nowrap;
    }
    button:hover { filter: brightness(1.12); }
    button:active { transform: translateY(1px); }
    button:focus-visible { outline: 2px solid var(--df-blue); outline-offset: 2px; }

    .shape-tab { clip-path: polygon(0 0, 90% 0, 100% 100%, 0 100%); padding-right: 28px; }
    .shape-rounded { border-radius: var(--df-radius); }
    .shape-pill { border-radius: 999px; }

    .variant-secondary { --_bg: var(--df-secondary); }
    .variant-success { --_bg: var(--df-green); }
    .variant-danger { --_bg: var(--df-red); }
    .variant-warning { --_bg: var(--df-orange); }
    .variant-ghost { --_bg: transparent; --_fg: var(--df-text); box-shadow: inset 0 0 0 1px var(--df-border); }
    .variant-ghost:hover { --_bg: var(--df-surface-alt); filter: none; }

    .size-sm { padding: 5px 12px; font-size: 0.75rem; gap: 5px; }
    .size-sm.shape-tab { padding-right: 18px; }
    .size-lg { padding: 14px 30px 14px 24px; font-size: 0.95rem; }
    .size-lg.shape-tab { padding-right: 38px; }

    button[disabled] { opacity: .5; cursor: not-allowed; filter: none; transform: none; }
    .loading { cursor: progress; }

    ::slotted(svg), ::slotted(i) { width: 16px; height: 16px; }
    .spinner {
      width: 14px; height: 14px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: girar .7s linear infinite;
    }
    @keyframes girar { to { transform: rotate(360deg); } }
  `;
  template() {
    return `<button part="button" type="button"><span class="spinner" hidden></span><slot></slot></button>`;
  }
  firstRender() {
    this._button = this.$("button");
    this.addEventListener("click", (event) => {
      if (this.disabled || this.loading) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      this.emit("df-click", { variant: this.variant });
      const form = this.closest("form");
      if (form && this.type === "submit") {
        if (typeof form.requestSubmit === "function") form.requestSubmit();
        else form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
      } else if (form && this.type === "reset") {
        form.reset();
      }
    }, { capture: true });
  }
  update() {
    const btn = this._button;
    btn.className = `variant-${this.variant} size-${this.size} shape-${this.shape}${this.loading ? " loading" : ""}`;
    btn.disabled = this.disabled || this.loading;
    btn.setAttribute("aria-busy", String(this.loading));
    this.$(".spinner").hidden = !this.loading;
  }
  /** Pone el foco en el botón interno. */
  focus(options) {
    this._button?.focus(options);
  }
};
DfButton.define("df-button");

// src/components/df-input.js
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateValue(value, rules = {}) {
  const v = String(value ?? "").trim();
  if (rules.required && v === "") return { valid: false, message: "Este campo es obligatorio" };
  if (v === "") return { valid: true, message: "" };
  if (rules.type === "email" && !EMAIL_RE.test(v)) {
    return { valid: false, message: rules.errorMessage || "Introduce un correo v\xE1lido" };
  }
  if (rules.type === "number" && Number.isNaN(Number(v))) {
    return { valid: false, message: rules.errorMessage || "Introduce un n\xFAmero" };
  }
  if (rules.minlength && v.length < rules.minlength) {
    return { valid: false, message: rules.errorMessage || `M\xEDnimo ${rules.minlength} caracteres` };
  }
  if (rules.pattern) {
    let re;
    try {
      re = new RegExp(`^(?:${rules.pattern})$`);
    } catch {
      re = null;
    }
    if (re && !re.test(v)) return { valid: false, message: rules.errorMessage || "Formato no v\xE1lido" };
  }
  return { valid: true, message: "" };
}
var DfInput = class extends DfElement {
  static formAssociated = true;
  static properties = {
    label: { type: String, default: "" },
    type: { type: String, default: "text" },
    name: { type: String, default: "" },
    value: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    hint: { type: String, default: "" },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    pattern: { type: String, default: "" },
    minlength: { type: Number, default: 0 },
    rows: { type: Number, default: 3 },
    errorMessage: { type: String, default: "" },
    invalid: { type: Boolean, default: false }
  };
  static styles = `
    :host { display: block; }
    .wrap { display: flex; flex-direction: column; gap: 6px; }
    label { font-size: .82rem; font-weight: 600; color: var(--df-text); display: flex; gap: 4px; align-items: center; }
    .req { color: var(--df-red); }
    input, textarea {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--df-border);
      background: var(--df-surface-alt);
      color: var(--df-text);
      border-radius: var(--df-radius);
      font: .88rem var(--df-font);
      outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    textarea { resize: vertical; }
    input:focus, textarea:focus { border-color: var(--df-blue); box-shadow: 0 0 0 3px color-mix(in srgb, var(--df-blue) 18%, transparent); }
    input:disabled, textarea:disabled { opacity: .6; cursor: not-allowed; }
    :host([invalid]) input, :host([invalid]) textarea { border-color: var(--df-red); }
    .msg { font-size: .75rem; color: var(--df-text-muted); min-height: 1em; }
    :host([invalid]) .msg { color: var(--df-red); font-weight: 600; }
  `;
  constructor() {
    super();
    this._internals = null;
    if (typeof this.attachInternals === "function") {
      try {
        this._internals = this.attachInternals();
      } catch {
        this._internals = null;
      }
    }
  }
  template() {
    return `
      <div class="wrap">
        <label part="label" for="f"><span class="text"></span><span class="req" hidden>*</span></label>
        <span class="field-slot"></span>
        <span class="msg" aria-live="polite"></span>
      </div>`;
  }
  /** Crea el `<input>` o `<textarea>` según `type`. Se repite si cambia el tipo. */
  _buildField() {
    const isArea = this.type === "textarea";
    const holder = this.$(".field-slot");
    const previous = this._field ? this._field.value : this.getAttribute("value") ?? "";
    holder.innerHTML = isArea ? `<textarea id="f" part="field" rows="${escapeHtml(this.rows)}"></textarea>` : `<input id="f" part="field" type="${escapeHtml(this.type)}">`;
    this._field = holder.firstElementChild;
    this._field.value = previous;
    this._isArea = isArea;
    this._field.addEventListener("input", () => {
      this._syncForm();
      if (this.invalid) this.validate({ silent: true });
      this.emit("df-input", { value: this.value, name: this.name });
    });
    this._field.addEventListener("change", () => {
      const valid = this.validate();
      this.emit("df-change", { value: this.value, name: this.name, valid });
    });
    this._field.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !this._isArea) this.emit("df-enter", { value: this.value, name: this.name });
    });
  }
  update(changed) {
    if (!this._field || changed === "type" || changed === "rows" && this._isArea) this._buildField();
    const f = this._field;
    if (changed === "value" || changed === null) {
      const attr = this.getAttribute("value");
      if (changed === "value" || attr !== null) f.value = attr ?? "";
    }
    this.$(".text").textContent = this.label;
    this.$("label").hidden = !this.label;
    this.$(".req").hidden = !this.required;
    f.placeholder = this.placeholder;
    f.disabled = this.disabled;
    f.required = this.required;
    if (this.name) f.name = this.name;
    f.setAttribute("aria-invalid", String(this.invalid));
    if (!this.invalid) this.$(".msg").textContent = this.hint;
    this._syncForm();
  }
  /** Valor actual del campo (lo que ha escrito el usuario). */
  get value() {
    return this._field ? this._field.value : this.getAttribute("value") ?? "";
  }
  set value(v) {
    const text = v === null || v === void 0 ? "" : String(v);
    if (this._field) this._field.value = text;
    this.setAttribute("value", text);
    this._syncForm();
  }
  _syncForm() {
    this._internals?.setFormValue?.(this.value);
  }
  /**
   * Valida el valor actual, muestra el mensaje de error y devuelve el resultado.
   * @param {{silent?: boolean}} [options]  `silent` evita lanzar `df-invalid`.
   * @returns {boolean} `true` si es válido.
   */
  validate(options = {}) {
    const { valid, message } = validateValue(this.value, {
      required: this.required,
      type: this.type,
      pattern: this.pattern,
      minlength: this.minlength,
      errorMessage: this.errorMessage
    });
    this.invalid = !valid;
    this.$(".msg").textContent = valid ? this.hint : message;
    if (!valid && !options.silent) this.emit("df-invalid", { value: this.value, name: this.name, message });
    return valid;
  }
  /** Comprueba si es válido sin mostrar nada. */
  checkValidity() {
    return validateValue(this.value, {
      required: this.required,
      type: this.type,
      pattern: this.pattern,
      minlength: this.minlength
    }).valid;
  }
  /** Vacía el campo y quita el estado de error. */
  clear() {
    this.value = "";
    this.invalid = false;
    if (this._rendered) this.$(".msg").textContent = this.hint;
  }
  /** Pone el foco en el campo interno. */
  focus(options) {
    this._field?.focus(options);
  }
  /** Lo llama el navegador al hacer `form.reset()`. */
  formResetCallback() {
    this.clear();
  }
  /**
   * Valida todos los `df-input` y `df-select` que haya dentro de un contenedor.
   * Pone el foco en el primero que falle.
   * @param {ParentNode} container  Formulario o cualquier elemento.
   * @returns {boolean} `true` si todos son válidos.
   */
  static validateAll(container) {
    const inputs = [...container.querySelectorAll("df-input, df-select")];
    const results = inputs.map((input) => input.validate());
    const firstBad = inputs[results.indexOf(false)];
    if (firstBad) firstBad.focus();
    return results.every(Boolean);
  }
  /**
   * Recoge los valores de los `df-input`, `df-select` (texto) y `df-switch` (booleano) de un contenedor
   * en un objeto `{ name: value }`.
   * @param {ParentNode} container
   * @returns {Object<string, string>}
   */
  static collect(container) {
    const data = {};
    container.querySelectorAll("df-input, df-select, df-switch").forEach((el) => {
      if (!el.name) return;
      data[el.name] = el.localName === "df-switch" ? el.checked : el.value;
    });
    return data;
  }
};
DfInput.define("df-input");

// src/components/df-select.js
var DfSelect = class extends DfElement {
  static formAssociated = true;
  static properties = {
    value: { type: String, default: "" },
    label: { type: String, default: "" },
    placeholder: { type: String, default: "Selecciona una opci\xF3n" },
    name: { type: String, default: "" },
    hint: { type: String, default: "" },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    invalid: { type: Boolean, default: false },
    open: { type: Boolean, default: false }
  };
  static styles = `
    :host { display: block; position: relative; }
    .wrap { display: flex; flex-direction: column; gap: 6px; }
    .lbl { font-size: .82rem; font-weight: 600; color: var(--df-text); }
    .req { color: var(--df-red); }
    .trigger {
      all: unset; box-sizing: border-box;
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      width: 100%; min-height: 40px; padding: 9px 12px 9px 14px;
      border: 1px solid var(--df-border); border-radius: var(--df-radius);
      background: var(--df-surface-alt); color: var(--df-text);
      font: .88rem var(--df-font); cursor: pointer;
      transition: border-color .15s, box-shadow .15s;
    }
    .trigger:focus-visible, :host([open]) .trigger { border-color: var(--df-blue); box-shadow: 0 0 0 3px color-mix(in srgb, var(--df-blue) 18%, transparent); }
    .trigger[aria-disabled="true"] { opacity: .6; cursor: not-allowed; }
    :host([invalid]) .trigger { border-color: var(--df-red); }
    .placeholder { color: var(--df-text-muted); }
    .chev { flex: none; transition: transform .15s; color: var(--df-text-muted); }
    :host([open]) .chev { transform: rotate(180deg); }
    .list {
      position: absolute; left: 0; right: 0; z-index: 1300;
      margin: 4px 0 0; padding: 4px; list-style: none;
      max-height: 240px; overflow: auto;
      background: var(--df-surface); color: var(--df-text);
      border: 1px solid var(--df-border); border-radius: 8px;
      box-shadow: 0 12px 28px -8px rgba(0,0,0,.25);
    }
    .opt { padding: 8px 10px; border-radius: 6px; font-size: .86rem; cursor: pointer; display: flex; justify-content: space-between; gap: 8px; }
    .opt.active { background: var(--df-surface-alt); }
    .opt[aria-selected="true"] { font-weight: 600; color: var(--df-teal); }
    .opt[aria-selected="true"]::after { content: '\u2713'; }
    .opt[aria-disabled="true"] { opacity: .45; cursor: not-allowed; }
    .empty { padding: 8px 10px; font-size: .82rem; color: var(--df-text-muted); }
    .msg { font-size: .75rem; color: var(--df-text-muted); min-height: 1em; }
    :host([invalid]) .msg { color: var(--df-red); font-weight: 600; }
  `;
  constructor() {
    super();
    this._options = null;
    this._active = -1;
    this._internals = null;
    if (typeof this.attachInternals === "function") {
      try {
        this._internals = this.attachInternals();
      } catch {
        this._internals = null;
      }
    }
  }
  template() {
    return `
      <div class="wrap">
        <span class="lbl" id="lbl"><span class="txt"></span> <span class="req" hidden>*</span></span>
        <button class="trigger" part="trigger" role="combobox" aria-haspopup="listbox" aria-expanded="false"
                aria-controls="list" aria-labelledby="lbl val" type="button">
          <span class="val" id="val"></span>
          <svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <span class="msg" id="msg" aria-live="polite"></span>
      </div>
      <ul class="list" part="listbox" id="list" role="listbox" aria-labelledby="lbl" hidden></ul>`;
  }
  firstRender() {
    const trigger = this.$(".trigger");
    trigger.addEventListener("click", () => {
      if (this.disabled) return;
      if (this.open) this.close();
      else this.show();
    });
    trigger.addEventListener("keydown", (e) => this._onKeydown(e));
    this.$(".list").addEventListener("mousedown", (e) => e.preventDefault());
    this.$(".list").addEventListener("click", (e) => {
      const li = e.target.closest(".opt");
      if (li) this._choose(Number(li.dataset.index));
    });
    this._onOutside = (e) => {
      if (!e.composedPath().includes(this)) this.close();
    };
    this._observer = new MutationObserver(() => {
      if (this._options === null) this._renderOptions();
      this.update(null);
    });
    this._observer.observe(this, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["value", "label", "disabled"] });
    this._renderOptions();
  }
  /**
   * Lista de opciones `[{ value, label, disabled? }]`. Si no se asigna, se leen las `<option>` hijas.
   * @type {Array<{value: string, label: string, disabled?: boolean}>}
   */
  get options() {
    if (this._options) return this._options;
    return [...this.querySelectorAll("option")].map((o) => ({
      value: o.value,
      label: o.textContent.trim(),
      disabled: o.disabled
    }));
  }
  set options(list) {
    this._options = Array.isArray(list) ? list.map((o) => typeof o === "string" ? { value: o, label: o, disabled: false } : { value: String(o.value), label: String(o.label ?? o.value), disabled: Boolean(o.disabled) }) : null;
    if (this._rendered) {
      this._renderOptions();
      this.update(null);
    }
  }
  /** Texto de la opción seleccionada (o `''`). */
  get selectedLabel() {
    return this.options.find((o) => o.value === this.value)?.label ?? "";
  }
  /** Índice de la opción seleccionada (o -1). */
  get selectedIndex() {
    return this.options.findIndex((o) => o.value === this.value);
  }
  _renderOptions() {
    const list = this.$(".list");
    list.innerHTML = "";
    const opts = this.options;
    if (!opts.length) {
      list.innerHTML = '<li class="empty" role="presentation">Sin opciones</li>';
      return;
    }
    opts.forEach((o, i) => {
      const li = document.createElement("li");
      li.className = "opt";
      li.id = `opt-${i}`;
      li.dataset.index = String(i);
      li.setAttribute("role", "option");
      li.setAttribute("part", "option");
      li.textContent = o.label;
      list.appendChild(li);
    });
  }
  update(changed) {
    const opts = this.options;
    const trigger = this.$(".trigger");
    this.$(".txt").textContent = this.label;
    this.$(".lbl").hidden = !this.label;
    this.$(".req").hidden = !this.required;
    const lbl = this.selectedLabel;
    const val = this.$(".val");
    val.textContent = lbl || this.placeholder;
    val.className = `val ${lbl ? "" : "placeholder"}`;
    trigger.setAttribute("aria-disabled", String(this.disabled));
    trigger.setAttribute("aria-required", String(this.required));
    trigger.setAttribute("aria-invalid", String(this.invalid));
    trigger.tabIndex = this.disabled ? -1 : 0;
    [...this.$(".list").querySelectorAll(".opt")].forEach((li, i) => {
      li.setAttribute("aria-selected", String(opts[i]?.value === this.value));
      li.setAttribute("aria-disabled", String(Boolean(opts[i]?.disabled)));
      li.classList.toggle("active", i === this._active);
    });
    if (!this.invalid) this.$(".msg").textContent = this.hint;
    this._internals?.setFormValue?.(this.value);
    if (changed === "open" || changed === null) {
      this.$(".list").hidden = !this.open;
      trigger.setAttribute("aria-expanded", String(this.open));
      if (this.open) document.addEventListener("pointerdown", this._onOutside, true);
      else document.removeEventListener("pointerdown", this._onOutside, true);
    }
    this._syncActive();
  }
  _syncActive() {
    const trigger = this.$(".trigger");
    if (this.open && this._active >= 0) {
      trigger.setAttribute("aria-activedescendant", `opt-${this._active}`);
      this.$(`#opt-${this._active}`)?.scrollIntoView?.({ block: "nearest" });
    } else {
      trigger.removeAttribute("aria-activedescendant");
    }
  }
  _move(delta) {
    const opts = this.options;
    if (!opts.length) return;
    let i = this._active;
    for (let paso = 0; paso < opts.length; paso++) {
      i = (i + delta + opts.length) % opts.length;
      if (!opts[i].disabled) break;
    }
    this._setActive(i);
  }
  _setActive(i) {
    this._active = i;
    this.$(".list").querySelectorAll(".opt").forEach((li, j) => li.classList.toggle("active", j === i));
    this._syncActive();
  }
  _onKeydown(e) {
    if (this.disabled) return;
    const opts = this.options;
    const abrirCon = ["ArrowDown", "ArrowUp", "Enter", " "];
    if (!this.open) {
      if (abrirCon.includes(e.key)) {
        e.preventDefault();
        this.show();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this._move(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        this._move(-1);
        break;
      case "Home":
        e.preventDefault();
        this._setActive(opts.findIndex((o) => !o.disabled));
        break;
      case "End":
        e.preventDefault();
        this._setActive(opts.length - 1 - [...opts].reverse().findIndex((o) => !o.disabled));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        this._choose(this._active);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        this.close();
        break;
      case "Tab":
        this.close();
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const letra = e.key.toLowerCase();
          const start = this._active + 1;
          const orden = [...opts.keys()].map((k) => (k + start) % opts.length);
          const hit = orden.find((k) => !opts[k].disabled && opts[k].label.toLowerCase().startsWith(letra));
          if (hit !== void 0) this._setActive(hit);
        }
    }
  }
  _choose(index) {
    const opt = this.options[index];
    if (!opt || opt.disabled) return;
    const changed = opt.value !== this.value;
    this.value = opt.value;
    this.close();
    if (this.invalid) this.validate({ silent: true });
    if (changed) this.emit("df-change", { value: opt.value, label: opt.label, name: this.name });
  }
  /** Despliega la lista. */
  show() {
    if (this.disabled) return;
    this._active = this.selectedIndex >= 0 ? this.selectedIndex : this.options.findIndex((o) => !o.disabled);
    this.open = true;
  }
  /** Cierra la lista. */
  close() {
    this._active = -1;
    this.open = false;
  }
  /**
   * Valida (obligatorio) y muestra el error.
   * @param {{silent?: boolean}} [options]
   * @returns {boolean}
   */
  validate(options = {}) {
    const ok = !this.required || this.value !== "";
    this.invalid = !ok;
    this.$(".msg").textContent = ok ? this.hint : "Selecciona una opci\xF3n";
    if (!ok && !options.silent) this.emit("df-invalid", { name: this.name, message: "Selecciona una opci\xF3n" });
    return ok;
  }
  /** Pone el foco en el botón. */
  focus(options) {
    this.$(".trigger")?.focus(options);
  }
  formResetCallback() {
    this.value = "";
    this.invalid = false;
  }
  disconnectedCallback() {
    document.removeEventListener("pointerdown", this._onOutside, true);
  }
};
DfSelect.define("df-select");

// src/components/df-switch.js
var DfSwitch = class extends DfElement {
  static formAssociated = true;
  static properties = {
    checked: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    label: { type: String, default: "" },
    name: { type: String, default: "" },
    value: { type: String, default: "on" },
    size: { type: String, default: "md" }
  };
  static styles = `
    :host { display: inline-flex; vertical-align: middle; }
    .wrap { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
    :host([disabled]) .wrap { cursor: not-allowed; opacity: .5; }
    .track {
      --_w: 40px; --_h: 22px;
      position: relative; flex: none;
      width: var(--_w); height: var(--_h);
      border-radius: 999px;
      background: var(--df-border);
      transition: background .2s ease;
      outline: none;
    }
    .track:focus-visible { box-shadow: 0 0 0 3px color-mix(in srgb, var(--df-blue) 35%, transparent); }
    .thumb {
      position: absolute; top: 3px; left: 3px;
      width: calc(var(--_h) - 6px); height: calc(var(--_h) - 6px);
      border-radius: 50%; background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,.25);
      transition: transform .2s ease;
    }
    :host([checked]) .track { background: var(--df-teal); }
    :host([checked]) .thumb { transform: translateX(calc(var(--_w) - var(--_h))); }
    .size-sm { --_w: 32px; --_h: 18px; }
    .size-lg { --_w: 52px; --_h: 28px; }
    .text { font-size: .88rem; color: var(--df-text); }
  `;
  constructor() {
    super();
    this._internals = null;
    if (typeof this.attachInternals === "function") {
      try {
        this._internals = this.attachInternals();
      } catch {
        this._internals = null;
      }
    }
  }
  template() {
    return `
      <label class="wrap">
        <span class="track" part="track" role="switch" tabindex="0"><span class="thumb" part="thumb"></span></span>
        <span class="text"><slot></slot></span>
      </label>`;
  }
  firstRender() {
    this._defaultChecked = this.hasAttribute("checked");
    const track = this.$(".track");
    this.$(".wrap").addEventListener("click", (e) => {
      e.preventDefault();
      this._userToggle();
    });
    track.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this._userToggle();
      }
    });
  }
  update() {
    const track = this.$(".track");
    track.className = `track size-${this.size}`;
    track.setAttribute("aria-checked", String(this.checked));
    track.setAttribute("aria-disabled", String(this.disabled));
    track.tabIndex = this.disabled ? -1 : 0;
    const slot = this.$("slot");
    if (!slot.assignedNodes().length) slot.textContent = this.label;
    if (this.label) track.setAttribute("aria-label", this.label);
    this._internals?.setFormValue?.(this.checked ? this.value : null);
  }
  _userToggle() {
    if (this.disabled) return;
    this.toggle();
    this.emit("df-change", { checked: this.checked, name: this.name });
  }
  /**
   * Cambia el estado. No lanza evento (el evento solo se lanza con interacción del usuario).
   * @param {boolean} [force] Si se indica, fuerza ese estado.
   * @returns {boolean} El nuevo estado.
   */
  toggle(force) {
    this.checked = force === void 0 ? !this.checked : Boolean(force);
    return this.checked;
  }
  /** Pone el foco en el interruptor. */
  focus(options) {
    this.$(".track")?.focus(options);
  }
  /** Lo llama el navegador al hacer `form.reset()`. */
  formResetCallback() {
    this.checked = this._defaultChecked;
  }
};
DfSwitch.define("df-switch");

// src/components/df-modal.js
var DfModal = class _DfModal extends DfElement {
  static properties = {
    open: { type: Boolean, default: false },
    heading: { type: String, default: "Di\xE1logo" },
    confirmText: { type: String, default: "Aceptar" },
    cancelText: { type: String, default: "Cancelar" },
    variant: { type: String, default: "primary" },
    hideCancel: { type: Boolean, default: false },
    persistent: { type: Boolean, default: false },
    width: { type: String, default: "460px" }
  };
  static styles = `
    :host { position: fixed; inset: 0; z-index: 1000; display: none; }
    :host([open]) { display: block; }
    .overlay {
      position: absolute; inset: 0;
      background: rgba(7, 12, 24, .55);
      backdrop-filter: blur(3px);
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
      animation: aparecer .18s ease;
    }
    .box {
      width: 100%;
      background: var(--df-surface);
      color: var(--df-text);
      border: 1px solid var(--df-border);
      border-top: 4px solid var(--df-primary);
      border-radius: 10px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,.35);
      animation: subir .2s ease;
      max-height: calc(100vh - 32px);
      display: flex; flex-direction: column;
    }
    :host([variant="danger"]) .box { border-top-color: var(--df-red); }
    :host([variant="success"]) .box { border-top-color: var(--df-green); }
    header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 8px; }
    h3 { margin: 0; font-size: 1.05rem; }
    .close {
      all: unset; cursor: pointer; font-size: 1.4rem; line-height: 1; color: var(--df-text-muted);
      width: 28px; height: 28px; display: grid; place-items: center; border-radius: 6px;
    }
    .close:hover { background: var(--df-surface-alt); color: var(--df-text); }
    .close:focus-visible { outline: 2px solid var(--df-blue); }
    .body { padding: 8px 20px 16px; font-size: .9rem; line-height: 1.5; overflow: auto; }
    footer { display: flex; justify-content: flex-end; gap: 10px; padding: 12px 20px 18px; }
    @keyframes aparecer { from { opacity: 0; } }
    @keyframes subir { from { transform: translateY(12px); opacity: 0; } }
  `;
  template() {
    return `
      <div class="overlay" part="overlay">
        <div class="box" part="box" role="dialog" aria-modal="true" aria-labelledby="titulo">
          <header>
            <h3 id="titulo"></h3>
            <button class="close" aria-label="Cerrar">&times;</button>
          </header>
          <div class="body"><slot></slot></div>
          <footer>
            <slot name="footer">
              <df-button class="cancel" variant="ghost" shape="rounded"></df-button>
              <df-button class="confirm" shape="rounded"></df-button>
            </slot>
          </footer>
        </div>
      </div>`;
  }
  firstRender() {
    this._onKeydown = (e) => {
      if (!this.open || !this._isTopmost()) return;
      if (e.key === "Escape" && !this.persistent) {
        e.stopPropagation();
        this.cancel();
      } else if (e.key === "Tab") {
        this._trapFocus(e);
      }
    };
    this.$(".close").addEventListener("click", () => this.cancel());
    this.$(".cancel").addEventListener("click", () => this.cancel());
    this.$(".confirm").addEventListener("click", () => this.confirm());
    this.$(".overlay").addEventListener("click", (e) => {
      if (e.target === e.currentTarget && !this.persistent) this.cancel();
    });
  }
  update(changed) {
    this.$("#titulo").textContent = this.heading;
    this.$(".confirm").textContent = this.confirmText;
    this.$(".confirm").variant = this.variant;
    this.$(".cancel").textContent = this.cancelText;
    this.$(".cancel").hidden = this.hideCancel;
    this.$(".box").style.maxWidth = this.width;
    if (changed === "open" || changed === null) {
      if (this.open) {
        document.addEventListener("keydown", this._onKeydown);
        _DfModal._stack.push(this);
        this._previousFocus = _DfModal._deepActiveElement();
        if (_DfModal._stack.length === 1) {
          _DfModal._bodyOverflow = document.body.style.overflow;
          document.body.style.overflow = "hidden";
        }
        if (changed === "open") {
          this.emit("df-open");
          queueMicrotask(() => {
            const first = this.querySelector(_DfModal.FOCUSABLE);
            (first || this.$(".confirm")).focus?.();
          });
        }
      } else if (changed === "open") {
        this._release();
      }
    }
  }
  disconnectedCallback() {
    if (this.open) this._release();
  }
  /** Quita listeners, desbloquea el scroll y devuelve el foco. @private */
  _release() {
    document.removeEventListener("keydown", this._onKeydown);
    _DfModal._stack = _DfModal._stack.filter((m) => m !== this);
    if (_DfModal._stack.length === 0) document.body.style.overflow = _DfModal._bodyOverflow ?? "";
    const prev = this._previousFocus;
    this._previousFocus = null;
    if (prev && prev.isConnected && typeof prev.focus === "function") prev.focus();
  }
  /** Solo el modal de arriba del todo reacciona al teclado (si hay varios abiertos). @private */
  _isTopmost() {
    return _DfModal._stack[_DfModal._stack.length - 1] === this;
  }
  /** Elementos enfocables del modal, en orden visual. @private */
  _focusables() {
    const light = [...this.querySelectorAll(_DfModal.FOCUSABLE)].filter((el) => !el.disabled && !el.hidden);
    const footerSlot = this.$('slot[name="footer"]');
    const usaFooterPropio = footerSlot.assignedElements().length > 0;
    const botones = usaFooterPropio ? [] : [this.$(".cancel"), this.$(".confirm")].filter((b) => !b.hidden);
    return [this.$(".close"), ...light, ...botones];
  }
  /** Mantiene el foco dentro del modal al pulsar Tab / Shift+Tab. @private */
  _trapFocus(e) {
    const items = this._focusables();
    if (items.length === 0) return;
    const path = e.composedPath();
    const index = items.findIndex((el) => path.includes(el));
    const last = items.length - 1;
    let next = null;
    if (index === -1) next = items[0];
    else if (e.shiftKey && index === 0) next = items[last];
    else if (!e.shiftKey && index === last) next = items[0];
    if (next) {
      e.preventDefault();
      next.focus();
    }
  }
  /** Selector de elementos enfocables dentro del contenido del modal. */
  static FOCUSABLE = 'df-input, df-select, df-switch, df-button, input, textarea, select, button, a[href], [tabindex]:not([tabindex="-1"])';
  /** Pila de modales abiertos (para modales anidados). @private */
  static _stack = [];
  /** Elemento con el foco, atravesando Shadow DOMs. @private */
  static _deepActiveElement() {
    let el = document.activeElement;
    while (el && el.shadowRoot && el.shadowRoot.activeElement) el = el.shadowRoot.activeElement;
    return el;
  }
  /** Abre el modal. */
  show() {
    this.open = true;
  }
  /**
   * Cierra el modal.
   * @param {'confirm'|'cancel'|'method'} [reason='method']
   */
  close(reason = "method") {
    if (!this.open) return;
    this.open = false;
    this.emit("df-close", { reason });
  }
  /** Alterna abierto / cerrado. */
  toggle() {
    if (this.open) this.close();
    else this.show();
  }
  /** Acción del botón Aceptar: lanza `df-confirm` y cierra si nadie lo impide. */
  confirm() {
    const ok = this.emit("df-confirm", {}, { cancelable: true });
    if (ok) this.close("confirm");
  }
  /** Acción de Cancelar / X / Escape / fondo. */
  cancel() {
    this.emit("df-cancel");
    this.close("cancel");
  }
  /**
   * Crea un modal temporal, lo añade al `<body>` y lo elimina al cerrarse.
   * @private
   */
  static _temporal(options) {
    const modal = document.createElement("df-modal");
    modal.heading = options.heading ?? "Confirmar";
    if (options.confirmText) modal.confirmText = options.confirmText;
    if (options.cancelText) modal.cancelText = options.cancelText;
    if (options.variant) modal.variant = options.variant;
    document.body.appendChild(modal);
    modal.addEventListener("df-close", () => modal.remove(), { once: true });
    return modal;
  }
  /**
   * Pregunta de confirmación. Sustituye a `window.confirm()`.
   * @param {{heading?: string, message?: string, confirmText?: string, cancelText?: string, variant?: string}} options
   * @returns {Promise<boolean>} `true` si el usuario acepta.
   * @example
   * if (await DfModal.confirm({ message: '¿Borrar el cliente?', variant: 'danger' })) { ... }
   */
  static confirm(options = {}) {
    const modal = _DfModal._temporal(options);
    const p = document.createElement("p");
    p.style.margin = "0";
    p.textContent = options.message ?? "\xBFSeguro?";
    modal.appendChild(p);
    return new Promise((resolve) => {
      modal.addEventListener("df-close", (e) => resolve(e.detail.reason === "confirm"), { once: true });
      modal.show();
    });
  }
  /**
   * Formulario rápido dentro de un modal. Sustituye a `window.prompt()` y permite varios campos con validación.
   * @param {{heading?: string, message?: string, confirmText?: string,
   *          fields: Array<{name: string, label?: string, type?: string, value?: string|number|boolean,
   *                         required?: boolean, placeholder?: string, pattern?: string,
   *                         options?: Array<{value: string, label: string}>}>}} options
   *        `type` admite los de `df-input` y además `'select'` (con `options`) y `'switch'` (devuelve booleano).
   * @returns {Promise<Object<string,string>|null>} Los valores `{ name: valor }` o `null` si se cancela.
   * @example
   * const datos = await DfModal.prompt({ heading: 'Nuevo producto',
   *   fields: [{ name: 'nombre', label: 'Nombre', required: true }, { name: 'precio', type: 'number' }] });
   */
  static prompt(options = {}) {
    const modal = _DfModal._temporal({ confirmText: "Guardar", ...options });
    const form = document.createElement("form");
    form.style.cssText = "display:flex;flex-direction:column;gap:12px;margin:0";
    if (options.message) {
      const p = document.createElement("p");
      p.style.margin = "0";
      p.textContent = options.message;
      form.appendChild(p);
    }
    for (const field of options.fields ?? []) {
      if (field.type === "select") {
        const select = document.createElement("df-select");
        select.name = field.name;
        select.label = field.label ?? field.name;
        select.options = field.options ?? [];
        if (field.required) select.required = true;
        if (field.value !== void 0) select.value = field.value;
        form.appendChild(select);
        continue;
      }
      if (field.type === "switch") {
        const sw = document.createElement("df-switch");
        sw.name = field.name;
        sw.label = field.label ?? field.name;
        if (field.value) sw.checked = true;
        form.appendChild(sw);
        continue;
      }
      const input = document.createElement("df-input");
      input.name = field.name;
      input.label = field.label ?? field.name;
      if (field.type) input.type = field.type;
      if (field.required) input.required = true;
      if (field.placeholder) input.placeholder = field.placeholder;
      if (field.pattern) input.pattern = field.pattern;
      if (field.value !== void 0) input.value = field.value;
      form.appendChild(input);
    }
    modal.appendChild(form);
    return new Promise((resolve) => {
      form.addEventListener("df-enter", () => modal.confirm());
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        modal.confirm();
      });
      modal.addEventListener("df-confirm", (e) => {
        if (!DfInput.validateAll(form)) e.preventDefault();
      });
      modal.addEventListener("df-close", (e) => {
        resolve(e.detail.reason === "confirm" ? DfInput.collect(form) : null);
      }, { once: true });
      modal.show();
    });
  }
};
DfModal.define("df-modal");

// src/components/df-toast-stack.js
var ICONOS = { success: "\u2713", info: "i", warning: "!", danger: "\u2715" };
var TIPOS = Object.keys(ICONOS);
var DfToastStack = class extends DfElement {
  static properties = {
    position: { type: String, default: "bottom-right" },
    duration: { type: Number, default: 3e3 },
    max: { type: Number, default: 5 }
  };
  static styles = `
    :host { position: fixed; z-index: 1100; pointer-events: none; display: block; }
    .stack { display: flex; flex-direction: column; gap: 10px; width: min(360px, calc(100vw - 32px)); }
    .toast {
      pointer-events: auto;
      display: flex; align-items: center; gap: 12px;
      background: var(--df-surface);
      color: var(--df-text);
      border: 1px solid var(--df-border);
      border-left: 4px solid var(--_c);
      border-radius: 8px;
      padding: 12px 16px;
      font-size: .85rem;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,.15);
      cursor: pointer;
      animation: entrar .25s ease;
      transition: opacity .25s ease, transform .25s ease;
    }
    .toast.saliendo { opacity: 0; transform: translateX(20px); }
    .icon {
      flex: none; width: 22px; height: 22px; border-radius: 50%;
      display: grid; place-items: center;
      background: var(--_c); color: #fff; font-weight: 800; font-size: .75rem;
    }
    .success { --_c: var(--df-green); }
    .info { --_c: var(--df-blue); }
    .warning { --_c: var(--df-orange); }
    .danger { --_c: var(--df-red); }
    @keyframes entrar { from { opacity: 0; transform: translateY(10px); } }
  `;
  template() {
    return `<div class="stack" role="status" aria-live="polite"></div>`;
  }
  update() {
    const [v, h] = this.position.split("-");
    const s = this.style;
    s.top = v === "top" ? "20px" : "";
    s.bottom = v === "bottom" ? "20px" : "";
    s.left = h === "left" ? "20px" : h === "center" ? "50%" : "";
    s.right = h === "right" ? "20px" : "";
    s.transform = h === "center" ? "translateX(-50%)" : "";
    this.$(".stack").style.flexDirection = v === "top" ? "column-reverse" : "column";
  }
  /** Número de toasts visibles ahora mismo. */
  get count() {
    return this.shadowRoot.querySelectorAll(".toast:not(.saliendo)").length;
  }
  /**
   * Muestra una notificación.
   * @param {string} message                       Texto (se inserta como texto, nunca como HTML).
   * @param {'success'|'info'|'warning'|'danger'} [type='info']
   * @param {number} [duration=this.duration]      Milisegundos; `0` para que no se cierre sola.
   * @returns {HTMLElement} El elemento del toast (por si se quiere cerrar a mano con `dismiss`).
   */
  show(message, type = "info", duration = this.duration) {
    if (!this._rendered) this.connectedCallback();
    const tipo = TIPOS.includes(type) ? type : "info";
    const toast = document.createElement("div");
    toast.className = `toast ${tipo}`;
    toast.setAttribute("part", "toast");
    const icon = document.createElement("span");
    icon.className = "icon";
    icon.textContent = ICONOS[tipo];
    const text = document.createElement("span");
    text.className = "text";
    text.textContent = message;
    toast.append(icon, text);
    toast._info = { message, type: tipo };
    toast.addEventListener("click", () => this.dismiss(toast, "click"));
    this.$(".stack").appendChild(toast);
    this.emit("df-toast-show", { message, type: tipo });
    const visibles = [...this.shadowRoot.querySelectorAll(".toast:not(.saliendo)")];
    if (this.max > 0 && visibles.length > this.max) this.dismiss(visibles[0], "overflow");
    if (duration > 0) toast._timer = setTimeout(() => this.dismiss(toast, "timeout"), duration);
    return toast;
  }
  /**
   * Quita un toast con animación.
   * @param {HTMLElement} toast
   * @param {'timeout'|'click'|'overflow'|'clear'} [reason='click']
   */
  dismiss(toast, reason = "click") {
    if (!toast || toast.classList.contains("saliendo")) return;
    clearTimeout(toast._timer);
    toast.classList.add("saliendo");
    this.emit("df-toast-hide", { ...toast._info, reason });
    setTimeout(() => toast.remove(), 250);
  }
  /** Quita todos los toasts. */
  clear() {
    this.shadowRoot.querySelectorAll(".toast").forEach((t) => this.dismiss(t, "clear"));
  }
  /**
   * Atajo global: usa el primer `<df-toast-stack>` de la página (o crea uno) y muestra el mensaje.
   * @param {string} message
   * @param {'success'|'info'|'warning'|'danger'} [type='info']
   * @returns {HTMLElement}
   */
  static notify(message, type = "info") {
    let stack = document.querySelector("df-toast-stack");
    if (!stack) {
      stack = document.createElement("df-toast-stack");
      document.body.appendChild(stack);
    }
    return stack.show(message, type);
  }
};
DfToastStack.define("df-toast-stack");

// src/components/df-tooltip.js
var contador = 0;
var DfTooltip = class extends DfElement {
  static properties = {
    text: { type: String, default: "" },
    placement: { type: String, default: "top" },
    delay: { type: Number, default: 150 },
    disabled: { type: Boolean, default: false }
  };
  static styles = `
    :host { position: relative; display: inline-block; }
    .tip {
      position: absolute; z-index: 1200;
      max-width: 260px; width: max-content;
      padding: 6px 10px; border-radius: 6px;
      background: var(--df-tooltip-bg, #0f172a); color: var(--df-tooltip-color, #f8fafc);
      font-size: .76rem; font-weight: 500; line-height: 1.35;
      box-shadow: 0 6px 16px -4px rgba(0,0,0,.35);
      pointer-events: none;
      opacity: 0; transition: opacity .12s ease, transform .12s ease;
    }
    .tip::after { content: ''; position: absolute; border: 5px solid transparent; }
    :host([data-visible]) .tip { opacity: 1; }
    .top { bottom: calc(100% + 8px); left: 50%; transform: translate(-50%, 4px); }
    .top::after { top: 100%; left: 50%; margin-left: -5px; border-top-color: var(--df-tooltip-bg, #0f172a); }
    .bottom { top: calc(100% + 8px); left: 50%; transform: translate(-50%, -4px); }
    .bottom::after { bottom: 100%; left: 50%; margin-left: -5px; border-bottom-color: var(--df-tooltip-bg, #0f172a); }
    .left { right: calc(100% + 8px); top: 50%; transform: translate(4px, -50%); }
    .left::after { left: 100%; top: 50%; margin-top: -5px; border-left-color: var(--df-tooltip-bg, #0f172a); }
    .right { left: calc(100% + 8px); top: 50%; transform: translate(-4px, -50%); }
    .right::after { right: 100%; top: 50%; margin-top: -5px; border-right-color: var(--df-tooltip-bg, #0f172a); }
    :host([data-visible]) .top, :host([data-visible]) .bottom { transform: translate(-50%, 0); }
    :host([data-visible]) .left, :host([data-visible]) .right { transform: translate(0, -50%); }
  `;
  template() {
    return `<slot></slot><div class="tip" part="tip" aria-hidden="true"></div>`;
  }
  firstRender() {
    this._descId = `df-tooltip-${++contador}`;
    this._desc = document.createElement("span");
    this._desc.id = this._descId;
    this._desc.hidden = true;
    this._desc.setAttribute("data-df-tooltip-desc", "");
    this.appendChild(this._desc);
    const abrir = () => this._schedule();
    const cerrar = () => this.hide();
    this.addEventListener("mouseenter", abrir);
    this.addEventListener("mouseleave", cerrar);
    this.addEventListener("focusin", abrir);
    this.addEventListener("focusout", cerrar);
    this._onKey = (e) => {
      if (e.key === "Escape" && this.visible) this.hide();
    };
    this.$("slot").addEventListener("slotchange", () => this._link());
  }
  update() {
    const tip = this.$(".tip");
    tip.className = `tip ${this.placement}`;
    tip.textContent = this.text;
    this._desc.textContent = this.text;
    this._link();
    if (this.disabled && this.visible) this.hide();
  }
  /** Enlaza el elemento disparador con la descripción. @private */
  _link() {
    const trigger = this.trigger;
    if (trigger && !trigger.hasAttribute("aria-describedby")) trigger.setAttribute("aria-describedby", this._descId);
  }
  /** Primer elemento envuelto (el disparador). */
  get trigger() {
    return [...this.children].find((el) => !el.hasAttribute("data-df-tooltip-desc")) ?? null;
  }
  /** Si se está mostrando. */
  get visible() {
    return this.hasAttribute("data-visible");
  }
  _schedule() {
    if (this.disabled || !this.text) return;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.show(), this.delay);
  }
  /** Muestra el tooltip inmediatamente. */
  show() {
    clearTimeout(this._timer);
    if (this.disabled || !this.text || this.visible) return;
    this.setAttribute("data-visible", "");
    document.addEventListener("keydown", this._onKey);
    this.emit("df-show");
  }
  /** Oculta el tooltip. */
  hide() {
    clearTimeout(this._timer);
    if (!this.visible) return;
    this.removeAttribute("data-visible");
    document.removeEventListener("keydown", this._onKey);
    this.emit("df-hide");
  }
  disconnectedCallback() {
    clearTimeout(this._timer);
    document.removeEventListener("keydown", this._onKey);
  }
};
DfTooltip.define("df-tooltip");

// src/components/df-progress.js
var DfProgress = class extends DfElement {
  static properties = {
    value: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    label: { type: String, default: "" },
    variant: { type: String, default: "default" },
    indeterminate: { type: Boolean, default: false },
    showValue: { type: Boolean, default: false },
    size: { type: String, default: "md" }
  };
  static styles = `
    :host { display: block; }
    .head { display: flex; justify-content: space-between; font-size: .8rem; margin-bottom: 6px; color: var(--df-text); }
    .head .pct { color: var(--df-text-muted); font-variant-numeric: tabular-nums; }
    .track { position: relative; height: 8px; border-radius: 999px; background: var(--df-surface-alt); overflow: hidden;
             box-shadow: inset 0 0 0 1px var(--df-border); }
    .size-sm { height: 4px; }
    .size-lg { height: 14px; }
    .bar { height: 100%; width: 0; border-radius: inherit; background: var(--_c, var(--df-teal)); transition: width .35s ease; }
    .success { --_c: var(--df-green); }
    .warning { --_c: var(--df-orange); }
    .danger { --_c: var(--df-red); }
    :host([indeterminate]) .bar { width: 35% !important; position: absolute; animation: vaiven 1.2s ease-in-out infinite; }
    @keyframes vaiven { from { left: -35%; } to { left: 100%; } }
    @media (prefers-reduced-motion: reduce) { :host([indeterminate]) .bar { animation-duration: 3s; } .bar { transition: none; } }
  `;
  template() {
    return `
      <div class="head" hidden><span class="label"></span><span class="pct"></span></div>
      <div class="track" part="track" role="progressbar"><div class="bar" part="bar"></div></div>`;
  }
  /** Porcentaje (0–100) acotado. */
  get percent() {
    if (this.max <= 0) return 0;
    return Math.min(100, Math.max(0, this.value / this.max * 100));
  }
  update(changed) {
    const track = this.$(".track");
    track.className = `track size-${this.size} ${this.variant}`;
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", String(this.max));
    if (this.label) track.setAttribute("aria-label", this.label);
    else track.removeAttribute("aria-label");
    if (this.indeterminate) {
      track.removeAttribute("aria-valuenow");
      track.setAttribute("aria-busy", "true");
    } else {
      track.setAttribute("aria-valuenow", String(this.value));
      track.removeAttribute("aria-busy");
    }
    const pct = Math.round(this.percent);
    this.$(".bar").style.width = `${this.percent}%`;
    this.$(".label").textContent = this.label;
    this.$(".pct").textContent = this.showValue && !this.indeterminate ? `${pct} %` : "";
    this.$(".head").hidden = !this.label && !(this.showValue && !this.indeterminate);
    const complete = !this.indeterminate && this.max > 0 && this.value >= this.max;
    if (complete && !this._completed && changed !== null) this.emit("df-complete", { value: this.value, max: this.max });
    this._completed = complete;
  }
};
DfProgress.define("df-progress");

// src/components/df-stat-card.js
function formatValue(value, format = "text", currency = "EUR") {
  if (format === "text") return String(value);
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  if (format === "currency") {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency, minimumFractionDigits: 2, useGrouping: "always" }).format(n);
  }
  if (format === "percent") {
    return new Intl.NumberFormat("es-ES", { style: "percent", maximumFractionDigits: 1 }).format(n / 100);
  }
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2, useGrouping: "always" }).format(n);
}
var DfStatCard = class extends DfElement {
  static properties = {
    label: { type: String, default: "" },
    value: { type: String, default: "0" },
    format: { type: String, default: "text" },
    currency: { type: String, default: "EUR" },
    unit: { type: String, default: "" },
    hint: { type: String, default: "" },
    variant: { type: String, default: "default" },
    interactive: { type: Boolean, default: false }
  };
  static styles = `
    :host { display: block; }
    .card {
      --_c: var(--df-text);
      height: 100%;
      background: var(--df-surface-alt);
      border: 1px solid var(--df-border);
      border-left: 4px solid var(--_accent, var(--df-border));
      border-radius: 8px;
      padding: 16px;
      display: flex; justify-content: space-between; gap: 12px;
      transition: transform .15s ease, box-shadow .15s ease;
    }
    .label { font-size: .78rem; color: var(--df-text-muted); }
    .value { font-size: 1.45rem; font-weight: 700; margin-top: 4px; color: var(--_c); font-variant-numeric: tabular-nums; }
    .unit { font-size: .85rem; font-weight: 600; margin-left: 3px; color: var(--df-text-muted); }
    .hint { font-size: .72rem; color: var(--df-text-muted); margin-top: 4px; }
    ::slotted([slot="icon"]) { color: var(--_accent, var(--df-text-muted)); width: 22px; height: 22px; }
    .success { --_c: var(--df-green); --_accent: var(--df-green); }
    .warning { --_c: var(--df-orange); --_accent: var(--df-orange); }
    .danger { --_c: var(--df-red); --_accent: var(--df-red); }
    .info { --_c: var(--df-blue); --_accent: var(--df-blue); }
    :host([interactive]) .card { cursor: pointer; }
    :host([interactive]) .card:hover { transform: translateY(-2px); box-shadow: 0 8px 18px -8px rgba(0,0,0,.2); }
    .card:focus-visible { outline: 2px solid var(--df-blue); outline-offset: 2px; }
  `;
  template() {
    return `
      <div class="card" part="card">
        <div>
          <div class="label"></div>
          <div class="value" part="value"><span class="num"></span><span class="unit"></span></div>
          <div class="hint"></div>
        </div>
        <slot name="icon"></slot>
      </div>`;
  }
  firstRender() {
    const card = this.$(".card");
    const select = () => {
      if (this.interactive) this.emit("df-select", { label: this.label, value: this.value });
    };
    card.addEventListener("click", select);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select();
      }
    });
  }
  update() {
    const card = this.$(".card");
    card.className = `card ${this.variant}`;
    if (this.interactive) {
      card.tabIndex = 0;
      card.setAttribute("role", "button");
    } else {
      card.removeAttribute("tabindex");
      card.removeAttribute("role");
    }
    this.$(".label").textContent = this.label;
    this.$(".num").textContent = this.formattedValue;
    this.$(".unit").textContent = this.unit;
    this.$(".hint").textContent = this.hint;
    this.$(".hint").hidden = !this.hint;
  }
  /** El valor tal y como se ve en pantalla. */
  get formattedValue() {
    return formatValue(this.value, this.format, this.currency);
  }
};
DfStatCard.define("df-stat-card");

// src/components/df-data-table.js
var normalizar = (v) => String(v ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
function queryRows(rows, opts = {}) {
  const { query = "", keys = [], sortKey = "", sortDir = "asc", pageSize = 0 } = opts;
  let out = [...rows];
  const q = normalizar(query).trim();
  if (q) {
    const campos = keys.length ? keys : Object.keys(rows[0] ?? {});
    out = out.filter((row) => campos.some((k) => normalizar(row[k]).includes(q)));
  }
  if (sortKey) {
    const factor = sortDir === "desc" ? -1 : 1;
    out.sort((a, b) => {
      const x = a[sortKey];
      const y = b[sortKey];
      if (x == null && y == null) return 0;
      if (x == null) return 1;
      if (y == null) return -1;
      if (typeof x === "number" && typeof y === "number") return (x - y) * factor;
      return String(x).localeCompare(String(y), "es", { numeric: true, sensitivity: "base" }) * factor;
    });
  }
  const total = out.length;
  const pages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const page = Math.min(Math.max(1, opts.page ?? 1), pages);
  if (pageSize > 0) out = out.slice((page - 1) * pageSize, page * pageSize);
  return { rows: out, total, pages, page };
}
var DfDataTable = class extends DfElement {
  static properties = {
    pageSize: { type: Number, default: 10 },
    searchable: { type: Boolean, default: false },
    searchPlaceholder: { type: String, default: "Buscar\u2026" },
    emptyText: { type: String, default: "No hay datos" },
    sortKey: { type: String, default: "" },
    sortDir: { type: String, default: "asc" },
    striped: { type: Boolean, default: false },
    clickable: { type: Boolean, default: false },
    caption: { type: String, default: "" }
  };
  static styles = `
    :host { display: block; }
    .toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
    .toolbar:not(.has-search):not(.has-slot) { display: none; }
    .search { position: relative; flex: 1; max-width: 300px; min-width: 180px; }
    .search svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--df-text-muted); }
    .search input {
      width: 100%; padding: 8px 12px 8px 32px; border: 1px solid var(--df-border); border-radius: var(--df-radius);
      background: var(--df-surface-alt); color: var(--df-text); font: .85rem var(--df-font); outline: none;
    }
    .search input:focus { border-color: var(--df-blue); }
    .scroll { overflow-x: auto; border: 1px solid var(--df-border); border-radius: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: .86rem; color: var(--df-text); }
    caption { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
    th { text-align: left; font-weight: 600; font-size: .8rem;
         color: var(--df-text-muted); background: var(--df-surface-alt); padding: 0; border-bottom: 1px solid var(--df-border); white-space: nowrap; }
    th > span, th > button { display: flex; align-items: center; gap: 6px; padding: 11px 14px; }
    th button { all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 6px; width: 100%; padding: 11px 14px; cursor: pointer; }
    th button:hover { color: var(--df-text); }
    th button:focus-visible { outline: 2px solid var(--df-blue); outline-offset: -2px; }
    th[aria-sort="ascending"], th[aria-sort="descending"] { color: var(--df-teal); }
    .arrow { opacity: .35; font-size: .7rem; }
    th[aria-sort] .arrow { opacity: 1; }
    td { padding: 11px 14px; border-bottom: 1px solid var(--df-border); vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    .striped tbody tr:nth-child(even) td { background: color-mix(in srgb, var(--df-surface-alt) 60%, transparent); }
    .clickable tbody tr { cursor: pointer; }
    .clickable tbody tr:hover td { background: var(--df-surface-alt); }
    .right { text-align: right; justify-content: flex-end; }
    .center { text-align: center; justify-content: center; }
    td.empty { text-align: center; color: var(--df-text-muted); padding: 28px; }
    .foot { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 12px; font-size: .8rem; color: var(--df-text-muted); flex-wrap: wrap; }
    .pager { display: flex; gap: 4px; }
    .pager button {
      all: unset; box-sizing: border-box; min-width: 30px; height: 30px; padding: 0 8px; border-radius: 6px;
      display: grid; place-items: center; cursor: pointer; color: var(--df-text); border: 1px solid var(--df-border); font-size: .8rem;
    }
    .pager button:hover:not([disabled]) { background: var(--df-surface-alt); }
    .pager button[aria-current="page"] { background: var(--df-primary); color: #fff; border-color: transparent; }
    .pager button[disabled] { opacity: .4; cursor: not-allowed; }
    .pager button:focus-visible { outline: 2px solid var(--df-blue); outline-offset: 1px; }
  `;
  constructor() {
    super();
    this._columns = [];
    this._rows = [];
    this._query = "";
    this._page = 1;
  }
  template() {
    return `
      <div class="toolbar">
        <label class="search" hidden>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" aria-label="Buscar en la tabla">
        </label>
        <slot name="toolbar"></slot>
      </div>
      <div class="scroll"><table part="table"><caption></caption><thead><tr></tr></thead><tbody></tbody></table></div>
      <div class="foot"><span class="info" aria-live="polite"></span><nav class="pager" aria-label="Paginaci\xF3n"></nav></div>`;
  }
  firstRender() {
    const input = this.$(".search input");
    input.addEventListener("input", () => {
      this._query = input.value;
      this._page = 1;
      this._renderBody();
      this.emit("df-search", { query: this._query, total: this._last.total });
    });
    this.$('slot[name="toolbar"]').addEventListener("slotchange", () => this._toolbarState());
    this.$("tbody").addEventListener("click", (e) => {
      if (!this.clickable) return;
      const tr = e.target.closest("tr[data-index]");
      if (!tr) return;
      const index = Number(tr.dataset.index);
      this.emit("df-row-click", { row: this._last.rows[index], index });
    });
  }
  /** Definición de columnas. @type {Array<object>} */
  get columns() {
    return this._columns;
  }
  set columns(cols) {
    this._columns = Array.isArray(cols) ? cols : [];
    if (this._rendered) this.update(null);
  }
  /** Datos. @type {Array<object>} */
  get rows() {
    return this._rows;
  }
  set rows(data) {
    this._rows = Array.isArray(data) ? data : [];
    if (this._rendered) {
      this._clampPage();
      this._renderBody();
    }
  }
  /**
   * Cambia los datos de golpe (atajo de `rows = ...`).
   * @param {Array<object>} rows
   */
  setData(rows) {
    this.rows = rows;
  }
  /** Página actual (empieza en 1). */
  get page() {
    return this._page;
  }
  /** Filas que se ven ahora mismo (tras filtrar, ordenar y paginar). */
  get visibleRows() {
    return this._compute().rows;
  }
  /** Número de filas que cumplen la búsqueda. */
  get total() {
    return this._compute().total;
  }
  /** Texto de búsqueda actual. */
  get query() {
    return this._query;
  }
  /**
   * Busca por código.
   * @param {string} text
   */
  search(text) {
    this._query = String(text ?? "");
    this._page = 1;
    if (this._rendered) {
      this.$(".search input").value = this._query;
      this._renderBody();
    }
  }
  /**
   * Ordena por una columna. Si ya estaba ordenada por esa, invierte la dirección.
   * @param {string} key
   * @param {'asc'|'desc'} [direction]
   */
  sortBy(key, direction) {
    const dir = direction ?? (this.sortKey === key && this.sortDir === "asc" ? "desc" : "asc");
    this.sortKey = key;
    this.sortDir = dir;
  }
  /**
   * Va a una página.
   * @param {number} page
   */
  goToPage(page) {
    const { pages } = this._compute();
    const destino = Math.min(Math.max(1, page), pages);
    if (destino === this._page) return;
    this._page = destino;
    this._renderBody();
    this.emit("df-page", { page: this._page, pages });
  }
  _compute() {
    return queryRows(this._rows, {
      query: this._query,
      keys: this._columns.map((c) => c.key),
      sortKey: this.sortKey,
      sortDir: this.sortDir,
      page: this._page,
      pageSize: this.pageSize
    });
  }
  _clampPage() {
    const { pages } = queryRows(this._rows, { query: this._query, keys: this._columns.map((c) => c.key), pageSize: this.pageSize });
    this._page = Math.min(this._page, pages);
  }
  _toolbarState() {
    const bar = this.$(".toolbar");
    bar.classList.toggle("has-search", this.searchable);
    bar.classList.toggle("has-slot", this.$('slot[name="toolbar"]').assignedElements().length > 0);
  }
  update(changed) {
    this.$(".search").hidden = !this.searchable;
    this.$(".search input").placeholder = this.searchPlaceholder;
    this._toolbarState();
    this.$("caption").textContent = this.caption;
    const table = this.$("table");
    table.className = `${this.striped ? "striped" : ""} ${this.clickable ? "clickable" : ""}`;
    if (changed === "page-size") this._page = 1;
    this._renderHead();
    this._renderBody();
  }
  _renderHead() {
    const tr = this.$("thead tr");
    tr.innerHTML = "";
    this._columns.forEach((col) => {
      const th = document.createElement("th");
      th.scope = "col";
      const align = col.align ?? (["number", "currency"].includes(col.type) ? "right" : "left");
      const sortable = col.sortable !== false;
      if (this.sortKey === col.key) th.setAttribute("aria-sort", this.sortDir === "desc" ? "descending" : "ascending");
      const inner = document.createElement(sortable ? "button" : "span");
      inner.className = align;
      inner.textContent = col.label ?? col.key;
      if (sortable) {
        const arrow = document.createElement("span");
        arrow.className = "arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = this.sortKey === col.key ? this.sortDir === "desc" ? "\u25BC" : "\u25B2" : "\u2195";
        inner.appendChild(arrow);
        inner.addEventListener("click", () => {
          this.sortBy(col.key);
          this.emit("df-sort", { key: this.sortKey, direction: this.sortDir });
        });
      }
      th.appendChild(inner);
      tr.appendChild(th);
    });
  }
  _cell(col, row) {
    const td = document.createElement("td");
    const align = col.align ?? (["number", "currency"].includes(col.type) ? "right" : "left");
    if (align !== "left") td.className = align;
    if (typeof col.render === "function") {
      const out = col.render(row);
      if (out instanceof Node) td.appendChild(out);
      else td.innerHTML = out ?? "";
      return td;
    }
    const v = row[col.key];
    if (col.type === "currency") td.textContent = formatValue(v, "currency");
    else if (col.type === "number") td.textContent = formatValue(v, "number");
    else if (col.type === "date" && v) {
      const d = new Date(v);
      td.textContent = Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString("es-ES");
    } else td.textContent = v ?? "";
    return td;
  }
  _renderBody() {
    const res = this._compute();
    this._last = res;
    this._page = res.page;
    const tbody = this.$("tbody");
    tbody.innerHTML = "";
    if (!res.rows.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.className = "empty";
      td.colSpan = Math.max(1, this._columns.length);
      td.textContent = this._query ? `Sin resultados para "${this._query}"` : this.emptyText;
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      res.rows.forEach((row, i) => {
        const tr = document.createElement("tr");
        tr.dataset.index = String(i);
        this._columns.forEach((col) => tr.appendChild(this._cell(col, row)));
        tbody.appendChild(tr);
      });
    }
    this._renderFoot(res);
  }
  _renderFoot({ total, pages, page }) {
    const size = this.pageSize;
    const desde = total === 0 ? 0 : size > 0 ? (page - 1) * size + 1 : 1;
    const hasta = size > 0 ? Math.min(page * size, total) : total;
    this.$(".info").textContent = total === 0 ? "0 resultados" : `${desde}\u2013${hasta} de ${total}`;
    const pager = this.$(".pager");
    pager.innerHTML = "";
    pager.hidden = pages <= 1;
    if (pages <= 1) return;
    const boton = (texto, destino, opts = {}) => {
      const b = document.createElement("button");
      b.textContent = texto;
      if (opts.label) b.setAttribute("aria-label", opts.label);
      if (opts.current) b.setAttribute("aria-current", "page");
      if (opts.disabled) b.disabled = true;
      b.addEventListener("click", () => this.goToPage(destino));
      pager.appendChild(b);
    };
    boton("\u2039", page - 1, { label: "P\xE1gina anterior", disabled: page === 1 });
    const inicio = Math.max(1, Math.min(page - 2, pages - 4));
    for (let p = inicio; p <= Math.min(pages, inicio + 4); p++) boton(String(p), p, { current: p === page, label: `P\xE1gina ${p}` });
    boton("\u203A", page + 1, { label: "P\xE1gina siguiente", disabled: page === pages });
  }
};
DfDataTable.define("df-data-table");

// src/components/df-badge.js
var BADGE_COLORS = ["teal", "blue", "green", "orange", "red", "yellow", "purple", "magenta", "gray"];
var DfBadge = class extends DfElement {
  static properties = {
    color: { type: String, default: "teal" },
    variant: { type: String, default: "solid" },
    size: { type: String, default: "md" },
    dot: { type: Boolean, default: false }
  };
  static styles = `
    :host { display: inline-block; vertical-align: middle; }
    .badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 10px;
      border-radius: 6px;
      font-weight: 600; font-size: .8rem; line-height: 1.2;
      white-space: nowrap;
      background: var(--_c); color: #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,.08);
    }
    .size-sm { padding: 2px 7px; font-size: .7rem; border-radius: 4px; }
    .variant-soft { background: color-mix(in srgb, var(--_c) 16%, transparent); color: var(--_c); box-shadow: none; }
    .variant-outline { background: transparent; color: var(--_c); box-shadow: inset 0 0 0 1.5px var(--_c); }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  `;
  template() {
    return `<span class="badge" part="badge"><span class="dot" hidden></span><slot></slot></span>`;
  }
  update() {
    const badge = this.$(".badge");
    badge.className = `badge variant-${this.variant} size-${this.size}`;
    badge.style.setProperty("--_c", this.cssColor);
    this.$(".dot").hidden = !this.dot;
  }
  /** Color CSS real que se está usando. */
  get cssColor() {
    const c = this.color;
    if (c === "gray") return "var(--df-text-muted)";
    return BADGE_COLORS.includes(c) ? `var(--df-${c})` : c;
  }
};
DfBadge.define("df-badge");

// src/components/df-avatar.js
var PALETA = ["#0d9488", "#0284c7", "#7c3aed", "#c026d3", "#ea580c", "#16a34a", "#e11d48", "#ca8a04", "#1a4d59"];
var TAMANOS = { sm: 28, md: 40, lg: 56, xl: 80 };
var ESTADOS = { online: "En l\xEDnea", away: "Ausente", busy: "Ocupado", offline: "Desconectado" };
function initials(name) {
  const partes = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}
function colorFor(name) {
  let hash = 0;
  for (const ch of String(name ?? "")) hash = hash * 31 + ch.codePointAt(0) >>> 0;
  return PALETA[hash % PALETA.length];
}
var DfAvatar = class extends DfElement {
  static properties = {
    name: { type: String, default: "" },
    src: { type: String, default: "" },
    size: { type: String, default: "md" },
    shape: { type: String, default: "circle" },
    status: { type: String, default: "" }
  };
  static styles = `
    :host { display: inline-block; vertical-align: middle; }
    .avatar {
      --_s: 40px;
      position: relative;
      width: var(--_s); height: var(--_s);
      border-radius: 50%;
      display: grid; place-items: center;
      background: var(--_bg); color: #fff;
      font-weight: 700; font-size: calc(var(--_s) * .38); letter-spacing: .02em;
      user-select: none;
    }
    .square { border-radius: 22%; }
    img { width: 100%; height: 100%; object-fit: cover; border-radius: inherit; }
    .dot {
      position: absolute; right: 0; bottom: 0;
      width: calc(var(--_s) * .28); height: calc(var(--_s) * .28); min-width: 8px; min-height: 8px;
      border-radius: 50%; border: 2px solid var(--df-surface);
    }
    .online { background: var(--df-green); }
    .away { background: var(--df-yellow); }
    .busy { background: var(--df-red); }
    .offline { background: var(--df-text-muted); }
  `;
  template() {
    return `<span class="avatar" part="avatar" role="img"><img alt="" hidden><span class="ini" aria-hidden="true"></span><span class="dot" hidden></span></span>`;
  }
  firstRender() {
    const img = this.$("img");
    img.addEventListener("error", () => {
      this._failed = img.getAttribute("src");
      this._paint();
      this.emit("df-error", { src: this._failed });
    });
  }
  update(changed) {
    if (changed === "src") this._failed = null;
    this._paint();
  }
  _paint() {
    const box = this.$(".avatar");
    const img = this.$("img");
    const px = TAMANOS[this.size] ?? TAMANOS.md;
    box.className = `avatar ${this.shape === "square" ? "square" : ""}`;
    box.style.setProperty("--_s", `${px}px`);
    box.style.setProperty("--_bg", colorFor(this.name));
    const usaImagen = Boolean(this.src) && this._failed !== this.src;
    img.hidden = !usaImagen;
    if (usaImagen && img.getAttribute("src") !== this.src) img.setAttribute("src", this.src);
    this.$(".ini").textContent = usaImagen ? "" : initials(this.name);
    const estado = ESTADOS[this.status];
    const dot = this.$(".dot");
    dot.hidden = !estado;
    dot.className = `dot ${this.status}`;
    box.setAttribute("aria-label", [this.name || "Usuario", estado].filter(Boolean).join(" \xB7 "));
  }
  /** Iniciales que se muestran. */
  get initials() {
    return initials(this.name);
  }
};
DfAvatar.define("df-avatar");

// src/components/df-tabs.js
var DfTabPanel = class extends DfElement {
  static properties = {
    label: { type: String, default: "" },
    disabled: { type: Boolean, default: false }
  };
  static styles = `
    :host { display: block; }
    :host([hidden]) { display: none !important; }
  `;
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "tabpanel");
  }
  update(changed) {
    if (this.label) this.setAttribute("aria-label", this.label);
    if (changed === "label" || changed === "disabled") this.closest("df-tabs")?.refresh?.();
  }
};
DfTabPanel.define("df-tab-panel");
var DfTabs = class extends DfElement {
  static properties = {
    selected: { type: Number, default: 0 },
    variant: { type: String, default: "line" }
  };
  static styles = `
    :host { display: block; }
    .list { display: flex; gap: 4px; border-bottom: 1px solid var(--df-border); margin-bottom: 16px; overflow-x: auto; scrollbar-width: thin; }
    .tab {
      all: unset; box-sizing: border-box;
      padding: 10px 16px; margin-bottom: -1px;
      font: 600 .85rem var(--df-font); color: var(--df-text-muted);
      border-bottom: 2px solid transparent;
      cursor: pointer; white-space: nowrap;
      transition: color .15s, border-color .15s, background .15s;
    }
    .tab:hover { color: var(--df-text); }
    .tab[aria-selected="true"] { color: var(--df-primary); border-bottom-color: var(--df-teal); }
    .tab:focus-visible { outline: 2px solid var(--df-blue); outline-offset: -2px; border-radius: 4px; }
    .tab[aria-disabled="true"] { opacity: .45; cursor: not-allowed; }
    .pill { border-bottom: none; gap: 6px; padding: 4px; background: var(--df-surface-alt); border-radius: 10px; width: fit-content; max-width: 100%; }
    .pill .tab { border: none; border-radius: 7px; padding: 7px 14px; margin: 0; }
    .pill .tab[aria-selected="true"] { background: var(--df-surface); color: var(--df-text); box-shadow: 0 1px 3px rgba(0,0,0,.12); }
  `;
  template() {
    return `<div class="list" part="tablist" role="tablist"></div><slot></slot>`;
  }
  firstRender() {
    this.$("slot").addEventListener("slotchange", () => this.refresh());
    this.$(".list").addEventListener("keydown", (e) => this._onKeydown(e));
    this.refresh();
  }
  /** Paneles hijos. */
  get panels() {
    return [...this.children].filter((el) => el.localName === "df-tab-panel");
  }
  /** Vuelve a generar las pestañas a partir de los paneles (se llama solo al añadir o quitar paneles). */
  refresh() {
    if (!this._rendered) return;
    const list = this.$(".list");
    list.innerHTML = "";
    this.panels.forEach((panel, i) => {
      const tab = document.createElement("button");
      tab.className = "tab";
      tab.setAttribute("role", "tab");
      tab.setAttribute("part", "tab");
      tab.textContent = panel.label || `Pesta\xF1a ${i + 1}`;
      tab.dataset.index = String(i);
      tab.addEventListener("click", () => this._userSelect(i));
      list.appendChild(tab);
    });
    this.update(null);
  }
  update() {
    const list = this.$(".list");
    list.className = `list ${this.variant === "pill" ? "pill" : ""}`;
    const panels = this.panels;
    const actual = this._validIndex(this.selected);
    [...list.children].forEach((tab, i) => {
      const activo = i === actual;
      const disabled = panels[i]?.disabled ?? false;
      tab.setAttribute("aria-selected", String(activo));
      tab.setAttribute("aria-disabled", String(disabled));
      tab.tabIndex = activo ? 0 : -1;
    });
    panels.forEach((panel, i) => {
      panel.hidden = i !== actual;
    });
  }
  /** Corrige el índice si apunta a un panel que no existe o está desactivado. @private */
  _validIndex(index) {
    const panels = this.panels;
    if (panels[index] && !panels[index].disabled) return index;
    const primero = panels.findIndex((p) => !p.disabled);
    return primero === -1 ? 0 : primero;
  }
  _userSelect(index) {
    const panel = this.panels[index];
    if (!panel || panel.disabled || index === this.selected) return;
    this.selected = index;
    this.emit("df-tab-change", { index, label: panel.label });
  }
  _onKeydown(e) {
    const panels = this.panels;
    const habilitados = panels.map((p, i) => p.disabled ? -1 : i).filter((i) => i >= 0);
    if (!habilitados.length) return;
    const pos = habilitados.indexOf(this._validIndex(this.selected));
    let destino = null;
    if (e.key === "ArrowRight") destino = habilitados[(pos + 1) % habilitados.length];
    else if (e.key === "ArrowLeft") destino = habilitados[(pos - 1 + habilitados.length) % habilitados.length];
    else if (e.key === "Home") destino = habilitados[0];
    else if (e.key === "End") destino = habilitados[habilitados.length - 1];
    if (destino === null) return;
    e.preventDefault();
    this._userSelect(destino);
    this.$(".list").children[destino]?.focus();
  }
  /**
   * Selecciona una pestaña por código (no lanza evento).
   * @param {number} index
   */
  select(index) {
    this.selected = index;
  }
};
DfTabs.define("df-tabs");

// src/components/df-theme-toggle.js
var SOL = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
var LUNA = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;
var DfThemeToggle = class extends DfElement {
  static properties = {
    theme: { type: String, default: "light" },
    target: { type: String, default: "body" },
    storageKey: { type: String, default: "" }
  };
  static styles = `
    :host { display: inline-block; }
    button {
      all: unset;
      width: 36px; height: 36px; border-radius: 50%;
      display: grid; place-items: center;
      cursor: pointer;
      color: var(--df-toggle-color, #fff);
      background: var(--df-toggle-bg, rgba(255,255,255,.12));
      transition: background .2s ease, transform .3s ease;
    }
    button:hover { background: var(--df-toggle-bg-hover, rgba(255,255,255,.22)); }
    button:focus-visible { outline: 2px solid var(--df-blue); outline-offset: 2px; }
    :host([theme="dark"]) button { transform: rotate(-20deg); }
  `;
  template() {
    return `<button part="button"></button>`;
  }
  connectedCallback() {
    if (!this._rendered && this.storageKey) {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved === "light" || saved === "dark") this.theme = saved;
      } catch {
      }
    }
    super.connectedCallback();
  }
  firstRender() {
    this.$("button").addEventListener("click", () => this.toggle());
  }
  update() {
    const dark = this.theme === "dark";
    const btn = this.$("button");
    btn.innerHTML = dark ? SOL : LUNA;
    btn.setAttribute("aria-label", dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
    btn.title = btn.getAttribute("aria-label");
    this.applyTheme();
  }
  /** Aplica el tema actual al elemento objetivo y lo guarda si hay `storageKey`. */
  applyTheme() {
    const el = document.querySelector(this.target);
    if (el) {
      if (this.theme === "dark") el.setAttribute("data-theme", "dark");
      else el.removeAttribute("data-theme");
    }
    if (this.storageKey) {
      try {
        localStorage.setItem(this.storageKey, this.theme);
      } catch {
      }
    }
  }
  /**
   * Cambia al tema contrario y lanza `df-theme-change`.
   * @returns {'light'|'dark'} El nuevo tema.
   */
  toggle() {
    this.theme = this.theme === "dark" ? "light" : "dark";
    this.emit("df-theme-change", { theme: this.theme });
    return this.theme;
  }
};
DfThemeToggle.define("df-theme-toggle");

// src/index.js
var VERSION = "2.0.0";
var TAGS = [
  "df-button",
  "df-input",
  "df-select",
  "df-switch",
  "df-modal",
  "df-toast-stack",
  "df-tooltip",
  "df-progress",
  "df-data-table",
  "df-stat-card",
  "df-badge",
  "df-avatar",
  "df-tabs",
  "df-tab-panel",
  "df-theme-toggle"
];
export {
  BADGE_COLORS,
  DfAvatar,
  DfBadge,
  DfButton,
  DfDataTable,
  DfElement,
  DfInput,
  DfModal,
  DfProgress,
  DfSelect,
  DfStatCard,
  DfSwitch,
  DfTabPanel,
  DfTabs,
  DfThemeToggle,
  DfToastStack,
  DfTooltip,
  TAGS,
  VERSION,
  colorFor,
  escapeHtml,
  formatValue,
  fromAttribute,
  initials,
  queryRows,
  toKebab,
  validateValue
};
//# sourceMappingURL=diegofo-ui.esm.js.map
