// state.js — single source of truth, plain object + pub/sub (no framework overhead)

const listeners = new Set();

export const state = {
  units: JSON.parse(localStorage.getItem('angin:units') || '"metric"'), // metric | imperial
  theme: localStorage.getItem('angin:theme') || 'auto', // auto | dark | amoled
  lang: localStorage.getItem('angin:lang') || 'id', // id | en
  savedCities: JSON.parse(localStorage.getItem('angin:savedCities') || '[]'),
  history: JSON.parse(localStorage.getItem('angin:history') || '[]'),
  current: null,       // active weather payload
  currentCity: null,   // { name, admin1, country, lat, lon }
  isOnline: navigator.onLine,
  lastUpdated: null,
  notifAlerts: JSON.parse(localStorage.getItem('angin:notifAlerts') || 'true'),
};

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setState(patch) {
  Object.assign(state, patch);
  for (const fn of listeners) fn(state);
}

export function persist(key, value) {
  localStorage.setItem(`angin:${key}`, JSON.stringify(value));
}
