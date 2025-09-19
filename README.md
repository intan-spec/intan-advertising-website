# Intan Advertising Website - Neon Database Migration

## Overview
Website ini telah berhasil dimigrasi dari localStorage ke Neon Database untuk penyimpanan data yang lebih robust dan scalable.

## Setup Database Neon

### 1. Buat Akun Neon
1. Kunjungi [Neon.tech](https://neon.tech)
2. Daftar akun baru atau login
3. Buat project baru

### 2. Konfigurasi Database
1. Copy connection string dari dashboard Neon
2. Edit file `.env` dan ganti `DATABASE_URL` dengan connection string Anda:
   ```
   DATABASE_URL=postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### 3. Struktur Database
Database akan otomatis membuat tabel berikut saat server pertama kali dijalankan:

#### Tabel `products`
- `id` (SERIAL PRIMARY KEY)
- `location` (VARCHAR(255))
- `image` (TEXT)
- `category` (VARCHAR(100))
- `status` (VARCHAR(50))
- `size` (VARCHAR(100))
- `area` (VARCHAR(100))
- `orientation` (VARCHAR(50))
- `viewingDirection` (VARCHAR(100))
- `traffic` (VARCHAR(50))
- `description` (TEXT)
- `mapsUrl` (TEXT)
- `driveUrl` (TEXT)
- `videoUrl` (TEXT)
- `availabilityDate` (DATE)
- `lastUpdated` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

#### Tabel `admin_sessions`
- `id` (SERIAL PRIMARY KEY)
- `token` (VARCHAR(255) UNIQUE)
- `username` (VARCHAR(100))
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `expires_at` (TIMESTAMP)

## Menjalankan Aplikasi

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env dengan kredensial database Neon Anda
```

### 3. Jalankan Server
```bash
npm run server
```
Server akan berjalan di http://localhost:3000

### 4. Jalankan Frontend (Opsional)
Jika ingin menjalankan frontend terpisah:
```bash
npm run client
```
Frontend akan berjalan di http://localhost:8000

## Fitur Database

### API Endpoints
- `GET /api/products` - Ambil semua produk
- `GET /api/products/:id` - Ambil produk berdasarkan ID
- `POST /api/products` - Tambah produk baru (perlu auth)
- `PUT /api/products/:id` - Update produk (perlu auth)
- `DELETE /api/products/:id` - Hapus produk (perlu auth)
- `POST /api/admin/login` - Login admin
- `POST /api/admin/verify` - Verifikasi session admin
- `POST /api/admin/logout` - Logout admin

### Autentikasi
- Username: `admin`
- Password: `admin123`
- Session menggunakan JWT token
- Token disimpan di localStorage untuk persistence

### Fallback System
Jika koneksi database gagal, aplikasi akan:
1. Menampilkan pesan error di console
2. Menggunakan sample data sebagai fallback
3. Tetap berfungsi normal dengan data sample

## Migrasi Data

### Dari localStorage ke Neon
Data yang sebelumnya disimpan di localStorage akan otomatis dimuat ke database Neon saat:
1. Admin login pertama kali
2. Menambah/edit produk baru
3. Data sample akan digunakan sebagai data awal

### Backup Data
Data di database Neon otomatis ter-backup oleh sistem Neon. Untuk backup manual:
1. Export data melalui Neon dashboard
2. Atau gunakan pg_dump dengan connection string

## Troubleshooting

### Database Connection Error
Jika muncul error koneksi database:
1. Pastikan DATABASE_URL di .env sudah benar
2. Cek koneksi internet
3. Verifikasi kredensial di Neon dashboard
4. Aplikasi tetap bisa berjalan dengan sample data

### Server Error
Jika server tidak bisa start:
1. Pastikan port 3000 tidak digunakan aplikasi lain
2. Cek log error di terminal
3. Restart server dengan `npm run server`

## Development

### Struktur File
- `server.js` - Express server dengan Neon integration
- `api.js` - API helper functions untuk frontend
- `script.js` - Frontend JavaScript (sudah diupdate untuk API calls)
- `.env` - Environment variables
- `package.json` - Dependencies dan scripts

### Testing
1. Test koneksi database: akses http://localhost:3000/api/products
2. Test admin login: gunakan form login di website
3. Test CRUD operations: tambah/edit/hapus produk sebagai admin

## Production Deployment

### Environment Variables
Pastikan set environment variables berikut di production:
- `DATABASE_URL` - Neon connection string
- `PORT` - Port server (default: 3000)
- `NODE_ENV` - Set ke "production"
- `ADMIN_USERNAME` - Username admin
- `ADMIN_PASSWORD` - Password admin

### Security
- Ganti default admin credentials
- Gunakan HTTPS di production
- Set proper CORS origins
- Gunakan environment variables untuk secrets