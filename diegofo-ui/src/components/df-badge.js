import { DfElement } from '../core/df-element.js';

/** Colores de la paleta de diegofo-ui que se pueden usar por nombre. */
export const BADGE_COLORS = ['teal', 'blue', 'green', 'orange', 'red', 'yellow', 'purple', 'magenta', 'gray'];

/**
 * Etiqueta / píldora de color para estados, categorías o asignaturas.
 *
 * @element df-badge
 *
 * @prop {string} color - Un color de la paleta (`teal`, `blue`, `green`, `orange`, `red`, `yellow`, `purple`,
 *                        `magenta`, `gray`) o cualquier color CSS (`#2563eb`, `rgb(...)`). Por defecto `teal`.
 * @prop {'solid'|'soft'|'outline'} variant - Relleno sólido, suave o solo borde. Por defecto `solid`.
 * @prop {'sm'|'md'} size - Tamaño. Por defecto `md`.
 * @prop {boolean} dot    - Muestra un punto antes del texto. Por defecto `false`.
 *
 * @slot - Texto de la etiqueta.
 * @csspart badge - El contenedor.
 *
 * @example
 * <df-badge color="green" variant="soft" dot>Activo</df-badge>
 */
export class DfBadge extends DfElement {
  static properties = {
    color: { type: String, default: 'teal' },
    variant: { type: String, default: 'solid' },
    size: { type: String, default: 'md' },
    dot: { type: Boolean, default: false },
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
    const badge = this.$('.badge');
    badge.className = `badge variant-${this.variant} size-${this.size}`;
    badge.style.setProperty('--_c', this.cssColor);
    this.$('.dot').hidden = !this.dot;
  }

  /** Color CSS real que se está usando. */
  get cssColor() {
    const c = this.color;
    if (c === 'gray') return 'var(--df-text-muted)';
    return BADGE_COLORS.includes(c) ? `var(--df-${c})` : c;
  }
}

DfBadge.define('df-badge');
