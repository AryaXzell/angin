// background.js — CSS-driven ambient background. No canvas, no requestAnimationFrame loop.
// Only touches the DOM once per weather change (a handful of class/style writes),
// then the GPU compositor handles all animation for free.

let bgLayerA, bgLayerB, activeIsA = true;
let lightningTimer = null;

function ensureLayers(bgGradientEl) {
  if (bgLayerA) return;
  bgGradientEl.replaceChildren();
  bgLayerA = document.createElement('div');
  bgLayerB = document.createElement('div');
  bgLayerA.className = 'bg-layer';
  bgLayerB.className = 'bg-layer';
  bgLayerB.style.opacity = '0';
  bgGradientEl.append(bgLayerA, bgLayerB);
}

function buildAmbientLayer(type, isDay, temp) {
  const root = document.createElement('div');

  if (temp >= 34 && isDay) {
    root.appendChild(Object.assign(document.createElement('div'), { className: 'ambient-heat' }));
  } else if (type === 'rain' || type === 'thunder') {
    root.appendChild(Object.assign(document.createElement('div'), { className: 'ambient-rain' }));
  } else if (type === 'snow') {
    root.appendChild(Object.assign(document.createElement('div'), { className: 'ambient-snow' }));
  } else if (type === 'fog' || type === 'clouds') {
    const count = type === 'fog' ? 5 : 4;
    for (let i = 0; i < count; i++) {
      const c = document.createElement('div');
      c.className = 'ambient-cloud';
      const size = 80 + Math.random() * 160;
      c.style.width = c.style.height = `${size}px`;
      c.style.top = `${Math.random() * 55}%`;
      c.style.left = '0';
      c.style.animationDuration = `${35 + Math.random() * 40}s`;
      c.style.animationDelay = `-${Math.random() * 30}s`;
      root.appendChild(c);
    }
  } else if (!isDay) {
    root.appendChild(Object.assign(document.createElement('div'), { className: 'ambient-stars' }));
  } else {
    for (let i = 0; i < 3; i++) {
      const c = document.createElement('div');
      c.className = 'ambient-cloud';
      const size = 60 + Math.random() * 90;
      c.style.width = c.style.height = `${size}px`;
      c.style.top = `${Math.random() * 30}%`;
      c.style.left = '0';
      c.style.opacity = '0.5';
      c.style.animationDuration = `${45 + Math.random() * 30}s`;
      c.style.animationDelay = `-${Math.random() * 30}s`;
      root.appendChild(c);
    }
  }
  return root;
}

export function renderBackground(bgGradientEl, ambientBgEl, lightningEl, type, isDay, temp) {
  ensureLayers(bgGradientEl);

  let from, to;
  if (temp >= 34 && isDay) { from = '#e65100'; to = '#ff6d00'; }
  else if (type === 'thunder') { from = isDay ? '#37474f' : '#0d1117'; to = isDay ? '#546e7a' : '#161b22'; }
  else if (type === 'rain') { from = isDay ? '#4a5568' : '#1a1f2e'; to = isDay ? '#718096' : '#2d3340'; }
  else if (type === 'snow') { from = isDay ? '#b0bec5' : '#37474f'; to = isDay ? '#cfd8dc' : '#546e7a'; }
  else if (type === 'fog') { from = isDay ? '#8e9eab' : '#3e4a54'; to = isDay ? '#b0bec5' : '#5a6a78'; }
  else if (type === 'clouds') { from = isDay ? '#607d8b' : '#263238'; to = isDay ? '#90a4ae' : '#37474f'; }
  else if (!isDay) { from = '#0c1428'; to = '#1a2450'; }
  else { from = '#3b82f6'; to = '#93c5fd'; }

  const gradient = `linear-gradient(to bottom, ${from}, ${to})`;
  const incoming = activeIsA ? bgLayerB : bgLayerA;
  const outgoing = activeIsA ? bgLayerA : bgLayerB;
  incoming.style.backgroundImage = gradient;
  incoming.style.opacity = '1';
  outgoing.style.opacity = '0';
  activeIsA = !activeIsA;

  ambientBgEl.replaceChildren(buildAmbientLayer(type, isDay, temp));

  clearInterval(lightningTimer);
  lightningTimer = null;
  if (type === 'thunder' && lightningEl) {
    const scheduleFlash = () => {
      lightningEl.classList.remove('flash');
      void lightningEl.offsetWidth; // restart CSS animation
      lightningEl.classList.add('flash');
    };
    lightningTimer = setInterval(() => {
      if (Math.random() < 0.35) scheduleFlash();
    }, 2200 + Math.random() * 3000);
  }
}

export function stopAmbient() {
  clearInterval(lightningTimer);
  lightningTimer = null;
}
