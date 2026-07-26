// toast.js — small notification system, built via DOM API (no innerHTML)
import { icon } from './render.js';

let container;
const ICONS = { info: 'info', success: 'check-circle', error: 'alert-circle', warn: 'alert-triangle' };

function ensureContainer() {
  if (container) return container;
  container = document.createElement('div');
  container.className = 'toast-container';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
  return container;
}

export function toast(message, type = 'info', duration = 2600) {
  const c = ensureContainer();
  const node = document.createElement('div');
  node.className = `toast toast-${type}`;
  node.appendChild(icon(ICONS[type] || 'info', 'icon'));
  const span = document.createElement('span');
  span.textContent = message;
  node.appendChild(span);
  c.appendChild(node);

  requestAnimationFrame(() => node.classList.add('show'));
  setTimeout(() => {
    node.classList.remove('show');
    node.classList.add('hide');
    setTimeout(() => node.remove(), 350);
  }, duration);
}
