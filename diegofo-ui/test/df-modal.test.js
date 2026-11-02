import { describe, it, expect, afterEach, vi } from 'vitest';
import { DfModal } from '../src/components/df-modal.js';
import '../src/components/df-switch.js';
import { mount, cleanup, tick, press } from './helpers.js';

afterEach(cleanup);

const $ = (el, sel) => el.shadowRoot.querySelector(sel);

describe('<df-modal>', () => {
  it('tiene los valores por defecto y empieza cerrado', () => {
    const el = mount('<df-modal></df-modal>');
    expect(el.open).toBe(false);
    expect(el.heading).toBe('Diálogo');
    expect(el.confirmText).toBe('Aceptar');
    expect(el.cancelText).toBe('Cancelar');
    expect(el.variant).toBe('primary');
    expect(el.persistent).toBe(false);
  });

  it('pinta título y textos de los botones', () => {
    const el = mount('<df-modal heading="Borrar" confirm-text="Sí" cancel-text="No" variant="danger"></df-modal>');
    expect($(el, '#titulo').textContent).toBe('Borrar');
    expect($(el, '.confirm').textContent).toBe('Sí');
    expect($(el, '.confirm').variant).toBe('danger');
    expect($(el, '.cancel').textContent).toBe('No');
  });

  it('hide-cancel oculta el botón Cancelar', () => {
    const el = mount('<df-modal hide-cancel></df-modal>');
    expect($(el, '.cancel').hidden).toBe(true);
  });

  it('show() abre y lanza df-open; close() cierra y lanza df-close', () => {
    const el = mount('<df-modal></df-modal>');
    const onOpen = vi.fn();
    const onClose = vi.fn();
    el.addEventListener('df-open', onOpen);
    el.addEventListener('df-close', onClose);
    el.show();
    expect(el.open).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(1);
    el.close();
    expect(el.open).toBe(false);
    expect(onClose.mock.calls[0][0].detail).toEqual({ reason: 'method' });
  });

  it('toggle() alterna', () => {
    const el = mount('<df-modal></df-modal>');
    el.toggle();
    expect(el.open).toBe(true);
    el.toggle();
    expect(el.open).toBe(false);
  });

  it('Aceptar lanza df-confirm y cierra con reason "confirm"', () => {
    const el = mount('<df-modal open></df-modal>');
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    el.addEventListener('df-confirm', onConfirm);
    el.addEventListener('df-close', onClose);
    $(el, '.confirm').click();
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(el.open).toBe(false);
    expect(onClose.mock.calls[0][0].detail.reason).toBe('confirm');
  });

  it('si se cancela df-confirm con preventDefault, el modal sigue abierto', () => {
    const el = mount('<df-modal open></df-modal>');
    el.addEventListener('df-confirm', (e) => e.preventDefault());
    el.confirm();
    expect(el.open).toBe(true);
  });

  it('Cancelar y la X lanzan df-cancel y cierran', () => {
    const el = mount('<df-modal open></df-modal>');
    const onCancel = vi.fn();
    el.addEventListener('df-cancel', onCancel);
    $(el, '.cancel').click();
    expect(el.open).toBe(false);
    el.show();
    $(el, '.close').click();
    expect(el.open).toBe(false);
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it('Escape cierra el modal', () => {
    const el = mount('<df-modal></df-modal>');
    el.show();
    press('Escape');
    expect(el.open).toBe(false);
  });

  it('persistent: Escape y el fondo no lo cierran', () => {
    const el = mount('<df-modal persistent></df-modal>');
    el.show();
    press('Escape');
    $(el, '.overlay').click();
    expect(el.open).toBe(true);
  });

  it('pulsar en el fondo (fuera de la caja) cierra', () => {
    const el = mount('<df-modal open></df-modal>');
    $(el, '.overlay').click();
    expect(el.open).toBe(false);
  });

  it('pulsar dentro de la caja NO cierra', () => {
    const el = mount('<df-modal open></df-modal>');
    $(el, '.box').click();
    expect(el.open).toBe(true);
  });

  it('DfModal.confirm() resuelve true al aceptar y elimina el modal', async () => {
    const promesa = DfModal.confirm({ message: '¿Seguro?' });
    const modal = document.querySelector('df-modal');
    expect(modal.open).toBe(true);
    expect(modal.textContent).toContain('¿Seguro?');
    modal.confirm();
    expect(await promesa).toBe(true);
    expect(document.querySelector('df-modal')).toBeNull();
  });

  it('DfModal.confirm() resuelve false al cancelar', async () => {
    const promesa = DfModal.confirm({});
    document.querySelector('df-modal').cancel();
    expect(await promesa).toBe(false);
  });

  it('DfModal.prompt() valida los campos obligatorios y devuelve los valores', async () => {
    const promesa = DfModal.prompt({
      heading: 'Nuevo',
      fields: [
        { name: 'titulo', label: 'Título', required: true },
        { name: 'tag', label: 'Etiqueta', value: 'Tarea' },
      ],
    });
    const modal = document.querySelector('df-modal');
    const [titulo] = modal.querySelectorAll('df-input');

    modal.confirm(); // título vacío → no se cierra
    expect(modal.open).toBe(true);
    expect(titulo.invalid).toBe(true);

    titulo.value = 'Revisar SEO';
    modal.confirm();
    expect(await promesa).toEqual({ titulo: 'Revisar SEO', tag: 'Tarea' });
  });

  it('DfModal.prompt() devuelve null al cancelar', async () => {
    const promesa = DfModal.prompt({ fields: [{ name: 'a' }] });
    document.querySelector('df-modal').cancel();
    expect(await promesa).toBeNull();
    await tick();
  });

  it('DfModal.prompt() admite campos select y switch', async () => {
    const promesa = DfModal.prompt({
      fields: [
        { name: 'tipo', label: 'Tipo', type: 'select', options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], value: 'b' },
        { name: 'activo', label: 'Activo', type: 'switch', value: true },
      ],
    });
    const modal = document.querySelector('df-modal');
    expect(modal.querySelector('df-select').value).toBe('b');
    modal.confirm();
    expect(await promesa).toEqual({ tipo: 'b', activo: true });
  });
});

describe('<df-modal> · accesibilidad', () => {
  it('bloquea el scroll de la página mientras está abierto', () => {
    const el = mount('<df-modal></df-modal>');
    el.show();
    expect(document.body.style.overflow).toBe('hidden');
    el.close();
    expect(document.body.style.overflow).toBe('');
  });

  it('devuelve el foco al elemento que lo abrió', () => {
    const btn = mount('<button id="abrir">Abrir</button>');
    const el = mount('<df-modal></df-modal>');
    btn.focus();
    el.show();
    el.close();
    expect(document.activeElement).toBe(btn);
  });

  it('Tab desde el último elemento vuelve al primero (foco atrapado)', async () => {
    const el = mount('<df-modal><input id="campo"></df-modal>');
    el.show();
    await tick();
    const items = el._focusables();
    expect(items[0]).toBe(el.shadowRoot.querySelector('.close'));
    expect(items[1].id).toBe('campo');
    items[items.length - 1].focus();
    const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, composed: true, cancelable: true });
    items[items.length - 1].dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  });

  it('con varios modales abiertos, Escape solo cierra el de arriba', () => {
    const a = mount('<df-modal></df-modal>');
    const b = mount('<df-modal></df-modal>');
    a.show();
    b.show();
    press('Escape');
    expect(b.open).toBe(false);
    expect(a.open).toBe(true);
    a.close();
  });
});

