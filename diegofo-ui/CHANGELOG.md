# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [versionado semántico](https://semver.org/lang/es/).

## [2.0.0] · 2026-11-02

### Añadido
- 7 componentes nuevos: `df-select`, `df-switch`, `df-tooltip`, `df-progress`, `df-data-table`, `df-avatar` y `df-tabs` (con `df-tab-panel`).
- `DfModal.prompt()` admite campos `select` y `switch`.
- `DfInput.validateAll()` y `DfInput.collect()` incluyen `df-select` y `df-switch`.
- Tipos de TypeScript (`types/diegofo-ui.d.ts`) con autocompletado de etiquetas, propiedades y eventos.
- Web de documentación con portada, guías, una página por componente y banco de pruebas.
- Integración continua y despliegue en GitHub Pages con GitHub Actions.

### Mejorado
- `df-modal`: el foco queda atrapado dentro, vuelve al elemento que lo abrió, se bloquea el scroll de la página y Escape solo cierra el modal de arriba.
- La referencia `docs/COMPONENTES.md` y los tipos se generan a partir del código, así no se desincronizan.

## [1.0.0] · 2026-11-02

### Añadido
- Clase base `DfElement`: Shadow DOM, propiedades declarativas con tipo y valor por defecto, eventos `df-*`.
- Componentes `df-button`, `df-input`, `df-modal`, `df-toast-stack`, `df-stat-card`, `df-theme-toggle` y `df-badge`.
- Pruebas con Vitest + jsdom, empaquetado con esbuild y `npm pack`.
