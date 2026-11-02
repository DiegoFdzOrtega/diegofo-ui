/**
 * diegofo-ui · Librería de componentes visuales (Web Components).
 *
 * Importar este archivo registra todas las etiquetas `<df-*>`.
 *
 * @module diegofo-ui
 */
export { DfElement, escapeHtml, toKebab, fromAttribute } from './core/df-element.js';

// Acciones y formularios
export { DfButton } from './components/df-button.js';
export { DfInput, validateValue } from './components/df-input.js';
export { DfSelect } from './components/df-select.js';
export { DfSwitch } from './components/df-switch.js';

// Superposiciones y feedback
export { DfModal } from './components/df-modal.js';
export { DfToastStack } from './components/df-toast-stack.js';
export { DfTooltip } from './components/df-tooltip.js';
export { DfProgress } from './components/df-progress.js';

// Datos y presentación
export { DfDataTable, queryRows } from './components/df-data-table.js';
export { DfStatCard, formatValue } from './components/df-stat-card.js';
export { DfBadge, BADGE_COLORS } from './components/df-badge.js';
export { DfAvatar, initials, colorFor } from './components/df-avatar.js';

// Estructura
export { DfTabs, DfTabPanel } from './components/df-tabs.js';
export { DfThemeToggle } from './components/df-theme-toggle.js';

/** Versión de la librería. */
export const VERSION = '2.0.0';

/** Etiquetas que registra la librería. */
export const TAGS = [
  'df-button', 'df-input', 'df-select', 'df-switch',
  'df-modal', 'df-toast-stack', 'df-tooltip', 'df-progress',
  'df-data-table', 'df-stat-card', 'df-badge', 'df-avatar',
  'df-tabs', 'df-tab-panel', 'df-theme-toggle',
];
