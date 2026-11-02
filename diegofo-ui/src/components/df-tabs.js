import { DfElement } from '../core/df-element.js';

/**
 * Panel de contenido de un `<df-tabs>`.
 *
 * @element df-tab-panel
 *
 * @prop {string}  label    - Texto de la pestaña. Por defecto `''`.
 * @prop {boolean} disabled - La pestaña no se puede seleccionar. Por defecto `false`.
 *
 * @slot - Contenido del panel.
 */
export class DfTabPanel extends DfElement {
  static properties = {
    label: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  };

  static styles = `
    :host { display: block; }
    :host([hidden]) { display: none !important; }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'tabpanel');
  }

  update(changed) {
    if (this.label) this.setAttribute('aria-label', this.label);
    if (changed === 'label' || changed === 'disabled') this.closest('df-tabs')?.refresh?.();
  }
}
DfTabPanel.define('df-tab-panel');

/**
 * Pestañas. Cada hijo `<df-tab-panel label="...">` se convierte en una pestaña.
 * Navegación con teclado: ← → Inicio Fin (patrón ARIA "tabs" con activación automática).
 *
 * @element df-tabs
 *
 * @prop {number} selected - Índice de la pestaña activa. Por defecto `0`.
 * @prop {'line'|'pill'} variant - Estilo: subrayado o píldoras. Por defecto `line`.
 *
 * @fires df-tab-change - Cuando el usuario cambia de pestaña. detail: `{ index, label }`
 *
 * @slot - Los `<df-tab-panel>`.
 * @csspart tablist - La fila de pestañas.
 * @csspart tab     - Cada pestaña.
 *
 * @example
 * <df-tabs>
 *   <df-tab-panel label="Perfil">…</df-tab-panel>
 *   <df-tab-panel label="Seguridad">…</df-tab-panel>
 * </df-tabs>
 */
export class DfTabs extends DfElement {
  static properties = {
    selected: { type: Number, default: 0 },
    variant: { type: String, default: 'line' },
  };

  static styles = `
    :host { display: block; }
    .list { display: flex; gap: 4px; border-bottom: 1px solid var(--df-border); margin-bottom: 16px; overflow-x: auto; scrollbar-width: thin; }
    .tab {
      all: unset; box-sizing: border-box;
      padding: 10px 16px; margin-bottom: -1px;
      font: 600 .85rem var(--df-font); color: var(--df-text-muted);
      border-bottom: 2px solid transparent;
      cursor: pointer; white-space: nowrap;
      transition: color .15s, border-color .15s, background .15s;
    }
    .tab:hover { color: var(--df-text); }
    .tab[aria-selected="true"] { color: var(--df-primary); border-bottom-color: var(--df-teal); }
    .tab:focus-visible { outline: 2px solid var(--df-blue); outline-offset: -2px; border-radius: 4px; }
    .tab[aria-disabled="true"] { opacity: .45; cursor: not-allowed; }
    .pill { border-bottom: none; gap: 6px; padding: 4px; background: var(--df-surface-alt); border-radius: 10px; width: fit-content; max-width: 100%; }
    .pill .tab { border: none; border-radius: 7px; padding: 7px 14px; margin: 0; }
    .pill .tab[aria-selected="true"] { background: var(--df-surface); color: var(--df-text); box-shadow: 0 1px 3px rgba(0,0,0,.12); }
  `;

  template() {
    return `<div class="list" part="tablist" role="tablist"></div><slot></slot>`;
  }

  firstRender() {
    this.$('slot').addEventListener('slotchange', () => this.refresh());
    this.$('.list').addEventListener('keydown', (e) => this._onKeydown(e));
    this.refresh();
  }

  /** Paneles hijos. */
  get panels() {
    return [...this.children].filter((el) => el.localName === 'df-tab-panel');
  }

  /** Vuelve a generar las pestañas a partir de los paneles (se llama solo al añadir o quitar paneles). */
  refresh() {
    if (!this._rendered) return;
    const list = this.$('.list');
    list.innerHTML = '';
    this.panels.forEach((panel, i) => {
      const tab = document.createElement('button');
      tab.className = 'tab';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('part', 'tab');
      tab.textContent = panel.label || `Pestaña ${i + 1}`;
      tab.dataset.index = String(i);
      tab.addEventListener('click', () => this._userSelect(i));
      list.appendChild(tab);
    });
    this.update(null);
  }

  update() {
    const list = this.$('.list');
    list.className = `list ${this.variant === 'pill' ? 'pill' : ''}`;
    const panels = this.panels;
    const actual = this._validIndex(this.selected);
    [...list.children].forEach((tab, i) => {
      const activo = i === actual;
      const disabled = panels[i]?.disabled ?? false;
      tab.setAttribute('aria-selected', String(activo));
      tab.setAttribute('aria-disabled', String(disabled));
      tab.tabIndex = activo ? 0 : -1;
    });
    panels.forEach((panel, i) => { panel.hidden = i !== actual; });
  }

  /** Corrige el índice si apunta a un panel que no existe o está desactivado. @private */
  _validIndex(index) {
    const panels = this.panels;
    if (panels[index] && !panels[index].disabled) return index;
    const primero = panels.findIndex((p) => !p.disabled);
    return primero === -1 ? 0 : primero;
  }

  _userSelect(index) {
    const panel = this.panels[index];
    if (!panel || panel.disabled || index === this.selected) return;
    this.selected = index;
    this.emit('df-tab-change', { index, label: panel.label });
  }

  _onKeydown(e) {
    const panels = this.panels;
    const habilitados = panels.map((p, i) => (p.disabled ? -1 : i)).filter((i) => i >= 0);
    if (!habilitados.length) return;
    const pos = habilitados.indexOf(this._validIndex(this.selected));
    let destino = null;
    if (e.key === 'ArrowRight') destino = habilitados[(pos + 1) % habilitados.length];
    else if (e.key === 'ArrowLeft') destino = habilitados[(pos - 1 + habilitados.length) % habilitados.length];
    else if (e.key === 'Home') destino = habilitados[0];
    else if (e.key === 'End') destino = habilitados[habilitados.length - 1];
    if (destino === null) return;
    e.preventDefault();
    this._userSelect(destino);
    this.$('.list').children[destino]?.focus();
  }

  /**
   * Selecciona una pestaña por código (no lanza evento).
   * @param {number} index
   */
  select(index) {
    this.selected = index;
  }
}
DfTabs.define('df-tabs');
