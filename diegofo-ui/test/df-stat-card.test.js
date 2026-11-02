import { describe, it, expect, afterEach, vi } from 'vitest';
import { formatValue } from '../src/components/df-stat-card.js';
import { mount, cleanup, press } from './helpers.js';

afterEach(cleanup);

// Intl usa espacios especiales (U+00A0, U+202F): los normalizamos para comparar.
const norm = (s) => s.replace(/\s/g, ' ');
const $ = (el, sel) => el.shadowRoot.querySelector(sel);

describe('formatValue (función pura)', () => {
  it('text devuelve el valor tal cual', () => {
    expect(formatValue('Hola', 'text')).toBe('Hola');
  });

  it('number usa separadores españoles', () => {
    expect(formatValue(1234.5, 'number')).toBe('1.234,5');
  });

  it('currency formatea en euros por defecto', () => {
    expect(norm(formatValue(1234.5, 'currency'))).toBe('1.234,50 €');
    expect(norm(formatValue(0, 'currency'))).toBe('0,00 €');
  });

  it('percent', () => {
    expect(norm(formatValue(42.5, 'percent'))).toBe('42,5 %');
  });

  it('si no es un número, devuelve el texto original', () => {
    expect(formatValue('N/D', 'currency')).toBe('N/D');
  });
});

describe('<df-stat-card>', () => {
  it('tiene los valores por defecto', () => {
    const el = mount('<df-stat-card></df-stat-card>');
    expect(el.value).toBe('0');
    expect(el.format).toBe('text');
    expect(el.currency).toBe('EUR');
    expect(el.variant).toBe('default');
    expect(el.interactive).toBe(false);
  });

  it('pinta etiqueta, valor formateado, unidad y ayuda', () => {
    const el = mount('<df-stat-card label="Stock" value="1500" format="number" unit="u." hint="Total"></df-stat-card>');
    expect($(el, '.label').textContent).toBe('Stock');
    expect($(el, '.num').textContent).toBe('1.500');
    expect($(el, '.unit').textContent).toBe('u.');
    expect($(el, '.hint').textContent).toBe('Total');
    expect(el.formattedValue).toBe('1.500');
  });

  it('se actualiza al cambiar value', () => {
    const el = mount('<df-stat-card format="currency"></df-stat-card>');
    el.value = 99.9;
    expect(norm($(el, '.num').textContent)).toBe('99,90 €');
  });

  it('variant cambia la clase de color', () => {
    const el = mount('<df-stat-card variant="warning"></df-stat-card>');
    expect($(el, '.card').classList.contains('warning')).toBe(true);
  });

  it('la ayuda se oculta si está vacía', () => {
    const el = mount('<df-stat-card></df-stat-card>');
    expect($(el, '.hint').hidden).toBe(true);
  });

  it('interactive: lanza df-select con clic y con Enter', () => {
    const el = mount('<df-stat-card interactive label="Alertas" value="3"></df-stat-card>');
    const handler = vi.fn();
    el.addEventListener('df-select', handler);
    $(el, '.card').click();
    press('Enter', $(el, '.card'));
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler.mock.calls[0][0].detail).toEqual({ label: 'Alertas', value: '3' });
    expect($(el, '.card').getAttribute('role')).toBe('button');
    expect($(el, '.card').tabIndex).toBe(0);
  });

  it('sin interactive no lanza df-select', () => {
    const el = mount('<df-stat-card></df-stat-card>');
    const handler = vi.fn();
    el.addEventListener('df-select', handler);
    $(el, '.card').click();
    expect(handler).not.toHaveBeenCalled();
  });
});
