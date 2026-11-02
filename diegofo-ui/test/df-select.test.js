import { describe, it, expect, afterEach, vi } from 'vitest';
import '../src/components/df-select.js';
import { mount, cleanup, press } from './helpers.js';

afterEach(cleanup);

const HTML = `
  <df-select label="Fruta" name="fruta">
    <option value="manzana">Manzana</option>
    <option value="pera">Pera</option>
    <option value="platano" disabled>Plátano</option>
    <option value="mango">Mango</option>
  </df-select>`;

const $ = (el, s) => el.shadowRoot.querySelector(s);
const trigger = (el) => $(el, '.trigger');

describe('<df-select>', () => {
  it('tiene los valores por defecto', () => {
    const el = mount('<df-select></df-select>');
    expect(el.value).toBe('');
    expect(el.placeholder).toBe('Selecciona una opción');
    expect(el.open).toBe(false);
    expect($(el, '.val').textContent).toBe('Selecciona una opción');
    expect(trigger(el).getAttribute('role')).toBe('combobox');
  });

  it('lee las <option> hijas', () => {
    const el = mount(HTML);
    expect(el.options.map((o) => o.value)).toEqual(['manzana', 'pera', 'platano', 'mango']);
    expect(el.options[2].disabled).toBe(true);
    expect(el.shadowRoot.querySelectorAll('[role="option"]')).toHaveLength(4);
  });

  it('acepta opciones por propiedad', () => {
    const el = mount('<df-select></df-select>');
    el.options = ['A', { value: 'b', label: 'Be' }];
    expect(el.options).toEqual([{ value: 'A', label: 'A', disabled: false }, { value: 'b', label: 'Be', disabled: false }]);
    el.value = 'b';
    expect($(el, '.val').textContent).toBe('Be');
  });

  it('abre al pulsar y elegir una opción lanza df-change', () => {
    const el = mount(HTML);
    const handler = vi.fn();
    el.addEventListener('df-change', handler);
    trigger(el).click();
    expect(el.open).toBe(true);
    expect(trigger(el).getAttribute('aria-expanded')).toBe('true');
    el.shadowRoot.querySelectorAll('.opt')[1].click();
    expect(el.value).toBe('pera');
    expect(el.open).toBe(false);
    expect(el.selectedLabel).toBe('Pera');
    expect(handler.mock.calls[0][0].detail).toEqual({ value: 'pera', label: 'Pera', name: 'fruta' });
  });

  it('las opciones desactivadas no se pueden elegir', () => {
    const el = mount(HTML);
    trigger(el).click();
    el.shadowRoot.querySelectorAll('.opt')[2].click();
    expect(el.value).toBe('');
  });

  it('teclado: flechas saltan desactivadas, Enter elige, Escape cierra', () => {
    const el = mount(HTML);
    const t = trigger(el);
    press('ArrowDown', t); // abre en la primera
    expect(el.open).toBe(true);
    expect(t.getAttribute('aria-activedescendant')).toBe('opt-0');
    press('ArrowDown', t);
    press('ArrowDown', t); // salta "Plátano"
    expect(t.getAttribute('aria-activedescendant')).toBe('opt-3');
    press('Enter', t);
    expect(el.value).toBe('mango');
    press('ArrowDown', t);
    press('Escape', t);
    expect(el.open).toBe(false);
    expect(el.value).toBe('mango');
  });

  it('búsqueda por primera letra', () => {
    const el = mount(HTML);
    const t = trigger(el);
    press('Enter', t);
    press('m', t);
    expect(t.getAttribute('aria-activedescendant')).toBe('opt-3');
  });

  it('validate() con required', () => {
    const el = mount(HTML.replace('name="fruta"', 'name="fruta" required'));
    expect(el.validate()).toBe(false);
    expect(el.invalid).toBe(true);
    expect($(el, '.msg').textContent).toBe('Selecciona una opción');
    el.value = 'pera';
    expect(el.validate()).toBe(true);
  });

  it('desactivado no se abre', () => {
    const el = mount(HTML.replace('name="fruta"', 'name="fruta" disabled'));
    trigger(el).click();
    expect(el.open).toBe(false);
  });

  it('se cierra al pulsar fuera', () => {
    const el = mount(HTML);
    trigger(el).click();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true, composed: true }));
    expect(el.open).toBe(false);
  });
});
