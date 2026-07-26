// pullToRefresh.js — native-feeling pull-to-refresh gesture
import { state } from './state.js';
import { app, pullIndicator, pageCuaca } from './dom.js';
import { fetchWeatherData } from './weather.js';
import { haptic } from './utils.js';
import { getActiveTab } from './navigation.js';

const THRESHOLD = 80;

export function initPullToRefresh() {
  if (!pullIndicator) return;
  let startY = 0, pulling = false, triggered = false;

  app.addEventListener('touchstart', (e) => {
    if (getActiveTab() !== 'cuaca') return;
    if (pageCuaca.scrollTop > 0 || window.scrollY > 0) return;
    startY = e.touches[0].clientY;
    pulling = true;
    triggered = false;
  }, { passive: true });

  app.addEventListener('touchmove', (e) => {
    if (!pulling || getActiveTab() !== 'cuaca') return;
    const diff = e.touches[0].clientY - startY;
    if (diff > 0 && window.scrollY === 0) {
      const pull = Math.min(diff * 0.5, 110);
      pullIndicator.style.transform = `translateY(${pull}px) translateX(-50%)`;
      pullIndicator.style.opacity = String(Math.min(pull / THRESHOLD, 1));
      if (pull > THRESHOLD && !triggered) {
        triggered = true;
        haptic(12);
        pullIndicator.classList.add('ready');
      } else if (pull <= THRESHOLD) {
        triggered = false;
        pullIndicator.classList.remove('ready');
      }
    }
  }, { passive: true });

  app.addEventListener('touchend', () => {
    if (!pulling) return;
    pulling = false;
    if (triggered) {
      pullIndicator.classList.add('spinning');
      pullIndicator.style.transform = 'translateY(50px) translateX(-50%)';
      if (state.currentCity) {
        fetchWeatherData(state.currentCity.lat, state.currentCity.lon, state.currentCity.name, false);
      }
      setTimeout(resetIndicator, 700);
    } else {
      resetIndicator();
    }
  });

  function resetIndicator() {
    pullIndicator.style.transform = 'translateY(-40px) translateX(-50%)';
    pullIndicator.style.opacity = '0';
    pullIndicator.classList.remove('ready', 'spinning');
  }
}
