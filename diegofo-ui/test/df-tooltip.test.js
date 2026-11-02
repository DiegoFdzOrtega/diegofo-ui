import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import '../src/components/df-tooltip.js';
import { mount, cleanup, press } from './helpers.js';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe('<df-tooltip>', () => {
  it('tiene los valores por defecto', () => {
    const el = mount('<df-tooltip><button>Hola</button></df-tooltip>');
    expect(el.placement).toBe('top');
    expect(el.delay).toBe(150);
    expect(el.visible).toBe(false);
  });

  it('enlaza el disparador con una descripción accesible', () => {
    const el = mount('<df-tooltip text="Guardar cambios"><button>💾</button></df-tooltip>');
    const btn = el.querySelector('button');
    const id = btn.getAttribute('aria-describedby');
    expect(id).toBeTruthy();
    expect(document.getElementById(id).textContent).toBe('Guardar cambios');
    expect(el.trigger).toBe(btn);
  });

  it('aparece tras el retardo al pasar el ratón y se va al salir', () => {
    const el = mount('<df-tooltip text="Hola" delay="200"><button>x</button></df-tooltip>');
    const show = vi.fn();
    const hide = vi.fn();
    el.addEventListener('df-show', show);
    el.addEventListener('df-hide', hide);
    el.dispatchEvent(new Event('mouseenter'));
    vi.advanceTimersByTime(199);
    expect(el.visible).toBe(false);
    vi.advanceTimersByTime(1);
    expect(el.visible).toBe(true);
    expect(show).toHaveBeenCalledTimes(1);
    el.dispatchEvent(new Event('mouseleave'));
    expect(el.visible).toBe(false);
    expect(hide).toHaveBeenCalledTimes(1);
  });

  it('aparece al enfocar con teclado y Escape lo cierra', () => {
    const el = mount('<df-tooltip text="Hola"><button>x</button></df-tooltip>');
    el.querySelector('button').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    vi.advanceTimersByTime(150);
    expect(el.visible).toBe(true);
    press('Escape');
    expect(el.visible).toBe(false);
  });

  it('sin texto o desactivado no aparece', () => {
    const el = mount('<df-tooltip><button>x</button></df-tooltip>');
    el.show();
    expect(el.visible).toBe(false);
    el.text = 'Ya tiene texto';
    el.disabled = true;
    el.show();
    expect(el.visible).toBe(false);
  });

  it('placement cambia la clase de la burbuja', () => {
    const el = mount('<df-tooltip text="x" placement="right"><button>x</button></df-tooltip>');
    expect(el.shadowRoot.querySelector('.tip').classList.contains('right')).toBe(true);
  });
});
