// search.js — city search page: geocoding lookups, history chips, safe rendering
import { searchInputPage, searchResultsPage, searchHistoryContainer } from './dom.js';
import { fetchWeatherData } from './weather.js';
import { saveCity, isCitySaved } from './savedCities.js';
import { switchTab } from './navigation.js';
import { haptic, debounce } from './utils.js';
import { geocodeSearch } from './network.js';
import { renderSearchResult, renderHistoryChip, icon } from './render.js';
import { state, setState, persist } from './state.js';
import { t } from './i18n.js';

const HISTORY_MAX = 6;

function pushHistory(name, lat, lon) {
  const hist = [{ name, lat, lon }, ...state.history.filter((h) => !(h.name === name && h.lat === lat))].slice(0, HISTORY_MAX);
  setState({ history: hist });
  persist('history', hist);
  renderHistory();
}

export function renderHistory() {
  if (!searchHistoryContainer) return;
  searchHistoryContainer.replaceChildren();
  if (state.history.length === 0) return;

  const label = document.createElement('p');
  label.className = 'history-label';
  label.appendChild(icon('history'));
  label.append(t('recent_searches'));

  const chips = document.createElement('div');
  chips.className = 'history-chips';
  for (const h of state.history) {
    chips.appendChild(renderHistoryChip(h.name, () => {
      haptic(8);
      fetchWeatherData(h.lat, h.lon, h.name);
      switchTab('cuaca');
    }));
  }

  searchHistoryContainer.append(label, chips);
}

function renderEmptyMessage(iconName, title, sub) {
  searchResultsPage.replaceChildren();
  const wrap = document.createElement('div');
  wrap.className = 'search-empty';
  wrap.appendChild(icon(iconName));
  const p1 = document.createElement('p');
  p1.textContent = title;
  const p2 = document.createElement('p');
  p2.className = 'sub';
  p2.textContent = sub;
  wrap.append(p1, p2);
  searchResultsPage.appendChild(wrap);
}

function renderSpinner() {
  searchResultsPage.replaceChildren();
  const wrap = document.createElement('div');
  wrap.className = 'search-spinner-wrap';
  const spin = document.createElement('div');
  spin.className = 'search-spinner';
  wrap.appendChild(spin);
  searchResultsPage.appendChild(wrap);
}

async function runSearch(query) {
  renderSpinner();
  try {
    const results = await geocodeSearch(query);
    if (results.length) {
      searchResultsPage.replaceChildren();
      const frag = document.createDocumentFragment();
      results.forEach((place) => {
        const normalized = { name: place.name, admin1: place.admin1, country: place.country, lat: place.latitude, lon: place.longitude };
        const saved = isCitySaved(place.name, place.latitude);
        const row = renderSearchResult(
          normalized,
          saved,
          (p) => {
            haptic(8);
            pushHistory(p.name, p.lat, p.lon);
            fetchWeatherData(p.lat, p.lon, p.name);
            switchTab('cuaca');
          },
          (p, btn) => {
            haptic(10);
            saveCity(p.name, p.lat, p.lon);
            btn.replaceChildren(icon('bookmark-check', 'icon saved'));
          }
        );
        frag.appendChild(row);
      });
      searchResultsPage.appendChild(frag);
    } else {
      renderEmptyMessage('search-x', t('city_not_found'), t('try_another'));
    }
  } catch {
    renderEmptyMessage('wifi-off', t('loading_failed'), t('check_connection'));
  }
}

const debouncedSearch = debounce(runSearch, 400);

export function initSearch() {
  renderHistory();
  searchInputPage.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    if (q.length < 2) {
      searchResultsPage.replaceChildren();
      if (searchHistoryContainer) searchHistoryContainer.style.display = 'block';
      return;
    }
    if (searchHistoryContainer) searchHistoryContainer.style.display = 'none';
    debouncedSearch(q);
  });
}
