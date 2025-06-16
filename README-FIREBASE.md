# Firebase Authentication Kurulum Rehberi

Firebase authentication'ı Tera Map projenizde aktif hale getirmek için aşağıdaki adımları takip edin.

## 1. Firebase Console'da Proje Oluşturma

1. [Firebase Console](https://console.firebase.google.com/)'a gidin
2. "Create a project" veya "Add project" butonuna tıklayın
3. Proje adı olarak "tera-map" yazın
4. Google Analytics'i aktif edin (önerilen)
5. Projeyi oluşturun

## 2. Authentication Servisini Aktif Etme

1. Sol menüden "Authentication" sekmesine gidin
2. "Get started" butonuna tıklayın
3. "Sign-in method" tabına geçin
4. "Email/Password"ı aktif edin
5. "Google"ı aktif edin (opsiyonel ama önerilen)

## 3. Web App Yapılandırması

1. Proje ayarlarına gidin (⚙️ ikonuna tıklayın)
2. "Your apps" bölümünde "</>" (Web) ikonuna tıklayın
3. App nickname olarak "tera-map-web" yazın
4. "Register app" butonuna tıklayın
5. Firebase SDK configuration kodunu kopyalayın

## 4. Kod Yapılandırması

Kopyaladığınız config bilgilerini aşağıdaki dosyalarda güncelleyin:

### Dosyalar:
- `index.html` (satır ~218)
- `kaydol/index.html` (satır ~158)
- `giris/index.html` (satır ~179)
- `js/firebase-config.js` (satır ~6)

### Değiştirilecek değerler:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key-here", // Buraya kendi API key'inizi yazın
  authDomain: "your-project-id.firebaseapp.com", // Project ID'nizi yazın
  projectId: "your-project-id", // Project ID'nizi yazın
  storageBucket: "your-project-id.appspot.com", // Project ID'nizi yazın
  messagingSenderId: "your-sender-id", // Messaging Sender ID'nizi yazın
  appId: "your-app-id" // App ID'nizi yazın
};
```

## 5. Domain Ayarları (Production için)

Firebase Console'da Authentication > Settings > Authorized domains kısmına production domain'inizi ekleyin:
- `https://www.teramap.works`
- `https://teramap.works`

## 6. Test Etme

1. Kayıt sayfasına gidin: `/kaydol`
2. Test kullanıcısı oluşturun
3. Giriş sayfasından giriş yapın: `/giris`
4. Google ile giriş yapma özelliğini test edin

## Özellikler

✅ **Email/Password ile kayıt**
- Güçlü şifre kontrolü
- Email doğrulama
- Türkçe hata mesajları

✅ **Google ile giriş**
- Tek tıkla kayıt/giriş
- Profil resmi otomatik alınır

✅ **Şifre sıfırlama**
- Email ile şifre sıfırlama
- Güvenli reset linkleri

✅ **Güvenlik**
- JWT token yönetimi
- Otomatik oturum yönetimi
- CORS koruması

✅ **Kullanıcı deneyimi**
- Responsive design
- Loading durumları
- Başarı/hata mesajları

## Profil Sayfası Entegrasyonu

Profil sayfasında Firebase kullanıcı bilgilerini göstermek için `profil/index.html` dosyasında şu ID'lere sahip elementler olmalı:

```html
<div id="user-info">
  <img id="user-avatar" src="" alt="Profil Resmi">
  <span id="user-name">İsim</span>
  <span id="user-email">email@example.com</span>
</div>
<button id="logout-btn">Çıkış Yap</button>
```

## Güvenlik Notları

⚠️ **Önemli**: Firebase config bilgileri public'tir ve herkes tarafından görülebilir. Bu normal bir durumdur çünkü Firebase Security Rules ile erişim kontrolü yapılır.

🔒 **Security Rules**: Firestore kullanacaksanız mutlaka güvenlik kurallarını yapılandırın.

📧 **Email Templates**: Firebase Console > Authentication > Templates kısmından email şablonlarını Türkçe'ye çevirebilirsiniz.

## Sorun Giderme

**CORS Hatası**: Localhost'ta test ediyorsanız `http://localhost:3000` gibi adresleri Firebase Console'da authorized domains'e ekleyin.

**Popup Blocked**: Google signin popup'ı engelleniyorsa tarayıcı ayarlarından popup'ları aktif edin.

**Email Verification**: Production'da email doğrulaması zorunlu hale getirmek için Authentication > Settings'ten ayarlayabilirsiniz. 