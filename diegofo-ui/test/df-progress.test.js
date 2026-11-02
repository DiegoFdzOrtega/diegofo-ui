import { describe, it, expect, afterEach, vi } from 'vitest';
import '../src/components/df-progress.js';
import { mount, cleanup } from './helpers.js';

afterEach(cleanup);

const $ = (el, s) => el.shadowRoot.querySelector(s);

describe('<df-progress>', () => {
  it('tiene los valores por defecto', () => {
    const el = mount('<df-progress></df-progress>');
    expect(el.value).toBe(0);
    expect(el.max).toBe(100);
    expect(el.indeterminate).toBe(false);
    expect(el.percent).toBe(0);
    expect($(el, '.track').getAttribute('role')).toBe('progressbar');
  });

  it('calcula el porcentaje y lo refleja en ARIA y en el ancho', () => {
    const el = mount('<df-progress value="30" max="60" show-value label="Subida"></df-progress>');
    expect(el.percent).toBe(50);
    expect($(el, '.bar').style.width).toBe('50%');
    expect($(el, '.track').getAttribute('aria-valuenow')).toBe('30');
    expect($(el, '.track').getAttribute('aria-valuemax')).toBe('60');
    expect($(el, '.track').getAttribute('aria-label')).toBe('Subida');
    expect($(el, '.pct').textContent).toBe('50 %');
  });

  it('acota el porcentaje entre 0 y 100', () => {
    const el = mount('<df-progress value="150"></df-progress>');
    expect(el.percent).toBe(100);
    el.value = -5;
    expect(el.percent).toBe(0);
  });

  it('indeterminado quita aria-valuenow', () => {
    const el = mount('<df-progress indeterminate value="40"></df-progress>');
    expect($(el, '.track').hasAttribute('aria-valuenow')).toBe(false);
    expect($(el, '.track').getAttribute('aria-busy')).toBe('true');
  });

  it('lanza df-complete una sola vez al llegar al máximo', () => {
    const el = mount('<df-progress value="90"></df-progress>');
    const handler = vi.fn();
    el.addEventListener('df-complete', handler);
    el.value = 100;
    el.value = 100;
    el.max = 100;
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({ value: 100, max: 100 });
  });

  it('variant cambia el color', () => {
    const el = mount('<df-progress variant="danger"></df-progress>');
    expect($(el, '.track').classList.contains('danger')).toBe(true);
  });
});
