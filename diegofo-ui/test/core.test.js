import { describe, it, expect, afterEach, vi } from 'vitest';
import { DfElement, toKebab, fromAttribute, escapeHtml } from '../src/core/df-element.js';
import { mount, cleanup } from './helpers.js';

// Componente mínimo solo para probar la clase base.
class DfPrueba extends DfElement {
  static properties = {
    texto: { type: String, default: 'Hola' },
    cantidad: { type: Number, default: 3 },
    activo: { type: Boolean, default: false },
    mensajeError: { type: String, default: 'Error' },
  };
  template() {
    return '<p></p>';
  }
  update(changed) {
    this.ultimoCambio = changed;
    this.$('p').textContent = `${this.texto}-${this.cantidad}-${this.activo}`;
  }
}
DfPrueba.define('df-prueba');

afterEach(cleanup);

describe('utilidades del núcleo', () => {
  it('toKebab convierte camelCase a kebab-case', () => {
    expect(toKebab('errorMessage')).toBe('error-message');
    expect(toKebab('confirmText')).toBe('confirm-text');
    expect(toKebab('label')).toBe('label');
  });

  it('fromAttribute convierte según el tipo y usa el valor por defecto', () => {
    expect(fromAttribute(null, String, 'x')).toBe('x');
    expect(fromAttribute('abc', String, 'x')).toBe('abc');
    expect(fromAttribute('42', Number, 0)).toBe(42);
    expect(fromAttribute('no-numero', Number, 7)).toBe(7);
    expect(fromAttribute('', Boolean, false)).toBe(true);
    expect(fromAttribute(null, Boolean, false)).toBe(false);
  });

  it('escapeHtml neutraliza etiquetas', () => {
    expect(escapeHtml('<img src=x onerror="a">')).toBe('&lt;img src=x onerror=&quot;a&quot;&gt;');
    expect(escapeHtml(null)).toBe('');
  });
});

describe('DfElement (clase base)', () => {
  it('crea Shadow DOM y pinta la plantilla', () => {
    const el = mount('<df-prueba></df-prueba>');
    expect(el.shadowRoot).not.toBeNull();
    expect(el.shadowRoot.querySelector('p')).not.toBeNull();
  });

  it('las propiedades tienen valores por defecto', () => {
    const el = mount('<df-prueba></df-prueba>');
    expect(el.texto).toBe('Hola');
    expect(el.cantidad).toBe(3);
    expect(el.activo).toBe(false);
    expect(el.shadowRoot.querySelector('p').textContent).toBe('Hola-3-false');
  });

  it('lee los atributos HTML con el tipo correcto', () => {
    const el = mount('<df-prueba texto="Adiós" cantidad="10" activo mensaje-error="Mal"></df-prueba>');
    expect(el.texto).toBe('Adiós');
    expect(el.cantidad).toBe(10);
    expect(el.activo).toBe(true);
    expect(el.mensajeError).toBe('Mal');
  });

  it('asignar una propiedad refleja el atributo y repinta', () => {
    const el = mount('<df-prueba></df-prueba>');
    el.cantidad = 5;
    el.activo = true;
    expect(el.getAttribute('cantidad')).toBe('5');
    expect(el.hasAttribute('activo')).toBe(true);
    expect(el.ultimoCambio).toBe('activo');
    expect(el.shadowRoot.querySelector('p').textContent).toBe('Hola-5-true');
    el.activo = false;
    expect(el.hasAttribute('activo')).toBe(false);
  });

  it('asignar null quita el atributo y vuelve al valor por defecto', () => {
    const el = mount('<df-prueba texto="X"></df-prueba>');
    el.texto = null;
    expect(el.hasAttribute('texto')).toBe(false);
    expect(el.texto).toBe('Hola');
  });

  it('respeta propiedades asignadas antes de insertar el elemento', () => {
    const el = document.createElement('df-prueba');
    el.texto = 'Antes';
    document.body.appendChild(el);
    expect(el.shadowRoot.querySelector('p').textContent).toBe('Antes-3-false');
  });

  it('emit lanza un CustomEvent que burbujea y atraviesa el Shadow DOM', () => {
    const el = mount('<df-prueba></df-prueba>');
    const handler = vi.fn();
    document.body.addEventListener('df-algo', handler);
    el.emit('df-algo', { a: 1 });
    expect(handler).toHaveBeenCalledTimes(1);
    const evento = handler.mock.calls[0][0];
    expect(evento.detail).toEqual({ a: 1 });
    expect(evento.composed).toBe(true);
    document.body.removeEventListener('df-algo', handler);
  });

  it('emit devuelve false si el evento cancelable se cancela', () => {
    const el = mount('<df-prueba></df-prueba>');
    el.addEventListener('df-x', (e) => e.preventDefault());
    expect(el.emit('df-x', {}, { cancelable: true })).toBe(false);
    expect(el.emit('df-x', {})).toBe(true);
  });

  it('define() no falla si la etiqueta ya estaba registrada', () => {
    expect(() => DfPrueba.define('df-prueba')).not.toThrow();
  });
});
