import { DfElement } from '../core/df-element.js';

const PALETA = ['#0d9488', '#0284c7', '#7c3aed', '#c026d3', '#ea580c', '#16a34a', '#e11d48', '#ca8a04', '#1a4d59'];
const TAMANOS = { sm: 28, md: 40, lg: 56, xl: 80 };
const ESTADOS = { online: 'En línea', away: 'Ausente', busy: 'Ocupado', offline: 'Desconectado' };

/**
 * Iniciales de un nombre: "Diego Fernández Ortega" → "DF". Función pura.
 * @param {string} name
 * @returns {string}
 */
export function initials(name) {
  const partes = String(name ?? '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

/**
 * Color estable para un nombre (el mismo nombre siempre da el mismo color). Función pura.
 * @param {string} name
 * @returns {string}
 */
export function colorFor(name) {
  let hash = 0;
  for (const ch of String(name ?? '')) hash = (hash * 31 + ch.codePointAt(0)) >>> 0;
  return PALETA[hash % PALETA.length];
}

/**
 * Avatar de usuario: foto o, si no hay (o falla), iniciales sobre un color calculado a partir del nombre.
 *
 * @element df-avatar
 *
 * @prop {string} name   - Nombre de la persona (para iniciales, color y texto alternativo). Por defecto `''`.
 * @prop {string} src    - URL de la imagen. Por defecto `''`.
 * @prop {'sm'|'md'|'lg'|'xl'} size - Tamaño (28, 40, 56 u 80 px). Por defecto `md`.
 * @prop {'circle'|'square'} shape  - Forma. Por defecto `circle`.
 * @prop {''|'online'|'away'|'busy'|'offline'} status - Punto de estado. Por defecto `''` (sin punto).
 *
 * @fires df-error - Si la imagen no se puede cargar (se muestran las iniciales). detail: `{ src }`
 *
 * @csspart avatar - El círculo / cuadrado.
 *
 * @example
 * <df-avatar name="Diego Fernández" status="online"></df-avatar>
 */
export class DfAvatar extends DfElement {
  static properties = {
    name: { type: String, default: '' },
    src: { type: String, default: '' },
    size: { type: String, default: 'md' },
    shape: { type: String, default: 'circle' },
    status: { type: String, default: '' },
  };

  static styles = `
    :host { display: inline-block; vertical-align: middle; }
    .avatar {
      --_s: 40px;
      position: relative;
      width: var(--_s); height: var(--_s);
      border-radius: 50%;
      display: grid; place-items: center;
      background: var(--_bg); color: #fff;
      font-weight: 700; font-size: calc(var(--_s) * .38); letter-spacing: .02em;
      user-select: none;
    }
    .square { border-radius: 22%; }
    img { width: 100%; height: 100%; object-fit: cover; border-radius: inherit; }
    .dot {
      position: absolute; right: 0; bottom: 0;
      width: calc(var(--_s) * .28); height: calc(var(--_s) * .28); min-width: 8px; min-height: 8px;
      border-radius: 50%; border: 2px solid var(--df-surface);
    }
    .online { background: var(--df-green); }
    .away { background: var(--df-yellow); }
    .busy { background: var(--df-red); }
    .offline { background: var(--df-text-muted); }
  `;

  template() {
    return `<span class="avatar" part="avatar" role="img"><img alt="" hidden><span class="ini" aria-hidden="true"></span><span class="dot" hidden></span></span>`;
  }

  firstRender() {
    const img = this.$('img');
    img.addEventListener('error', () => {
      this._failed = img.getAttribute('src');
      this._paint();
      this.emit('df-error', { src: this._failed });
    });
  }

  update(changed) {
    if (changed === 'src') this._failed = null;
    this._paint();
  }

  _paint() {
    const box = this.$('.avatar');
    const img = this.$('img');
    const px = TAMANOS[this.size] ?? TAMANOS.md;
    box.className = `avatar ${this.shape === 'square' ? 'square' : ''}`;
    box.style.setProperty('--_s', `${px}px`);
    box.style.setProperty('--_bg', colorFor(this.name));
    const usaImagen = Boolean(this.src) && this._failed !== this.src;
    img.hidden = !usaImagen;
    if (usaImagen && img.getAttribute('src') !== this.src) img.setAttribute('src', this.src);
    this.$('.ini').textContent = usaImagen ? '' : initials(this.name);
    const estado = ESTADOS[this.status];
    const dot = this.$('.dot');
    dot.hidden = !estado;
    dot.className = `dot ${this.status}`;
    box.setAttribute('aria-label', [this.name || 'Usuario', estado].filter(Boolean).join(' · '));
  }

  /** Iniciales que se muestran. */
  get initials() {
    return initials(this.name);
  }
}

DfAvatar.define('df-avatar');
