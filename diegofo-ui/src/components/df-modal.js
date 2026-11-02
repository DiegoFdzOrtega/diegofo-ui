import { DfElement } from '../core/df-element.js';
import './df-button.js';
import { DfInput } from './df-input.js';
import './df-select.js';
import './df-switch.js';

/**
 * Ventana modal (diálogo) con cabecera, contenido y botones de Aceptar / Cancelar.
 * Incluye dos atajos estáticos que devuelven promesas: `DfModal.confirm()` y `DfModal.prompt()`,
 * pensados para sustituir a `confirm()` y `prompt()` del navegador.
 *
 * @element df-modal
 *
 * @prop {boolean} open        - Si está visible. Por defecto `false`.
 * @prop {string}  heading     - Título. Por defecto `'Diálogo'`.
 * @prop {string}  confirmText - (atributo `confirm-text`) Texto del botón principal. Por defecto `'Aceptar'`.
 * @prop {string}  cancelText  - (atributo `cancel-text`) Texto del botón secundario. Por defecto `'Cancelar'`.
 * @prop {'primary'|'danger'|'success'} variant - Color del botón principal. Por defecto `primary`.
 * @prop {boolean} hideCancel  - (atributo `hide-cancel`) Oculta el botón Cancelar. Por defecto `false`.
 * @prop {boolean} persistent  - Si es `true`, no se cierra con Escape ni al pulsar fuera. Por defecto `false`.
 * @prop {string}  width       - Ancho máximo de la caja (CSS). Por defecto `'460px'`.
 *
 * @fires df-open    - Al abrirse.
 * @fires df-confirm - Al pulsar Aceptar. Es cancelable: si se llama a `event.preventDefault()` el modal NO se cierra
 *                     (útil para validar antes de cerrar).
 * @fires df-cancel  - Al pulsar Cancelar, la X, Escape o el fondo.
 * @fires df-close   - Al cerrarse. detail: `{ reason: 'confirm' | 'cancel' | 'method' }`
 *
 * @slot          - Contenido del cuerpo.
 * @slot footer   - Sustituye a los botones por defecto.
 * @csspart box   - La caja del diálogo.
 * @csspart overlay - El fondo oscuro.
 */
export class DfModal extends DfElement {
  static properties = {
    open: { type: Boolean, default: false },
    heading: { type: String, default: 'Diálogo' },
    confirmText: { type: String, default: 'Aceptar' },
    cancelText: { type: String, default: 'Cancelar' },
    variant: { type: String, default: 'primary' },
    hideCancel: { type: Boolean, default: false },
    persistent: { type: Boolean, default: false },
    width: { type: String, default: '460px' },
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
      if (e.key === 'Escape' && !this.persistent) {
        e.stopPropagation();
        this.cancel();
      } else if (e.key === 'Tab') {
        this._trapFocus(e);
      }
    };
    this.$('.close').addEventListener('click', () => this.cancel());
    this.$('.cancel').addEventListener('click', () => this.cancel());
    this.$('.confirm').addEventListener('click', () => this.confirm());
    this.$('.overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget && !this.persistent) this.cancel();
    });
  }

  update(changed) {
    this.$('#titulo').textContent = this.heading;
    this.$('.confirm').textContent = this.confirmText;
    this.$('.confirm').variant = this.variant;
    this.$('.cancel').textContent = this.cancelText;
    this.$('.cancel').hidden = this.hideCancel;
    this.$('.box').style.maxWidth = this.width;

    if (changed === 'open' || changed === null) {
      if (this.open) {
        document.addEventListener('keydown', this._onKeydown);
        DfModal._stack.push(this);
        // Recordamos qué tenía el foco para devolvérselo al cerrar.
        this._previousFocus = DfModal._deepActiveElement();
        // Bloqueamos el scroll de la página de fondo.
        if (DfModal._stack.length === 1) {
          DfModal._bodyOverflow = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
        }
        if (changed === 'open') {
          this.emit('df-open');
          // Foco en el primer campo del contenido, o en el botón principal.
          queueMicrotask(() => {
            const first = this.querySelector(DfModal.FOCUSABLE);
            (first || this.$('.confirm')).focus?.();
          });
        }
      } else if (changed === 'open') {
        this._release();
      }
    }
  }

  disconnectedCallback() {
    if (this.open) this._release();
  }

  /** Quita listeners, desbloquea el scroll y devuelve el foco. @private */
  _release() {
    document.removeEventListener('keydown', this._onKeydown);
    DfModal._stack = DfModal._stack.filter((m) => m !== this);
    if (DfModal._stack.length === 0) document.body.style.overflow = DfModal._bodyOverflow ?? '';
    const prev = this._previousFocus;
    this._previousFocus = null;
    if (prev && prev.isConnected && typeof prev.focus === 'function') prev.focus();
  }

  /** Solo el modal de arriba del todo reacciona al teclado (si hay varios abiertos). @private */
  _isTopmost() {
    return DfModal._stack[DfModal._stack.length - 1] === this;
  }

  /** Elementos enfocables del modal, en orden visual. @private */
  _focusables() {
    const light = [...this.querySelectorAll(DfModal.FOCUSABLE)].filter((el) => !el.disabled && !el.hidden);
    const footerSlot = this.$('slot[name="footer"]');
    const usaFooterPropio = footerSlot.assignedElements().length > 0;
    const botones = usaFooterPropio ? [] : [this.$('.cancel'), this.$('.confirm')].filter((b) => !b.hidden);
    return [this.$('.close'), ...light, ...botones];
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
  close(reason = 'method') {
    if (!this.open) return;
    this.open = false;
    this.emit('df-close', { reason });
  }

  /** Alterna abierto / cerrado. */
  toggle() {
    if (this.open) this.close();
    else this.show();
  }

  /** Acción del botón Aceptar: lanza `df-confirm` y cierra si nadie lo impide. */
  confirm() {
    const ok = this.emit('df-confirm', {}, { cancelable: true });
    if (ok) this.close('confirm');
  }

  /** Acción de Cancelar / X / Escape / fondo. */
  cancel() {
    this.emit('df-cancel');
    this.close('cancel');
  }

  /**
   * Crea un modal temporal, lo añade al `<body>` y lo elimina al cerrarse.
   * @private
   */
  static _temporal(options) {
    const modal = document.createElement('df-modal');
    modal.heading = options.heading ?? 'Confirmar';
    if (options.confirmText) modal.confirmText = options.confirmText;
    if (options.cancelText) modal.cancelText = options.cancelText;
    if (options.variant) modal.variant = options.variant;
    document.body.appendChild(modal);
    modal.addEventListener('df-close', () => modal.remove(), { once: true });
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
    const modal = DfModal._temporal(options);
    const p = document.createElement('p');
    p.style.margin = '0';
    p.textContent = options.message ?? '¿Seguro?';
    modal.appendChild(p);
    return new Promise((resolve) => {
      modal.addEventListener('df-close', (e) => resolve(e.detail.reason === 'confirm'), { once: true });
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
    const modal = DfModal._temporal({ confirmText: 'Guardar', ...options });
    const form = document.createElement('form');
    form.style.cssText = 'display:flex;flex-direction:column;gap:12px;margin:0';
    if (options.message) {
      const p = document.createElement('p');
      p.style.margin = '0';
      p.textContent = options.message;
      form.appendChild(p);
    }
    for (const field of options.fields ?? []) {
      if (field.type === 'select') {
        const select = document.createElement('df-select');
        select.name = field.name;
        select.label = field.label ?? field.name;
        select.options = field.options ?? [];
        if (field.required) select.required = true;
        if (field.value !== undefined) select.value = field.value;
        form.appendChild(select);
        continue;
      }
      if (field.type === 'switch') {
        const sw = document.createElement('df-switch');
        sw.name = field.name;
        sw.label = field.label ?? field.name;
        if (field.value) sw.checked = true;
        form.appendChild(sw);
        continue;
      }
      const input = document.createElement('df-input');
      input.name = field.name;
      input.label = field.label ?? field.name;
      if (field.type) input.type = field.type;
      if (field.required) input.required = true;
      if (field.placeholder) input.placeholder = field.placeholder;
      if (field.pattern) input.pattern = field.pattern;
      if (field.value !== undefined) input.value = field.value;
      form.appendChild(input);
    }
    modal.appendChild(form);

    return new Promise((resolve) => {
      // Enter en un campo = Aceptar.
      form.addEventListener('df-enter', () => modal.confirm());
      form.addEventListener('submit', (e) => { e.preventDefault(); modal.confirm(); });
      modal.addEventListener('df-confirm', (e) => {
        if (!DfInput.validateAll(form)) e.preventDefault();
      });
      modal.addEventListener('df-close', (e) => {
        resolve(e.detail.reason === 'confirm' ? DfInput.collect(form) : null);
      }, { once: true });
      modal.show();
    });
  }
}

DfModal.define('df-modal');

