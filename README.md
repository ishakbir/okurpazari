<div align="center">

# 📚 OkurPazarı
### İkinci El Kitap İlan Platformu · Second-Hand Book Marketplace

<p>
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io">
  <img src="https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/TypeScript-Typed-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
</p>

<p><strong>🇹🇷 Türkçe</strong> · <a href="#-english">🇬🇧 English</a></p>

</div>

---

## 🇹🇷 Türkçe

### Hakkında

Kullanıcıların ikinci el kitaplarını güvenle listeleyip satabileceği, alıcıların ise aradıkları eserleri kolayca bulup mesajlaşma veya soru-cevap yoluyla satıcılarla iletişim kurabileceği **moderasyonlu ve gerçek zamanlı bir ilan platformudur**.

---

### Temel Özellikler

| Özellik | Açıklama |
|---------|----------|
| **Kimlik Doğrulama** | JWT + HttpOnly Cookie tabanlı güvenli Access/Refresh Token akışı |
| **Rol Bazlı Yetkilendirme** | `ADMIN` ve `USER` rolleri ile moderasyon ve yönetim kontrolleri |
| **Onaylı İlan Sistemi** | İlanlar `PENDING` olarak başlar, admin onayı sonrası `ACTIVE` olur |
| **Zengin İlan Detayları** | Kitap adı, yazar, kategori, kondisyon, çoklu resim yükleme |
| **SEO-Friendly URL** | Türkçe karakter destekli otomatik slug oluşturma |
| **Gerçek Zamanlı Sohbet** | Socket.io ile anlık mesajlaşma, yazıyor göstergesi, okundu bildirimi |
| **Soru-Cevap (Q&A)** | İlan sayfalarında herkese açık soru-cevap alanı |
| **Anlık Bildirimler** | İlan onay/red, yeni mesaj, soru ve sipariş güncellemeleri |
| **Satın Alma & Kargo** | Mock ödeme simülasyonu, otomatik kargo barkod üretimi, teslim onayı |
| **Admin Paneli** | Dashboard istatistikleri, kategori yönetimi, slider & tema yönetimi |

---

### Teknoloji Yığını

| Katman | Teknoloji | Kullanım Amacı |
|--------|-----------|----------------|
| **Frontend** | Next.js 16 (App Router) | SSR/CSR React Framework |
| | React 19 + TypeScript | Tip güvenli dinamik arayüz |
| | Tailwind CSS | Responsive, modern tasarım |
| | Lucide React | Minimalist ikon paketi |
| | Socket.io Client | Gerçek zamanlı WebSocket bağlantıları |
| **Backend** | Node.js + Express.js | RESTful API sunucusu |
| | Sequelize ORM | MySQL nesne ilişkisel modelleme |
| | MySQL 8.x | İlişkisel veri saklama |
| | Socket.io | Sohbet, yazıyor durumu, bildirimler |
| | Multer | Resim yükleme yönetimi |
| | Helmet + CORS | Güvenlik başlıkları ve CORS politikaları |
| | bcryptjs | Güvenli şifre hash'leme |
| **Auth** | JWT (Access + Refresh) | Durumsuz kimlik doğrulama |

---

### Kurulum

**Ön Gereksinimler:** Node.js v18+, MySQL v8.x+

```sql
CREATE DATABASE listing_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
# Backend
cd backend
cp .env.example .env    # DB_PASSWORD ve JWT_SECRET tanımlayın
npm install
npm run dev             # → http://localhost:5001

# Frontend
cd ../frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:5001/api" > .env.local
npm install
npm run dev             # → http://localhost:3000
```

---

### Test Hesapları

| Rol | E-posta | Şifre |
|-----|---------|-------|
| **Yönetici** | `admin@demo.com` | `Admin123!` |
| **Satıcı** | `satici@demo.com` | `satici123` |
| **Alıcı** | `alici@demo.com` | `alici123` |

---

<br>

<a name="-english"></a>

## 🇬🇧 English

### About

A moderated, real-time marketplace where users can list, discover, and purchase second-hand books — featuring instant messaging, Q&A, order tracking, and a full admin panel.

---

### Key Features

| Feature | Description |
|---------|-------------|
| **Authentication** | JWT + HttpOnly Cookie based secure Access/Refresh Token flow |
| **Role-Based Access** | `ADMIN` and `USER` roles with granular permission gates |
| **Moderated Listings** | Listings start as `PENDING`, go live after admin approval (`ACTIVE`) |
| **Rich Details** | Book title, author, category, condition, multi-image upload |
| **SEO-Friendly Slugs** | Auto-generated, Turkish-character-aware URL slugs |
| **Real-Time Chat** | Socket.io powered DM with typing indicators and read receipts |
| **Public Q&A** | Open question-answer threads on listing pages |
| **Instant Notifications** | Real-time alerts for approvals, messages, questions, order updates |
| **Purchase & Shipping** | Mock payment, auto-generated shipping barcodes, delivery confirmation |
| **Admin Panel** | Dashboard analytics, category management, slider & theme control |

---

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16 (App Router) | SSR/CSR React framework |
| | React 19 + TypeScript | Type-safe dynamic UI |
| | Tailwind CSS | Responsive, modern styling |
| | Lucide React | Minimalist icon library |
| | Socket.io Client | Real-time WebSocket connections |
| **Backend** | Node.js + Express.js | RESTful API server |
| | Sequelize ORM | MySQL object-relational mapping |
| | MySQL 8.x | Relational data storage |
| | Socket.io | Chat, typing indicators, notifications |
| | Multer | Image upload handling |
| | Helmet + CORS | Security headers & cross-origin policies |
| | bcryptjs | Secure password hashing |
| **Auth** | JWT (Access + Refresh) | Stateless authentication |

---

### Installation

**Prerequisites:** Node.js v18+, MySQL v8.x+

```sql
CREATE DATABASE listing_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
# Backend
cd backend
cp .env.example .env    # Set DB_PASSWORD and JWT_SECRET
npm install
npm run dev             # → http://localhost:5001

# Frontend
cd ../frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:5001/api" > .env.local
npm install
npm run dev             # → http://localhost:3000
```

---

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@demo.com` | `Admin123!` |
| **Seller** | `satici@demo.com` | `satici123` |
| **Buyer** | `alici@demo.com` | `alici123` |

---

## 📸 Gallery

<img width="1673" height="747" alt="Ekran Resmi 2026-05-31 21 14 41" src="https://github.com/user-attachments/assets/25c48668-9d67-4d7d-83dc-37ae386c673d" />
<br>
<img width="3360" height="3464" alt="screencapture-localhost-3000-ilan-bilinmeyen-rota-agatha-christie-66572266-2026-05-31-21_17_55" src="https://github.com/user-attachments/assets/91a5f79c-e1f1-4b9f-9552-84c0f421a9cf" />
<br>
<img width="3360" height="3134" alt="screencapture-localhost-3000-arama-2026-05-31-21_16_16" src="https://github.com/user-attachments/assets/3d025f80-f943-441e-90fd-2db539c954f6" />
<br>
<img width="254" height="430" alt="Ekran Resmi 2026-05-31 21 24 01" src="https://github.com/user-attachments/assets/574cd571-d85e-43e7-ba23-bb1878c034c0" />
<br>
<img width="1266" height="455" alt="Ekran Resmi 2026-05-31 21 23 53" src="https://github.com/user-attachments/assets/95bff5ca-4731-46bb-bc0d-7eddaa8d4f58" />
<br>
<img width="1069" height="203" alt="Ekran Resmi 2026-05-31 21 23 15" src="https://github.com/user-attachments/assets/c25ad6e5-4eb1-43dd-9230-a016f7f9f645" />
<br>
<img width="1672" height="576" alt="Ekran Resmi 2026-05-31 21 22 47" src="https://github.com/user-attachments/assets/36a95b7e-0649-4f8f-a226-4091d59f460d" />
<br>
<img width="242" height="350" alt="Ekran Resmi 2026-05-31 21 22 19" src="https://github.com/user-attachments/assets/9de73b7d-3a80-4a39-932d-184f5af70ea6" />
<br>
<img width="1670" height="295" alt="Ekran Resmi 2026-05-31 21 17 33" src="https://github.com/user-attachments/assets/06bedba9-31e0-4290-8123-e653591a7e52" />
<br>
<img width="1615" height="733" alt="Ekran Resmi 2026-05-31 21 15 17" src="https://github.com/user-attachments/assets/c7ed484e-61c0-4cba-bab9-c7ce5b88934d" />

---

<div align="center">
  <br>
  <p>Built with ❤️ using Next.js, Express & Socket.io</p>
</div>
