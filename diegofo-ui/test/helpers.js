/**
 * Utilidades comunes para los tests.
 */

/**
 * Inserta HTML en el documento y devuelve el primer elemento.
 * @param {string} html
 * @returns {HTMLElement}
 */
export function mount(html) {
  const host = document.createElement('div');
  host.className = 'test-host';
  host.innerHTML = html;
  document.body.appendChild(host);
  return host.firstElementChild;
}

/** Limpia el documento entre tests. */
export function cleanup() {
  document.body.innerHTML = '';
  document.body.removeAttribute('data-theme');
}

/** Espera a que se vacíe la cola de microtareas (promesas, queueMicrotask). */
export function tick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Escribe texto en un campo como lo haría el usuario (valor + evento input).
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @param {string} text
 */
export function type(field, text) {
  field.value = text;
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

/** Pulsa una tecla sobre un elemento (o el documento). */
export function press(key, target = document) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}
