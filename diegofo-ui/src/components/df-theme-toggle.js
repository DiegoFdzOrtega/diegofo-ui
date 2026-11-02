import { DfElement } from '../core/df-element.js';

const SOL = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
const LUNA = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;

/**
 * Interruptor de tema claro / oscuro.
 * Pone `data-theme="dark"` en el elemento objetivo (o lo quita en modo claro),
 * que es como funcionan las variables CSS de diegofo-ui.
 *
 * @element df-theme-toggle
 *
 * @prop {'light'|'dark'} theme - Tema actual. Por defecto `light`.
 * @prop {string} target        - Selector CSS del elemento al que se aplica el tema. Por defecto `'body'`.
 * @prop {string} storageKey    - (atributo `storage-key`) Si se indica, el tema se guarda en localStorage con esa clave.
 *                                Por defecto `''` (no guarda).
 *
 * @fires df-theme-change - Cuando el USUARIO cambia el tema (clic o `toggle()`). detail: `{ theme }`.
 *                          Asignar la propiedad `theme` por código no lanza el evento.
 *
 * @csspart button - El botón.
 */
export class DfThemeToggle extends DfElement {
  static properties = {
    theme: { type: String, default: 'light' },
    target: { type: String, default: 'body' },
    storageKey: { type: String, default: '' },
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
    // Antes del primer pintado, si hay un tema guardado lo recuperamos.
    if (!this._rendered && this.storageKey) {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved === 'light' || saved === 'dark') this.theme = saved;
      } catch { /* localStorage no disponible */ }
    }
    super.connectedCallback();
  }

  firstRender() {
    this.$('button').addEventListener('click', () => this.toggle());
  }

  update() {
    const dark = this.theme === 'dark';
    const btn = this.$('button');
    btn.innerHTML = dark ? SOL : LUNA;
    btn.setAttribute('aria-label', dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    btn.title = btn.getAttribute('aria-label');
    this.applyTheme();
  }

  /** Aplica el tema actual al elemento objetivo y lo guarda si hay `storageKey`. */
  applyTheme() {
    const el = document.querySelector(this.target);
    if (el) {
      if (this.theme === 'dark') el.setAttribute('data-theme', 'dark');
      else el.removeAttribute('data-theme');
    }
    if (this.storageKey) {
      try { localStorage.setItem(this.storageKey, this.theme); } catch { /* sin almacenamiento */ }
    }
  }

  /**
   * Cambia al tema contrario y lanza `df-theme-change`.
   * @returns {'light'|'dark'} El nuevo tema.
   */
  toggle() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.emit('df-theme-change', { theme: this.theme });
    return this.theme;
  }
}

DfThemeToggle.define('df-theme-toggle');
