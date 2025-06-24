/**
 * Kupon Kodu Sistemi
 * Tera için kupon kodlarını yönetir ve doğrular
 */

class CouponSystem {
    constructor() {
        this.codesFile = '/data/invite_codes.json';
        this.usedCodes = new Set(); // Kullanılan kodları bellekte tut
    }

    /**
     * Kupon kodunu doğrular
     * @param {string} code - Kontrol edilecek kupon kodu
     * @returns {Promise<boolean>} - Kod geçerli mi?
     */
    async validateCoupon(code) {
        try {
            const response = await fetch(this.codesFile);
            const data = await response.json();
            
            // Kod listesinde var mı ve kullanılmamış mı kontrol et
            const coupon = data.codes.find(c => 
                c.code === code.toUpperCase() && 
                !c.used && 
                !this.usedCodes.has(code.toUpperCase())
            );
            
            return !!coupon;
        } catch (error) {
            console.error('Kupon doğrulama hatası:', error);
            return false;
        }
    }

    /**
     * Kupon kodunu kullanılmış olarak işaretler
     * @param {string} code - Kullanılan kupon kodu
     * @param {Object} userInfo - Kullanıcı bilgileri
     */
    async useCoupon(code, userInfo) {
        try {
            // Bellekte kullanılan kod olarak işaretle
            this.usedCodes.add(code.toUpperCase());
            
            // Kullanım kaydını localStorage'a kaydet (geçici çözüm)
            const usageRecord = {
                code: code.toUpperCase(),
                usedAt: new Date().toISOString(),
                userEmail: userInfo.email,
                userName: userInfo.fullName
            };
            
            // Mevcut kayıtları al
            const existingRecords = JSON.parse(localStorage.getItem('usedCoupons') || '[]');
            existingRecords.push(usageRecord);
            
            // Güncellenmiş kayıtları sakla
            localStorage.setItem('usedCoupons', JSON.stringify(existingRecords));
            
            console.log('Kupon kullanıldı:', usageRecord);
            return true;
        } catch (error) {
            console.error('Kupon kullanım hatası:', error);
            return false;
        }
    }

    /**
     * Kullanılan kupon kodlarını listeler (admin için)
     * @returns {Array} - Kullanılan kodların listesi
     */
    getUsedCoupons() {
        try {
            return JSON.parse(localStorage.getItem('usedCoupons') || '[]');
        } catch (error) {
            console.error('Kullanılan kuponları getirme hatası:', error);
            return [];
        }
    }

    /**
     * Kalan kupon sayısını hesaplar
     * @returns {Promise<number>} - Kalan kupon sayısı
     */
    async getRemainingCouponCount() {
        try {
            const response = await fetch(this.codesFile);
            const data = await response.json();
            
            const totalCodes = data.codes.length;
            const usedCount = this.usedCodes.size;
            
            return Math.max(0, totalCodes - usedCount);
        } catch (error) {
            console.error('Kalan kupon sayısı hesaplama hatası:', error);
            return 0;
        }
    }

    /**
     * Rastgele kupon kodu üretir (admin için)
     * @param {number} length - Kod uzunluğu (varsayılan 5)
     * @returns {string} - Üretilen kod
     */
    generateRandomCode(length = 5) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Sistem durumunu kontrol eder
     * @returns {Promise<Object>} - Sistem durumu
     */
    async getSystemStatus() {
        const remainingCoupons = await this.getRemainingCouponCount();
        const usedCoupons = this.getUsedCoupons();
        
        return {
            totalCoupons: 50,
            remainingCoupons,
            usedCoupons: usedCoupons.length,
            lastUsed: usedCoupons.length > 0 ? usedCoupons[usedCoupons.length - 1] : null,
            systemActive: remainingCoupons > 0
        };
    }
}

// Global instance oluştur
window.couponSystem = new CouponSystem();

// Sayfa yüklendiğinde kullanılan kodları bellekten yükle
document.addEventListener('DOMContentLoaded', function() {
    const usedCoupons = window.couponSystem.getUsedCoupons();
    usedCoupons.forEach(record => {
        window.couponSystem.usedCodes.add(record.code);
    });
    
    console.log('Kupon sistemi yüklendi. Kullanılan kod sayısı:', usedCoupons.length);
});

// Debug fonksiyonları (geliştirme için)
window.debugCoupons = {
    showUsedCoupons: () => console.table(window.couponSystem.getUsedCoupons()),
    getSystemStatus: () => window.couponSystem.getSystemStatus().then(console.log),
    clearUsedCoupons: () => {
        localStorage.removeItem('usedCoupons');
        window.couponSystem.usedCodes.clear();
        console.log('Kullanılan kuponlar temizlendi');
    }
}; 