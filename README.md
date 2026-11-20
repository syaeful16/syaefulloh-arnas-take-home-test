# Geographic Entity Interactive Map

Aplikasi peta interaktif fullstack untuk mengelola entitas geografis (CRUD, pencarian ter-debounce, filter kategori & status, sinkronisasi filter ke URL query string, serta visualisasi marker dan label di peta) yang dibangun menggunakan **Next.js**, **Go**, dan **PostgreSQL**.

---

## Cara Menjalankan Program

### Menjalankan dengan Docker Compose (Direkomendasikan)

Konfigurasi default sudah disediakan di `docker-compose.yml`, sehingga proyek dapat langsung dijalankan tanpa perlu membuat file environment (`.env`) secara manual.

1. Pastikan **Docker** dan **Docker Compose** sudah aktif di mesin kamu.
2. Masuk ke direktori root proyek, lalu jalankan:

   ```bash
   docker compose up -d --build
   ```
3. Tunggu hingga container `geo_entity_postgres`, `geo_entity_api`, dan `geo_entity_web` berjalan, lalu akses:
   - Frontend (Web App): `http://localhost:3000`
   - Backend API: `http://127.0.0.1:8080`
   - PostgreSQL: `127.0.0.1:5432`

Jika terjadi bentrok port (5432, 8080, atau 3000):
- Edit nilai port secara langsung di `docker-compose.yml` pada bagian `ports:` atau jalankan override variabel port via terminal tanpa mengedit file:
   ```bash
   WEB_PORT=3001 APP_PORT=8081 DB_PORT=5433 docker compose up -d --build
   ```
> Catatan: Jika port backend (`api`) diubah ke port lain (misalnya `8081`), sesuaikan juga `NEXT_PUBLIC_API_BASE_URL` di `docker-compose.yml` menjadi `http://127.0.0.1:8081` lalu jalankan ulang perintah di atas.


Untuk melihat log atau menghentikan seluruh layanan:
```bash
docker compose logs -f // melihat log secara real-time
docker compose down // menghentikan seluruh layanan
```

---

### Pengujian Endpoint API (Bruno Collection)

Koleksi request API tersedia di folder api-collection/Geo Entity API dan dapat dibuka menggunakan aplikasi Bruno:

1. Buka folder `api-collection/Geo Entity API` di **Bruno**.
2. Pada dropdown Environment di pojok kanan atas Bruno, pilih environment yang sesuai (misalnya `local` atau `development` yang mengarah ke `http://127.0.0.1:8080` atau `http://localhost:8080`).
3. Jalankan request endpoint yang dibutuhkan untuk menguji backend API.

### Menjalankan Secara Lokal (Tanpa Docker)

- **Backend (Go)**: pastikan PostgreSQL berjalan, sesuaikan variabel environment database/server, lalu jalankan entry point Go (`go run .` atau `go run ./cmd/api`).
- **Frontend (Next.js)**: pastikan `NEXT_PUBLIC_API_BASE_URL` mengarah ke `http://127.0.0.1:8080`, lalu jalankan:

```bash
pnpm install
pnpm run dev
```

---

## Alasan Pemilihan Library

### Frontend Library
- **Next.js & React (TypeScript)**: menyediakan struktur aplikasi berbasis komponen yang modular, pengelolaan query string/routing yang rapi, serta dukungan TypeScript yang menjaga keamanan tipe data antara form, filter, dan respons API.

- **Tailwind CSS & Komponen UI (shadcn/ui / Radix & Base UI primitives)**: mempercepat penyusunan antarmuka peta interaktif (panel filter, daftar entitas, modal form, dan menu aksi) agar konsisten, responsif, dan mudah dikustomisasi.

- **Zod**: digunakan untuk validasi schema di sisi klien yang deklaratif dan type-safe, sehingga kesalahan input (seperti batas koordinat latitude/longitude dan panjang nama entitas) dapat tertangkap lebih awal sebelum dikirim ke backend.

- **Leaflet / React Leaflet**: ringan, open-source, tidak memerlukan API key berbayar untuk pengujian lokal, serta mendukung marker kustom, label nama permanen, dan pembedaan visual matched vs dimmed saat filter aktif.

### Backend Library
- **Go**: dipilih karena performa eksekusinya tinggi, binary-nya ringan untuk multi-stage build Docker, serta cocok untuk membangun REST API yang cepat dan terstruktur.

- **Fiber**: framework web untuk Go yang ringan dan memiliki performa tinggi. Fiber menyediakan routing, middleware, serta pengelolaan HTTP request dan response yang praktis sehingga mempercepat pengembangan REST API.

- **GORM & Driver PostgreSQL**: mempermudah pengelolaan model data, relasi entitas dan kategori, serta operasi query ke PostgreSQL secara rapi dan terstruktur.

- **github.com/syaeful16/envloader**: library utilitas environment buatan sendiri yang digunakan untuk memuat dan membaca konfigurasi environment aplikasi secara praktis dan terpusat.
