<div align="center">

<img src="icons/icon.svg" width="88" height="88" alt="Angin logo">

# Angin

**Cuaca real-time, ringan, dan cepat.**
Progressive Web App tanpa framework, tanpa build step, dan tanpa dependency runtime.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8)](#-progressive-web-app)
[![No Framework](https://img.shields.io/badge/framework-none-success)](#-arsitektur)

[Fitur](#-fitur) · [Mulai](#-mulai) · [Arsitektur](#-arsitektur) · [Performa](#-performa) · [Kontribusi](#-kontribusi)

</div>

---

## Tentang

**Angin** adalah aplikasi cuaca yang dibangun ulang dari nol dengan satu prinsip utama: **secepat dan seringan mungkin**, tanpa mengorbankan fitur atau visual. Tidak ada framework, tidak ada bundler, tidak ada dependency CDN runtime — murni HTML, CSS, dan JavaScript modern (ES Modules) yang berjalan langsung di browser.

Data cuaca ditenagai oleh [Open-Meteo](https://open-meteo.com) — API cuaca gratis, open-source, dan tanpa API key.

## ✨ Fitur

- 🌤️ **Cuaca real-time** — suhu, kondisi, terasa seperti, kelembapan, tekanan, jarak pandang
- ⏰ **Perkiraan per jam** (24 jam) dan **7 hari ke depan**
- 🌬️ **Kualitas udara (AQI)** — standar Eropa, dengan deskripsi tingkat bahaya
- 🌧️ **Grafik curah hujan** 12 jam ke depan
- 🌙 **Fase bulan** dan **matahari terbit/terbenam**, dihitung secara deterministik (tanpa API tambahan)
- 📍 **Kota tersimpan** — simpan kota favorit, lihat cuacanya sekilas
- 🔍 **Pencarian kota** dengan riwayat pencarian
- ⚠️ **Peringatan cuaca proaktif** — notifikasi suhu ekstrem, angin kencang, potensi hujan deras
- 🌐 **Dwibahasa** — Indonesia & Inggris
- 📱 **PWA penuh** — bisa dipasang di layar utama, berfungsi offline dengan cache
- ♿ **Aksesibel** — dukungan keyboard navigation, ARIA labels, `prefers-reduced-motion`
- 🎨 **Tema** — Auto, Gelap, dan AMOLED (hitam pekat, hemat baterai OLED)

## 🚀 Mulai

Proyek ini **tidak memerlukan build step**. Cukup sajikan foldernya lewat web server statis apa pun:

```bash
# Opsi 1: Python
python3 -m http.server 8080

# Opsi 2: Node (http-server)
npx http-server -p 8080

# Opsi 3: PHP
php -S localhost:8080
```

Lalu buka `http://localhost:8080`.

> **Penting:** karena project ini pakai ES Modules (`<script type="module">`) dan Service Worker, ia **tidak bisa** dibuka langsung lewat `file://` — harus lewat HTTP server (lokal maupun deploy).

### Deploy

Bisa langsung di-deploy ke Vercel, Netlify, GitHub Pages, atau Cloudflare Pages tanpa konfigurasi build apa pun — cukup arahkan ke root folder ini.

Sebelum deploy ke produksi, ganti placeholder domain `https://angin.example.app` di file-file berikut dengan domain asli:
- `index.html` (canonical, Open Graph, Twitter Card, JSON-LD)
- `robots.txt`
- `sitemap.xml`
- `llms.txt`

## 🏗 Arsitektur

```
angin/
├── index.html              # Entry point, semua meta tag SEO/PWA
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service worker (cache-first shell, network-first API)
├── robots.txt               # Crawler rules (termasuk AI agent crawlers)
├── sitemap.xml               # Sitemap XML
├── llms.txt                    # Konteks terstruktur untuk AI agent
├── css/
│   ├── base.css             # Reset, design tokens, typography
│   ├── utilities.css        # Utility classes minimal (bukan Tailwind)
│   └── components.css       # Semua komponen UI + animasi CSS-only
├── icons/
│   ├── sprite.svg            # Sprite SVG lokal (ikon di-inline ke index.html)
│   ├── icon*.png              # App icons berbagai ukuran
│   └── og-image.png            # Gambar Open Graph / Twitter Card
└── js/
    ├── main.js               # Entry point aplikasi
    ├── state.js               # State management (plain object + pub/sub)
    ├── weather.js              # Orkestrasi fetch → cache → render
    ├── render.js                # DOM builder aman (tanpa innerHTML dinamis)
    ├── network.js                # Fetch layer (timeout, cache, stale-while-revalidate)
    ├── background.js              # Latar belakang ambient CSS-driven (bukan canvas)
    ├── weatherAlerts.js             # Deteksi kondisi ekstrem → notifikasi
    ├── i18n.js                       # String table dwibahasa
    └── ...                             # Modul lain (search, navigation, settings, dst.)
```

### Prinsip desain

1. **Nol dependency runtime.** Tidak ada Tailwind CDN, tidak ada library ikon eksternal, tidak ada framework. Semua CSS ditulis tangan; semua ikon adalah SVG sprite lokal.
2. **Nol `innerHTML` dengan data dinamis.** Semua rendering pakai DOM API (`createElement`, `textContent`) untuk menghilangkan risiko XSS dari data yang berasal dari API eksternal (misalnya nama kota hasil pencarian).
3. **CSS-driven animation, bukan JavaScript loop.** Latar belakang ambient (hujan, salju, bintang, awan) memakai animasi CSS murni yang berjalan di GPU compositor — bukan `requestAnimationFrame` + `<canvas>` yang terus-menerus memakai CPU/RAM.
4. **Stale-while-revalidate.** Data cuaca yang di-cache langsung ditampilkan, lalu disegarkan di latar belakang — pengguna tidak pernah menatap layar loading kalau ada data lama yang masih relevan.

## ⚡ Performa

Target: **Google PageSpeed Insights 90+** di seluruh kategori (Performance, Accessibility, Best Practices, SEO), dicapai lewat:

- Tidak ada render-blocking script pihak ketiga (CDN Tailwind/Lucide dihapus total)
- CSS kritis di-inline di `<head>`, sisanya non-blocking
- Ikon sebagai SVG sprite inline (nol request tambahan)
- Gambar ikon di-generate dalam berbagai ukuran agar tidak ada oversized image
- Tidak ada JavaScript framework (nol overhead parsing/hydration)
- Service worker untuk instant repeat-load dan dukungan offline
- Animasi berjalan di GPU lewat CSS, bukan JS

## 🔒 Privasi

Angin tidak memiliki server backend dan tidak mengumpulkan data pengguna. Semua preferensi (satuan, tema, bahasa) dan kota tersimpan disimpan secara lokal di perangkat lewat `localStorage`. Data cuaca diambil langsung dari Open-Meteo tanpa perantara.

## 🤝 Kontribusi

Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan berkontribusi.

## 📄 Lisensi

[MIT](LICENSE) © 2026 AryaXzell
