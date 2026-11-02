import { describe, it, expect, afterEach, vi } from 'vitest';
import '../src/components/df-button.js';
import { mount, cleanup } from './helpers.js';

afterEach(cleanup);

const inner = (el) => el.shadowRoot.querySelector('button');

describe('<df-button>', () => {
  it('se registra como elemento personalizado', () => {
    expect(customElements.get('df-button')).toBeDefined();
  });

  it('tiene los valores por defecto', () => {
    const el = mount('<df-button>Guardar</df-button>');
    expect(el.variant).toBe('primary');
    expect(el.size).toBe('md');
    expect(el.shape).toBe('tab');
    expect(el.type).toBe('button');
    expect(el.disabled).toBe(false);
    expect(el.loading).toBe(false);
    expect(inner(el).className).toBe('variant-primary size-md shape-tab');
  });

  it('muestra el contenido del slot', () => {
    const el = mount('<df-button>Guardar</df-button>');
    expect(el.shadowRoot.querySelector('slot')).not.toBeNull();
    expect(el.textContent).toBe('Guardar');
  });

  it('cambia las clases internas al cambiar variant, size y shape', () => {
    const el = mount('<df-button></df-button>');
    el.variant = 'danger';
    el.size = 'sm';
    el.shape = 'pill';
    expect(inner(el).className).toBe('variant-danger size-sm shape-pill');
  });

  it('lanza df-click al pulsar', () => {
    const el = mount('<df-button variant="success">OK</df-button>');
    const handler = vi.fn();
    el.addEventListener('df-click', handler);
    el.click();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].detail).toEqual({ variant: 'success' });
  });

  it('desactivado: no lanza df-click ni click', () => {
    const el = mount('<df-button disabled>OK</df-button>');
    const dfClick = vi.fn();
    const click = vi.fn();
    el.addEventListener('df-click', dfClick);
    el.addEventListener('click', click);
    el.click();
    expect(dfClick).not.toHaveBeenCalled();
    expect(click).not.toHaveBeenCalled();
    expect(inner(el).disabled).toBe(true);
  });

  it('loading: muestra el spinner, marca aria-busy y bloquea clics', () => {
    const el = mount('<df-button>OK</df-button>');
    const handler = vi.fn();
    el.addEventListener('df-click', handler);
    el.loading = true;
    expect(el.shadowRoot.querySelector('.spinner').hidden).toBe(false);
    expect(inner(el).getAttribute('aria-busy')).toBe('true');
    el.click();
    expect(handler).not.toHaveBeenCalled();
    el.loading = false;
    expect(el.shadowRoot.querySelector('.spinner').hidden).toBe(true);
  });

  it('type="submit" envía el formulario que lo contiene', () => {
    const form = mount('<form><df-button type="submit">Enviar</df-button></form>');
    const onSubmit = vi.fn((e) => e.preventDefault());
    form.addEventListener('submit', onSubmit);
    form.querySelector('df-button').click();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('type="button" (por defecto) NO envía el formulario', () => {
    const form = mount('<form><df-button>Nada</df-button></form>');
    const onSubmit = vi.fn((e) => e.preventDefault());
    form.addEventListener('submit', onSubmit);
    form.querySelector('df-button').click();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('type="reset" resetea el formulario', () => {
    const form = mount('<form><input value="a"><df-button type="reset">Reset</df-button></form>');
    const input = form.querySelector('input');
    input.value = 'cambiado';
    form.querySelector('df-button').click();
    expect(input.value).toBe('a');
  });
});
