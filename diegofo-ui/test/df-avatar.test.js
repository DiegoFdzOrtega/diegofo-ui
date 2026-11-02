import { describe, it, expect, afterEach, vi } from 'vitest';
import { initials, colorFor } from '../src/components/df-avatar.js';
import { mount, cleanup } from './helpers.js';

afterEach(cleanup);

const $ = (el, s) => el.shadowRoot.querySelector(s);

describe('funciones puras de df-avatar', () => {
  it('initials()', () => {
    expect(initials('Diego Fernández Ortega')).toBe('DF');
    expect(initials('ana')).toBe('AN');
    expect(initials('  ')).toBe('?');
    expect(initials(null)).toBe('?');
  });

  it('colorFor() es estable', () => {
    expect(colorFor('Ana')).toBe(colorFor('Ana'));
    expect(colorFor('Ana')).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('<df-avatar>', () => {
  it('tiene los valores por defecto', () => {
    const el = mount('<df-avatar></df-avatar>');
    expect(el.size).toBe('md');
    expect(el.shape).toBe('circle');
    expect(el.status).toBe('');
    expect($(el, '.ini').textContent).toBe('?');
  });

  it('muestra iniciales y nombre accesible', () => {
    const el = mount('<df-avatar name="Lucía Pérez" status="online"></df-avatar>');
    expect(el.initials).toBe('LP');
    expect($(el, '.ini').textContent).toBe('LP');
    expect($(el, '.avatar').getAttribute('aria-label')).toBe('Lucía Pérez · En línea');
    expect($(el, '.dot').hidden).toBe(false);
  });

  it('con src muestra la imagen', () => {
    const el = mount('<df-avatar name="Ana" src="foto.png"></df-avatar>');
    expect($(el, 'img').hidden).toBe(false);
    expect($(el, 'img').getAttribute('src')).toBe('foto.png');
    expect($(el, '.ini').textContent).toBe('');
  });

  it('si la imagen falla vuelve a las iniciales y lanza df-error', () => {
    const el = mount('<df-avatar name="Ana Ruiz" src="rota.png"></df-avatar>');
    const handler = vi.fn();
    el.addEventListener('df-error', handler);
    $(el, 'img').dispatchEvent(new Event('error'));
    expect($(el, 'img').hidden).toBe(true);
    expect($(el, '.ini').textContent).toBe('AR');
    expect(handler.mock.calls[0][0].detail).toEqual({ src: 'rota.png' });
  });

  it('size y shape cambian el aspecto', () => {
    const el = mount('<df-avatar size="xl" shape="square"></df-avatar>');
    expect($(el, '.avatar').style.getPropertyValue('--_s')).toBe('80px');
    expect($(el, '.avatar').classList.contains('square')).toBe(true);
  });
});
