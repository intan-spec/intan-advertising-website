# Panduan Deployment Website Intan Advertising

## Masalah yang Terjadi

Anda mengalami masalah login setelah deploy ke Netlify karena **Netlify hanya hosting frontend (static files)**, sedangkan backend API server tidak ter-deploy.

## Solusi Deployment

### 1. **Frontend (Netlify) ✅**
- Netlify sudah benar untuk hosting frontend
- File `netlify.toml` sudah dibuat untuk konfigurasi yang tepat

### 2. **Backend (Perlu Deploy Terpisah) ❌**
Backend Node.js server harus di-deploy ke platform terpisah:

#### **Opsi A: Railway (Recommended)**
1. Buat akun di [Railway.app](https://railway.app)
2. Connect GitHub repository
3. Deploy dari folder project ini
4. Railway akan otomatis detect Node.js dan menjalankan `npm start`
5. Copy URL yang diberikan Railway (contoh: `https://your-app.railway.app`)

#### **Opsi B: Render**
1. Buat akun di [Render.com](https://render.com)
2. Create new Web Service
3. Connect repository
4. Set build command: `npm install`
5. Set start command: `npm start`

#### **Opsi C: Heroku**
1. Install Heroku CLI
2. `heroku create your-app-name`
3. `git push heroku main`

### 3. **Update Konfigurasi**
Setelah backend ter-deploy, update file `api.js`:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'  // Local development
    : 'https://YOUR-BACKEND-URL-HERE';  // Ganti dengan URL backend Anda
```

### 4. **Environment Variables di Backend**
Pastikan di platform hosting backend, set environment variables:
- `DATABASE_URL` = Connection string Neon database Anda
- `ADMIN_PASSWORD` = Password admin yang aman
- `NODE_ENV` = production

## Langkah-langkah Deployment

### Step 1: Deploy Backend
1. Pilih platform (Railway/Render/Heroku)
2. Deploy project ini ke platform tersebut
3. Set environment variables
4. Test API endpoint: `https://your-backend-url/api/products`

### Step 2: Update Frontend
1. Edit `api.js` dengan URL backend yang benar
2. Commit dan push ke GitHub
3. Netlify akan otomatis re-deploy

### Step 3: Test
1. Buka website Netlify Anda
2. Coba login dengan credentials admin
3. Pastikan data billboard muncul

## Troubleshooting

### Jika masih tidak bisa login:
1. **Check browser console** untuk error messages
2. **Verify backend URL** di Network tab browser
3. **Check CORS settings** di server.js
4. **Verify environment variables** di platform hosting

### CORS Issues:
Jika ada CORS error, pastikan di `server.js`:
```javascript
app.use(cors({
    origin: ['https://your-netlify-url.netlify.app', 'http://localhost:8000'],
    credentials: true
}));
```

## Struktur Deployment Final
```
Frontend (Netlify) → API calls → Backend (Railway/Render) → Database (Neon)
```

Setiap komponen harus di-deploy terpisah untuk aplikasi full-stack seperti ini.