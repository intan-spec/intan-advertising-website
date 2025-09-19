# 🚀 Panduan Deploy Backend ke Railway

## Langkah 1: Persiapan Akun Railway

1. **Buka** [railway.app](https://railway.app)
2. **Sign up** dengan GitHub account Anda
3. **Verify email** jika diminta

## Langkah 2: Upload Project ke GitHub

Jika belum ada di GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main
```

## Langkah 3: Deploy di Railway

### 3.1 Create New Project
1. Login ke Railway dashboard
2. Klik **"New Project"**
3. Pilih **"Deploy from GitHub repo"**
4. Pilih repository project Anda
5. Klik **"Deploy Now"**

### 3.2 Set Environment Variables
Di Railway dashboard:
1. Klik project Anda
2. Pilih tab **"Variables"**
3. Tambahkan variables berikut:

```
DATABASE_URL = postgresql://username:password@hostname/database?sslmode=require
ADMIN_PASSWORD = ganti_dengan_password_kuat_anda
NODE_ENV = production
PORT = ${{RAILWAY_PUBLIC_PORT}}
```

**⚠️ PENTING:** 
- Ganti `DATABASE_URL` dengan connection string Neon Anda
- Ganti `ADMIN_PASSWORD` dengan password yang kuat (bukan admin123!)

### 3.3 Get Your Backend URL
Setelah deploy berhasil:
1. Di Railway dashboard, klik **"Settings"**
2. Scroll ke **"Domains"**
3. Copy URL yang diberikan (contoh: `https://your-app-production.railway.app`)

## Langkah 4: Update Frontend Configuration

1. **Edit file `api.js`** di project Anda:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'  // Local development
    ? 'https://YOUR-RAILWAY-URL-HERE';  // Ganti dengan URL Railway Anda
```

2. **Ganti `YOUR-RAILWAY-URL-HERE`** dengan URL Railway yang sebenarnya

3. **Commit dan push** ke GitHub:
```bash
git add api.js
git commit -m "Update API URL for production"
git push
```

4. **Netlify akan otomatis re-deploy** frontend Anda

## Langkah 5: Test Deployment

### 5.1 Test Backend API
Buka di browser: `https://your-railway-url/api/products`
- Harus menampilkan data JSON billboard

### 5.2 Test Frontend Login
1. Buka website Netlify Anda
2. Klik tombol **"Admin Login"**
3. Login dengan:
   - Username: `admin`
   - Password: (sesuai yang Anda set di `ADMIN_PASSWORD`)

## Troubleshooting

### ❌ Jika deployment gagal:
1. **Check logs** di Railway dashboard → "Deployments" → klik deployment terakhir
2. **Pastikan** `package.json` memiliki `"start": "node server.js"`
3. **Verify** semua dependencies ada di `package.json`

### ❌ Jika API tidak bisa diakses:
1. **Check** environment variables sudah benar
2. **Test** database connection di Railway logs
3. **Verify** PORT menggunakan `${{RAILWAY_PUBLIC_PORT}}`

### ❌ Jika CORS error:
Update `server.js` untuk allow Netlify domain:
```javascript
app.use(cors({
    origin: [
        'https://your-netlify-site.netlify.app',
        'http://localhost:8000'
    ],
    credentials: true
}));
```

## File yang Sudah Disiapkan

✅ `railway.json` - Konfigurasi Railway
✅ `Procfile` - Backup deployment config  
✅ `package.json` - Sudah ada start script
✅ `netlify.toml` - Konfigurasi Netlify

## Struktur Final

```
GitHub Repo → Railway (Backend) → Neon Database
     ↓
Netlify (Frontend) → API calls → Railway Backend
```

Setelah semua langkah selesai, website Anda akan fully functional! 🎉