import { describe, it, expect, afterEach, vi } from 'vitest';
import '../src/components/df-switch.js';
import { mount, cleanup, press } from './helpers.js';

afterEach(cleanup);

const track = (el) => el.shadowRoot.querySelector('.track');

describe('<df-switch>', () => {
  it('tiene los valores por defecto', () => {
    const el = mount('<df-switch></df-switch>');
    expect(el.checked).toBe(false);
    expect(el.disabled).toBe(false);
    expect(el.value).toBe('on');
    expect(el.size).toBe('md');
    expect(track(el).getAttribute('role')).toBe('switch');
    expect(track(el).getAttribute('aria-checked')).toBe('false');
  });

  it('al pulsar cambia y lanza df-change', () => {
    const el = mount('<df-switch name="avisos" label="Avisos"></df-switch>');
    const handler = vi.fn();
    el.addEventListener('df-change', handler);
    el.shadowRoot.querySelector('.wrap').click();
    expect(el.checked).toBe(true);
    expect(track(el).getAttribute('aria-checked')).toBe('true');
    expect(handler.mock.calls[0][0].detail).toEqual({ checked: true, name: 'avisos' });
  });

  it('se maneja con Espacio y Enter', () => {
    const el = mount('<df-switch></df-switch>');
    press(' ', track(el));
    expect(el.checked).toBe(true);
    press('Enter', track(el));
    expect(el.checked).toBe(false);
  });

  it('desactivado no cambia ni es enfocable', () => {
    const el = mount('<df-switch disabled></df-switch>');
    const handler = vi.fn();
    el.addEventListener('df-change', handler);
    el.shadowRoot.querySelector('.wrap').click();
    expect(el.checked).toBe(false);
    expect(handler).not.toHaveBeenCalled();
    expect(track(el).tabIndex).toBe(-1);
  });

  it('toggle() por código no lanza evento', () => {
    const el = mount('<df-switch></df-switch>');
    const handler = vi.fn();
    el.addEventListener('df-change', handler);
    expect(el.toggle()).toBe(true);
    expect(el.toggle(true)).toBe(true);
    expect(el.toggle(false)).toBe(false);
    expect(handler).not.toHaveBeenCalled();
  });

  it('usa label como texto y nombre accesible', () => {
    const el = mount('<df-switch label="Modo avión"></df-switch>');
    expect(el.shadowRoot.querySelector('slot').textContent).toBe('Modo avión');
    expect(track(el).getAttribute('aria-label')).toBe('Modo avión');
  });
});
