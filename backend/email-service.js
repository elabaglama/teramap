const nodemailer = require('nodemailer');
const { logEmail } = require('./database');

// E-posta ayarları (production'da environment variables kullanılmalı)
const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
    }
};

// Nodemailer transporter oluştur
const transporter = nodemailer.createTransporter(emailConfig);

// Transporter'ı test et
transporter.verify((error, success) => {
    if (error) {
        console.warn('E-posta servisi yapılandırılmamış:', error.message);
        console.info('E-posta gönderimi devre dışı. SMTP ayarlarını environment variables ile yapılandırın.');
    } else {
        console.log('E-posta servisi hazır');
    }
});

// Rezervasyon onay e-postası şablonu
function getConfirmationEmailTemplate(reservation) {
    return {
        subject: 'TeraMap - Rezervasyon Onayı',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">TeraMap</h1>
                    <p style="color: white; margin: 10px 0 0 0;">Rezervasyon Onayı</p>
                </div>
                
                <div style="padding: 30px; background: #f8f9fa;">
                    <h2 style="color: #333; margin-bottom: 20px;">Merhaba ${reservation.name},</h2>
                    
                    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                        Rezervasyon talebiniz başarıyla alındı! Rezervasyon detaylarınız aşağıdadır:
                    </p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Mekan:</strong></td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${reservation.venue}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Tarih:</strong></td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${reservation.date}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>İletişim:</strong></td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${reservation.email}</td>
                            </tr>
                            ${reservation.phone ? `
                                <tr>
                                    <td style="padding: 10px 0;"><strong>Telefon:</strong></td>
                                    <td style="padding: 10px 0;">${reservation.phone}</td>
                                </tr>
                            ` : ''}
                        </table>
                    </div>
                    
                    <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin: 0; color: #0c5460;">
                            <strong>Önemli:</strong> Bu rezervasyon talebi incelenmektedir. 
                            24 saat içinde size geri dönüş yapılacaktır.
                        </p>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6;">
                        Herhangi bir sorunuz varsa bizimle iletişime geçmekten çekinmeyin.
                    </p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #999; font-size: 14px;">
                            TeraMap Ekibi<br>
                            <a href="mailto:info@teramap.com" style="color: #667eea;">info@teramap.com</a>
                        </p>
                    </div>
                </div>
                
                <div style="background: #333; padding: 20px; text-align: center;">
                    <p style="color: #999; margin: 0; font-size: 12px;">
                        Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.
                    </p>
                </div>
            </div>
        `
    };
}

// Admin bildirim e-postası şablonu  
function getAdminNotificationTemplate(reservation) {
    return {
        subject: `Yeni Rezervasyon Talebi - ${reservation.venue}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #dc3545; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">YENİ REZERVASYON</h1>
                    <p style="color: white; margin: 10px 0 0 0;">Acil İnceleme Gerekli</p>
                </div>
                
                <div style="padding: 20px; background: #f8f9fa;">
                    <h2 style="color: #333;">Rezervasyon Detayları</h2>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Mekan:</strong></td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${reservation.venue}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Tarih:</strong></td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${reservation.date}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Müşteri:</strong></td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${reservation.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>E-posta:</strong></td>
                                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${reservation.email}</td>
                            </tr>
                            ${reservation.phone ? `
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Telefon:</strong></td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${reservation.phone}</td>
                                </tr>
                            ` : ''}
                            <tr>
                                <td style="padding: 10px 0;"><strong>Talep Zamanı:</strong></td>
                                <td style="padding: 10px 0;">${new Date(reservation.created_at).toLocaleString('tr-TR')}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="#" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px;">
                            Rezervasyonu Onayla
                        </a>
                        <a href="#" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px;">
                            Rezervasyonu Reddet
                        </a>
                    </div>
                </div>
            </div>
        `
    };
}

// E-posta gönder
async function sendEmail(to, template) {
    try {
        // E-posta servisi yapılandırılmamışsa sadece konsola log at
        if (!process.env.SMTP_USER) {
            console.log('📧 E-posta gönderilecekti (SMTP yapılandırılmamış):');
            console.log(`   Alıcı: ${to}`);
            console.log(`   Konu: ${template.subject}`);
            return { success: true, message: 'E-posta simulation (SMTP yapılandırılmamış)' };
        }

        const mailOptions = {
            from: `"TeraMap" <${emailConfig.auth.user}>`,
            to: to,
            subject: template.subject,
            html: template.html
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ E-posta gönderildi:', to);
        return { success: true, messageId: result.messageId };
        
    } catch (error) {
        console.error('❌ E-posta gönderme hatası:', error.message);
        return { success: false, error: error.message };
    }
}

// Rezervasyon onay e-postası gönder
async function sendReservationConfirmation(reservation) {
    const template = getConfirmationEmailTemplate(reservation);
    const result = await sendEmail(reservation.email, template);
    
    // E-posta logunu kaydet
    try {
        await logEmail(
            reservation.id, 
            reservation.email, 
            template.subject, 
            'confirmation',
            result.success ? 'sent' : 'failed'
        );
    } catch (error) {
        console.error('E-posta logu kaydedilemedi:', error);
    }
    
    return result;
}

// Admin bildirimi gönder
async function sendAdminNotification(reservation) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@teramap.com';
    const template = getAdminNotificationTemplate(reservation);
    const result = await sendEmail(adminEmail, template);
    
    // E-posta logunu kaydet
    try {
        await logEmail(
            reservation.id, 
            adminEmail, 
            template.subject, 
            'admin_notification',
            result.success ? 'sent' : 'failed'
        );
    } catch (error) {
        console.error('E-posta logu kaydedilemedi:', error);
    }
    
    return result;
}

module.exports = {
    sendReservationConfirmation,
    sendAdminNotification,
    sendEmail
}; 