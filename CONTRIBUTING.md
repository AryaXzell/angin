# Berkontribusi ke Angin

Terima kasih sudah tertarik berkontribusi! 🌬️

## Prinsip utama

Sebelum menambahkan sesuatu, tolong jaga prinsip inti proyek ini:

1. **Tidak ada build step.** Semua kode harus berjalan langsung di browser tanpa transpile/bundle.
2. **Tidak ada framework atau dependency runtime baru** kecuali benar-benar tidak terhindarkan — dan bahkan begitu, diskusikan dulu lewat issue.
3. **Tidak ada `innerHTML` dengan data dinamis.** Selalu gunakan DOM API (`createElement`, `textContent`, `append`) — lihat `js/render.js` untuk polanya.
4. **Animasi berat pakai CSS, bukan JS loop.** Kalau memungkinkan, hindari `requestAnimationFrame` untuk animasi berkelanjutan.

## Alur kerja

1. Fork repo ini
2. Buat branch baru: `git checkout -b fitur/nama-fitur`
3. Jalankan lokal dengan static server apa pun (lihat README bagian "Mulai")
4. Test manual di beberapa ukuran layar (mobile-first)
5. Commit dengan pesan yang jelas
6. Buka Pull Request dengan deskripsi perubahan

## Struktur kode

- Setiap file di `js/` punya satu tanggung jawab spesifik — hindari menumpuk logic tidak terkait di satu file
- String yang tampil ke pengguna masuk ke `js/i18n.js` (ID & EN)
- Style baru masuk ke `css/components.css`, token warna/spacing baru ke `css/base.css`

## Melaporkan bug

Buka issue dengan:
- Langkah reproduksi
- Perilaku yang diharapkan vs. yang terjadi
- Browser & perangkat yang digunakan

## Kode etik

Bersikap baik dan hormat. Diskusi teknis yang membangun selalu diterima.
