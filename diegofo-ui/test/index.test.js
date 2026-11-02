import { describe, it, expect } from 'vitest';
import * as lib from '../src/index.js';

describe('punto de entrada (index.js)', () => {
  it('registra todas las etiquetas de TAGS', () => {
    expect(lib.TAGS).toHaveLength(15);
    for (const tag of lib.TAGS) expect(customElements.get(tag)).toBeDefined();
  });

  it('exporta las clases y utilidades públicas', () => {
    for (const nombre of ['DfButton', 'DfInput', 'DfSelect', 'DfSwitch', 'DfModal', 'DfToastStack', 'DfTooltip',
      'DfProgress', 'DfDataTable', 'DfStatCard', 'DfBadge', 'DfAvatar', 'DfTabs', 'DfTabPanel', 'DfThemeToggle']) {
      expect(typeof lib[nombre]).toBe('function');
    }
    for (const fn of ['validateValue', 'formatValue', 'queryRows', 'initials', 'colorFor', 'escapeHtml']) {
      expect(typeof lib[fn]).toBe('function');
    }
    expect(lib.VERSION).toBe('2.0.0');
  });
});
