# TeraMap Backend Rezervasyon Sistemi

## Özellikler

✅ **Tamamlanan Özellikler:**
1. **Backend API** - Rezervasyon kabul eden REST API
2. **Veritabanı Entegrasyonu** - SQLite veritabanı ile kalıcı veri saklama
3. **E-posta Bildirimleri** - Otomatik müşteri onayı ve admin bildirimi

## Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. E-posta Yapılandırması (İsteğe Bağlı)

E-posta bildirimlerini etkinleştirmek için environment variables ayarlayın:

```bash
# Windows PowerShell
$env:SMTP_HOST = "smtp.gmail.com"
$env:SMTP_PORT = "587"
$env:SMTP_USER = "your-email@gmail.com"
$env:SMTP_PASS = "your-app-password"
$env:ADMIN_EMAIL = "admin@teramap.com"

# Linux/Mac
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USER="your-email@gmail.com"
export SMTP_PASS="your-app-password"
export ADMIN_EMAIL="admin@teramap.com"
```

**Not:** E-posta yapılandırması yapılmazsa sistem yine çalışır, sadece e-postalar konsola log olarak yazılır.

### 3. Server'ı Başlat
```bash
npm start
```

## API Endpoints

### POST /api/reservation
Yeni rezervasyon oluşturur.

**Request Body:**
```json
{
  "venue": "Mekan Adı",
  "date": "2025-07-15",
  "name": "Müşteri Adı",
  "email": "musteri@email.com",
  "phone": "0555 123 4567"
}
```

**Response:**
```json
{
  "success": true,
  "reservation": {
    "id": 1,
    "venue": "Mekan Adı",
    "date": "2025-07-15",
    "name": "Müşteri Adı",
    "email": "musteri@email.com",
    "phone": "0555 123 4567",
    "status": "pending",
    "created_at": "2025-01-03T10:30:00Z"
  },
  "message": "Rezervasyon başarıyla alındı! E-posta ile onay gönderilecek."
}
```

### GET /api/reservations
Tüm rezervasyonları listeler (oturum açmış kullanıcılar için).

**Response:**
```json
{
  "success": true,
  "reservations": [
    {
      "id": 1,
      "venue": "Mekan Adı",
      "date": "2025-07-15",
      "name": "Müşteri Adı",
      "email": "musteri@email.com",
      "phone": "0555 123 4567",
      "status": "pending",
      "created_at": "2025-01-03T10:30:00Z"
    }
  ]
}
```

## Veritabanı

SQLite veritabanı (`backend/data/teramap.db`) otomatik olarak oluşturulur ve şu tabloları içerir:

- **reservations**: Rezervasyon bilgileri
- **email_logs**: E-posta gönderim logları

## E-posta Şablonları

### Müşteri Onay E-postası
- Rezervasyon detayları
- Onay mesajı
- TeraMap branding

### Admin Bildirim E-postası  
- Yeni rezervasyon uyarısı
- Hızlı onay/red butonları
- Müşteri iletişim bilgileri

## Güvenlik

- Rezervasyon API'si herkese açık
- Rezervasyon listesi sadece oturum açmış kullanıcılar
- E-posta validasyonu
- SQL injection koruması (prepared statements)

## Geliştirme

Server'ı geliştirme modunda çalıştırmak için:
```bash
npm run dev
``` 