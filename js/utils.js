// utils.js — pure helper functions (no side effects except DOM helpers & haptics)
import { state } from './state.js';
import { t } from './i18n.js';

export const $ = (s, ctx = document) => ctx.querySelector(s);
export const $$ = (s, ctx = document) => ctx.querySelectorAll(s);

export function getWeatherInfo(code, isDay) {
  if (code === 0) return { label: t('weather_clear'), icon: isDay ? 'sun' : 'moon', type: 'clear' };
  if (code === 1 || code === 2) return { label: t('weather_pcloudy'), icon: isDay ? 'cloud-sun' : 'cloud-moon', type: 'clouds' };
  if (code === 3) return { label: t('weather_cloudy'), icon: 'cloud', type: 'clouds' };
  if (code >= 45 && code <= 48) return { label: t('weather_fog'), icon: 'cloud-fog', type: 'fog' };
  if (code >= 51 && code <= 67) return { label: t('weather_rain'), icon: 'cloud-rain', type: 'rain' };
  if (code >= 71 && code <= 77) return { label: t('weather_snow'), icon: 'snowflake', type: 'snow' };
  if (code >= 80 && code <= 82) return { label: t('weather_heavyrain'), icon: 'cloud-rain-wind', type: 'rain' };
  if (code >= 95) return { label: t('weather_thunder'), icon: 'cloud-lightning', type: 'thunder' };
  return { label: t('weather_unknown'), icon: 'cloud', type: 'clouds' };
}

export function getWindDirection(deg) {
  const dirs = ['U', 'UTL', 'TL', 'TTL', 'T', 'TTG', 'TG', 'UTG'];
  const idx = Math.round(deg / 45) % 8;
  return { label: dirs[idx], rotation: deg };
}

export function getMoonInfo(phase) {
  if (phase < 0.03 || phase > 0.97) return { name: t('moon_new'), shadowX: 0 };
  if (phase < 0.23) return { name: t('moon_wax_cres'), shadowX: -55 };
  if (phase < 0.28) return { name: t('moon_first_q'), shadowX: -90 };
  if (phase < 0.47) return { name: t('moon_wax_gib'), shadowX: -60 };
  if (phase < 0.53) return { name: t('moon_full'), shadowX: -100 };
  if (phase < 0.72) return { name: t('moon_wan_gib'), shadowX: 60 };
  if (phase < 0.78) return { name: t('moon_last_q'), shadowX: 90 };
  return { name: t('moon_wan_cres'), shadowX: 55 };
}

// Deterministic moon phase (0-1) computed from a known new-moon epoch.
// Replaces any need for a network call or randomness.
const SYNODIC_MONTH = 29.53058867;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14); // Jan 6 2000, 18:14 UTC
export function computeMoonPhase(date = new Date()) {
  const days = (date.getTime() - KNOWN_NEW_MOON) / 86400000;
  const phase = (days % SYNODIC_MONTH) / SYNODIC_MONTH;
  return phase < 0 ? phase + 1 : phase;
}

export function estimateVisibility(code, rh) {
  if (code >= 45 && code <= 48) return { val: Math.round(Math.max(0.5, 3 - rh / 30)), desc: t('vis_fog') };
  if (code >= 51 && code <= 67) return { val: Math.round(Math.max(1, 8 - rh / 15)), desc: t('vis_rain') };
  if (code >= 80) return { val: Math.round(Math.max(0.5, 4 - rh / 20)), desc: t('vis_heavyrain') };
  if (code >= 95) return { val: Math.round(Math.max(0.5, 3 - rh / 25)), desc: t('vis_storm') };
  if (rh > 90) return { val: 6, desc: t('vis_humid') };
  return { val: 22, desc: t('vis_clear') };
}

export function animateNumber(el, target, suffix = '') {
  if (!el) return;
  const start = parseFloat(el.textContent) || 0;
  if (Math.abs(start - target) < 0.5 && el.textContent !== '--') {
    el.textContent = target + suffix;
    return;
  }
  const st = performance.now();
  const dur = Math.min(700, 300 + Math.abs(target - start) * 10);
  const easeOutExpo = (p) => (p === 1 ? 1 : 1 - Math.pow(2, -10 * p));
  function tick(now) {
    const p = Math.min((now - st) / dur, 1);
    el.textContent = Math.round(start + (target - start) * easeOutExpo(p)) + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(tick);
}

// ========== Unit conversion ==========
export function toDisplayTemp(celsius) {
  if (state.units === 'imperial') return Math.round((celsius * 9) / 5 + 32);
  return Math.round(celsius);
}
export function tempUnitLabel() {
  return state.units === 'imperial' ? '°F' : '°C';
}
export function toDisplaySpeed(kmh) {
  if (state.units === 'imperial') return Math.round(kmh * 0.621371);
  return Math.round(kmh);
}
export function speedUnitLabel() {
  return state.units === 'imperial' ? 'mph' : 'km/j';
}

// ========== Air Quality ==========
export function getAqiInfo(aqi) {
  if (aqi == null) return { label: '--', color: '#94a3b8', desc: t('aqi_unavailable') };
  if (aqi <= 20) return { label: t('aqi_good'), color: '#4ade80', desc: t('aqi_desc_good') };
  if (aqi <= 40) return { label: t('aqi_fair'), color: '#a3e635', desc: t('aqi_desc_fair') };
  if (aqi <= 60) return { label: t('aqi_moderate'), color: '#facc15', desc: t('aqi_desc_moderate') };
  if (aqi <= 80) return { label: t('aqi_poor'), color: '#fb923c', desc: t('aqi_desc_poor') };
  if (aqi <= 100) return { label: t('aqi_verypoor'), color: '#f87171', desc: t('aqi_desc_verypoor') };
  return { label: t('aqi_hazardous'), color: '#c084fc', desc: t('aqi_desc_hazardous') };
}

// ========== Greeting ==========
export function getGreeting() {
  const h = new Date().getHours();
  if (h < 4) return t('greeting_night');
  if (h < 10) return t('greeting_morning');
  if (h < 15) return t('greeting_noon');
  if (h < 18) return t('greeting_evening');
  return t('greeting_night');
}

// ========== Haptics ==========
export function haptic(pattern = 10) {
  if (localStorage.getItem('angin:haptics') === 'false') return;
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {}
}

// ========== Ripple (CSS-driven, JS only computes position once) ==========
export function attachRipple(el) {
  el.addEventListener('pointerdown', (e) => {
    const rect = el.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height) * 1.6;
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
    ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
    el.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }, { passive: true });
}

export function attachRippleAll(selector) {
  $$(selector).forEach(attachRipple);
}

export function debounce(fn, ms) {
  let tid;
  return (...args) => {
    clearTimeout(tid);
    tid = setTimeout(() => fn(...args), ms);
  };
}
