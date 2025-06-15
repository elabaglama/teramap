# Tera - Gençlik Ekipleri ve Mekanlar Platformu

Tera, gençlik ekiplerinin etkinliklerini düzenleyebilecekleri mekanları bulmalarını ve mekan sahipleriyle iletişim kurmalarını sağlayan bir platformdur.

## Özellikler

- Davetiye kodu sistemi ile kontrollü üyelik
- Güvenli giriş ve oturum yönetimi
- Mekan listeleme ve rezervasyon tarihleri görüntüleme
- Mekan sahiplerine mesaj gönderme
- Gençlik ekiplerinin etkinliklerini görüntüleme
- Profil bilgilerini güncelleme

## Teknolojiler

- Node.js
- Express.js
- HTML5
- CSS3
- JavaScript (ES6+)

## Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/kullaniciadi/tera.git
cd tera
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Sunucuyu başlatın:
```bash
npm run dev
```

4. Tarayıcınızda http://localhost:3000 adresini açın.

## Veri Yapısı

Proje, JSON dosyalarını veritabanı olarak kullanmaktadır:

- `data/users.json`: Kullanıcı bilgileri
- `data/invite_codes.json`: Davetiye kodları
- `data/venues.json`: Mekan bilgileri
- `data/teams.json`: Gençlik ekipleri ve etkinlikleri
- `data/messages.json`: Mekan sahiplerine gönderilen mesajlar

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. 