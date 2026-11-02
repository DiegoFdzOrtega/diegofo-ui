import { describe, it, expect, afterEach, vi } from 'vitest';
import { DfInput, validateValue } from '../src/components/df-input.js';
import { mount, cleanup, type, press } from './helpers.js';

afterEach(cleanup);

const field = (el) => el.shadowRoot.querySelector('input, textarea');
const msg = (el) => el.shadowRoot.querySelector('.msg').textContent;

describe('validateValue (función pura)', () => {
  it('obligatorio vacío → error', () => {
    expect(validateValue('', { required: true })).toEqual({ valid: false, message: 'Este campo es obligatorio' });
    expect(validateValue('   ', { required: true }).valid).toBe(false);
  });

  it('vacío y no obligatorio → válido', () => {
    expect(validateValue('', { type: 'email' }).valid).toBe(true);
  });

  it('valida correos', () => {
    expect(validateValue('ana@ejemplo.com', { type: 'email' }).valid).toBe(true);
    expect(validateValue('ana@ejemplo', { type: 'email' }).valid).toBe(false);
  });

  it('valida números, longitud mínima y patrón', () => {
    expect(validateValue('12.5', { type: 'number' }).valid).toBe(true);
    expect(validateValue('doce', { type: 'number' }).valid).toBe(false);
    expect(validateValue('ab', { minlength: 3 }).message).toBe('Mínimo 3 caracteres');
    expect(validateValue('1234A', { pattern: '[0-9]{4}[A-Z]' }).valid).toBe(true);
    expect(validateValue('123A', { pattern: '[0-9]{4}[A-Z]' }).valid).toBe(false);
  });

  it('usa el mensaje personalizado si se indica', () => {
    expect(validateValue('x', { pattern: '\\d+', errorMessage: 'Solo dígitos' }).message).toBe('Solo dígitos');
  });

  it('un patrón mal escrito no rompe la validación', () => {
    expect(validateValue('abc', { pattern: '[' }).valid).toBe(true);
  });
});

describe('<df-input>', () => {
  it('tiene los valores por defecto', () => {
    const el = mount('<df-input></df-input>');
    expect(el.type).toBe('text');
    expect(el.value).toBe('');
    expect(el.required).toBe(false);
    expect(el.minlength).toBe(0);
    expect(el.rows).toBe(3);
    expect(el.invalid).toBe(false);
    expect(field(el).tagName).toBe('INPUT');
  });

  it('pinta etiqueta, placeholder, ayuda y asterisco de obligatorio', () => {
    const el = mount('<df-input label="Nombre" placeholder="Ej. Ana" hint="Tu nombre" required></df-input>');
    expect(el.shadowRoot.querySelector('label .text').textContent).toBe('Nombre');
    expect(el.shadowRoot.querySelector('.req').hidden).toBe(false);
    expect(field(el).placeholder).toBe('Ej. Ana');
    expect(msg(el)).toBe('Tu nombre');
  });

  it('value se puede leer y escribir', () => {
    const el = mount('<df-input value="inicial"></df-input>');
    expect(el.value).toBe('inicial');
    el.value = 'nuevo';
    expect(field(el).value).toBe('nuevo');
    type(field(el), 'escrito');
    expect(el.value).toBe('escrito');
  });

  it('type="textarea" crea un textarea con las filas indicadas', () => {
    const el = mount('<df-input type="textarea" rows="5"></df-input>');
    expect(field(el).tagName).toBe('TEXTAREA');
    expect(field(el).getAttribute('rows')).toBe('5');
  });

  it('cambiar el tipo conserva lo escrito', () => {
    const el = mount('<df-input></df-input>');
    type(field(el), 'secreto');
    el.type = 'password';
    expect(field(el).type).toBe('password');
    expect(el.value).toBe('secreto');
  });

  it('lanza df-input al escribir', () => {
    const el = mount('<df-input name="nombre"></df-input>');
    const handler = vi.fn();
    el.addEventListener('df-input', handler);
    type(field(el), 'Ana');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({ value: 'Ana', name: 'nombre' });
  });

  it('lanza df-change (con validación) al confirmar el cambio', () => {
    const el = mount('<df-input type="email"></df-input>');
    const handler = vi.fn();
    el.addEventListener('df-change', handler);
    field(el).value = 'mal';
    field(el).dispatchEvent(new Event('change'));
    expect(handler.mock.calls[0][0].detail.valid).toBe(false);
    expect(el.invalid).toBe(true);
  });

  it('lanza df-enter al pulsar Enter', () => {
    const el = mount('<df-input></df-input>');
    const handler = vi.fn();
    el.addEventListener('df-enter', handler);
    type(field(el), 'hola');
    press('Enter', field(el));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail.value).toBe('hola');
  });

  it('validate(): obligatorio vacío muestra error y lanza df-invalid', () => {
    const el = mount('<df-input required name="nombre"></df-input>');
    const handler = vi.fn();
    el.addEventListener('df-invalid', handler);
    expect(el.validate()).toBe(false);
    expect(el.invalid).toBe(true);
    expect(el.hasAttribute('invalid')).toBe(true);
    expect(msg(el)).toBe('Este campo es obligatorio');
    expect(field(el).getAttribute('aria-invalid')).toBe('true');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('el error desaparece en cuanto el valor es correcto', () => {
    const el = mount('<df-input required hint="Ayuda"></df-input>');
    el.validate();
    type(field(el), 'ya escrito');
    expect(el.invalid).toBe(false);
    expect(msg(el)).toBe('Ayuda');
  });

  it('checkValidity() no muestra nada', () => {
    const el = mount('<df-input required></df-input>');
    expect(el.checkValidity()).toBe(false);
    expect(el.invalid).toBe(false);
  });

  it('clear() vacía y quita el error', () => {
    const el = mount('<df-input required value="x"></df-input>');
    el.value = '';
    el.validate();
    el.value = 'algo';
    el.clear();
    expect(el.value).toBe('');
    expect(el.invalid).toBe(false);
  });

  it('disabled desactiva el campo interno', () => {
    const el = mount('<df-input disabled></df-input>');
    expect(field(el).disabled).toBe(true);
  });

  it('DfInput.validateAll y DfInput.collect trabajan con un formulario completo', () => {
    const form = mount(`
      <form>
        <df-input name="nombre" required></df-input>
        <df-input name="email" type="email"></df-input>
      </form>`);
    const [nombre, email] = form.querySelectorAll('df-input');
    expect(DfInput.validateAll(form)).toBe(false);
    nombre.value = 'Ana';
    email.value = 'ana@ejemplo.com';
    expect(DfInput.validateAll(form)).toBe(true);
    expect(DfInput.collect(form)).toEqual({ nombre: 'Ana', email: 'ana@ejemplo.com' });
  });
});
