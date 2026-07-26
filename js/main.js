// main.js — application entry point
import { state } from './state.js';
import { btnRefresh, btnShare, btnEditCities } from './dom.js';
import { fetchWeatherData } from './weather.js';
import { initNavigation, switchTab } from './navigation.js';
import { initSearch } from './search.js';
import { getDeviceLocation } from './geolocation.js';
import { initSettings } from './settings.js';
import { initNetworkStatus } from './network-status.js';
import { initPullToRefresh } from './pullToRefresh.js';
import { initInstallPrompt } from './pwa-install.js';
import { shareWeather } from './share.js';
import { $, attachRippleAll, haptic } from './utils.js';

let isEditingCities = false;

if (btnEditCities) {
  btnEditCities.addEventListener('click', () => {
    haptic(8);
    isEditingCities = !isEditingCities;
    btnEditCities.textContent = isEditingCities ? 'Selesai' : 'Edit';
  });
}

if (btnRefresh) {
  btnRefresh.addEventListener('click', () => {
    haptic(8);
    const svg = btnRefresh.querySelector('svg');
    if (svg) {
      svg.style.animation = 'spin 0.6s ease';
      setTimeout(() => { svg.style.animation = ''; }, 650);
    }
    if (state.currentCity) {
      fetchWeatherData(state.currentCity.lat, state.currentCity.lon, state.currentCity.name, false);
    }
  });
}

if (btnShare) btnShare.addEventListener('click', shareWeather);

function init() {
  initNavigation();
  initSearch();
  applyStartupTabFromURL();
  initSettings();
  initNetworkStatus();
  initPullToRefresh();
  initInstallPrompt();
  getDeviceLocation();
  attachRippleAll('.nav-item, .btn-icon, #btn-edit-cities, .btn-retry');

  const btnRetry = $('#btn-retry');
  if (btnRetry) {
    btnRetry.addEventListener('click', () => {
      haptic(8);
      const last = state.currentCity;
      if (last) fetchWeatherData(last.lat, last.lon, last.name, false);
      else getDeviceLocation();
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // service worker registration failure shouldn't block the app
      });
    });
  }
}

function applyStartupTabFromURL() {
  const params = new URLSearchParams(location.search);
  const tab = params.get('tab');
  if (tab === 'search' || tab === 'kota') {
    switchTab(tab);
  }
}

init();
