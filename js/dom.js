// dom.js — centralized element references, queried once at module load
import { $, $$ } from './utils.js';

export const bgGradient = $('#bg-gradient');
export const ambientBg = $('#ambient-bg');
export const lightningOverlay = $('#lightning-overlay');
export const loader = $('#loader');
export const app = $('#app');
export const errorState = $('#error-state');

export const pageCuaca = $('#page-cuaca');
export const pageSearch = $('#page-search');
export const pageKota = $('#page-kota');
export const navItems = $$('.nav-item');
export const navIndicator = $('#nav-indicator');

export const greetingEl = $('#greeting-text');
export const locNameEl = $('#loc-name');
export const currentTempEl = $('#current-temp');
export const currentDescEl = $('#current-desc');
export const highTempEl = $('#high-temp');
export const lowTempEl = $('#low-temp');
export const warningBanner = $('#warning-banner');
export const warningText = $('#warning-text');
export const hourlyContainer = $('#hourly-container');
export const dailyContainer = $('#daily-container');
export const sunriseCard = $('#sunrise-card');
export const sunriseTimeEl = $('#sunrise-time');
export const sunsetTimeEl = $('#sunset-time');
export const sunArcDot = $('#sun-arc-dot');
export const moonShadowEl = $('#moon-shadow-el');
export const moonPhaseNameEl = $('#moon-phase-name');
export const daylightDurationEl = $('#daylight-duration');
export const uvValEl = $('#uv-val');
export const uvDescEl = $('#uv-desc');
export const feelsValEl = $('#feels-val');
export const feelsDescEl = $('#feels-desc');
export const windValEl = $('#wind-val');
export const windUnitEl = $('#wind-unit');
export const windCompass = $('#wind-compass');
export const windDirLabel = $('#wind-dir-label');
export const humidityValEl = $('#humidity-val');
export const humidityDescEl = $('#humidity-desc');
export const pressureValEl = $('#pressure-val');
export const pressureDescEl = $('#pressure-desc');
export const visibilityValEl = $('#visibility-val');
export const visibilityDescEl = $('#visibility-desc');
export const lastUpdatedEl = $('#last-updated');
export const btnRefresh = $('#btn-refresh');
export const btnShare = $('#btn-share');
export const searchInputPage = $('#search-input-page');
export const searchResultsPage = $('#search-results-page');
export const searchHistoryContainer = $('#search-history-container');
export const savedCitiesContainer = $('#saved-cities-container');
export const emptySavedMessage = $('#empty-saved-message');
export const btnEditCities = $('#btn-edit-cities');

export const aqiCard = $('#aqi-card');
export const aqiValEl = $('#aqi-val');
export const aqiLabelEl = $('#aqi-label');
export const aqiDescEl = $('#aqi-desc');
export const aqiBarFill = $('#aqi-bar-fill');

export const precipCard = $('#precip-card');
export const precipChart = $('#precip-chart');

export const pullIndicator = $('#pull-indicator');
export const offlineBanner = $('#offline-banner');
export const installBanner = $('#install-banner');
