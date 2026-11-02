# diegofo · Workstation

Aplicación de ejemplo construida con la librería **diegofo-ui** (carpeta `../diegofo-ui`): CRM de clientes, inventario, tablero Kanban, agenda semanal y asistente de IA local.

## Cómo abrirla

Doble clic en `index.html` (o Live Server). No necesita instalar nada: usa el paquete ya generado `lib/diegofo-ui.min.js`.

Si cambias algo de la librería, ejecuta `npm run build` dentro de `../diegofo-ui` y el `.min.js` se copia aquí automáticamente.

## Dónde ver la librería

Al abrir la app sale la pestaña **Librería** (la primera del submenú). Ahí están los componentes funcionando en vivo, con el código para usar cada uno, y un botón que abre la documentación completa (`../diegofo-ui/docs/index.html`).

## Qué componentes usa y dónde

| Componente | Dónde se usa en la app |
|---|---|
| `<df-data-table>` | Directorio de clientes e inventario de productos: orden por columnas, búsqueda sin tildes y paginación |
| `<df-input>` | Formulario de clientes (nombre obligatorio de mín. 3 letras, correo validado, fecha, notas) y URL / API key de los ajustes de IA |
| `<df-select>` | Tipo de perfil, proveedor y modelo de IA, posición de los toasts |
| `<df-switch>` | "Registro activo" del formulario |
| `<df-button>` | Todos los botones, incluidos los de enviar y resetear el formulario |
| `<df-modal>` | Confirmación al eliminar y al restablecer datos (`DfModal.confirm`), formularios de nueva tarjeta y nuevo producto (`DfModal.prompt`) |
| `<df-toast-stack>` | Todas las notificaciones (`app.showToast`) |
| `<df-tooltip>` | Botones de la barra superior, exportar CSV y avisos de stock bajo |
| `<df-progress>` | Porcentaje de tarjetas completadas en el Kanban |
| `<df-stat-card>` | Métricas de productos (la de alertas es interactiva) |
| `<df-badge>` | Tipo y estado de clientes, agenda, etiquetas del Kanban, categorías |
| `<df-avatar>` | Perfil de la barra superior y equipo en la vista Librería |
| `<df-tabs>` | Vista Librería |
| `<df-theme-toggle>` | Tema claro / oscuro, sincronizado entre la barra y la vista Librería |

## Detalles de implementación

- Sin `prompt()`, `confirm()` ni `alert()` del navegador: todo pasa por `df-modal` y `df-toast-stack`.
- Los formularios validan antes de guardar y marcan en rojo el campo con error.
- Los datos que escribe el usuario se escapan antes de pintarlos en las tablas.
- Los datos (clientes, tarjetas, productos, tema y ajustes) se guardan en `localStorage` y se pueden exportar e importar en JSON.
