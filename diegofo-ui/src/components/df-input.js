import { DfElement, escapeHtml } from '../core/df-element.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida un valor según unas reglas. Es una función pura: se puede probar sin DOM.
 * @param {string} value
 * @param {{required?: boolean, type?: string, pattern?: string, minlength?: number, errorMessage?: string}} rules
 * @returns {{valid: boolean, message: string}}
 */
export function validateValue(value, rules = {}) {
  const v = String(value ?? '').trim();
  if (rules.required && v === '') return { valid: false, message: 'Este campo es obligatorio' };
  if (v === '') return { valid: true, message: '' };
  if (rules.type === 'email' && !EMAIL_RE.test(v)) {
    return { valid: false, message: rules.errorMessage || 'Introduce un correo válido' };
  }
  if (rules.type === 'number' && Number.isNaN(Number(v))) {
    return { valid: false, message: rules.errorMessage || 'Introduce un número' };
  }
  if (rules.minlength && v.length < rules.minlength) {
    return { valid: false, message: rules.errorMessage || `Mínimo ${rules.minlength} caracteres` };
  }
  if (rules.pattern) {
    let re;
    try { re = new RegExp(`^(?:${rules.pattern})$`); } catch { re = null; }
    if (re && !re.test(v)) return { valid: false, message: rules.errorMessage || 'Formato no válido' };
  }
  return { valid: true, message: '' };
}

/**
 * Campo de formulario con etiqueta, ayuda y validación integrada.
 *
 * @element df-input
 *
 * @prop {string}  label        - Texto de la etiqueta. Por defecto `''`.
 * @prop {string}  type         - `text` (por defecto), `email`, `password`, `number`, `date` o `textarea`.
 * @prop {string}  name         - Nombre del campo (se usa al enviar un formulario). Por defecto `''`.
 * @prop {string}  value        - Valor actual. Por defecto `''`.
 * @prop {string}  placeholder  - Texto de ejemplo. Por defecto `''`.
 * @prop {string}  hint         - Texto de ayuda bajo el campo. Por defecto `''`.
 * @prop {boolean} required     - Obligatorio. Por defecto `false`.
 * @prop {boolean} disabled     - Desactivado. Por defecto `false`.
 * @prop {string}  pattern      - Expresión regular que debe cumplir el valor. Por defecto `''`.
 * @prop {number}  minlength    - Longitud mínima. Por defecto `0` (sin mínimo).
 * @prop {number}  rows         - Filas cuando `type="textarea"`. Por defecto `3`.
 * @prop {string}  errorMessage - (atributo `error-message`) Mensaje de error personalizado. Por defecto `''`.
 * @prop {boolean} invalid      - Solo lectura en la práctica: lo pone `validate()`. Por defecto `false`.
 *
 * @fires df-input   - En cada pulsación. detail: `{ value, name }`
 * @fires df-change  - Al confirmar el cambio (salir del campo). detail: `{ value, name, valid }`
 * @fires df-enter   - Al pulsar Enter (no en textarea). detail: `{ value, name }`
 * @fires df-invalid - Cuando `validate()` falla. detail: `{ value, name, message }`
 *
 * @csspart field - El `<input>` o `<textarea>` interno.
 * @csspart label - La etiqueta.
 */
export class DfInput extends DfElement {
  static formAssociated = true;

  static properties = {
    label: { type: String, default: '' },
    type: { type: String, default: 'text' },
    name: { type: String, default: '' },
    value: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    hint: { type: String, default: '' },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    pattern: { type: String, default: '' },
    minlength: { type: Number, default: 0 },
    rows: { type: Number, default: 3 },
    errorMessage: { type: String, default: '' },
    invalid: { type: Boolean, default: false },
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
    if (typeof this.attachInternals === 'function') {
      try { this._internals = this.attachInternals(); } catch { this._internals = null; }
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
    const isArea = this.type === 'textarea';
    const holder = this.$('.field-slot');
    const previous = this._field ? this._field.value : this.getAttribute('value') ?? '';
    holder.innerHTML = isArea
      ? `<textarea id="f" part="field" rows="${escapeHtml(this.rows)}"></textarea>`
      : `<input id="f" part="field" type="${escapeHtml(this.type)}">`;
    this._field = holder.firstElementChild;
    this._field.value = previous;
    this._isArea = isArea;

    this._field.addEventListener('input', () => {
      this._syncForm();
      if (this.invalid) this.validate({ silent: true });
      this.emit('df-input', { value: this.value, name: this.name });
    });
    this._field.addEventListener('change', () => {
      const valid = this.validate();
      this.emit('df-change', { value: this.value, name: this.name, valid });
    });
    this._field.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !this._isArea) this.emit('df-enter', { value: this.value, name: this.name });
    });
  }

  update(changed) {
    if (!this._field || changed === 'type' || (changed === 'rows' && this._isArea)) this._buildField();
    const f = this._field;
    if (changed === 'value' || changed === null) {
      const attr = this.getAttribute('value');
      if (changed === 'value' || attr !== null) f.value = attr ?? '';
    }
    this.$('.text').textContent = this.label;
    this.$('label').hidden = !this.label;
    this.$('.req').hidden = !this.required;
    f.placeholder = this.placeholder;
    f.disabled = this.disabled;
    f.required = this.required;
    if (this.name) f.name = this.name;
    f.setAttribute('aria-invalid', String(this.invalid));
    if (!this.invalid) this.$('.msg').textContent = this.hint;
    this._syncForm();
  }

  /** Valor actual del campo (lo que ha escrito el usuario). */
  get value() {
    return this._field ? this._field.value : this.getAttribute('value') ?? '';
  }

  set value(v) {
    const text = v === null || v === undefined ? '' : String(v);
    if (this._field) this._field.value = text;
    this.setAttribute('value', text);
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
      errorMessage: this.errorMessage,
    });
    this.invalid = !valid;
    this.$('.msg').textContent = valid ? this.hint : message;
    if (!valid && !options.silent) this.emit('df-invalid', { value: this.value, name: this.name, message });
    return valid;
  }

  /** Comprueba si es válido sin mostrar nada. */
  checkValidity() {
    return validateValue(this.value, {
      required: this.required, type: this.type, pattern: this.pattern, minlength: this.minlength,
    }).valid;
  }

  /** Vacía el campo y quita el estado de error. */
  clear() {
    this.value = '';
    this.invalid = false;
    if (this._rendered) this.$('.msg').textContent = this.hint;
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
    const inputs = [...container.querySelectorAll('df-input, df-select')];
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
    container.querySelectorAll('df-input, df-select, df-switch').forEach((el) => {
      if (!el.name) return;
      data[el.name] = el.localName === 'df-switch' ? el.checked : el.value;
    });
    return data;
  }
}

DfInput.define('df-input');
