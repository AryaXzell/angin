// geolocation.js — device location with a sensible fallback chain
import { fetchWeatherData, getLastLocation } from './weather.js';
import { reverseGeocode } from './network.js';
import { toast } from './toast.js';
import { t } from './i18n.js';

const JAKARTA = { lat: -6.2088, lon: 106.8456, name: 'Jakarta' };

export function getDeviceLocation() {
  const last = getLastLocation();

  if (!('geolocation' in navigator)) {
    fetchWeatherData(last?.lat ?? JAKARTA.lat, last?.lon ?? JAKARTA.lon, last?.name ?? JAKARTA.name);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const geo = await reverseGeocode(latitude, longitude);
        fetchWeatherData(latitude, longitude, geo.name);
      } catch {
        fetchWeatherData(latitude, longitude, 'Lokasi Saat Ini');
      }
    },
    () => {
      toast(t('location_denied'), 'warn');
      fetchWeatherData(last?.lat ?? JAKARTA.lat, last?.lon ?? JAKARTA.lon, last?.name ?? JAKARTA.name);
    },
    { timeout: 10000, maximumAge: 5 * 60 * 1000 }
  );
}
