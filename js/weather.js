// weather.js — orchestrates fetch -> cache -> render
import { state, setState } from './state.js';
import * as dom from './dom.js';
import {
  getWeatherInfo, getMoonInfo, computeMoonPhase, estimateVisibility, animateNumber,
  toDisplayTemp, tempUnitLabel, toDisplaySpeed, speedUnitLabel, getWindDirection,
  getAqiInfo, getGreeting,
} from './utils.js';
import { renderHourly, renderDaily, renderPrecipChart } from './render.js';
import { renderBackground } from './background.js';
import { fetchWeatherBundle, getCached, setCached } from './network.js';
import { toast } from './toast.js';
import { t } from './i18n.js';
import { evaluateAlerts } from './weatherAlerts.js';

function showLoader() {
  dom.loader.style.display = 'flex';
  dom.loader.style.opacity = '1';
  dom.app.style.display = 'none';
  dom.errorState.classList.remove('show');
}

function hideLoader() {
  dom.errorState.classList.remove('show');
  dom.loader.style.opacity = '0';
  setTimeout(() => {
    dom.loader.style.display = 'none';
    dom.app.style.display = 'flex';
  }, 250);
}

function showError() {
  dom.loader.style.display = 'none';
  dom.app.style.display = 'none';
  dom.errorState.classList.add('show');
}

export async function fetchWeatherData(lat, lon, name, useCache = true) {
  const cached = useCache ? getCached(lat, lon) : null;

  if (cached) {
    updateUI(cached.weather, name, cached.aqi, lat, lon);
    if (!cached.isFresh) {
      // stale-while-revalidate: refresh silently in the background
      refreshInBackground(lat, lon, name);
    }
    return;
  }

  if (state.current) {
    // we already have something on screen — refresh quietly instead of showing loader
    refreshInBackground(lat, lon, name);
    return;
  }

  showLoader();
  try {
    const bundle = await fetchWeatherBundle(lat, lon);
    setCached(lat, lon, bundle);
    updateUI(bundle.weather, name, bundle.aqi, lat, lon);
  } catch (e) {
    console.error('Weather fetch failed', e);
    showError();
    toast(t('loading_failed'), 'error');
  }
}

async function refreshInBackground(lat, lon, name) {
  try {
    const bundle = await fetchWeatherBundle(lat, lon);
    setCached(lat, lon, bundle);
    updateUI(bundle.weather, name, bundle.aqi, lat, lon);
  } catch {
    // silent — user already sees cached/stale data, no need to interrupt
  }
}

export function updateUI(data, name, aqiData, lat, lon) {
  hideLoader();
  const cur = data.current, daily = data.daily, hourly = data.hourly;
  const info = getWeatherInfo(cur.weather_code, cur.is_day === 1);

  setState({
    current: data, currentCity: { name, lat, lon },
    lastUpdated: Date.now(),
  });

  if (dom.greetingEl) dom.greetingEl.textContent = getGreeting();
  dom.locNameEl.textContent = name;
  animateNumber(dom.currentTempEl, toDisplayTemp(cur.temperature_2m));
  dom.currentDescEl.textContent = info.label;
  dom.highTempEl.textContent = `H:${toDisplayTemp(daily.temperature_2m_max[0])}\u00B0`;
  dom.lowTempEl.textContent = `L:${toDisplayTemp(daily.temperature_2m_min[0])}\u00B0`;

  if (cur.temperature_2m >= 34) {
    dom.warningBanner.style.display = 'flex';
    dom.warningText.textContent = `Suhu mencapai ${toDisplayTemp(cur.temperature_2m)}${tempUnitLabel()}. Minum air yang cukup ya.`;
  } else {
    dom.warningBanner.style.display = 'none';
  }

  // Moon (deterministic calculation, no network dependency)
  const moonInfo = getMoonInfo(computeMoonPhase());
  dom.moonShadowEl.style.transform = `translateX(${moonInfo.shadowX}%)`;
  dom.moonPhaseNameEl.textContent = moonInfo.name;

  renderHourly(dom.hourlyContainer, hourly);
  renderDaily(dom.dailyContainer, daily);

  if (dom.precipCard && dom.precipChart) {
    const hasPrecip = renderPrecipChart(dom.precipChart, hourly);
    dom.precipCard.style.display = hasPrecip ? 'flex' : 'none';
  }

  // Sunrise/Sunset
  if (daily.sunrise?.[0] && daily.sunset?.[0]) {
    const sr = new Date(daily.sunrise[0]), ss = new Date(daily.sunset[0]);
    dom.sunriseTimeEl.textContent = `${String(sr.getHours()).padStart(2, '0')}:${String(sr.getMinutes()).padStart(2, '0')}`;
    dom.sunsetTimeEl.textContent = `${String(ss.getHours()).padStart(2, '0')}:${String(ss.getMinutes()).padStart(2, '0')}`;
    const diffMin = Math.round((ss - sr) / 60000);
    dom.daylightDurationEl.textContent = `Durasi siang: ${Math.floor(diffMin / 60)}j ${diffMin % 60}m`;
    const progress = Math.max(0, Math.min(1, (Date.now() - sr) / (ss - sr)));
    dom.sunArcDot.setAttribute('cx', String(5 + progress * 110));
    dom.sunArcDot.setAttribute('cy', String(44 - (1 - Math.pow(2 * progress - 1, 2)) * 40));
    dom.sunriseCard.style.display = 'block';
  } else {
    dom.sunriseCard.style.display = 'none';
  }

  // Detail widgets
  animateNumber(dom.uvValEl, Math.round(daily.uv_index_max[0]));
  dom.uvDescEl.textContent = daily.uv_index_max[0] > 7 ? 'Pakai sunblock' : daily.uv_index_max[0] > 2 ? 'Lindungi kulit' : 'Aman';

  animateNumber(dom.feelsValEl, toDisplayTemp(cur.apparent_temperature));
  const diff = cur.apparent_temperature - cur.temperature_2m;
  dom.feelsDescEl.textContent = diff > 3 ? 'Lebih panas' : diff < -2 ? 'Lebih dingin' : 'Mirip';

  animateNumber(dom.windValEl, toDisplaySpeed(cur.wind_speed_10m));
  if (dom.windUnitEl) dom.windUnitEl.textContent = speedUnitLabel();
  const wDir = getWindDirection(cur.wind_direction_10m || 0);
  dom.windCompass.style.transform = `rotate(${wDir.rotation}deg)`;
  dom.windDirLabel.textContent = wDir.label;

  animateNumber(dom.humidityValEl, cur.relative_humidity_2m);
  dom.humidityDescEl.textContent = `Titik embun ${toDisplayTemp(cur.temperature_2m - (100 - cur.relative_humidity_2m) / 5)}${tempUnitLabel()}`;

  const pressure = Math.round(cur.surface_pressure || 1013);
  animateNumber(dom.pressureValEl, pressure);
  dom.pressureDescEl.textContent = pressure > 1025 ? 'Tinggi' : pressure < 1005 ? 'Rendah' : 'Stabil';

  const vis = estimateVisibility(cur.weather_code, cur.relative_humidity_2m);
  animateNumber(dom.visibilityValEl, vis.val);
  dom.visibilityDescEl.textContent = vis.desc;

  dom.lastUpdatedEl.textContent = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // AQI
  if (aqiData?.current?.european_aqi != null && dom.aqiCard) {
    const aqi = Math.round(aqiData.current.european_aqi);
    const aqiInfo = getAqiInfo(aqi);
    dom.aqiCard.style.display = 'flex';
    animateNumber(dom.aqiValEl, aqi);
    dom.aqiLabelEl.textContent = aqiInfo.label;
    dom.aqiLabelEl.style.color = aqiInfo.color;
    dom.aqiDescEl.textContent = aqiInfo.desc;
    if (dom.aqiBarFill) {
      dom.aqiBarFill.style.width = `${Math.min(100, aqi)}%`;
      dom.aqiBarFill.style.background = aqiInfo.color;
    }
  } else if (dom.aqiCard) {
    dom.aqiCard.style.display = 'none';
  }

  renderBackground(dom.bgGradient, dom.ambientBg, dom.lightningOverlay, info.type, cur.is_day === 1, cur.temperature_2m);
  persistLastLocation(lat, lon, name);
  evaluateAlerts(data);
}

function persistLastLocation(lat, lon, name) {
  try {
    localStorage.setItem('angin:lastLocation', JSON.stringify({ lat, lon, name }));
  } catch {}
}

export function getLastLocation() {
  try {
    return JSON.parse(localStorage.getItem('angin:lastLocation') || 'null');
  } catch {
    return null;
  }
}
