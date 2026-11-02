import { DfElement } from '../core/df-element.js';
import { formatValue } from './df-stat-card.js';

/** Normaliza texto para buscar sin importar mayúsculas ni tildes. */
const normalizar = (v) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Filtra, ordena y pagina filas. Función pura: se puede probar sin DOM.
 * @param {Array<object>} rows
 * @param {{query?: string, keys?: string[], sortKey?: string, sortDir?: 'asc'|'desc', page?: number, pageSize?: number}} opts
 * @returns {{rows: Array<object>, total: number, pages: number, page: number}}
 */
export function queryRows(rows, opts = {}) {
  const { query = '', keys = [], sortKey = '', sortDir = 'asc', pageSize = 0 } = opts;
  let out = [...rows];
  const q = normalizar(query).trim();
  if (q) {
    const campos = keys.length ? keys : Object.keys(rows[0] ?? {});
    out = out.filter((row) => campos.some((k) => normalizar(row[k]).includes(q)));
  }
  if (sortKey) {
    const factor = sortDir === 'desc' ? -1 : 1;
    out.sort((a, b) => {
      const x = a[sortKey];
      const y = b[sortKey];
      if (x == null && y == null) return 0;
      if (x == null) return 1;
      if (y == null) return -1;
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * factor;
      return String(x).localeCompare(String(y), 'es', { numeric: true, sensitivity: 'base' }) * factor;
    });
  }
  const total = out.length;
  const pages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const page = Math.min(Math.max(1, opts.page ?? 1), pages);
  if (pageSize > 0) out = out.slice((page - 1) * pageSize, page * pageSize);
  return { rows: out, total, pages, page };
}

/**
 * Tabla de datos con ordenación por columnas, búsqueda y paginación.
 * Los datos se pasan por JavaScript con las propiedades `columns` y `rows`.
 *
 * @element df-data-table
 *
 * @prop {number}  pageSize          - (atributo `page-size`) Filas por página; `0` = sin paginar. Por defecto `10`.
 * @prop {boolean} searchable        - Muestra la caja de búsqueda. Por defecto `false`.
 * @prop {string}  searchPlaceholder - (atributo `search-placeholder`) Por defecto `'Buscar…'`.
 * @prop {string}  emptyText         - (atributo `empty-text`) Texto sin resultados. Por defecto `'No hay datos'`.
 * @prop {string}  sortKey           - (atributo `sort-key`) Columna por la que se ordena. Por defecto `''`.
 * @prop {'asc'|'desc'} sortDir      - (atributo `sort-dir`) Dirección. Por defecto `asc`.
 * @prop {boolean} striped           - Filas alternas sombreadas. Por defecto `false`.
 * @prop {boolean} clickable         - Las filas se pueden pulsar (lanza `df-row-click`). Por defecto `false`.
 * @prop {string}  caption           - Título accesible de la tabla. Por defecto `''`.
 *
 * Columnas: `{ key, label, sortable = true, align = 'left'|'right'|'center', type = 'text'|'number'|'currency'|'date',
 *             render?: (row) => string | Node }`. Si `render` devuelve un string, se inserta como HTML (el programador es
 * responsable de escaparlo); si devuelve un nodo, se añade tal cual (útil para botones con listeners).
 *
 * @fires df-sort      - Al ordenar. detail: `{ key, direction }`
 * @fires df-search    - Al escribir en la búsqueda. detail: `{ query, total }`
 * @fires df-page      - Al cambiar de página. detail: `{ page, pages }`
 * @fires df-row-click - Al pulsar una fila (con `clickable`). detail: `{ row, index }`
 *
 * @slot toolbar - Acciones a la derecha de la búsqueda (botones, filtros…).
 * @csspart table - La tabla.
 */
export class DfDataTable extends DfElement {
  static properties = {
    pageSize: { type: Number, default: 10 },
    searchable: { type: Boolean, default: false },
    searchPlaceholder: { type: String, default: 'Buscar…' },
    emptyText: { type: String, default: 'No hay datos' },
    sortKey: { type: String, default: '' },
    sortDir: { type: String, default: 'asc' },
    striped: { type: Boolean, default: false },
    clickable: { type: Boolean, default: false },
    caption: { type: String, default: '' },
  };

  static styles = `
    :host { display: block; }
    .toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
    .toolbar:not(.has-search):not(.has-slot) { display: none; }
    .search { position: relative; flex: 1; max-width: 300px; min-width: 180px; }
    .search svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--df-text-muted); }
    .search input {
      width: 100%; padding: 8px 12px 8px 32px; border: 1px solid var(--df-border); border-radius: var(--df-radius);
      background: var(--df-surface-alt); color: var(--df-text); font: .85rem var(--df-font); outline: none;
    }
    .search input:focus { border-color: var(--df-blue); }
    .scroll { overflow-x: auto; border: 1px solid var(--df-border); border-radius: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: .86rem; color: var(--df-text); }
    caption { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
    th { text-align: left; font-weight: 600; font-size: .8rem;
         color: var(--df-text-muted); background: var(--df-surface-alt); padding: 0; border-bottom: 1px solid var(--df-border); white-space: nowrap; }
    th > span, th > button { display: flex; align-items: center; gap: 6px; padding: 11px 14px; }
    th button { all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 6px; width: 100%; padding: 11px 14px; cursor: pointer; }
    th button:hover { color: var(--df-text); }
    th button:focus-visible { outline: 2px solid var(--df-blue); outline-offset: -2px; }
    th[aria-sort="ascending"], th[aria-sort="descending"] { color: var(--df-teal); }
    .arrow { opacity: .35; font-size: .7rem; }
    th[aria-sort] .arrow { opacity: 1; }
    td { padding: 11px 14px; border-bottom: 1px solid var(--df-border); vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    .striped tbody tr:nth-child(even) td { background: color-mix(in srgb, var(--df-surface-alt) 60%, transparent); }
    .clickable tbody tr { cursor: pointer; }
    .clickable tbody tr:hover td { background: var(--df-surface-alt); }
    .right { text-align: right; justify-content: flex-end; }
    .center { text-align: center; justify-content: center; }
    td.empty { text-align: center; color: var(--df-text-muted); padding: 28px; }
    .foot { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 12px; font-size: .8rem; color: var(--df-text-muted); flex-wrap: wrap; }
    .pager { display: flex; gap: 4px; }
    .pager button {
      all: unset; box-sizing: border-box; min-width: 30px; height: 30px; padding: 0 8px; border-radius: 6px;
      display: grid; place-items: center; cursor: pointer; color: var(--df-text); border: 1px solid var(--df-border); font-size: .8rem;
    }
    .pager button:hover:not([disabled]) { background: var(--df-surface-alt); }
    .pager button[aria-current="page"] { background: var(--df-primary); color: #fff; border-color: transparent; }
    .pager button[disabled] { opacity: .4; cursor: not-allowed; }
    .pager button:focus-visible { outline: 2px solid var(--df-blue); outline-offset: 1px; }
  `;

  constructor() {
    super();
    this._columns = [];
    this._rows = [];
    this._query = '';
    this._page = 1;
  }

  template() {
    return `
      <div class="toolbar">
        <label class="search" hidden>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" aria-label="Buscar en la tabla">
        </label>
        <slot name="toolbar"></slot>
      </div>
      <div class="scroll"><table part="table"><caption></caption><thead><tr></tr></thead><tbody></tbody></table></div>
      <div class="foot"><span class="info" aria-live="polite"></span><nav class="pager" aria-label="Paginación"></nav></div>`;
  }

  firstRender() {
    const input = this.$('.search input');
    input.addEventListener('input', () => {
      this._query = input.value;
      this._page = 1;
      this._renderBody();
      this.emit('df-search', { query: this._query, total: this._last.total });
    });
    this.$('slot[name="toolbar"]').addEventListener('slotchange', () => this._toolbarState());
    this.$('tbody').addEventListener('click', (e) => {
      if (!this.clickable) return;
      const tr = e.target.closest('tr[data-index]');
      if (!tr) return;
      const index = Number(tr.dataset.index);
      this.emit('df-row-click', { row: this._last.rows[index], index });
    });
  }

  /** Definición de columnas. @type {Array<object>} */
  get columns() { return this._columns; }
  set columns(cols) {
    this._columns = Array.isArray(cols) ? cols : [];
    if (this._rendered) this.update(null);
  }

  /** Datos. @type {Array<object>} */
  get rows() { return this._rows; }
  set rows(data) {
    this._rows = Array.isArray(data) ? data : [];
    if (this._rendered) { this._clampPage(); this._renderBody(); }
  }

  /**
   * Cambia los datos de golpe (atajo de `rows = ...`).
   * @param {Array<object>} rows
   */
  setData(rows) { this.rows = rows; }

  /** Página actual (empieza en 1). */
  get page() { return this._page; }

  /** Filas que se ven ahora mismo (tras filtrar, ordenar y paginar). */
  get visibleRows() { return this._compute().rows; }

  /** Número de filas que cumplen la búsqueda. */
  get total() { return this._compute().total; }

  /** Texto de búsqueda actual. */
  get query() { return this._query; }

  /**
   * Busca por código.
   * @param {string} text
   */
  search(text) {
    this._query = String(text ?? '');
    this._page = 1;
    if (this._rendered) { this.$('.search input').value = this._query; this._renderBody(); }
  }

  /**
   * Ordena por una columna. Si ya estaba ordenada por esa, invierte la dirección.
   * @param {string} key
   * @param {'asc'|'desc'} [direction]
   */
  sortBy(key, direction) {
    const dir = direction ?? (this.sortKey === key && this.sortDir === 'asc' ? 'desc' : 'asc');
    this.sortKey = key;
    this.sortDir = dir;
  }

  /**
   * Va a una página.
   * @param {number} page
   */
  goToPage(page) {
    const { pages } = this._compute();
    const destino = Math.min(Math.max(1, page), pages);
    if (destino === this._page) return;
    this._page = destino;
    this._renderBody();
    this.emit('df-page', { page: this._page, pages });
  }

  _compute() {
    return queryRows(this._rows, {
      query: this._query,
      keys: this._columns.map((c) => c.key),
      sortKey: this.sortKey,
      sortDir: this.sortDir,
      page: this._page,
      pageSize: this.pageSize,
    });
  }

  _clampPage() {
    const { pages } = queryRows(this._rows, { query: this._query, keys: this._columns.map((c) => c.key), pageSize: this.pageSize });
    this._page = Math.min(this._page, pages);
  }

  _toolbarState() {
    const bar = this.$('.toolbar');
    bar.classList.toggle('has-search', this.searchable);
    bar.classList.toggle('has-slot', this.$('slot[name="toolbar"]').assignedElements().length > 0);
  }

  update(changed) {
    this.$('.search').hidden = !this.searchable;
    this.$('.search input').placeholder = this.searchPlaceholder;
    this._toolbarState();
    this.$('caption').textContent = this.caption;
    const table = this.$('table');
    table.className = `${this.striped ? 'striped' : ''} ${this.clickable ? 'clickable' : ''}`;
    if (changed === 'page-size') this._page = 1;
    this._renderHead();
    this._renderBody();
  }

  _renderHead() {
    const tr = this.$('thead tr');
    tr.innerHTML = '';
    this._columns.forEach((col) => {
      const th = document.createElement('th');
      th.scope = 'col';
      const align = col.align ?? (['number', 'currency'].includes(col.type) ? 'right' : 'left');
      const sortable = col.sortable !== false;
      if (this.sortKey === col.key) th.setAttribute('aria-sort', this.sortDir === 'desc' ? 'descending' : 'ascending');
      const inner = document.createElement(sortable ? 'button' : 'span');
      inner.className = align;
      inner.textContent = col.label ?? col.key;
      if (sortable) {
        const arrow = document.createElement('span');
        arrow.className = 'arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = this.sortKey === col.key ? (this.sortDir === 'desc' ? '▼' : '▲') : '↕';
        inner.appendChild(arrow);
        inner.addEventListener('click', () => {
          this.sortBy(col.key);
          this.emit('df-sort', { key: this.sortKey, direction: this.sortDir });
        });
      }
      th.appendChild(inner);
      tr.appendChild(th);
    });
  }

  _cell(col, row) {
    const td = document.createElement('td');
    const align = col.align ?? (['number', 'currency'].includes(col.type) ? 'right' : 'left');
    if (align !== 'left') td.className = align;
    if (typeof col.render === 'function') {
      const out = col.render(row);
      if (out instanceof Node) td.appendChild(out);
      else td.innerHTML = out ?? '';
      return td;
    }
    const v = row[col.key];
    if (col.type === 'currency') td.textContent = formatValue(v, 'currency');
    else if (col.type === 'number') td.textContent = formatValue(v, 'number');
    else if (col.type === 'date' && v) {
      const d = new Date(v);
      td.textContent = Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString('es-ES');
    } else td.textContent = v ?? '';
    return td;
  }

  _renderBody() {
    const res = this._compute();
    this._last = res;
    this._page = res.page;
    const tbody = this.$('tbody');
    tbody.innerHTML = '';
    if (!res.rows.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.className = 'empty';
      td.colSpan = Math.max(1, this._columns.length);
      td.textContent = this._query ? `Sin resultados para "${this._query}"` : this.emptyText;
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      res.rows.forEach((row, i) => {
        const tr = document.createElement('tr');
        tr.dataset.index = String(i);
        this._columns.forEach((col) => tr.appendChild(this._cell(col, row)));
        tbody.appendChild(tr);
      });
    }
    this._renderFoot(res);
  }

  _renderFoot({ total, pages, page }) {
    const size = this.pageSize;
    const desde = total === 0 ? 0 : size > 0 ? (page - 1) * size + 1 : 1;
    const hasta = size > 0 ? Math.min(page * size, total) : total;
    this.$('.info').textContent = total === 0 ? '0 resultados' : `${desde}–${hasta} de ${total}`;
    const pager = this.$('.pager');
    pager.innerHTML = '';
    pager.hidden = pages <= 1;
    if (pages <= 1) return;
    const boton = (texto, destino, opts = {}) => {
      const b = document.createElement('button');
      b.textContent = texto;
      if (opts.label) b.setAttribute('aria-label', opts.label);
      if (opts.current) b.setAttribute('aria-current', 'page');
      if (opts.disabled) b.disabled = true;
      b.addEventListener('click', () => this.goToPage(destino));
      pager.appendChild(b);
    };
    boton('‹', page - 1, { label: 'Página anterior', disabled: page === 1 });
    const inicio = Math.max(1, Math.min(page - 2, pages - 4));
    for (let p = inicio; p <= Math.min(pages, inicio + 4); p++) boton(String(p), p, { current: p === page, label: `Página ${p}` });
    boton('›', page + 1, { label: 'Página siguiente', disabled: page === pages });
  }
}

DfDataTable.define('df-data-table');
