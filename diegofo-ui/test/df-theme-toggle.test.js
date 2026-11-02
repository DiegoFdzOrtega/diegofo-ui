import { describe, it, expect, afterEach, vi } from 'vitest';
import '../src/components/df-theme-toggle.js';
import { mount, cleanup } from './helpers.js';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const btn = (el) => el.shadowRoot.querySelector('button');

describe('<df-theme-toggle>', () => {
  it('tiene los valores por defecto', () => {
    const el = mount('<df-theme-toggle></df-theme-toggle>');
    expect(el.theme).toBe('light');
    expect(el.target).toBe('body');
    expect(el.storageKey).toBe('');
    expect(document.body.hasAttribute('data-theme')).toBe(false);
    expect(btn(el).getAttribute('aria-label')).toBe('Cambiar a tema oscuro');
  });

  it('al pulsar pasa a oscuro, aplica data-theme y lanza df-theme-change', () => {
    const el = mount('<df-theme-toggle></df-theme-toggle>');
    const handler = vi.fn();
    el.addEventListener('df-theme-change', handler);
    btn(el).click();
    expect(el.theme).toBe('dark');
    expect(document.body.getAttribute('data-theme')).toBe('dark');
    expect(handler.mock.calls[0][0].detail).toEqual({ theme: 'dark' });
    expect(btn(el).getAttribute('aria-label')).toBe('Cambiar a tema claro');
  });

  it('toggle() alterna y devuelve el nuevo tema', () => {
    const el = mount('<df-theme-toggle theme="dark"></df-theme-toggle>');
    expect(document.body.getAttribute('data-theme')).toBe('dark');
    expect(el.toggle()).toBe('light');
    expect(document.body.hasAttribute('data-theme')).toBe(false);
  });

  it('asignar theme por código aplica el tema pero NO lanza el evento', () => {
    const el = mount('<df-theme-toggle></df-theme-toggle>');
    const handler = vi.fn();
    el.addEventListener('df-theme-change', handler);
    el.theme = 'dark';
    expect(document.body.getAttribute('data-theme')).toBe('dark');
    expect(handler).not.toHaveBeenCalled();
  });

  it('target permite aplicar el tema a otro elemento', () => {
    mount('<section id="zona"></section>');
    const el = mount('<df-theme-toggle target="#zona"></df-theme-toggle>');
    el.toggle();
    expect(document.getElementById('zona').getAttribute('data-theme')).toBe('dark');
    expect(document.body.hasAttribute('data-theme')).toBe(false);
  });

  it('storage-key guarda el tema y lo recupera al volver a cargar', () => {
    const el = mount('<df-theme-toggle storage-key="tema-test"></df-theme-toggle>');
    el.toggle();
    expect(localStorage.getItem('tema-test')).toBe('dark');
    cleanup();
    const otro = mount('<df-theme-toggle storage-key="tema-test"></df-theme-toggle>');
    expect(otro.theme).toBe('dark');
    expect(document.body.getAttribute('data-theme')).toBe('dark');
  });
});
