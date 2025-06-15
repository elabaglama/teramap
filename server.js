const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');
const app = express();

app.use(express.json());
app.use(express.static('.'));

// Session yönetimi
app.use(session({
    secret: 'tera-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 saat
    }
}));

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Oturum kontrolü middleware
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/giris');
    }
    next();
};

// Kullanıcı bilgilerini getir
app.get('/api/user', (req, res) => {
    if (!req.session.user) {
        return res.json({ user: null });
    }
    res.json({ user: req.session.user });
});

// Giriş yapma API'si
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kullanıcı veritabanını oku
        const usersData = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'users.json'), 'utf8'));
        
        // Şifreyi hashle
        const hashedPassword = crypto
            .createHash('sha256')
            .update(password)
            .digest('hex');
        
        // Kullanıcıyı bul
        const user = usersData.users.find(u => u.email === email && u.password === hashedPassword);
        
        if (!user) {
            return res.json({ 
                success: false, 
                message: 'E-posta veya şifre hatalı.' 
            });
        }
        
        // Session'a kullanıcı bilgilerini kaydet
        req.session.user = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            communityName: user.communityName
        };
        
        res.json({ success: true });
    } catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sunucu hatası' 
        });
    }
});

// Mekanları getir
app.get('/api/venues', requireAuth, async (req, res) => {
    try {
        const venuesData = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'venues.json'), 'utf8'));
        res.json(venuesData.venues);
    } catch (error) {
        console.error('Mekanlar yüklenirken hata:', error);
        res.status(500).json({ error: 'Mekanlar yüklenemedi' });
    }
});

// Ekipleri getir
app.get('/api/teams', requireAuth, async (req, res) => {
    try {
        const teamsData = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'teams.json'), 'utf8'));
        res.json(teamsData.teams);
    } catch (error) {
        console.error('Ekipler yüklenirken hata:', error);
        res.status(500).json({ error: 'Ekipler yüklenemedi' });
    }
});

// Mesaj gönder (Vercel'de dosya yazma devre dışı)
app.post('/api/messages', requireAuth, async (req, res) => {
    try {
        // Vercel'de dosya sistemi read-only olduğu için geçici olarak başarılı yanıt döndürüyoruz
        res.json({ success: true, message: 'Mesaj gönderildi (demo mode)' });
    } catch (error) {
        console.error('Mesaj gönderme hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Mesaj gönderilemedi' 
        });
    }
});

// Profil güncelleme (Vercel'de dosya yazma devre dışı)
app.post('/api/profile/update', requireAuth, async (req, res) => {
    try {
        // Vercel'de dosya sistemi read-only olduğu için geçici olarak başarılı yanıt döndürüyoruz
        res.json({ success: true, message: 'Profil güncellendi (demo mode)' });
    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Profil güncellenemedi' 
        });
    }
});

// Çıkış yapma
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Davetiye kodu doğrulama
app.post('/api/validate-invite', async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const inviteData = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'invite_codes.json'), 'utf8'));
        
        const codeInfo = inviteData.codes.find(c => c.code === inviteCode);
        
        if (!codeInfo || codeInfo.used) {
            return res.json({ valid: false });
        }
        
        res.json({ valid: true });
    } catch (error) {
        console.error('Davetiye kodu doğrulama hatası:', error);
        res.status(500).json({ valid: false, error: 'Sunucu hatası' });
    }
});

// Kullanıcı kaydı (Vercel'de dosya yazma devre dışı)
app.post('/api/register', async (req, res) => {
    try {
        const { inviteCode, email, password, fullName, communityName } = req.body;
        
        // Davetiye kodu kontrolü
        const inviteData = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'invite_codes.json'), 'utf8'));
        const codeInfo = inviteData.codes.find(c => c.code === inviteCode);
        
        if (!codeInfo || codeInfo.used) {
            return res.json({ success: false, message: 'Geçersiz veya kullanılmış davetiye kodu.' });
        }
        
        // Kullanıcı veritabanını oku
        const usersData = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'users.json'), 'utf8'));
        
        // Email kontrolü
        if (usersData.users.some(u => u.email === email)) {
            return res.json({ success: false, message: 'Bu e-posta adresi zaten kullanımda.' });
        }
        
        // Vercel'de dosya sistemi read-only olduğu için geçici olarak başarılı yanıt döndürüyoruz
        res.json({ success: true, message: 'Kayıt tamamlandı (demo mode)' });
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
});

// Korumalı rotalar
app.get('/mekanlar', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'mekanlar', 'index.html'));
});

app.get('/genclik-ekipleri', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'genclik-ekipleri', 'index.html'));
});

app.get('/profil', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'profil', 'index.html'));
});

// Vercel için export
module.exports = app;

// Local development
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server ${PORT} portunda çalışıyor`);
    });
} 