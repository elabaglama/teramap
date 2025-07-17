const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');

// Veritabanı ve e-posta servisleri
const { createReservation, getAllReservations } = require('./backend/database');
const { sendReservationConfirmation, sendAdminNotification } = require('./backend/email-service');

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

// Mesaj gönder
app.post('/api/messages', requireAuth, async (req, res) => {
    try {
        const { venueId, content } = req.body;
        const messagesData = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'messages.json'), 'utf8'));
        
        const newMessage = {
                    id: Date.now().toString(),
            venueId,
            userId: req.session.user.id,
            content,
                    createdAt: new Date().toISOString()
                };
                
        messagesData.messages.push(newMessage);
        await fs.writeFile(
            path.join(__dirname, 'data', 'messages.json'),
            JSON.stringify(messagesData, null, 2)
        );
        
        res.json({ success: true });
            } catch (error) {
        console.error('Mesaj gönderme hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Mesaj gönderilemedi' 
        });
    }
});

// Profil güncelleme
app.post('/api/profile/update', requireAuth, async (req, res) => {
    try {
        const { fullName, email, communityName, currentPassword, newPassword } = req.body;
        const usersData = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'users.json'), 'utf8'));
        
        // Kullanıcıyı bul
        const userIndex = usersData.users.findIndex(u => u.id === req.session.user.id);
        
        if (userIndex === -1) {
            return res.json({ 
                success: false, 
                message: 'Kullanıcı bulunamadı' 
            });
        }
        
        // Şifre değişikliği varsa kontrol et
        if (currentPassword && newPassword) {
            const hashedCurrentPassword = crypto
                .createHash('sha256')
                .update(currentPassword)
                .digest('hex');
            
            if (hashedCurrentPassword !== usersData.users[userIndex].password) {
                return res.json({ 
                    success: false, 
                    message: 'Mevcut şifre hatalı' 
                });
            }
            
            // Yeni şifreyi hashle
            usersData.users[userIndex].password = crypto
                .createHash('sha256')
                .update(newPassword)
                .digest('hex');
        }
        
        // Diğer bilgileri güncelle
        usersData.users[userIndex].fullName = fullName;
        usersData.users[userIndex].email = email;
        usersData.users[userIndex].communityName = communityName;
        
        // Session'ı güncelle
        req.session.user = {
            id: usersData.users[userIndex].id,
            email,
            fullName,
            communityName
        };
        
        // Değişiklikleri kaydet
        await fs.writeFile(
            path.join(__dirname, 'data', 'users.json'),
            JSON.stringify(usersData, null, 2)
        );
        
        res.json({ success: true });
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

// Basit kullanıcı kaydı (invite code'suz)
app.post('/api/register-simple', async (req, res) => {
    try {
        const { email, password, fullName, communityName } = req.body;
        
        // Kullanıcı veritabanını oku
        const usersData = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'users.json'), 'utf8'));
        
        // Email kontrolü
        if (usersData.users.some(u => u.email === email)) {
            return res.json({ success: false, message: 'Bu e-posta adresi zaten kullanımda.' });
        }
        
        // Şifreyi hashle
        const hashedPassword = crypto
            .createHash('sha256')
            .update(password)
            .digest('hex');
        
        // Yeni kullanıcı oluştur
        const newUser = {
            id: Date.now().toString(),
            fullName,
            email,
            password: hashedPassword,
            communityName,
            createdAt: new Date().toISOString()
        };
        
        // Kullanıcıyı kaydet
        usersData.users.push(newUser);
        await fs.writeFile(
            path.join(__dirname, 'data', 'users.json'),
            JSON.stringify(usersData, null, 2)
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
});

// Kullanıcı kaydı (invite code ile)
app.post('/api/register', async (req, res) => {
    try {
        const { inviteCode, email, password, fullName, communityName } = req.body;
        
        // Davetiye kodu kontrolü
        const inviteData = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'invite_codes.json'), 'utf8'));
        const codeIndex = inviteData.codes.findIndex(c => c.code === inviteCode);
        
        if (codeIndex === -1 || inviteData.codes[codeIndex].used) {
            return res.json({ success: false, message: 'Geçersiz veya kullanılmış davetiye kodu.' });
        }
        
        // Kullanıcı veritabanını oku
        const usersData = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'users.json'), 'utf8'));
        
        // Email kontrolü
        if (usersData.users.some(u => u.email === email)) {
            return res.json({ success: false, message: 'Bu e-posta adresi zaten kullanımda.' });
        }
        
        // Şifreyi hashle
        const hashedPassword = crypto
            .createHash('sha256')
            .update(password)
            .digest('hex');
        
        // Yeni kullanıcı oluştur
        const newUser = {
            id: Date.now().toString(),
            fullName,
            email,
            password: hashedPassword,
            communityName,
            inviteCode,
            createdAt: new Date().toISOString()
        };
        
        // Kullanıcıyı kaydet
        usersData.users.push(newUser);
        await fs.writeFile(
            path.join(__dirname, 'data', 'users.json'),
            JSON.stringify(usersData, null, 2)
        );
        
        // Davetiye kodunu kullanıldı olarak işaretle
        inviteData.codes[codeIndex].used = true;
        await fs.writeFile(
            path.join(__dirname, 'data', 'invite_codes.json'),
            JSON.stringify(inviteData, null, 2)
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
});

// Rezervasyon kaydet (herkese açık) - Veritabanı + E-posta
app.post('/api/reservation', async (req, res) => {
    try {
        const { venue, date, name, email, phone } = req.body;
        
        // Validasyon
        if (!venue || !date || !name || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Eksik bilgi: Mekan, tarih, isim ve e-posta zorunludur' 
            });
        }

        // E-posta format kontrolü
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Geçersiz e-posta formatı' 
            });
        }

        // Rezervasyonu veritabanına kaydet
        const reservation = await createReservation({ venue, date, name, email, phone });
        console.log('✅ Rezervasyon veritabanına kaydedildi:', reservation.id);

        // E-posta bildirimleri gönder (asenkron)
        Promise.all([
            sendReservationConfirmation(reservation),
            sendAdminNotification(reservation)
        ]).then(([customerResult, adminResult]) => {
            console.log('📧 Müşteri e-postası:', customerResult.success ? 'Gönderildi' : 'Başarısız');
            console.log('📧 Admin e-postası:', adminResult.success ? 'Gönderildi' : 'Başarısız');
        }).catch(error => {
            console.error('E-posta gönderme hatası:', error);
        });

        // Başarılı yanıt
        res.json({ 
            success: true, 
            reservation: {
                id: reservation.id,
                venue: reservation.venue,
                date: reservation.date,
                name: reservation.name,
                email: reservation.email,
                phone: reservation.phone,
                status: reservation.status,
                created_at: reservation.created_at
            },
            message: 'Rezervasyon başarıyla alındı! E-posta ile onay gönderilecek.'
        });

    } catch (error) {
        console.error('❌ Rezervasyon kaydetme hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Rezervasyon kaydedilemedi. Lütfen tekrar deneyin.' 
        });
    }
});

// Rezervasyonları listele (admin için)
app.get('/api/reservations', requireAuth, async (req, res) => {
    try {
        const reservations = await getAllReservations();
        res.json({ success: true, reservations });
    } catch (error) {
        console.error('❌ Rezervasyonları listeleme hatası:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Rezervasyonlar yüklenemedi' 
        });
    }
});

// SMTP durumunu döndür
app.get('/api/smtp-status', (req, res) => {
    const smtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
    res.json({ smtpConfigured });
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

app.get('/admin', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
}); 