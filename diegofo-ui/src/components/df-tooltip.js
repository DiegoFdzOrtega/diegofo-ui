import { DfElement } from '../core/df-element.js';

let contador = 0;

/**
 * Tooltip: texto de ayuda que aparece al pasar el ratón o al enfocar con teclado el elemento que envuelve.
 *
 * @element df-tooltip
 *
 * @prop {string} text      - Texto del tooltip. Por defecto `''`.
 * @prop {'top'|'bottom'|'left'|'right'} placement - Posición. Por defecto `top`.
 * @prop {number} delay     - Milisegundos antes de aparecer. Por defecto `150`.
 * @prop {boolean} disabled - No se muestra. Por defecto `false`.
 *
 * @fires df-show - Al aparecer.
 * @fires df-hide - Al ocultarse.
 *
 * @slot - El elemento que dispara el tooltip (botón, icono, enlace…).
 * @csspart tip - La burbuja.
 *
 * @example
 * <df-tooltip text="Exportar a CSV"><df-button size="sm">CSV</df-button></df-tooltip>
 */
export class DfTooltip extends DfElement {
  static properties = {
    text: { type: String, default: '' },
    placement: { type: String, default: 'top' },
    delay: { type: Number, default: 150 },
    disabled: { type: Boolean, default: false },
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
    // Descripción accesible: un <span> oculto en el light DOM, referenciado con aria-describedby
    // desde el elemento disparador (aria-describedby no puede apuntar dentro de un Shadow DOM).
    this._descId = `df-tooltip-${++contador}`;
    this._desc = document.createElement('span');
    this._desc.id = this._descId;
    this._desc.hidden = true;
    this._desc.setAttribute('data-df-tooltip-desc', '');
    this.appendChild(this._desc);

    const abrir = () => this._schedule();
    const cerrar = () => this.hide();
    this.addEventListener('mouseenter', abrir);
    this.addEventListener('mouseleave', cerrar);
    this.addEventListener('focusin', abrir);
    this.addEventListener('focusout', cerrar);
    this._onKey = (e) => { if (e.key === 'Escape' && this.visible) this.hide(); };
    this.$('slot').addEventListener('slotchange', () => this._link());
  }

  update() {
    const tip = this.$('.tip');
    tip.className = `tip ${this.placement}`;
    tip.textContent = this.text;
    this._desc.textContent = this.text;
    this._link();
    if (this.disabled && this.visible) this.hide();
  }

  /** Enlaza el elemento disparador con la descripción. @private */
  _link() {
    const trigger = this.trigger;
    if (trigger && !trigger.hasAttribute('aria-describedby')) trigger.setAttribute('aria-describedby', this._descId);
  }

  /** Primer elemento envuelto (el disparador). */
  get trigger() {
    return [...this.children].find((el) => !el.hasAttribute('data-df-tooltip-desc')) ?? null;
  }

  /** Si se está mostrando. */
  get visible() {
    return this.hasAttribute('data-visible');
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
    this.setAttribute('data-visible', '');
    document.addEventListener('keydown', this._onKey);
    this.emit('df-show');
  }

  /** Oculta el tooltip. */
  hide() {
    clearTimeout(this._timer);
    if (!this.visible) return;
    this.removeAttribute('data-visible');
    document.removeEventListener('keydown', this._onKey);
    this.emit('df-hide');
  }

  disconnectedCallback() {
    clearTimeout(this._timer);
    document.removeEventListener('keydown', this._onKey);
  }
}

DfTooltip.define('df-tooltip');
