// network.js — fetch layer with stale-while-revalidate cache + timeout guard

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const FETCH_TIMEOUT = 12000;

function withTimeout(promise, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { promise: promise(controller.signal), controller, cleanup: () => clearTimeout(timer) };
}

async function fetchJSON(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchWeatherBundle(lat, lon) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=temperature_2m,weather_code,is_day,precipitation_probability,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset&timezone=auto`;
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm2_5,pm10,ozone`;

  const w = withTimeout((signal) => fetchJSON(weatherUrl, signal), FETCH_TIMEOUT);
  const a = withTimeout((signal) => fetchJSON(aqiUrl, signal), FETCH_TIMEOUT);

  const [weather, aqi] = await Promise.all([
    w.promise.finally(w.cleanup),
    a.promise.finally(a.cleanup).catch(() => null),
  ]);

  return { weather, aqi, fetchedAt: Date.now() };
}

export function getCached(lat, lon) {
  const key = `angin:cache:${lat.toFixed(2)}_${lon.toFixed(2)}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...parsed, isFresh: Date.now() - parsed.fetchedAt < CACHE_TTL, key };
  } catch {
    return null;
  }
}

export function setCached(lat, lon, bundle) {
  const key = `angin:cache:${lat.toFixed(2)}_${lon.toFixed(2)}`;
  try {
    localStorage.setItem(key, JSON.stringify(bundle));
  } catch {
    // storage full or unavailable — fail silently, app still works without cache
  }
}

export async function geocodeSearch(query) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=id&format=json`;
  const { promise, cleanup } = withTimeout((signal) => fetchJSON(url, signal), 8000);
  try {
    const data = await promise;
    return data.results || [];
  } finally {
    cleanup();
  }
}

export async function reverseGeocode(lat, lon) {
  // Open-Meteo doesn't offer reverse geocoding; use a lightweight fallback via BigDataCloud (free, no key)
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`;
  const { promise, cleanup } = withTimeout((signal) => fetchJSON(url, signal), 8000);
  try {
    const data = await promise;
    return {
      name: data.city || data.locality || data.principalSubdivision || 'Lokasi Anda',
      admin1: data.principalSubdivision || '',
      country: data.countryName || '',
    };
  } catch {
    return { name: 'Lokasi Anda', admin1: '', country: '' };
  } finally {
    cleanup();
  }
}
