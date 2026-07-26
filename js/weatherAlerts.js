// weatherAlerts.js — proactive alerts derived from current conditions thresholds.
// No external alert API needed (Open-Meteo doesn't provide one) — this evaluates
// thresholds against the already-fetched current/hourly data.
import { state } from './state.js';
import { toast } from './toast.js';
import { t } from './i18n.js';

let lastAlertKey = null;

export function evaluateAlerts(data) {
  if (!state.notifAlerts) return;
  const cur = data.current;
  const hourly = data.hourly;

  const alerts = [];

  if (cur.temperature_2m >= 34) {
    alerts.push({ key: 'heat', message: t('heat_alert'), type: 'warn' });
  }
  if (cur.wind_speed_10m >= 40) {
    alerts.push({ key: 'wind', message: t('strong_wind'), type: 'warn' });
  }
  if (cur.relative_humidity_2m >= 90) {
    alerts.push({ key: 'humidity', message: t('humidity_high'), type: 'info' });
  }
  // Look at next 3 hours for heavy rain probability
  if (hourly?.precipitation_probability) {
    const next3 = hourly.precipitation_probability.slice(0, 3);
    if (next3.some((p) => p >= 70)) {
      alerts.push({ key: 'rain', message: t('heavy_rain_alert'), type: 'warn' });
    }
  }

  if (alerts.length === 0) return;
  const top = alerts[0];
  if (top.key === lastAlertKey) return; // avoid repeating the same alert every refresh
  lastAlertKey = top.key;
  toast(top.message, top.type, 3200);
}
