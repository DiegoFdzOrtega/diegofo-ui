import { describe, it, expect, afterEach, vi } from 'vitest';
import { queryRows } from '../src/components/df-data-table.js';
import { mount, cleanup, type } from './helpers.js';

afterEach(cleanup);

const DATOS = [
  { nombre: 'Ana Gómez', tipo: 'Cliente', importe: 120 },
  { nombre: 'Íñigo Pérez', tipo: 'Proveedor', importe: 80 },
  { nombre: 'Marcos Alonso', tipo: 'Alumno', importe: 300 },
  { nombre: 'Lucía Ruiz', tipo: 'Cliente', importe: 50 },
  { nombre: 'Sodire Tech', tipo: 'Proveedor', importe: 999 },
];
const COLUMNAS = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'importe', label: 'Importe', type: 'currency' },
];

function tabla(attrs = '') {
  const el = mount(`<df-data-table ${attrs}></df-data-table>`);
  el.columns = COLUMNAS;
  el.rows = DATOS;
  return el;
}
const celdas = (el, col) => [...el.shadowRoot.querySelectorAll('tbody tr')].map((tr) => tr.children[col]?.textContent);

describe('queryRows (función pura)', () => {
  it('filtra sin importar mayúsculas ni tildes', () => {
    expect(queryRows(DATOS, { query: 'inigo' }).rows[0].nombre).toBe('Íñigo Pérez');
    expect(queryRows(DATOS, { query: 'CLIENTE', keys: ['tipo'] }).total).toBe(2);
  });

  it('ordena números y textos', () => {
    expect(queryRows(DATOS, { sortKey: 'importe' }).rows.map((r) => r.importe)).toEqual([50, 80, 120, 300, 999]);
    expect(queryRows(DATOS, { sortKey: 'nombre', sortDir: 'desc' }).rows[0].nombre).toBe('Sodire Tech');
  });

  it('pagina y acota la página', () => {
    const r = queryRows(DATOS, { pageSize: 2, page: 3 });
    expect(r.pages).toBe(3);
    expect(r.rows).toHaveLength(1);
    expect(queryRows(DATOS, { pageSize: 2, page: 99 }).page).toBe(3);
  });
});

describe('<df-data-table>', () => {
  it('tiene los valores por defecto', () => {
    const el = mount('<df-data-table></df-data-table>');
    expect(el.pageSize).toBe(10);
    expect(el.searchable).toBe(false);
    expect(el.emptyText).toBe('No hay datos');
    expect(el.sortDir).toBe('asc');
    expect(el.shadowRoot.querySelector('td.empty').textContent).toBe('No hay datos');
  });

  it('pinta cabeceras y filas con formato', () => {
    const el = tabla();
    const ths = [...el.shadowRoot.querySelectorAll('th')].map((th) => th.textContent.replace(/[↕▲▼]/g, ''));
    expect(ths).toEqual(['Nombre', 'Tipo', 'Importe']);
    expect(celdas(el, 0)).toHaveLength(5);
    expect(celdas(el, 2)[0].replace(/\s/g, ' ')).toBe('120,00 €');
  });

  it('ordena al pulsar la cabecera y marca aria-sort', () => {
    const el = tabla();
    const handler = vi.fn();
    el.addEventListener('df-sort', handler);
    el.shadowRoot.querySelectorAll('th button')[2].click();
    expect(celdas(el, 2).map((t) => parseInt(t, 10))).toEqual([50, 80, 120, 300, 999]);
    expect(el.shadowRoot.querySelectorAll('th')[2].getAttribute('aria-sort')).toBe('ascending');
    el.shadowRoot.querySelectorAll('th button')[2].click();
    expect(el.sortDir).toBe('desc');
    expect(handler.mock.calls[1][0].detail).toEqual({ key: 'importe', direction: 'desc' });
  });

  it('busca y lanza df-search', () => {
    const el = tabla('searchable');
    const handler = vi.fn();
    el.addEventListener('df-search', handler);
    type(el.shadowRoot.querySelector('.search input'), 'prov');
    expect(celdas(el, 0)).toEqual(['Íñigo Pérez', 'Sodire Tech']);
    expect(handler.mock.calls[0][0].detail).toEqual({ query: 'prov', total: 2 });
    el.search('zzz');
    expect(el.shadowRoot.querySelector('td.empty').textContent).toBe('Sin resultados para "zzz"');
  });

  it('pagina y lanza df-page', () => {
    const el = tabla('page-size="2"');
    const handler = vi.fn();
    el.addEventListener('df-page', handler);
    expect(el.visibleRows).toHaveLength(2);
    expect(el.shadowRoot.querySelector('.info').textContent).toBe('1–2 de 5');
    el.shadowRoot.querySelector('[aria-label="Página siguiente"]').click();
    expect(el.page).toBe(2);
    expect(handler.mock.calls[0][0].detail).toEqual({ page: 2, pages: 3 });
    el.goToPage(99);
    expect(el.page).toBe(3);
    expect(el.shadowRoot.querySelector('[aria-current="page"]').textContent).toBe('3');
  });

  it('render personalizado (texto HTML o nodo)', () => {
    const el = mount('<df-data-table></df-data-table>');
    el.columns = [
      { key: 'a', label: 'A', render: (r) => `<b>${r.a}</b>` },
      { key: 'b', label: 'B', render: () => { const s = document.createElement('i'); s.textContent = 'nodo'; return s; } },
    ];
    el.rows = [{ a: 'x' }];
    expect(el.shadowRoot.querySelector('tbody b').textContent).toBe('x');
    expect(el.shadowRoot.querySelector('tbody i').textContent).toBe('nodo');
  });

  it('por defecto escapa el contenido de las celdas', () => {
    const el = mount('<df-data-table></df-data-table>');
    el.columns = [{ key: 'a' }];
    el.rows = [{ a: '<img src=x>' }];
    expect(el.shadowRoot.querySelector('tbody img')).toBeNull();
  });

  it('clickable lanza df-row-click con la fila', () => {
    const el = tabla('clickable');
    const handler = vi.fn();
    el.addEventListener('df-row-click', handler);
    el.shadowRoot.querySelectorAll('tbody tr')[1].children[0].click();
    expect(handler.mock.calls[0][0].detail.row.nombre).toBe('Íñigo Pérez');
  });

  it('columnas no ordenables no tienen botón', () => {
    const el = mount('<df-data-table></df-data-table>');
    el.columns = [{ key: 'a', sortable: false }];
    expect(el.shadowRoot.querySelector('th button')).toBeNull();
  });
});
