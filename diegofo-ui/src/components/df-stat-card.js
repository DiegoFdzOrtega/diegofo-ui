import { DfElement } from '../core/df-element.js';

/**
 * Da formato a un valor según el tipo de formato. Función pura (se prueba sin DOM).
 * @param {string|number} value
 * @param {'text'|'number'|'currency'|'percent'} format
 * @param {string} [currency='EUR']
 * @returns {string}
 */
export function formatValue(value, format = 'text', currency = 'EUR') {
  if (format === 'text') return String(value);
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  if (format === 'currency') {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency, minimumFractionDigits: 2, useGrouping: 'always' }).format(n);
  }
  if (format === 'percent') {
    return new Intl.NumberFormat('es-ES', { style: 'percent', maximumFractionDigits: 1 }).format(n / 100);
  }
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2, useGrouping: 'always' }).format(n);
}

/**
 * Tarjeta de métrica (KPI): etiqueta, valor grande formateado y texto de ayuda.
 *
 * @element df-stat-card
 *
 * @prop {string} label    - Título de la métrica. Por defecto `''`.
 * @prop {string} value    - Valor (texto o número). Por defecto `'0'`.
 * @prop {'text'|'number'|'currency'|'percent'} format - Cómo se muestra el valor. Por defecto `text`.
 * @prop {string} currency - Moneda si `format="currency"`. Por defecto `'EUR'`.
 * @prop {string} unit     - Unidad que se añade detrás (p. ej. `u.`). Por defecto `''`.
 * @prop {string} hint     - Texto pequeño bajo el valor. Por defecto `''`.
 * @prop {'default'|'success'|'warning'|'danger'|'info'} variant - Color del valor y del borde. Por defecto `default`.
 * @prop {boolean} interactive - La tarjeta se puede pulsar / enfocar con teclado. Por defecto `false`.
 *
 * @fires df-select - Al pulsar una tarjeta `interactive` (clic, Enter o Espacio). detail: `{ label, value }`
 *
 * @slot icon - Icono opcional a la derecha.
 * @csspart card - Contenedor de la tarjeta.
 * @csspart value - El valor.
 */
export class DfStatCard extends DfElement {
  static properties = {
    label: { type: String, default: '' },
    value: { type: String, default: '0' },
    format: { type: String, default: 'text' },
    currency: { type: String, default: 'EUR' },
    unit: { type: String, default: '' },
    hint: { type: String, default: '' },
    variant: { type: String, default: 'default' },
    interactive: { type: Boolean, default: false },
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
    const card = this.$('.card');
    const select = () => {
      if (this.interactive) this.emit('df-select', { label: this.label, value: this.value });
    };
    card.addEventListener('click', select);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select();
      }
    });
  }

  update() {
    const card = this.$('.card');
    card.className = `card ${this.variant}`;
    if (this.interactive) {
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
    } else {
      card.removeAttribute('tabindex');
      card.removeAttribute('role');
    }
    this.$('.label').textContent = this.label;
    this.$('.num').textContent = this.formattedValue;
    this.$('.unit').textContent = this.unit;
    this.$('.hint').textContent = this.hint;
    this.$('.hint').hidden = !this.hint;
  }

  /** El valor tal y como se ve en pantalla. */
  get formattedValue() {
    return formatValue(this.value, this.format, this.currency);
  }
}

DfStatCard.define('df-stat-card');
