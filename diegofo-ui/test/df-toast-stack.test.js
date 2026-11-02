import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { DfToastStack } from '../src/components/df-toast-stack.js';
import { mount, cleanup } from './helpers.js';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

const toasts = (el) => el.shadowRoot.querySelectorAll('.toast');

describe('<df-toast-stack>', () => {
  it('tiene los valores por defecto', () => {
    const el = mount('<df-toast-stack></df-toast-stack>');
    expect(el.position).toBe('bottom-right');
    expect(el.duration).toBe(3000);
    expect(el.max).toBe(5);
    expect(el.count).toBe(0);
  });

  it('coloca el contenedor según position', () => {
    const el = mount('<df-toast-stack position="top-left"></df-toast-stack>');
    expect(el.style.top).toBe('20px');
    expect(el.style.left).toBe('20px');
    expect(el.style.bottom).toBe('');
    el.position = 'bottom-center';
    expect(el.style.bottom).toBe('20px');
    expect(el.style.left).toBe('50%');
  });

  it('show() añade un toast con su texto y tipo', () => {
    const el = mount('<df-toast-stack></df-toast-stack>');
    const t = el.show('Guardado', 'success');
    expect(toasts(el)).toHaveLength(1);
    expect(t.classList.contains('success')).toBe(true);
    expect(t.querySelector('.text').textContent).toBe('Guardado');
  });

  it('un tipo desconocido se convierte en info', () => {
    const el = mount('<df-toast-stack></df-toast-stack>');
    expect(el.show('x', 'raro').classList.contains('info')).toBe(true);
  });

  it('el mensaje se inserta como texto, no como HTML', () => {
    const el = mount('<df-toast-stack></df-toast-stack>');
    const t = el.show('<b>hola</b>');
    expect(t.querySelector('b')).toBeNull();
    expect(t.querySelector('.text').textContent).toBe('<b>hola</b>');
  });

  it('se cierra solo pasado `duration`', () => {
    const el = mount('<df-toast-stack duration="1000"></df-toast-stack>');
    el.show('Adiós');
    vi.advanceTimersByTime(999);
    expect(el.count).toBe(1);
    vi.advanceTimersByTime(1);
    expect(el.count).toBe(0);
    vi.advanceTimersByTime(300); // animación de salida
    expect(toasts(el)).toHaveLength(0);
  });

  it('duration 0 = no se cierra solo', () => {
    const el = mount('<df-toast-stack></df-toast-stack>');
    el.show('Fijo', 'info', 0);
    vi.advanceTimersByTime(60000);
    expect(el.count).toBe(1);
  });

  it('respeta el máximo quitando el más antiguo', () => {
    const el = mount('<df-toast-stack max="2"></df-toast-stack>');
    const hide = vi.fn();
    el.addEventListener('df-toast-hide', hide);
    el.show('1');
    el.show('2');
    el.show('3');
    expect(el.count).toBe(2);
    expect(hide.mock.calls[0][0].detail).toEqual({ message: '1', type: 'info', reason: 'overflow' });
  });

  it('al pulsar un toast se cierra', () => {
    const el = mount('<df-toast-stack></df-toast-stack>');
    const t = el.show('Púlsame');
    t.click();
    expect(el.count).toBe(0);
  });

  it('lanza df-toast-show y df-toast-hide', () => {
    const el = mount('<df-toast-stack duration="500"></df-toast-stack>');
    const show = vi.fn();
    const hide = vi.fn();
    el.addEventListener('df-toast-show', show);
    el.addEventListener('df-toast-hide', hide);
    el.show('Hola', 'warning');
    expect(show.mock.calls[0][0].detail).toEqual({ message: 'Hola', type: 'warning' });
    vi.advanceTimersByTime(500);
    expect(hide.mock.calls[0][0].detail.reason).toBe('timeout');
  });

  it('clear() quita todos', () => {
    const el = mount('<df-toast-stack></df-toast-stack>');
    el.show('a');
    el.show('b');
    el.clear();
    expect(el.count).toBe(0);
  });

  it('DfToastStack.notify() crea el contenedor si no existe', () => {
    expect(document.querySelector('df-toast-stack')).toBeNull();
    DfToastStack.notify('Global', 'success');
    const stack = document.querySelector('df-toast-stack');
    expect(stack).not.toBeNull();
    expect(stack.count).toBe(1);
  });
});
