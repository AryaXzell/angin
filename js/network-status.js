// network-status.js — online/offline indicator banner
import { offlineBanner } from './dom.js';
import { setState } from './state.js';

export function initNetworkStatus() {
  function update() {
    const online = navigator.onLine;
    setState({ isOnline: online });
    if (offlineBanner) offlineBanner.classList.toggle('show', !online);
  }
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}
