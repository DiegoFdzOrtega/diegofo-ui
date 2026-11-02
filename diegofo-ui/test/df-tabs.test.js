import { describe, it, expect, afterEach, vi } from 'vitest';
import '../src/components/df-tabs.js';
import { mount, cleanup, press } from './helpers.js';

afterEach(cleanup);

const HTML = `
  <df-tabs>
    <df-tab-panel label="Uno">Contenido 1</df-tab-panel>
    <df-tab-panel label="Dos">Contenido 2</df-tab-panel>
    <df-tab-panel label="Tres" disabled>Contenido 3</df-tab-panel>
    <df-tab-panel label="Cuatro">Contenido 4</df-tab-panel>
  </df-tabs>`;

const tabs = (el) => [...el.shadowRoot.querySelectorAll('[role="tab"]')];

describe('<df-tabs>', () => {
  it('genera una pestaña por panel y muestra solo el primero', () => {
    const el = mount(HTML);
    expect(el.selected).toBe(0);
    expect(el.variant).toBe('line');
    expect(tabs(el).map((t) => t.textContent)).toEqual(['Uno', 'Dos', 'Tres', 'Cuatro']);
    expect(el.panels.map((p) => p.hidden)).toEqual([false, true, true, true]);
    expect(tabs(el)[0].getAttribute('aria-selected')).toBe('true');
    expect(el.panels[0].getAttribute('role')).toBe('tabpanel');
  });

  it('al pulsar una pestaña la selecciona y lanza df-tab-change', () => {
    const el = mount(HTML);
    const handler = vi.fn();
    el.addEventListener('df-tab-change', handler);
    tabs(el)[1].click();
    expect(el.selected).toBe(1);
    expect(el.panels[1].hidden).toBe(false);
    expect(handler.mock.calls[0][0].detail).toEqual({ index: 1, label: 'Dos' });
  });

  it('las pestañas desactivadas no se pueden seleccionar', () => {
    const el = mount(HTML);
    tabs(el)[2].click();
    expect(el.selected).toBe(0);
    expect(tabs(el)[2].getAttribute('aria-disabled')).toBe('true');
  });

  it('flechas, Inicio y Fin navegan saltando las desactivadas', () => {
    const el = mount(HTML);
    const list = el.shadowRoot.querySelector('[role="tablist"]');
    press('ArrowRight', list);
    expect(el.selected).toBe(1);
    press('ArrowRight', list);
    expect(el.selected).toBe(3);
    press('ArrowRight', list);
    expect(el.selected).toBe(0);
    press('ArrowLeft', list);
    expect(el.selected).toBe(3);
    press('Home', list);
    expect(el.selected).toBe(0);
    press('End', list);
    expect(el.selected).toBe(3);
  });

  it('solo la pestaña activa es tabulable (roving tabindex)', () => {
    const el = mount(HTML);
    el.select(1);
    expect(tabs(el).map((t) => t.tabIndex)).toEqual([-1, 0, -1, -1]);
  });

  it('select() por código no lanza evento', () => {
    const el = mount(HTML);
    const handler = vi.fn();
    el.addEventListener('df-tab-change', handler);
    el.select(3);
    expect(el.panels[3].hidden).toBe(false);
    expect(handler).not.toHaveBeenCalled();
  });

  it('variant="pill" cambia el estilo', () => {
    const el = mount(HTML.replace('<df-tabs>', '<df-tabs variant="pill">'));
    expect(el.shadowRoot.querySelector('.list').classList.contains('pill')).toBe(true);
  });
});
