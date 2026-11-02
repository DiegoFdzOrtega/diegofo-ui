import { DfElement } from '../core/df-element.js';

/**
 * Desplegable de selección con el estilo de diegofo-ui, accesible por teclado
 * (patrón ARIA "combobox" de solo selección) y compatible con formularios.
 *
 * Las opciones se pueden dar como `<option>` hijas o con la propiedad JS `options`.
 *
 * @element df-select
 *
 * @prop {string}  value       - Valor seleccionado. Por defecto `''`.
 * @prop {string}  label       - Etiqueta encima del campo. Por defecto `''`.
 * @prop {string}  placeholder - Texto cuando no hay nada seleccionado. Por defecto `'Selecciona una opción'`.
 * @prop {string}  name        - Nombre del campo en un formulario. Por defecto `''`.
 * @prop {string}  hint        - Texto de ayuda. Por defecto `''`.
 * @prop {boolean} required    - Obligatorio. Por defecto `false`.
 * @prop {boolean} disabled    - Desactivado. Por defecto `false`.
 * @prop {boolean} invalid     - Lo pone `validate()`. Por defecto `false`.
 * @prop {boolean} open        - Si la lista está desplegada. Por defecto `false`.
 *
 * @fires df-change - Cuando el usuario elige una opción. detail: `{ value, label, name }`
 *
 * @csspart trigger - El botón que abre la lista.
 * @csspart listbox - La lista de opciones.
 * @csspart option  - Cada opción.
 *
 * @example
 * <df-select label="Tipo" name="tipo" required>
 *   <option value="cliente">Cliente</option>
 *   <option value="proveedor">Proveedor</option>
 * </df-select>
 */
export class DfSelect extends DfElement {
  static formAssociated = true;

  static properties = {
    value: { type: String, default: '' },
    label: { type: String, default: '' },
    placeholder: { type: String, default: 'Selecciona una opción' },
    name: { type: String, default: '' },
    hint: { type: String, default: '' },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    invalid: { type: Boolean, default: false },
    open: { type: Boolean, default: false },
  };

  static styles = `
    :host { display: block; position: relative; }
    .wrap { display: flex; flex-direction: column; gap: 6px; }
    .lbl { font-size: .82rem; font-weight: 600; color: var(--df-text); }
    .req { color: var(--df-red); }
    .trigger {
      all: unset; box-sizing: border-box;
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      width: 100%; min-height: 40px; padding: 9px 12px 9px 14px;
      border: 1px solid var(--df-border); border-radius: var(--df-radius);
      background: var(--df-surface-alt); color: var(--df-text);
      font: .88rem var(--df-font); cursor: pointer;
      transition: border-color .15s, box-shadow .15s;
    }
    .trigger:focus-visible, :host([open]) .trigger { border-color: var(--df-blue); box-shadow: 0 0 0 3px color-mix(in srgb, var(--df-blue) 18%, transparent); }
    .trigger[aria-disabled="true"] { opacity: .6; cursor: not-allowed; }
    :host([invalid]) .trigger { border-color: var(--df-red); }
    .placeholder { color: var(--df-text-muted); }
    .chev { flex: none; transition: transform .15s; color: var(--df-text-muted); }
    :host([open]) .chev { transform: rotate(180deg); }
    .list {
      position: absolute; left: 0; right: 0; z-index: 1300;
      margin: 4px 0 0; padding: 4px; list-style: none;
      max-height: 240px; overflow: auto;
      background: var(--df-surface); color: var(--df-text);
      border: 1px solid var(--df-border); border-radius: 8px;
      box-shadow: 0 12px 28px -8px rgba(0,0,0,.25);
    }
    .opt { padding: 8px 10px; border-radius: 6px; font-size: .86rem; cursor: pointer; display: flex; justify-content: space-between; gap: 8px; }
    .opt.active { background: var(--df-surface-alt); }
    .opt[aria-selected="true"] { font-weight: 600; color: var(--df-teal); }
    .opt[aria-selected="true"]::after { content: '✓'; }
    .opt[aria-disabled="true"] { opacity: .45; cursor: not-allowed; }
    .empty { padding: 8px 10px; font-size: .82rem; color: var(--df-text-muted); }
    .msg { font-size: .75rem; color: var(--df-text-muted); min-height: 1em; }
    :host([invalid]) .msg { color: var(--df-red); font-weight: 600; }
  `;

  constructor() {
    super();
    this._options = null;
    this._active = -1;
    this._internals = null;
    if (typeof this.attachInternals === 'function') {
      try { this._internals = this.attachInternals(); } catch { this._internals = null; }
    }
  }

  template() {
    return `
      <div class="wrap">
        <span class="lbl" id="lbl"><span class="txt"></span> <span class="req" hidden>*</span></span>
        <button class="trigger" part="trigger" role="combobox" aria-haspopup="listbox" aria-expanded="false"
                aria-controls="list" aria-labelledby="lbl val" type="button">
          <span class="val" id="val"></span>
          <svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <span class="msg" id="msg" aria-live="polite"></span>
      </div>
      <ul class="list" part="listbox" id="list" role="listbox" aria-labelledby="lbl" hidden></ul>`;
  }

  firstRender() {
    const trigger = this.$('.trigger');
    trigger.addEventListener('click', () => {
      if (this.disabled) return;
      if (this.open) this.close(); else this.show();
    });
    trigger.addEventListener('keydown', (e) => this._onKeydown(e));
    this.$('.list').addEventListener('mousedown', (e) => e.preventDefault()); // no robar el foco al botón
    this.$('.list').addEventListener('click', (e) => {
      const li = e.target.closest('.opt');
      if (li) this._choose(Number(li.dataset.index));
    });
    this._onOutside = (e) => { if (!e.composedPath().includes(this)) this.close(); };
    // Si cambian las <option> hijas, se vuelve a leer la lista.
    this._observer = new MutationObserver(() => { if (this._options === null) this._renderOptions(); this.update(null); });
    this._observer.observe(this, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['value', 'label', 'disabled'] });
    this._renderOptions();
  }

  /**
   * Lista de opciones `[{ value, label, disabled? }]`. Si no se asigna, se leen las `<option>` hijas.
   * @type {Array<{value: string, label: string, disabled?: boolean}>}
   */
  get options() {
    if (this._options) return this._options;
    return [...this.querySelectorAll('option')].map((o) => ({
      value: o.value, label: o.textContent.trim(), disabled: o.disabled,
    }));
  }

  set options(list) {
    this._options = Array.isArray(list)
      ? list.map((o) => (typeof o === 'string' ? { value: o, label: o, disabled: false } : { value: String(o.value), label: String(o.label ?? o.value), disabled: Boolean(o.disabled) }))
      : null;
    if (this._rendered) { this._renderOptions(); this.update(null); }
  }

  /** Texto de la opción seleccionada (o `''`). */
  get selectedLabel() {
    return this.options.find((o) => o.value === this.value)?.label ?? '';
  }

  /** Índice de la opción seleccionada (o -1). */
  get selectedIndex() {
    return this.options.findIndex((o) => o.value === this.value);
  }

  _renderOptions() {
    const list = this.$('.list');
    list.innerHTML = '';
    const opts = this.options;
    if (!opts.length) {
      list.innerHTML = '<li class="empty" role="presentation">Sin opciones</li>';
      return;
    }
    opts.forEach((o, i) => {
      const li = document.createElement('li');
      li.className = 'opt';
      li.id = `opt-${i}`;
      li.dataset.index = String(i);
      li.setAttribute('role', 'option');
      li.setAttribute('part', 'option');
      li.textContent = o.label;
      list.appendChild(li);
    });
  }

  update(changed) {
    const opts = this.options;
    const trigger = this.$('.trigger');
    this.$('.txt').textContent = this.label;
    this.$('.lbl').hidden = !this.label;
    this.$('.req').hidden = !this.required;
    const lbl = this.selectedLabel;
    const val = this.$('.val');
    val.textContent = lbl || this.placeholder;
    val.className = `val ${lbl ? '' : 'placeholder'}`;
    trigger.setAttribute('aria-disabled', String(this.disabled));
    trigger.setAttribute('aria-required', String(this.required));
    trigger.setAttribute('aria-invalid', String(this.invalid));
    trigger.tabIndex = this.disabled ? -1 : 0;
    [...this.$('.list').querySelectorAll('.opt')].forEach((li, i) => {
      li.setAttribute('aria-selected', String(opts[i]?.value === this.value));
      li.setAttribute('aria-disabled', String(Boolean(opts[i]?.disabled)));
      li.classList.toggle('active', i === this._active);
    });
    if (!this.invalid) this.$('.msg').textContent = this.hint;
    this._internals?.setFormValue?.(this.value);

    if (changed === 'open' || changed === null) {
      this.$('.list').hidden = !this.open;
      trigger.setAttribute('aria-expanded', String(this.open));
      if (this.open) document.addEventListener('pointerdown', this._onOutside, true);
      else document.removeEventListener('pointerdown', this._onOutside, true);
    }
    this._syncActive();
  }

  _syncActive() {
    const trigger = this.$('.trigger');
    if (this.open && this._active >= 0) {
      trigger.setAttribute('aria-activedescendant', `opt-${this._active}`);
      this.$(`#opt-${this._active}`)?.scrollIntoView?.({ block: 'nearest' });
    } else {
      trigger.removeAttribute('aria-activedescendant');
    }
  }

  _move(delta) {
    const opts = this.options;
    if (!opts.length) return;
    let i = this._active;
    for (let paso = 0; paso < opts.length; paso++) {
      i = (i + delta + opts.length) % opts.length;
      if (!opts[i].disabled) break;
    }
    this._setActive(i);
  }

  _setActive(i) {
    this._active = i;
    this.$('.list').querySelectorAll('.opt').forEach((li, j) => li.classList.toggle('active', j === i));
    this._syncActive();
  }

  _onKeydown(e) {
    if (this.disabled) return;
    const opts = this.options;
    const abrirCon = ['ArrowDown', 'ArrowUp', 'Enter', ' '];
    if (!this.open) {
      if (abrirCon.includes(e.key)) { e.preventDefault(); this.show(); }
      return;
    }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); this._move(1); break;
      case 'ArrowUp': e.preventDefault(); this._move(-1); break;
      case 'Home': e.preventDefault(); this._setActive(opts.findIndex((o) => !o.disabled)); break;
      case 'End': e.preventDefault(); this._setActive(opts.length - 1 - [...opts].reverse().findIndex((o) => !o.disabled)); break;
      case 'Enter':
      case ' ': e.preventDefault(); this._choose(this._active); break;
      case 'Escape': e.preventDefault(); e.stopPropagation(); this.close(); break;
      case 'Tab': this.close(); break;
      default:
        // Búsqueda por la primera letra.
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const letra = e.key.toLowerCase();
          const start = this._active + 1;
          const orden = [...opts.keys()].map((k) => (k + start) % opts.length);
          const hit = orden.find((k) => !opts[k].disabled && opts[k].label.toLowerCase().startsWith(letra));
          if (hit !== undefined) this._setActive(hit);
        }
    }
  }

  _choose(index) {
    const opt = this.options[index];
    if (!opt || opt.disabled) return;
    const changed = opt.value !== this.value;
    this.value = opt.value;
    this.close();
    if (this.invalid) this.validate({ silent: true });
    if (changed) this.emit('df-change', { value: opt.value, label: opt.label, name: this.name });
  }

  /** Despliega la lista. */
  show() {
    if (this.disabled) return;
    this._active = this.selectedIndex >= 0 ? this.selectedIndex : this.options.findIndex((o) => !o.disabled);
    this.open = true;
  }

  /** Cierra la lista. */
  close() {
    this._active = -1;
    this.open = false;
  }

  /**
   * Valida (obligatorio) y muestra el error.
   * @param {{silent?: boolean}} [options]
   * @returns {boolean}
   */
  validate(options = {}) {
    const ok = !this.required || this.value !== '';
    this.invalid = !ok;
    this.$('.msg').textContent = ok ? this.hint : 'Selecciona una opción';
    if (!ok && !options.silent) this.emit('df-invalid', { name: this.name, message: 'Selecciona una opción' });
    return ok;
  }

  /** Pone el foco en el botón. */
  focus(options) {
    this.$('.trigger')?.focus(options);
  }

  formResetCallback() {
    this.value = '';
    this.invalid = false;
  }

  disconnectedCallback() {
    document.removeEventListener('pointerdown', this._onOutside, true);
  }
}

DfSelect.define('df-select');
