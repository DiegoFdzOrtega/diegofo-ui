import { DfElement } from '../core/df-element.js';

const ICONOS = { success: '✓', info: 'i', warning: '!', danger: '✕' };
const TIPOS = Object.keys(ICONOS);

/**
 * Contenedor de notificaciones flotantes ("toasts").
 * Se coloca una vez en la página y se llama a `show()` desde el código.
 *
 * @element df-toast-stack
 *
 * @prop {'top-right'|'top-left'|'bottom-right'|'bottom-left'|'top-center'|'bottom-center'} position
 *       - Esquina de la pantalla. Por defecto `bottom-right`.
 * @prop {number} duration - Milisegundos que dura cada toast. `0` = no se cierra solo. Por defecto `3000`.
 * @prop {number} max      - Máximo de toasts a la vez; si se supera se quita el más antiguo. Por defecto `5`.
 *
 * @fires df-toast-show - Al mostrar un toast. detail: `{ message, type }`
 * @fires df-toast-hide - Al quitar un toast. detail: `{ message, type, reason: 'timeout'|'click'|'overflow'|'clear' }`
 *
 * @csspart toast - Cada notificación.
 *
 * @example
 * <df-toast-stack id="toasts" position="top-right"></df-toast-stack>
 * document.getElementById('toasts').show('Guardado', 'success');
 */
export class DfToastStack extends DfElement {
  static properties = {
    position: { type: String, default: 'bottom-right' },
    duration: { type: Number, default: 3000 },
    max: { type: Number, default: 5 },
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
    const [v, h] = this.position.split('-');
    const s = this.style;
    s.top = v === 'top' ? '20px' : '';
    s.bottom = v === 'bottom' ? '20px' : '';
    s.left = h === 'left' ? '20px' : h === 'center' ? '50%' : '';
    s.right = h === 'right' ? '20px' : '';
    s.transform = h === 'center' ? 'translateX(-50%)' : '';
    // Arriba: el más nuevo arriba. Abajo: el más nuevo abajo.
    this.$('.stack').style.flexDirection = v === 'top' ? 'column-reverse' : 'column';
  }

  /** Número de toasts visibles ahora mismo. */
  get count() {
    return this.shadowRoot.querySelectorAll('.toast:not(.saliendo)').length;
  }

  /**
   * Muestra una notificación.
   * @param {string} message                       Texto (se inserta como texto, nunca como HTML).
   * @param {'success'|'info'|'warning'|'danger'} [type='info']
   * @param {number} [duration=this.duration]      Milisegundos; `0` para que no se cierre sola.
   * @returns {HTMLElement} El elemento del toast (por si se quiere cerrar a mano con `dismiss`).
   */
  show(message, type = 'info', duration = this.duration) {
    if (!this._rendered) this.connectedCallback();
    const tipo = TIPOS.includes(type) ? type : 'info';
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.setAttribute('part', 'toast');
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = ICONOS[tipo];
    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = message;
    toast.append(icon, text);
    toast._info = { message, type: tipo };
    toast.addEventListener('click', () => this.dismiss(toast, 'click'));

    this.$('.stack').appendChild(toast);
    this.emit('df-toast-show', { message, type: tipo });

    // Si hay demasiados, quitamos el más antiguo.
    const visibles = [...this.shadowRoot.querySelectorAll('.toast:not(.saliendo)')];
    if (this.max > 0 && visibles.length > this.max) this.dismiss(visibles[0], 'overflow');

    if (duration > 0) toast._timer = setTimeout(() => this.dismiss(toast, 'timeout'), duration);
    return toast;
  }

  /**
   * Quita un toast con animación.
   * @param {HTMLElement} toast
   * @param {'timeout'|'click'|'overflow'|'clear'} [reason='click']
   */
  dismiss(toast, reason = 'click') {
    if (!toast || toast.classList.contains('saliendo')) return;
    clearTimeout(toast._timer);
    toast.classList.add('saliendo');
    this.emit('df-toast-hide', { ...toast._info, reason });
    setTimeout(() => toast.remove(), 250);
  }

  /** Quita todos los toasts. */
  clear() {
    this.shadowRoot.querySelectorAll('.toast').forEach((t) => this.dismiss(t, 'clear'));
  }

  /**
   * Atajo global: usa el primer `<df-toast-stack>` de la página (o crea uno) y muestra el mensaje.
   * @param {string} message
   * @param {'success'|'info'|'warning'|'danger'} [type='info']
   * @returns {HTMLElement}
   */
  static notify(message, type = 'info') {
    let stack = document.querySelector('df-toast-stack');
    if (!stack) {
      stack = document.createElement('df-toast-stack');
      document.body.appendChild(stack);
    }
    return stack.show(message, type);
  }
}

DfToastStack.define('df-toast-stack');
