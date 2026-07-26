// share.js — share current weather via native share sheet or clipboard
import { state } from './state.js';
import { toast } from './toast.js';
import { toDisplayTemp, tempUnitLabel, haptic } from './utils.js';

export async function shareWeather() {
  if (!state.current || !state.currentCity) {
    toast('Belum ada data cuaca', 'warn');
    return;
  }
  const cur = state.current.current;
  const temp = toDisplayTemp(cur.temperature_2m);
  const text = `Cuaca di ${state.currentCity.name}: ${temp}${tempUnitLabel()}. Dicek lewat Angin \u2728`;

  haptic(8);
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Angin', text });
    } catch {
      // user cancelled — no-op
    }
  } else {
    try {
      await navigator.clipboard.writeText(text);
      toast('Info cuaca disalin ke clipboard', 'success');
    } catch {
      toast('Gagal menyalin', 'error');
    }
  }
}
