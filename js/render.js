// render.js — builds DOM nodes directly (createElement/textContent), never innerHTML with
// interpolated data. This removes the XSS surface the old version had (city names from the
// geocoding API were concatenated straight into innerHTML strings).
import { getWeatherInfo, toDisplayTemp } from './utils.js';
import { t } from './i18n.js';

export function icon(name, cls = 'icon') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', cls);
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#i-${name}`);
  svg.appendChild(use);
  return svg;
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

export function renderHourly(container, hourly) {
  container.replaceChildren();
  const nowH = new Date().getHours();
  const frag = document.createDocumentFragment();
  let nowNode = null;

  for (let i = 0; i < 24 && i < hourly.time.length; i++) {
    const d = new Date(hourly.time[i]);
    const info = getWeatherInfo(hourly.weather_code[i], hourly.is_day[i] === 1);
    const isNow = d.getHours() === nowH && i < 6;
    const pop = hourly.precipitation_probability ? hourly.precipitation_probability[i] : null;

    const item = el('div', `hourly-item${isNow ? ' now' : ''}`);
    item.style.animationDelay = `${i * 15}ms`;

    const time = el('span', 'h-time', isNow ? t('now') : `${d.getHours()}:00`);
    const ic = icon(info.icon);
    const popEl = el('span', 'h-pop', pop != null && pop >= 15 ? `${pop}%` : '\u00A0');
    const temp = el('span', 'h-temp', `${toDisplayTemp(hourly.temperature_2m[i])}\u00B0`);

    item.append(time, ic, popEl, temp);
    frag.appendChild(item);
    if (isNow && !nowNode) nowNode = item;
  }
  container.appendChild(frag);
  if (nowNode) {
    requestAnimationFrame(() => nowNode.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }));
  }
}

export function renderDaily(container, daily) {
  container.replaceChildren();
  const mins = daily.temperature_2m_min.slice(0, 7);
  const maxs = daily.temperature_2m_max.slice(0, 7);
  const gMin = Math.min(...mins) - 2;
  const gMax = Math.max(...maxs) + 2;
  const range = gMax - gMin || 20;
  const frag = document.createDocumentFragment();

  for (let i = 0; i < 7 && i < daily.time.length; i++) {
    const date = new Date(daily.time[i]);
    const dayName = i === 0 ? t('today') : date.toLocaleDateString(t('_locale') === 'en' ? 'en-US' : 'id-ID', { weekday: 'short' });
    const info = getWeatherInfo(daily.weather_code[i], 1);
    const min = toDisplayTemp(mins[i]);
    const max = toDisplayTemp(maxs[i]);

    const row = el('div', 'daily-item');
    row.style.animationDelay = `${i * 35}ms`;

    row.append(
      el('span', 'd-name', dayName),
      icon(info.icon),
      el('span', 'd-min', `${min}\u00B0`)
    );

    const track = el('div', 'daily-bar-track');
    const bar = el('div', 'daily-bar');
    bar.style.setProperty('--w', `${Math.max(4, ((max - min) / range) * 100)}%`);
    bar.style.marginLeft = `${((min - gMin) / range) * 100}%`;
    track.appendChild(bar);

    row.append(track, el('span', 'd-max', `${max}\u00B0`));
    frag.appendChild(row);
  }
  container.appendChild(frag);
}

export function renderPrecipChart(container, hourly) {
  container.replaceChildren();
  const precip = hourly.precipitation || [];
  const slice = precip.slice(0, 12);
  const max = Math.max(1, ...slice);
  const frag = document.createDocumentFragment();

  for (let i = 0; i < slice.length; i++) {
    const d = new Date(hourly.time[i]);
    const wrap = el('div', 'precip-bar-wrap');
    const bar = el('div', 'precip-bar');
    const heightPct = Math.max(2, (slice[i] / max) * 100);
    bar.style.height = `${heightPct}%`;
    const label = el('span', 'precip-label', i % 3 === 0 ? `${d.getHours()}h` : '');
    wrap.append(bar, label);
    frag.appendChild(wrap);
  }
  container.appendChild(frag);
  return slice.some((v) => v > 0);
}

export function renderSavedCityCard(city, weatherSnapshot, onOpen, onDelete) {
  const card = el('div', 'glass-card rounded-22 saved-city-card p-3');
  const top = el('div', 'sc-top');
  top.append(el('span', 'sc-name', city.name));

  const delBtn = el('button', 'delete-city-btn');
  delBtn.setAttribute('aria-label', 'Hapus kota');
  delBtn.appendChild(icon('x'));
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onDelete(city);
  });
  top.appendChild(delBtn);

  const main = el('div', 'sc-main');
  if (weatherSnapshot) {
    main.append(icon(weatherSnapshot.icon), el('span', 'sc-temp', `${weatherSnapshot.temp}\u00B0`));
  } else {
    main.append(el('span', 'sc-temp skeleton', '\u00A0\u00A0\u00A0'));
  }

  card.append(top, main, el('p', 'sc-desc', weatherSnapshot ? weatherSnapshot.label : '...'));
  card.addEventListener('click', () => onOpen(city));
  return card;
}

export function renderSearchResult(place, isSaved, onOpen, onToggleSave) {
  const row = el('div', 'search-result-item');
  const info = el('div', 'sri-info');
  info.append(
    el('p', 'sri-name', place.name),
    el('p', 'sri-sub', [place.admin1, place.country].filter(Boolean).join(', '))
  );
  info.addEventListener('click', () => onOpen(place));

  const saveBtn = el('button', 'save-city-btn');
  saveBtn.setAttribute('aria-label', isSaved ? 'Hapus dari tersimpan' : 'Simpan kota');
  const ic = icon(isSaved ? 'bookmark-check' : 'bookmark', isSaved ? 'icon saved' : 'icon');
  saveBtn.appendChild(ic);
  saveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onToggleSave(place, saveBtn);
  });

  row.append(info, saveBtn);
  return row;
}

export function renderHistoryChip(term, onClick) {
  const chip = el('button', 'history-chip', term);
  chip.addEventListener('click', () => onClick(term));
  return chip;
}
