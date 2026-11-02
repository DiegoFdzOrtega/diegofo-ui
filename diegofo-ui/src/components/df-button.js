import { DfElement } from '../core/df-element.js';

/**
 * Botón de diegofo-ui con la forma de "pestaña recortada" de la marca.
 *
 * @element df-button
 *
 * @prop {'primary'|'secondary'|'success'|'danger'|'warning'|'ghost'} variant - Estilo de color. Por defecto `primary`.
 * @prop {'sm'|'md'|'lg'} size      - Tamaño. Por defecto `md`.
 * @prop {'tab'|'rounded'|'pill'} shape - Forma: `tab` (recortada, por defecto), `rounded` o `pill`.
 * @prop {'button'|'submit'|'reset'} type - Comportamiento dentro de un `<form>`. Por defecto `button`.
 * @prop {boolean} disabled - Desactiva el botón. Por defecto `false`.
 * @prop {boolean} loading  - Muestra un spinner y bloquea los clics. Por defecto `false`.
 * @prop {boolean} block    - Ocupa todo el ancho disponible. Por defecto `false`.
 *
 * @fires df-click - Al pulsar el botón (no se lanza si está `disabled` o `loading`). detail: `{ variant }`
 *
 * @slot - Contenido del botón (texto, iconos...).
 * @csspart button - El `<button>` interno.
 *
 * @example
 * <df-button variant="danger" size="sm">Eliminar</df-button>
 */
export class DfButton extends DfElement {
  static properties = {
    variant: { type: String, default: 'primary' },
    size: { type: String, default: 'md' },
    shape: { type: String, default: 'tab' },
    type: { type: String, default: 'button' },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    block: { type: Boolean, default: false },
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
    this._button = this.$('button');
    // Fase de captura en el host: si está bloqueado, el clic no llega a nadie.
    this.addEventListener('click', (event) => {
      if (this.disabled || this.loading) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      this.emit('df-click', { variant: this.variant });
      const form = this.closest('form');
      if (form && this.type === 'submit') {
        if (typeof form.requestSubmit === 'function') form.requestSubmit();
        else form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      } else if (form && this.type === 'reset') {
        form.reset();
      }
    }, { capture: true });
  }

  update() {
    const btn = this._button;
    btn.className = `variant-${this.variant} size-${this.size} shape-${this.shape}${this.loading ? ' loading' : ''}`;
    btn.disabled = this.disabled || this.loading;
    btn.setAttribute('aria-busy', String(this.loading));
    this.$('.spinner').hidden = !this.loading;
  }

  /** Pone el foco en el botón interno. */
  focus(options) {
    this._button?.focus(options);
  }
}

DfButton.define('df-button');
