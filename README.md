# 🛍️ SIAD Web App  
**Project SIAD — Yang Penting Kelar 😎**  
_Tim 7 (Bukan Naruto) | Mata Kuliah Web Application Development 03_

---

## 🚀 Overview
**SIAD Web App** adalah aplikasi backend jual beli sederhana dibangun menggunakan **Node.js + Express.js** dengan **Prisma ORM** sebagai layer antara aplikasi dan database.  
Proyek ini dibuat untuk memenuhi tugas mata kuliah *Web Application Development* dan dirancang agar mudah dikembangkan lebih lanjut.

---

## 🧩 Tech Stack
| Kategori | Teknologi |
|-----------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database ORM | Prisma |
| Database | SQLite / PostgreSQL (opsional) |
| Testing | Jest |
| Format Data | JSON (db.json) |

---

## ⚙️ Installation & Setup

1. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/siad-webapp.git
   cd siad-webapp/js-app

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Siapkan database**

   ```bash
   sudo -u postgres psql # login postgresql
   CREATE DATABASE db_wad03_t7bn; # create database
   
   ```

4. **Setel file .env**

   ```bash
   DATABASE_URL="postgresql://siad_user:password123@localhost:5432/db_wad03_t7bn"
   ```

5. **Migrasi skema DB dari Prisma, apply migration!**

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init_schema
   ```

6. **Jalankan server**

   ```bash
   npm start
   ```

Server akan berjalan di:
👉 [http://localhost:3000](http://localhost:3000)

---

## 📦 API Structure

| Endpoint        | Method              | Deskripsi                 |
| --------------- | ------------------- | ------------------------- |
| `/api/users`    | GET / POST          | Ambil atau buat data user |
| `/api/products` | GET                 | Ambil daftar produk       |
| `/api/cart`     | GET / POST / DELETE | Kelola keranjang belanja  |
| `/api/about`    | GET                 | Info tentang aplikasi     |
| `/api/greeting` | GET                 | Pesan sambutan sederhana  |

---

## 🪪 License

### This project is licensed under the **MIT License**.
### Feel free to use, modify, and share — with proper credit to Team 7.
---

✨ *Made with caffeine, collaboration, and a bit of chaos.*
