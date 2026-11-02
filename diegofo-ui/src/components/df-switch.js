import { DfElement } from '../core/df-element.js';

/**
 * Interruptor on/off (alternativa visual a un checkbox). Se puede usar dentro de un `<form>`.
 *
 * @element df-switch
 *
 * @prop {boolean} checked  - Encendido. Por defecto `false`.
 * @prop {boolean} disabled - Desactivado. Por defecto `false`.
 * @prop {string}  label    - Texto a la derecha del interruptor. Por defecto `''`.
 * @prop {string}  name     - Nombre del campo al enviar un formulario. Por defecto `''`.
 * @prop {string}  value    - Valor enviado cuando está encendido. Por defecto `'on'`.
 * @prop {'sm'|'md'|'lg'} size - Tamaño. Por defecto `md`.
 *
 * @fires df-change - Cuando el usuario lo cambia (clic, Espacio o Enter). detail: `{ checked, name }`
 *
 * @slot - Alternativa a `label` para poner contenido propio.
 * @csspart track - La pista.
 * @csspart thumb - El círculo.
 *
 * @example
 * <df-switch label="Recibir avisos" checked></df-switch>
 */
export class DfSwitch extends DfElement {
  static formAssociated = true;

  static properties = {
    checked: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    label: { type: String, default: '' },
    name: { type: String, default: '' },
    value: { type: String, default: 'on' },
    size: { type: String, default: 'md' },
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
    if (typeof this.attachInternals === 'function') {
      try { this._internals = this.attachInternals(); } catch { this._internals = null; }
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
    this._defaultChecked = this.hasAttribute('checked');
    const track = this.$('.track');
    this.$('.wrap').addEventListener('click', (e) => {
      e.preventDefault();
      this._userToggle();
    });
    track.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this._userToggle();
      }
    });
  }

  update() {
    const track = this.$('.track');
    track.className = `track size-${this.size}`;
    track.setAttribute('aria-checked', String(this.checked));
    track.setAttribute('aria-disabled', String(this.disabled));
    track.tabIndex = this.disabled ? -1 : 0;
    const slot = this.$('slot');
    if (!slot.assignedNodes().length) slot.textContent = this.label;
    if (this.label) track.setAttribute('aria-label', this.label);
    this._internals?.setFormValue?.(this.checked ? this.value : null);
  }

  _userToggle() {
    if (this.disabled) return;
    this.toggle();
    this.emit('df-change', { checked: this.checked, name: this.name });
  }

  /**
   * Cambia el estado. No lanza evento (el evento solo se lanza con interacción del usuario).
   * @param {boolean} [force] Si se indica, fuerza ese estado.
   * @returns {boolean} El nuevo estado.
   */
  toggle(force) {
    this.checked = force === undefined ? !this.checked : Boolean(force);
    return this.checked;
  }

  /** Pone el foco en el interruptor. */
  focus(options) {
    this.$('.track')?.focus(options);
  }

  /** Lo llama el navegador al hacer `form.reset()`. */
  formResetCallback() {
    this.checked = this._defaultChecked;
  }
}

DfSwitch.define('df-switch');
