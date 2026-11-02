import { describe, it, expect, afterEach } from 'vitest';
import { BADGE_COLORS } from '../src/components/df-badge.js';
import { mount, cleanup } from './helpers.js';

afterEach(cleanup);

const badge = (el) => el.shadowRoot.querySelector('.badge');

describe('<df-badge>', () => {
  it('tiene los valores por defecto', () => {
    const el = mount('<df-badge>Hola</df-badge>');
    expect(el.color).toBe('teal');
    expect(el.variant).toBe('solid');
    expect(el.size).toBe('md');
    expect(el.dot).toBe(false);
    expect(badge(el).className).toBe('badge variant-solid size-md');
  });

  it('los colores de la paleta usan las variables de diegofo-ui', () => {
    const el = mount('<df-badge color="blue"></df-badge>');
    expect(el.cssColor).toBe('var(--df-blue)');
    expect(badge(el).style.getPropertyValue('--_c')).toBe('var(--df-blue)');
    expect(BADGE_COLORS).toContain('magenta');
  });

  it('acepta cualquier color CSS', () => {
    const el = mount('<df-badge color="#2563eb"></df-badge>');
    expect(el.cssColor).toBe('#2563eb');
  });

  it('gray usa el color de texto secundario', () => {
    const el = mount('<df-badge color="gray"></df-badge>');
    expect(el.cssColor).toBe('var(--df-text-muted)');
  });

  it('variant, size y dot cambian el aspecto', () => {
    const el = mount('<df-badge></df-badge>');
    el.variant = 'soft';
    el.size = 'sm';
    el.dot = true;
    expect(badge(el).className).toBe('badge variant-soft size-sm');
    expect(el.shadowRoot.querySelector('.dot').hidden).toBe(false);
  });
});
