// navigation.js — tab switching + swipe gesture
import { app, pageCuaca, pageSearch, pageKota, navItems, navIndicator, searchInputPage } from './dom.js';
import { haptic } from './utils.js';

const TABS = ['cuaca', 'search', 'kota'];
let activeTab = 'cuaca';

export function switchTab(tab) {
  if (activeTab === tab) return;
  activeTab = tab;
  pageCuaca.classList.toggle('active', tab === 'cuaca');
  pageSearch.classList.toggle('active', tab === 'search');
  pageKota.classList.toggle('active', tab === 'kota');
  navItems.forEach((item) => {
    const isActive = item.dataset.tab === tab;
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
  const idx = TABS.indexOf(tab);
  navIndicator.style.left = `${idx * 33.33}%`;

  if (tab === 'kota') {
    import('./savedCities.js').then(({ renderSavedCities }) => renderSavedCities());
  }
  if (tab === 'search') searchInputPage.focus();
}

export function getActiveTab() {
  return activeTab;
}

export function initNavigation() {
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      haptic(6);
      switchTab(item.dataset.tab);
    });
    // role="button" divs don't get native Enter/Space activation like <button> does
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        haptic(6);
        switchTab(item.dataset.tab);
      }
    });
  });

  let touchStartX = 0, touchStartY = 0;
  app.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  app.addEventListener('touchend', (e) => {
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      const idx = TABS.indexOf(activeTab);
      if (diffX < 0 && idx < TABS.length - 1) { haptic(6); switchTab(TABS[idx + 1]); }
      else if (diffX > 0 && idx > 0) { haptic(6); switchTab(TABS[idx - 1]); }
    }
  }, { passive: true });
}
