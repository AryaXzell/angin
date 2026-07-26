// settings.js — bottom sheet for preferences
import { state, setState, persist } from './state.js';
import { $, haptic } from './utils.js';
import { toast } from './toast.js';
import { icon } from './render.js';
import { t } from './i18n.js';

let sheet, backdrop;

function segRow(labelText, key, options, current, onPick) {
  const row = document.createElement('div');
  row.className = 'settings-row';
  const label = document.createElement('span');
  label.textContent = labelText;
  const seg = document.createElement('div');
  seg.className = 'segmented';
  seg.dataset.key = key;
  options.forEach(([val, text]) => {
    const btn = document.createElement('button');
    btn.className = `seg-btn${current === val ? ' active' : ''}`;
    btn.dataset.val = val;
    btn.textContent = text;
    btn.addEventListener('click', () => onPick(val, btn, seg));
    seg.appendChild(btn);
  });
  row.append(label, seg);
  return row;
}

function toggleRow(labelText, isOn, onToggle) {
  const row = document.createElement('div');
  row.className = 'settings-row';
  const label = document.createElement('span');
  label.textContent = labelText;
  const btn = document.createElement('button');
  btn.className = `toggle-switch${isOn ? ' on' : ''}`;
  const knob = document.createElement('span');
  knob.className = 'toggle-knob';
  btn.appendChild(knob);
  btn.addEventListener('click', () => onToggle(btn));
  row.append(label, btn);
  return row;
}

function groupTitle(text) {
  const h = document.createElement('div');
  h.className = 'settings-group-title';
  h.textContent = text;
  return h;
}

function markActive(seg, chosenBtn) {
  seg.querySelectorAll('.seg-btn').forEach((b) => b.classList.toggle('active', b === chosenBtn));
}

function render() {
  sheet.replaceChildren();

  const handle = document.createElement('div');
  handle.className = 'sheet-handle';

  const title = document.createElement('h3');
  title.className = 'sheet-title';
  title.appendChild(icon('settings-2'));
  title.append(t('settings'));

  sheet.append(handle, title);

  sheet.appendChild(groupTitle('Satuan'));
  sheet.appendChild(
    segRow('Suhu & Angin', 'units', [
      ['metric', '\u00B0C \u00B7 km/j'],
      ['imperial', '\u00B0F \u00B7 mph'],
    ], state.units, (val, btn, seg) => {
      if (state.units === val) return;
      setState({ units: val });
      persist('units', val);
      markActive(seg, btn);
      haptic(8);
      document.dispatchEvent(new CustomEvent('prefs-changed'));
      toast('Pengaturan disimpan', 'success', 1400);
    })
  );

  sheet.appendChild(groupTitle(t('theme')));
  sheet.appendChild(
    segRow(t('theme'), 'theme', [
      ['auto', 'Auto'],
      ['dark', t('dark')],
      ['amoled', t('amoled')],
    ], state.theme, (val, btn, seg) => {
      if (state.theme === val) return;
      setState({ theme: val });
      persist('theme', val);
      markActive(seg, btn);
      applyTheme();
      haptic(8);
      toast('Pengaturan disimpan', 'success', 1400);
    })
  );

  sheet.appendChild(groupTitle(t('language')));
  sheet.appendChild(
    segRow(t('language'), 'lang', [
      ['id', 'Indonesia'],
      ['en', 'English'],
    ], state.lang, (val, btn, seg) => {
      if (state.lang === val) return;
      setState({ lang: val });
      persist('lang', val);
      markActive(seg, btn);
      haptic(8);
      toast('Bahasa diperbarui \u00B7 Language updated', 'success', 1800);
      setTimeout(() => location.reload(), 700);
    })
  );

  sheet.appendChild(groupTitle(t('about')));

  sheet.appendChild(
    toggleRow(t('notifications'), state.notifAlerts, (btn) => {
      const next = !state.notifAlerts;
      setState({ notifAlerts: next });
      persist('notifAlerts', next);
      btn.classList.toggle('on', next);
      haptic(8);
    })
  );

  const hapticsOn = localStorage.getItem('angin:haptics') !== 'false';
  sheet.appendChild(
    toggleRow(t('haptics'), hapticsOn, (btn) => {
      const currentlyOn = localStorage.getItem('angin:haptics') !== 'false';
      const next = !currentlyOn;
      localStorage.setItem('angin:haptics', String(next));
      btn.classList.toggle('on', next);
      if (next) haptic(8);
    })
  );

  const footer = document.createElement('p');
  footer.className = 'sheet-footer';
  footer.textContent = 'Angin \u00B7 dibuat oleh AryaXzell';
  sheet.appendChild(footer);
}

export function applyTheme() {
  document.body.classList.remove('theme-amoled');
  if (state.theme === 'amoled') document.body.classList.add('theme-amoled');
}

export function openSettings() {
  render();
  backdrop.classList.add('show');
  sheet.classList.add('show');
  haptic(6);
}

export function closeSettings() {
  backdrop.classList.remove('show');
  sheet.classList.remove('show');
}

export function initSettings() {
  sheet = $('#settings-sheet');
  backdrop = $('#sheet-backdrop');
  $('#btn-settings').addEventListener('click', openSettings);
  backdrop.addEventListener('click', closeSettings);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sheet.classList.contains('show')) closeSettings();
  });
  applyTheme();
}
