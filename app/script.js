/**
 * diegofo | UI Studio Workstation Pro · versión RA3
 * La misma app del RA2, pero usando la librería de componentes propia diegofo-ui
 * (df-button, df-input, df-modal, df-toast-stack, df-stat-card, df-theme-toggle, df-badge).
 */

// Clases de la librería (lib/diegofo-ui.min.js las expone en window.DiegofoUI)
const { DfModal, DfInput, escapeHtml, VERSION } = window.DiegofoUI;

const app = {
  STORAGE_KEY: 'diegofo_ui_ra3_data',

  // Horario extraído de tu captura lectiva de DAM 2
  scheduleData: [
    { hora: '12:00 - 12:30', lunes: '-', martes: '-', miercoles: '-', jueves: 'Acceso a Datos', viernes: '-' },
    { hora: '12:30 - 13:30', lunes: 'Desarrollo de Interfaces', martes: '-', miercoles: '-', jueves: 'Acceso a Datos', viernes: '-' },
    { hora: '13:30 - 14:00', lunes: 'Proyecto intermodular II', martes: '-', miercoles: '-', jueves: 'Acceso a Datos', viernes: '-' },
    { hora: '14:00 - 14:30', lunes: 'Proyecto intermodular II', martes: '-', miercoles: '-', jueves: 'Sistemas de Gestión Emp.', viernes: '-' },
    { hora: '14:30 - 15:00', lunes: 'Programación Multimedia', martes: '-', miercoles: '-', jueves: 'Sistemas de Gestión Emp.', viernes: '-' },
    { hora: '15:00 - 16:00', lunes: 'Programación Multimedia', martes: '-', miercoles: '-', jueves: 'Sistemas de Gestión Emp.', viernes: 'Desarrollo de Interfaces' },
    { hora: '16:00 - 16:30', lunes: 'Programación Multimedia', martes: '-', miercoles: '-', jueves: 'Sistemas de Gestión Emp.', viernes: 'Desarrollo de Interfaces' },
    { hora: '16:30 - 17:00', lunes: 'Programación de Servicios', martes: '-', miercoles: '-', jueves: '-', viernes: 'Desarrollo de Interfaces' },
    { hora: '17:00 - 17:30', lunes: 'Programación de Servicios', martes: '-', miercoles: '-', jueves: 'Inglés II', viernes: '-' },
    { hora: '17:30 - 18:00', lunes: '-', martes: '-', miercoles: '-', jueves: 'Inglés II', viernes: '-' },
    { hora: '18:00 - 19:00', lunes: '-', martes: '-', miercoles: 'IPE II', jueves: '-', viernes: '-' },
    { hora: '19:00 - 20:00', lunes: '-', martes: '-', miercoles: 'Digitalización', jueves: '-', viernes: '-' },
    { hora: '20:00 - 21:00', lunes: '-', martes: '-', miercoles: 'Sostenibilidad', jueves: '-', viernes: '-' }
  ],

  state: {
    theme: 'light',
    aiProvider: 'ollama',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'qwen2.5-coder:7b',
    apiKey: '',
    activeView: 'libreria',
    clients: [
      { id: 101, nombre: 'Ana Gómez', email: 'ana@ejemplo.com', tipo: 'Cliente', fecha: '2026-03-12', activo: true },
      { id: 102, nombre: 'Sodire Tech', email: 'contacto@sodire.es', tipo: 'Proveedor', fecha: '2026-04-01', activo: true },
      { id: 103, nombre: 'Marcos Alonso', email: 'marcos@alumnos.es', tipo: 'Alumno', fecha: '2026-04-10', activo: false }
    ],
    kanban: [
      { id: 'k1', title: 'Revisión SEO Sodire', desc: 'Optimización de meta etiquetas y palabras clave', status: 'backlog', tag: 'SEO' },
      { id: 'k2', title: 'Módulo Formulario DAM', desc: 'Validaciones de campos en Vanilla JS', status: 'in_progress', tag: 'Dev' },
      { id: 'k3', title: 'Diseño diegofo-ui', desc: 'Librería visual con pestañas recortadas', status: 'done', tag: 'UI/UX' }
    ],
    products: [
      { id: 'p1', nombre: 'Licencia Software Sodire CRM', categoria: 'SaaS', precio: 299, stock: 15 },
      { id: 'p2', nombre: 'Módulo Inteligencia Artificial', categoria: 'Plugin', precio: 120, stock: 4 }
    ]
  },

  init() {
    this.loadState();
    this.initIcons();
    this.initNavigation();
    this.initForm();
    this.initClientsTable();
    this.renderSchedule();
    this.initKanban();
    this.initProducts();
    this.initCommandPalette();
    this.initAISettings();
    this.initAssistant();
    this.initTheme();
    this.initModals();
    this.initToastDemo();
    this.initLibraryView();
    this.updateBadges();
  },

  saveState() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    this.updateBadges();
  },

  loadState() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.state = { ...this.state, ...parsed };
      } catch (e) {
        console.error('Error al cargar datos:', e);
      }
    }
  },

  initIcons() {
    if (window.lucide) lucide.createIcons();
  },

  initNavigation() {
    const primaryBtns = document.querySelectorAll('#nav-primary .tab-btn');
    const secondaryBtns = document.querySelectorAll('#nav-secondary .tab-btn');

    primaryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        primaryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetModule = btn.dataset.module;
        this.switchView(targetModule === 'clientes' ? 'formulario' : targetModule);
      });
    });

    secondaryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        secondaryBtns.forEach(b => b.classList.remove('active-sub'));
        btn.classList.add('active-sub');
        this.switchView(btn.dataset.view);
      });
    });

    if (this.state.activeView) {
      this.switchView(this.state.activeView);
    }
  },

  switchView(viewId) {
    this.state.activeView = viewId;
    // Resalta en el submenú la pestaña de la vista actual (también al cambiar desde código o Ctrl+K).
    document.querySelectorAll('#nav-secondary .tab-btn').forEach(b => {
      b.classList.toggle('active-sub', b.dataset.view === viewId);
    });
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active-view'));
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.add('active-view');
    }
    if (viewId === 'horario') {
      this.renderSchedule();
    }
    this.saveState();
  },

  updateBadges() {
    const clientsBadge = document.getElementById('badge-clients-count');
    const kanbanBadge = document.getElementById('badge-kanban-count');
    const productsBadge = document.getElementById('badge-products-count');

    if (clientsBadge) clientsBadge.textContent = this.state.clients.length;
    if (kanbanBadge) kanbanBadge.textContent = this.state.kanban.length;
    if (productsBadge) productsBadge.textContent = this.state.products.length;
  },

  initForm() {
    const mainForm = document.getElementById('main-form');
    const quickActionBtn = document.getElementById('btn-quick-action');

    // Funcionalidad del botón de la barra superior "Nuevo Registro"
    if (quickActionBtn) {
      quickActionBtn.addEventListener('df-click', () => {
        this.switchView('formulario');
        setTimeout(() => document.getElementById('input-nombre').focus(), 100);
      });
    }

    if (!mainForm) return;

    // El <df-button type="submit"> lanza el submit del formulario.
    mainForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validación con los propios df-input (obligatorio, email, longitud mínima...)
      if (!DfInput.validateAll(mainForm)) {
        this.showToast('Revisa los campos marcados en rojo.', 'warning');
        return;
      }

      const datos = DfInput.collect(mainForm); // { nombre, email, fecha, notas }
      const newClient = {
        id: Date.now(),
        nombre: datos.nombre.trim(),
        email: datos.email.trim(),
        tipo: document.getElementById('input-tipo').value,
        fecha: datos.fecha || new Date().toISOString().split('T')[0],
        notas: datos.notas,
        activo: document.getElementById('input-activo').checked
      };

      this.state.clients.unshift(newClient);
      this.saveState();
      this.renderClientsTable();
      this.showToast(`Cliente '${newClient.nombre}' guardado en LocalStorage.`, 'success');
      mainForm.reset();
    });

    // Al resetear, los df-input se vacían y pierden el estado de error.
    mainForm.addEventListener('reset', () => {
      // El evento "reset" llega antes de que el navegador vacíe los campos: restauramos después.
      setTimeout(() => {
        mainForm.querySelectorAll('df-input').forEach((input) => input.clear());
        document.getElementById('input-tipo').value = 'Cliente';
        document.getElementById('input-activo').checked = true;
      });
    });
  },

  initClientsTable() {
    const table = document.getElementById('table-clients');
    // Columnas de la df-data-table: los valores se escapan solos; render permite pintar componentes.
    table.columns = [
      { key: 'nombre', label: 'Nombre', render: (c) => `<strong>${escapeHtml(c.nombre)}</strong>` },
      { key: 'email', label: 'Correo' },
      { key: 'tipo', label: 'Tipo', render: (c) => `<df-badge size="sm" color="${this.getBadgeClass(c.tipo)}">${escapeHtml(c.tipo)}</df-badge>` },
      { key: 'fecha', label: 'Alta', type: 'date' },
      { key: 'activo', label: 'Estado', render: (c) => c.activo
        ? '<df-badge size="sm" color="green" variant="soft" dot>Activo</df-badge>'
        : '<df-badge size="sm" color="red" variant="soft" dot>Inactivo</df-badge>' },
      { key: 'acciones', label: '', sortable: false, align: 'right', render: (c) => {
        const btn = document.createElement('df-button');
        btn.size = 'sm';
        btn.variant = 'ghost';
        btn.shape = 'rounded';
        btn.textContent = 'Eliminar';
        btn.addEventListener('df-click', () => this.deleteClient(c.id));
        return btn;
      } }
    ];

    const btnExportCSV = document.getElementById('btn-export-csv');
    if (btnExportCSV) btnExportCSV.addEventListener('df-click', () => this.exportCSV());

    this.renderClientsTable();
  },

  renderClientsTable() {
    document.getElementById('table-clients').rows = [...this.state.clients];
  },

  getBadgeClass(tipo) {
    if (tipo === 'Cliente') return 'blue';
    if (tipo === 'Proveedor') return 'green';
    return 'orange';
  },

  async deleteClient(id) {
    const cliente = this.state.clients.find(c => c.id === id);
    const ok = await DfModal.confirm({
      heading: 'Eliminar cliente',
      message: `¿Seguro que quieres eliminar a "${cliente?.nombre}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      variant: 'danger'
    });
    if (!ok) return;
    this.state.clients = this.state.clients.filter(c => c.id !== id);
    this.saveState();
    this.renderClientsTable();
    this.showToast('Cliente eliminado.', 'warning');
  },

  exportCSV() {
    let csv = 'ID,Nombre,Email,Tipo,Fecha,Activo\n';
    this.state.clients.forEach(c => {
      csv += `${c.id},"${c.nombre.replace(/"/g, '""')}","${c.email}",${c.tipo},${c.fecha},${c.activo}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diegofo_clientes_${Date.now()}.csv`;
    a.click();
    this.showToast('CSV exportado.', 'success');
  },

  // Renderizado Garantizado del Horario DAM 2 (con Píldoras Visibles de Colores)
  renderSchedule() {
    const tbody = document.getElementById('schedule-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Cada asignatura es un <df-badge> con el color del día.
    const getPill = (subject, color) => {
      if (!subject || subject === '-') return '<span style="color: #888888;">-</span>';
      return `<df-badge color="${color}">${escapeHtml(subject)}</df-badge>`;
    };

    this.scheduleData.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="white-space: nowrap;"><strong>${row.hora}</strong></td>
        <td>${getPill(row.lunes, '#2563eb')}</td>
        <td>${getPill(row.martes, '#d97706')}</td>
        <td>${getPill(row.miercoles, '#7c3aed')}</td>
        <td>${getPill(row.jueves, '#059669')}</td>
        <td>${getPill(row.viernes, '#0d9488')}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  initKanban() {
    const btnAdd = document.getElementById('btn-add-kanban-card');
    if (btnAdd) {
      // Antes era prompt(); ahora un DfModal.prompt() con varios campos y validación.
      btnAdd.addEventListener('df-click', async () => {
        const datos = await DfModal.prompt({
          heading: 'Nueva tarjeta',
          confirmText: 'Crear tarjeta',
          fields: [
            { name: 'title', label: 'Título', required: true, placeholder: 'Ej. Revisión SEO' },
            { name: 'desc', label: 'Descripción', type: 'textarea', value: 'Creada desde el CRM' },
            { name: 'tag', label: 'Etiqueta', value: 'Tarea' }
          ]
        });
        if (!datos) return;
        this.state.kanban.push({
          id: 'k' + Date.now(),
          title: datos.title.trim(),
          desc: datos.desc,
          status: 'backlog',
          tag: datos.tag || 'Tarea'
        });
        this.saveState();
        this.renderKanban();
        this.showToast('Tarjeta añadida.', 'success');
      });
    }

    this.renderKanban();
  },

  renderKanban() {
    const cols = ['backlog', 'in_progress', 'done'];
    cols.forEach(colId => {
      const container = document.getElementById(`cards-${colId}`);
      const countEl = document.getElementById(`count-${colId}`);
      if (!container) return;

      container.innerHTML = '';
      const items = this.state.kanban.filter(k => k.status === colId);
      if (countEl) countEl.textContent = items.length;
      // Progreso del tablero: porcentaje de tarjetas en "Completado".
      const progress = document.getElementById('kanban-progress');
      if (progress) {
        progress.max = Math.max(1, this.state.kanban.length);
        progress.value = this.state.kanban.filter(k => k.status === 'done').length;
      }

      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.draggable = true;
        card.dataset.id = item.id;
        card.innerHTML = `
          <div class="kanban-card-title">${escapeHtml(item.title)}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">${escapeHtml(item.desc)}</div>
          <div class="kanban-card-meta">
            <df-badge size="sm" variant="soft" color="${this.getTagColor(item.tag)}">${escapeHtml(item.tag)}</df-badge>
            <a href="#" class="kanban-delete" style="color:var(--accent-red)">Borrar</a>
          </div>
        `;
        card.querySelector('.kanban-delete').addEventListener('click', (e) => {
          e.preventDefault();
          this.deleteKanban(item.id);
        });

        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', item.id);
        });

        container.appendChild(card);
      });

      const colEl = document.getElementById(`col-${colId}`);
      if (colEl && !colEl.dataset.dropReady) {
        colEl.dataset.dropReady = 'true';
        colEl.addEventListener('dragover', (e) => e.preventDefault());
        colEl.addEventListener('drop', (e) => {
          e.preventDefault();
          const cardId = e.dataTransfer.getData('text/plain');
          const cardObj = this.state.kanban.find(k => k.id === cardId);
          if (cardObj && cardObj.status !== colId) {
            cardObj.status = colId;
            this.saveState();
            this.renderKanban();
            this.showToast(`Estado cambiado a ${colId.replace('_', ' ')}`, 'info');
          }
        });
      }
    });
  },

  getTagColor(tag) {
    const colores = { SEO: 'orange', Dev: 'blue', 'UI/UX': 'purple', Tarea: 'teal' };
    return colores[tag] || 'gray';
  },

  deleteKanban(id) {
    this.state.kanban = this.state.kanban.filter(k => k.id !== id);
    this.saveState();
    this.renderKanban();
    this.showToast('Tarjeta eliminada.', 'warning');
  },

  initProducts() {
    const btnAdd = document.getElementById('btn-add-product');
    if (btnAdd) {
      // Antes eran tres prompt() seguidos; ahora un único formulario modal validado.
      btnAdd.addEventListener('df-click', async () => {
        const datos = await DfModal.prompt({
          heading: 'Añadir producto',
          fields: [
            { name: 'nombre', label: 'Nombre del producto', required: true },
            { name: 'categoria', label: 'Categoría', value: 'General' },
            { name: 'precio', label: 'Precio (€)', type: 'number', required: true, placeholder: '0.00' },
            { name: 'stock', label: 'Stock (unidades)', type: 'number', required: true, pattern: '\\d+' }
          ]
        });
        if (!datos) return;
        this.state.products.push({
          id: 'p' + Date.now(),
          nombre: datos.nombre.trim(),
          categoria: datos.categoria || 'General',
          precio: parseFloat(datos.precio),
          stock: parseInt(datos.stock, 10)
        });
        this.saveState();
        this.renderProducts();
        this.showToast('Producto añadido.', 'success');
      });
    }

    // La tarjeta de alertas es interactiva: al pulsarla lanza df-select.
    const lowStockCard = document.getElementById('val-low-stock');
    if (lowStockCard) {
      lowStockCard.addEventListener('df-select', () => {
        const bajos = this.state.products.filter(p => p.stock < 5);
        if (bajos.length === 0) this.showToast('No hay productos con poco stock.', 'success');
        else bajos.forEach(p => this.showToast(`${p.nombre}: quedan ${p.stock} u.`, 'warning'));
      });
    }

    this.renderProducts();
  },

  renderProducts() {
    const table = document.getElementById('products-table');
    if (!table.columns.length) {
      table.columns = [
        { key: 'nombre', label: 'Producto', render: (p) => `<strong>${escapeHtml(p.nombre)}</strong>` },
        { key: 'categoria', label: 'Categoría', render: (p) => `<df-badge size="sm" variant="outline" color="blue">${escapeHtml(p.categoria)}</df-badge>` },
        { key: 'precio', label: 'Precio', type: 'currency' },
        { key: 'stock', label: 'Stock', align: 'right', render: (p) => p.stock < 5
          ? `<df-tooltip text="Quedan menos de 5 unidades"><df-badge size="sm" color="orange">${p.stock} u.</df-badge></df-tooltip>`
          : `${p.stock} u.` },
        { key: 'acciones', label: '', sortable: false, align: 'right', render: (p) => {
          const btn = document.createElement('df-button');
          btn.size = 'sm';
          btn.variant = 'ghost';
          btn.shape = 'rounded';
          btn.textContent = 'Eliminar';
          btn.addEventListener('df-click', () => this.deleteProduct(p.id));
          return btn;
        } }
      ];
    }
    table.rows = [...this.state.products];

    const totalStockVal = this.state.products.reduce((t, p) => t + p.precio * p.stock, 0);
    const totalItems = this.state.products.reduce((t, p) => t + p.stock, 0);
    const lowStockCount = this.state.products.filter(p => p.stock < 5).length;

    // Las df-stat-card formatean solas (moneda / número) según su atributo format.
    const total = document.getElementById('val-total-stock');
    total.value = totalStockVal;
    total.hint = `${this.state.products.length} productos`;
    document.getElementById('val-total-items').value = totalItems;
    const low = document.getElementById('val-low-stock');
    low.value = lowStockCount;
    low.variant = lowStockCount > 0 ? 'warning' : 'success';
  },

  deleteProduct(id) {
    this.state.products = this.state.products.filter(p => p.id !== id);
    this.saveState();
    this.renderProducts();
    this.showToast('Producto eliminado.', 'warning');
  },

  initCommandPalette() {
    const trigger = document.getElementById('cmd-trigger');
    const palette = document.getElementById('cmd-palette');
    const input = document.getElementById('cmd-input');
    const resultsList = document.getElementById('cmd-results-list');

    const commands = [
      { label: 'Ir a Formulario', action: () => this.switchView('formulario') },
      { label: 'Ir a Horario DAM 2', action: () => this.switchView('horario') },
      { label: 'Ir a Directorio de Clientes', action: () => this.switchView('sub-clientes') },
      { label: 'Ir a Tablero Kanban', action: () => this.switchView('seguimiento') },
      { label: 'Ir a Productos & Stock', action: () => this.switchView('productos') },
      { label: 'Ir a Configuración', action: () => this.switchView('config') },
      { label: 'Ir a Librería RA3 (componentes)', action: () => this.switchView('libreria') },
      { label: 'Alternar Tema Claro / Oscuro', action: () => this.toggleTheme() },
      { label: 'Exportar Copia de Seguridad JSON', action: () => this.exportBackup() }
    ];

    const openPalette = () => {
      palette.classList.add('open');
      input.focus();
      renderResults(commands);
    };

    const closePalette = () => palette.classList.remove('open');

    const renderResults = (items) => {
      resultsList.innerHTML = '';
      items.forEach(cmd => {
        const div = document.createElement('div');
        div.className = 'cmd-item';
        div.innerHTML = `<span>${cmd.label}</span> <kbd>Enter</kbd>`;
        div.addEventListener('click', () => {
          cmd.action();
          closePalette();
        });
        resultsList.appendChild(div);
      });
    };

    if (trigger) trigger.addEventListener('click', openPalette);

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        palette.classList.contains('open') ? closePalette() : openPalette();
      }
      if (e.key === 'Escape') closePalette();
    });

    if (input) {
      input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = commands.filter(c => c.label.toLowerCase().includes(query));
        renderResults(filtered);
      });
    }
  },

  initAISettings() {
    const providerSelect = document.getElementById('select-ai-provider');
    const ollamaFields = document.getElementById('provider-ollama-fields');
    const geminiFields = document.getElementById('provider-gemini-fields');
    const ollamaUrlInput = document.getElementById('input-ollama-url');
    const ollamaModelSelect = document.getElementById('select-ollama-model');
    const apiKeyInput = document.getElementById('input-api-key');
    const saveBtn = document.getElementById('btn-save-ai-settings');

    if (providerSelect) {
      providerSelect.value = this.state.aiProvider || 'ollama';
      if (ollamaUrlInput) ollamaUrlInput.value = this.state.ollamaUrl || 'http://localhost:11434';
      if (ollamaModelSelect) ollamaModelSelect.value = this.state.ollamaModel || 'qwen2.5-coder:7b';
      if (apiKeyInput) apiKeyInput.value = this.state.apiKey || '';

      const toggleFields = () => {
        if (providerSelect.value === 'ollama') {
          ollamaFields.style.display = 'block';
          geminiFields.style.display = 'none';
        } else {
          ollamaFields.style.display = 'none';
          geminiFields.style.display = 'block';
        }
      };

      providerSelect.addEventListener('df-change', toggleFields);
      toggleFields();

      if (saveBtn) {
        saveBtn.addEventListener('df-click', () => {
          if (providerSelect.value === 'ollama' && !ollamaUrlInput.validate()) {
            this.showToast('La URL de Ollama no es válida.', 'danger');
            return;
          }
          this.state.aiProvider = providerSelect.value;
          this.state.ollamaUrl = ollamaUrlInput.value.trim();
          this.state.ollamaModel = ollamaModelSelect.value;
          this.state.apiKey = apiKeyInput.value.trim();
          this.saveState();
          this.updateAssistantHeader();
          this.showToast('Ajustes de IA guardados.', 'success');
        });
      }
    }

    this.initBackupSettings();
  },

  updateAssistantHeader() {
    const title = document.getElementById('assistant-header-title');
    if (!title) return;
    if (this.state.aiProvider === 'ollama') {
      title.textContent = `Asistente IA (${this.state.ollamaModel || 'qwen2.5-coder:7b'})`;
    } else {
      title.textContent = 'Asistente IA (Gemini API)';
    }
  },

  initAssistant() {
    const drawer = document.getElementById('assistant-drawer');
    const toggleBtn = document.getElementById('assistant-toggle');
    const closeBtn = document.getElementById('assistant-close');
    const sendBtn = document.getElementById('chat-send-btn');
    const input = document.getElementById('chat-input');
    const history = document.getElementById('chat-history');

    if (toggleBtn) toggleBtn.addEventListener('click', () => drawer.classList.add('open'));
    if (closeBtn) closeBtn.addEventListener('click', () => drawer.classList.remove('open'));

    this.updateAssistantHeader();

    const sendMsg = async () => {
      const userText = input.value.trim();
      if (!userText) return;

      const userDiv = document.createElement('div');
      userDiv.className = 'chat-msg user';
      userDiv.textContent = userText;
      history.appendChild(userDiv);
      input.value = '';

      const botDiv = document.createElement('div');
      botDiv.className = 'chat-msg bot';
      botDiv.textContent = 'Pensando con ' + (this.state.ollamaModel || 'qwen2.5-coder:7b') + '...';
      history.appendChild(botDiv);
      history.scrollTop = history.scrollHeight;

      if (this.state.aiProvider === 'ollama') {
        const ollamaUrl = this.state.ollamaUrl || 'http://localhost:11434';
        const model = this.state.ollamaModel || 'qwen2.5-coder:7b';

        try {
          const res = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: model,
              prompt: `Eres el asistente de diegofo-ui para Diego Fernández. Tienes acceso al horario lectivo de DAM 2. Responde de manera concisa.\n\nUsuario: ${userText}\nAsistente:`,
              stream: false
            })
          });

          if (!res.ok) throw new Error('Servidor Ollama no disponible');

          const data = await res.json();
          const reply = data.response || 'Sin respuesta.';
          botDiv.innerHTML = window.marked ? marked.parse(reply) : reply;

        } catch (e) {
          botDiv.innerHTML = `<span style="color:var(--accent-red)">⚠️ Error al conectar con Ollama en <code>${ollamaUrl}</code>.</span>`;
        }

      } else {
        if (!this.state.apiKey) {
          botDiv.textContent = 'Configura tu API Key de Gemini en Ajustes.';
          return;
        }

        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.state.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: userText }] }] })
          });
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta.';
          botDiv.innerHTML = window.marked ? marked.parse(reply) : reply;
        } catch (err) {
          botDiv.textContent = 'Error al consultar Gemini API.';
        }
      }

      history.scrollTop = history.scrollHeight;
    };

    if (sendBtn) sendBtn.addEventListener('click', sendMsg);
    if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMsg(); });
  },

  initBackupSettings() {
    const btnExport = document.getElementById('btn-backup-export');
    const btnExportNav = document.getElementById('btn-export-all');
    const btnReset = document.getElementById('btn-reset-data');
    const importInput = document.getElementById('input-import-file');

    if (btnExport) btnExport.addEventListener('df-click', () => this.exportBackup());
    if (btnExportNav) btnExportNav.addEventListener('click', () => this.exportBackup());

    if (btnReset) {
      btnReset.addEventListener('df-click', async () => {
        const ok = await DfModal.confirm({
          heading: 'Restablecer datos',
          message: 'Se borrarán todos los clientes, tarjetas y productos guardados. ¿Continuar?',
          confirmText: 'Borrar todo',
          variant: 'danger'
        });
        if (ok) {
          localStorage.removeItem(this.STORAGE_KEY);
          location.reload();
        }
      });
    }

    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              this.state = JSON.parse(event.target.result);
              this.saveState();
              location.reload();
            } catch (err) {
              this.showToast('Archivo JSON no válido.', 'danger');
            }
          };
          reader.readAsText(file);
        }
      });
    }
  },

  exportBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `diegofo_ui_backup_${Date.now()}.json`);
    dlAnchor.click();
    this.showToast('Backup JSON descargado.', 'success');
  },

  initTheme() {
    // Hay dos interruptores (barra superior y vista Librería): se mantienen sincronizados.
    const toggles = document.querySelectorAll('df-theme-toggle');
    // Al asignar la propiedad, el componente aplica data-theme al <body>.
    toggles.forEach(t => { t.theme = this.state.theme || 'light'; });
    // df-theme-change solo se lanza cuando el usuario lo cambia (asignar theme por código no lo lanza).
    toggles.forEach(t => t.addEventListener('df-theme-change', (e) => {
      this.state.theme = e.detail.theme;
      toggles.forEach(otro => { if (otro !== t) otro.theme = e.detail.theme; });
      this.saveState();
    }));
  },

  toggleTheme() {
    document.getElementById('theme-toggle').toggle();
  },

  initModals() {
    const modal = document.getElementById('modal-demo');

    document.getElementById('btn-open-modal-demo').addEventListener('df-click', () => modal.show());
    modal.addEventListener('df-confirm', () => this.showToast('Has pulsado Aceptar.', 'success'));
    modal.addEventListener('df-cancel', () => this.showToast('Diálogo cancelado.', 'info'));

    document.getElementById('btn-confirm-demo').addEventListener('df-click', async () => {
      const ok = await DfModal.confirm({ heading: 'Pregunta', message: '¿Te gusta la librería diegofo-ui?' });
      this.showToast(ok ? '¡Gracias! 🎉' : 'Vaya… la mejoraremos.', ok ? 'success' : 'warning');
    });

    document.getElementById('btn-prompt-demo').addEventListener('df-click', async () => {
      const datos = await DfModal.prompt({
        heading: 'Datos de contacto',
        message: 'Ejemplo de formulario rápido con validación.',
        fields: [
          { name: 'nombre', label: 'Nombre', required: true },
          { name: 'email', label: 'Correo', type: 'email', required: true }
        ]
      });
      if (datos) this.showToast(`Hola ${datos.nombre} (${datos.email})`, 'success');
    });
  },

  initToastDemo() {
    const stack = document.getElementById('toasts');
    document.querySelectorAll('#toast-demo df-button').forEach((btn) => {
      btn.addEventListener('df-click', () => this.showToast(btn.dataset.msg, btn.dataset.type));
    });
    const posSelect = document.getElementById('toast-position');
    posSelect.addEventListener('df-change', (e) => {
      stack.position = e.detail.value;
      this.showToast(`Ahora los toasts salen en: ${e.detail.label}`, 'info');
    });
  },

  // Vista "Librería RA3": demos en vivo de cada componente.
  initLibraryView() {
    document.getElementById('lib-version').textContent = 'v' + VERSION;

    const loadingBtn = document.getElementById('lib-loading-btn');
    loadingBtn.addEventListener('df-click', () => {
      loadingBtn.loading = true;
      setTimeout(() => { loadingBtn.loading = false; this.showToast('Carga terminada.', 'success'); }, 1500);
    });

    const input = document.getElementById('lib-input');
    document.getElementById('lib-validate-btn').addEventListener('df-click', () => {
      const ok = input.validate();
      this.showToast(ok ? `Correo válido: ${input.value}` : 'El correo no es válido.', ok ? 'success' : 'danger');
    });

    document.getElementById('lib-modal-btn').addEventListener('df-click', () => document.getElementById('modal-demo').show());
    document.getElementById('lib-confirm-btn').addEventListener('df-click', async () => {
      const ok = await DfModal.confirm({ heading: 'Confirmar', message: '¿Aceptas el reto del RA3?', variant: 'danger' });
      this.showToast(`DfModal.confirm() → ${ok}`, ok ? 'success' : 'warning');
    });
    document.getElementById('lib-prompt-btn').addEventListener('df-click', async () => {
      const datos = await DfModal.prompt({
        heading: 'Prueba de prompt',
        fields: [{ name: 'nombre', label: 'Tu nombre', required: true }, { name: 'edad', label: 'Nota que esperas', type: 'number' }]
      });
      this.showToast(datos ? `DfModal.prompt() → ${JSON.stringify(datos)}` : 'Cancelado', datos ? 'success' : 'info');
    });

    const textos = { success: '¡Operación realizada con éxito!', info: 'Esto es una notificación informativa.', warning: 'Cuidado: revisa los datos.', danger: 'Error al conectar con el servidor.' };
    document.querySelectorAll('[data-lib-toast]').forEach(btn => {
      btn.addEventListener('df-click', () => this.showToast(textos[btn.dataset.libToast], btn.dataset.libToast));
    });

    document.getElementById('lib-select').addEventListener('df-change', (e) => this.showToast(`Elegiste: ${e.detail.label}`, 'success'));
    document.getElementById('lib-switch').addEventListener('df-change', (e) => {
      this.showToast(e.detail.checked ? 'Avisos activados' : 'Avisos desactivados', e.detail.checked ? 'success' : 'info');
    });

    document.getElementById('lib-stat').addEventListener('df-select', (e) => {
      this.showToast(`df-select → ${e.detail.label}: ${e.detail.value}%`, 'info');
    });
  },

  // Todas las notificaciones de la app pasan por el componente <df-toast-stack>.
  showToast(msg, type = 'info') {
    document.getElementById('toasts').show(msg, type);
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());