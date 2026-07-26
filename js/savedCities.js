// savedCities.js — persisted favorite cities, rendered via safe DOM builders
import { savedCitiesContainer, emptySavedMessage } from './dom.js';
import { getWeatherInfo, toDisplayTemp, haptic } from './utils.js';
import { fetchWeatherData } from './weather.js';
import { getCached } from './network.js';
import { switchTab } from './navigation.js';
import { toast } from './toast.js';
import { renderSavedCityCard } from './render.js';
import { state, setState, persist } from './state.js';
import { t } from './i18n.js';

export function getSavedCities() {
  return state.savedCities;
}

export function isCitySaved(name, lat) {
  return state.savedCities.some((c) => c.name === name && Math.abs(c.lat - lat) < 0.001);
}

export function saveCity(name, lat, lon) {
  const cities = state.savedCities.filter((c) => !(c.name === name && c.lat === lat));
  cities.push({ name, lat, lon, savedAt: Date.now() });
  setState({ savedCities: cities });
  persist('savedCities', cities);
  toast(`${name} ${t('city_saved').toLowerCase()}`, 'success');
}

export function removeCity(name, lat) {
  const cities = state.savedCities.filter((c) => !(c.name === name && c.lat === lat));
  setState({ savedCities: cities });
  persist('savedCities', cities);
  toast(`${name} ${t('city_removed').toLowerCase()}`, 'info');
  renderSavedCities();
}

export async function renderSavedCities() {
  const cities = getSavedCities();
  if (cities.length === 0) {
    savedCitiesContainer.replaceChildren();
    emptySavedMessage.classList.remove('hidden');
    return;
  }
  emptySavedMessage.classList.add('hidden');

  const frag = document.createDocumentFragment();
  const cards = [];

  for (const city of cities) {
    const cached = getCached(city.lat, city.lon);
    let snapshot = null;
    if (cached) {
      const cur = cached.weather.current;
      const info = getWeatherInfo(cur.weather_code, cur.is_day === 1);
      snapshot = { temp: toDisplayTemp(cur.temperature_2m), icon: info.icon, label: info.label };
    }
    const card = renderSavedCityCard(
      city,
      snapshot,
      (c) => {
        haptic(8);
        fetchWeatherData(c.lat, c.lon, c.name);
        switchTab('cuaca');
      },
      (c) => {
        haptic(12);
        removeCity(c.name, c.lat);
      }
    );
    frag.appendChild(card);
    cards.push({ city, card });
  }
  savedCitiesContainer.replaceChildren();
  savedCitiesContainer.appendChild(frag);

  // Fetch fresh snapshots for any city missing cached data (non-blocking)
  for (const { city, card } of cards) {
    if (!getCached(city.lat, city.lon)) {
      import('./network.js').then(async ({ fetchWeatherBundle, setCached }) => {
        try {
          const bundle = await fetchWeatherBundle(city.lat, city.lon);
          setCached(city.lat, city.lon, bundle);
          renderSavedCities(); // re-render once new data is in cache
        } catch {
          // silent — card just stays in its placeholder state
        }
      });
      break; // only kick off one background fetch per render pass to avoid a thundering herd
    }
  }
}
