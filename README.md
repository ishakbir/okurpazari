# Okur Pazarı — İkinci El Kitap İlan Platformu

**Okur Pazarı**, kullanıcıların ikinci el kitaplarını güvenle listeleyip satabileceği, alıcıların ise aradıkları eserleri kolayca bulup mesajlaşma veya soru-cevap yoluyla satıcılarla iletişim kurabileceği **moderasyonlu ve gerçek zamanlı bir e-ticaret ilan platformudur**.

---

## 🚀 Öne Çıkan Özellikler

### 👥 Kullanıcı ve Rol Yönetimi
- **Güvenli Auth Sistemi:** JWT tabanlı Access Token ve HttpOnly Cookie tabanlı Refresh Token mekanizması ile güvenli kimlik doğrulama.
- **Rol Tabanlı Yetkilendirme (RBAC):** `ADMIN` ve `USER` rolleri ile gelişmiş moderasyon ve yönetim kontrolleri.

### 📖 İlan ve Kategori Sistemi
- **Onaylı İlan Girişi:** Kullanıcılar tarafından eklenen ilanlar **PENDING (Onay Bekliyor)** durumunda başlar ve admin panelinden onaylandıktan (`ACTIVE`) sonra listelenir.
- **Zengin İlan Detayları:** Kitap adı, yazar, açıklama, kategori, alt kategori, ürün kondisyonu (Sıfır, Sıfır Gibi, Az Kullanılmış vb.) ve çoklu resim yükleme desteği.
- **SEO-Friendly URL (Slug):** Arama motorları uyumlu otomatik Türkçe karakter destekli URL yapılandırması.

### 💬 Gerçek Zamanlı Sohbet ve Soru-Cevap (Q&A)
- **Direct Messaging (DM):** Alıcı ve satıcı arasında gerçek zamanlı (Socket.io), anlık yazıyor göstergeli ve okundu bildirimli sohbet odaları.
- **Genel Soru-Cevap:** İlan sayfalarında herkesin görebileceği, satıcının yanıtlayabileceği genel soru-cevap alanı.
- **Anlık Bildirimler:** İlan onay/red durumları, yeni mesajlar, sorular ve sipariş durum güncellemeleri için anlık bildirim sistemi.

### 🛒 Satın Alma ve Kargo Takip Akışı
- **Mock Ödeme ve Sipariş:** Güvenli ödeme simülasyonu ile kolay satın alım.
- **Kargo Yönetimi:** Satıcılar için otomatik kargo barkod üretimi ve alıcılar için teslim onay sistemi.

### 🛠️ Gelişmiş Admin Yönetim Paneli
- **Dashboard İstatistikleri:** Toplam üye, aktif ilan, bekleyen moderasyon ve sipariş verilerinin görselleştirilmesi.
- **Kategori & Navigasyon Yönetimi:** Dinamik menü kategorileri ve alt kategori tanımları.
- **Tema & Slider Yönetimi:** Ana sayfadaki görsel slider'ın, gri maske (overlay) efektlerinin ve buton linklerinin dinamik yönetimi.

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji / Kütüphane | Kullanım Amacı |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 16 (App Router)** | React Framework, SSR/CSR, App router yapısı |
| | **React 19 & TypeScript** | Tip güvenliği ve dinamik arayüz yönetimi |
| | **Tailwind CSS** | Premium, responsive ve modern arayüz tasarımı |
| | **Lucide React** | Minimalist ve modern ikon paketi |
| | **Socket.io Client** | Gerçek zamanlı WebSocket bağlantıları |
| **Backend** | **Node.js & Express.js** | Hızlı, ölçeklenebilir RESTful API mimarisi |
| | **Sequelize ORM** | MySQL veritabanı nesne ilişkisel modelleme (ORM) |
| | **MySQL 8.x** | Güvenilir ve ilişkisel veri saklama |
| | **Socket.io** | Sohbet, yazıyor... durumu ve bildirim yönetimi |
| | **Multer** | Profil, ilan ve slider resimleri yükleme yönetimi |
| | **Helmet & CORS** | Güvenlik başlıkları ve CORS güvenlik politikaları |
| | **bcryptjs** | Güvenli tek yönlü şifre hash'leme |

---

## 📦 Kurulum ve Çalıştırma

### 1. Ön Gereksinimler
- **Node.js** (v18 veya üzeri)
- **MySQL** (v8.x veya üzeri)

### 2. Veritabanı Hazırlığı
MySQL konsolunuzda aşağıdaki veritabanını oluşturun:
```sql
CREATE DATABASE listing_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Backend Kurulumu
```bash
cd backend
cp .env.example .env # DB_PASSWORD ve JWT_SECRET'larınızı tanımlayın
npm install
npm run dev # http://localhost:5001 adresinde sunucu başlar
```

### 4. Frontend Kurulumu
```bash
cd ../frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:5001/api" > .env.local
npm install
npm run dev # http://localhost:3000 adresinde arayüz başlar
```

---

## 🔑 Öntanımlı Test Hesapları

Sistemi doğrudan deneyimleyebilmeniz için önceden tanımlanmış test kullanıcıları:

- **Yönetici (Admin) Girişi:**
  - E-posta: `admin@demo.com`
  - Şifre: `Admin123!`
- **Satıcı (User) Girişi:**
  - E-posta: `satici@demo.com`
  - Şifre: `satici123`
- **Alıcı (User) Girişi:**
  - E-posta: `alici@demo.com`
  - Şifre: `alici123`




## Galeri

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

  
