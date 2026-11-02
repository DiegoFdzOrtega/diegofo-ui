import { DfElement } from '../core/df-element.js';

/**
 * Barra de progreso, con modo indeterminado para cargas de duración desconocida.
 *
 * @element df-progress
 *
 * @prop {number}  value         - Valor actual. Por defecto `0`.
 * @prop {number}  max           - Valor máximo. Por defecto `100`.
 * @prop {string}  label         - Texto encima de la barra (también se usa como nombre accesible). Por defecto `''`.
 * @prop {'default'|'success'|'warning'|'danger'} variant - Color. Por defecto `default`.
 * @prop {boolean} indeterminate - Animación continua sin valor concreto. Por defecto `false`.
 * @prop {boolean} showValue     - (atributo `show-value`) Muestra el porcentaje a la derecha. Por defecto `false`.
 * @prop {'sm'|'md'|'lg'} size   - Grosor. Por defecto `md`.
 *
 * @fires df-complete - Una vez, cuando `value` llega a `max`. detail: `{ value, max }`
 *
 * @csspart track - El fondo.
 * @csspart bar   - La parte rellena.
 *
 * @example
 * <df-progress label="Subiendo archivo" value="40" show-value></df-progress>
 */
export class DfProgress extends DfElement {
  static properties = {
    value: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    label: { type: String, default: '' },
    variant: { type: String, default: 'default' },
    indeterminate: { type: Boolean, default: false },
    showValue: { type: Boolean, default: false },
    size: { type: String, default: 'md' },
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
    return Math.min(100, Math.max(0, (this.value / this.max) * 100));
  }

  update(changed) {
    const track = this.$('.track');
    track.className = `track size-${this.size} ${this.variant}`;
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', String(this.max));
    if (this.label) track.setAttribute('aria-label', this.label);
    else track.removeAttribute('aria-label');
    if (this.indeterminate) {
      track.removeAttribute('aria-valuenow');
      track.setAttribute('aria-busy', 'true');
    } else {
      track.setAttribute('aria-valuenow', String(this.value));
      track.removeAttribute('aria-busy');
    }
    const pct = Math.round(this.percent);
    this.$('.bar').style.width = `${this.percent}%`;
    this.$('.label').textContent = this.label;
    this.$('.pct').textContent = this.showValue && !this.indeterminate ? `${pct} %` : '';
    this.$('.head').hidden = !this.label && !(this.showValue && !this.indeterminate);

    const complete = !this.indeterminate && this.max > 0 && this.value >= this.max;
    if (complete && !this._completed && changed !== null) this.emit('df-complete', { value: this.value, max: this.max });
    this._completed = complete;
  }
}

DfProgress.define('df-progress');
