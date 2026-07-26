// pwa-install.js — capture the beforeinstallprompt event and offer a friendly install banner
import { installBanner } from './dom.js';
import { icon } from './render.js';
import { haptic } from './utils.js';
import { t } from './i18n.js';

let deferredPrompt = null;

export function initInstallPrompt() {
  if (!installBanner) return;
  if (localStorage.getItem('angin:installDismissed') === 'true') return;
  if (window.matchMedia('(display-mode: standalone)').matches) return; // already installed

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showBanner();
  });

  window.addEventListener('appinstalled', () => {
    installBanner.classList.remove('show');
    deferredPrompt = null;
  });
}

function showBanner() {
  installBanner.replaceChildren();
  installBanner.appendChild(icon('download'));

  const p = document.createElement('p');
  p.textContent = t('install_app');
  installBanner.appendChild(p);

  const installBtn = document.createElement('button');
  installBtn.className = 'btn-install';
  installBtn.textContent = t('install');
  installBtn.addEventListener('click', async () => {
    haptic(8);
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBanner.classList.remove('show');
  });
  installBanner.appendChild(installBtn);

  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'btn-dismiss';
  dismissBtn.setAttribute('aria-label', 'Tutup');
  dismissBtn.appendChild(icon('x'));
  dismissBtn.addEventListener('click', () => {
    installBanner.classList.remove('show');
    localStorage.setItem('angin:installDismissed', 'true');
  });
  installBanner.appendChild(dismissBtn);

  installBanner.classList.add('show');
}
