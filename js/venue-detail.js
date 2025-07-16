// Venue Detail Page Functionality
class VenueDetailApp {
    constructor() {
        this.venue = null;
        this.currentDate = new Date(2025, 6); // Start from July 2025
        this.selectedDate = null;
        this.venues = [];
        this.bookedDates = []; // Will be populated with venue's available dates
        this.amenityIcons = {
            'Catering': '<i class="fas fa-utensils"></i>',
            'A/V Equipment': '<i class="fas fa-tv"></i>',
            'Sound System': '<i class="fas fa-volume-up"></i>',
            'Sergi': '<i class="fas fa-palette"></i>',
            'Performans': '<i class="fas fa-theater-masks"></i>',
            'Kültür': '<i class="fas fa-book"></i>',
            'Teknik': '<i class="fas fa-cogs"></i>',
            'Sahne': '<i class="fas fa-microphone"></i>',
            'Bahçe': '<i class="fas fa-tree"></i>',
            'Modern': '<i class="fas fa-building"></i>',
            'Özel': '<i class="fas fa-star"></i>',
            'Küçük': '<i class="fas fa-home"></i>',
            'Sanat': '<i class="fas fa-paint-brush"></i>',
            'Manzara': '<i class="fas fa-mountain"></i>',
            'Workshop': '<i class="fas fa-users"></i>',
            'Geniş': '<i class="fas fa-expand"></i>',
            'Konser': '<i class="fas fa-music"></i>',
            'Prestijli': '<i class="fas fa-crown"></i>',
            'Profesyonel': '<i class="fas fa-briefcase"></i>',
            'Sürdürülebilirlik': '<i class="fas fa-leaf"></i>',
            'Sosyal İnovasyon': '<i class="fas fa-lightbulb"></i>',
            'Ortak Çalışma': '<i class="fas fa-handshake"></i>',
            'Teras Bahçesi': '<i class="fas fa-seedling"></i>',
            'Podcast Stüdyosu': '<i class="fas fa-podcast"></i>',
            'Kütüphane': '<i class="fas fa-book-open"></i>',
            'Cafe': '<i class="fas fa-coffee"></i>',
            'Özel Mutfak': '<i class="fas fa-utensils"></i>',
            'Salon': '<i class="fas fa-couch"></i>',
            'Terası': '<i class="fas fa-building"></i>',
            'Sessiz Çevre': '<i class="fas fa-volume-mute"></i>',
            'Otopark': '<i class="fas fa-car"></i>',
            'Tarihi Mimari': '<i class="fas fa-landmark"></i>',
            'Haliç Manzarası': '<i class="fas fa-water"></i>',
            'Sergi Alanı': '<i class="fas fa-image"></i>',
            'Projeksiyon': '<i class="fas fa-video"></i>',
            'Ses Sistemi': '<i class="fas fa-volume-up"></i>',
            'Profesyonel Ses-Işık': '<i class="fas fa-magic"></i>',
            'Çoklu Salon': '<i class="fas fa-door-open"></i>',
            'Deniz Manzarası': '<i class="fas fa-ship"></i>',
            'Profesyonel Teknik Ekip': '<i class="fas fa-user-cog"></i>',
            'Boğaz Manzarası': '<i class="fas fa-water"></i>',
            'Çağdaş Sanat': '<i class="fas fa-palette"></i>',
            'MüzeCafe': '<i class="fas fa-coffee"></i>',
            'Profesyonel Galeri': '<i class="fas fa-images"></i>',
            'Teknik Altyapı': '<i class="fas fa-server"></i>'
        };
        this.init();
    }

    async init() {
        await this.loadVenues();
        this.extractVenueFromURL();
        this.loadVenueData();
        this.setupEventListeners();
        this.generateCalendar();
    }

    async loadVenues() {
        try {
            // Check if we're in a subdirectory and adjust path accordingly
            const path = window.location.pathname;
            const depth = path.split('/').length - 1;
            const dataPath = depth > 3 ? '../../../data/venues.json' : '/data/venues.json';
            
            const response = await fetch(dataPath);
            const data = await response.json();
            this.venues = data.venues || [];
        } catch (error) {
            console.error('Error loading venues:', error);
            this.venues = [];
        }
    }

    extractVenueFromURL() {
        const path = window.location.pathname;
        const pathParts = path.split('/');
        const venueSlug = pathParts[pathParts.length - 1] === '' ? pathParts[pathParts.length - 2] : pathParts[pathParts.length - 1];
        
        // Convert slug back to venue (simple mapping for now)
        const slugToId = {
            'postanegalata': '1',
            'rahatevebahceli': '2', 
            'fenerevleri': '3',
            'metrohan': '4',
            'borusan': '5'
        };
        
        const venueId = slugToId[venueSlug];
        this.venue = this.venues.find(v => v.id === venueId);
        
        // Fix image path based on current directory depth
        if (this.venue) {
            const depth = path.split('/').length - 1;
            if (depth > 3) {
                // We're in a subdirectory, use relative paths
                this.venue.image = this.venue.image.replace(/^\//, '../../../');
            }
        }
    }

    loadVenueData() {
        if (!this.venue) {
            this.showNotFound();
            return;
        }

        // Update page title
        document.title = `${this.venue.name} - TeraMap`;
        
        // Load venue details (fix image path for venue detail context)
        document.getElementById('venue-image').src = this.venue.image;
        document.getElementById('venue-image').alt = this.venue.name;
        document.getElementById('venue-name').textContent = this.venue.name;
        document.getElementById('venue-location').textContent = this.venue.location;
        document.getElementById('venue-capacity').textContent = this.venue.capacity;
        document.getElementById('venue-description').textContent = this.venue.description;

        // Set up available dates for calendar
        this.bookedDates = this.venue.availableDates ? this.venue.availableDates.map(date => new Date(date)) : [];

        // Load meta information
        this.loadMetaInfo();
        
        // Load amenities
        this.loadAmenities();
        
        // Load contact information
        this.loadContactInfo();
    }

    loadMetaInfo() {
        // Load price and category
        document.getElementById('venue-price').textContent = this.venue.price;
        document.getElementById('venue-category').textContent = this.venue.category;
        
        // Load badge
        const badgeElement = document.getElementById('venue-badge');
        if (this.venue.isYouthFree) {
            badgeElement.textContent = 'Gençlik Ekiplerine Ücretsiz';
            badgeElement.style.background = 'rgba(76, 175, 80, 0.9)';
        } else if (this.venue.isPaid) {
            badgeElement.textContent = 'Ücretli Kiralama';
            badgeElement.style.background = 'rgba(255, 152, 0, 0.9)';
        } else {
            badgeElement.textContent = 'Ücretsiz';
            badgeElement.style.background = 'rgba(145, 121, 110, 0.9)';
        }
    }

    loadAmenities() {
        const amenitiesGrid = document.getElementById('amenities-grid');
        
        if (!this.venue.features || this.venue.features.length === 0) {
            amenitiesGrid.innerHTML = '<p>Listelenen olanak bulunmamaktadır</p>';
            return;
        }

        amenitiesGrid.innerHTML = this.venue.features.map(feature => {
            const icon = this.amenityIcons[feature] || '<i class="fas fa-check"></i>';
            return `
                <div class="amenity-item">
                    <span class="amenity-icon">${icon}</span>
                    <span class="amenity-name">${feature}</span>
                </div>
            `;
        }).join('');

        // Add suitable for section
        this.loadSuitableFor();
    }

    loadSuitableFor() {
        if (!this.venue.suitableFor || this.venue.suitableFor.length === 0) {
            return;
        }

        // Create suitable for section if it doesn't exist
        const amenitiesSection = document.querySelector('.amenities-section');
        let suitableSection = document.querySelector('.suitable-for-section');
        
        if (!suitableSection) {
            suitableSection = document.createElement('div');
            suitableSection.className = 'suitable-for-section';
            suitableSection.innerHTML = `
                <h3>Bu Mekan Şunlar İçin Uygun</h3>
                <div class="suitable-for-grid" id="suitable-for-grid"></div>
            `;
            amenitiesSection.parentNode.insertBefore(suitableSection, amenitiesSection.nextSibling);
        }

        const suitableGrid = document.getElementById('suitable-for-grid');
        const suitableIcons = {
            'Workshop': '<i class="fas fa-tools"></i>',
            'Seminer': '<i class="fas fa-chalkboard-teacher"></i>',
            'Lansman': '<i class="fas fa-rocket"></i>',
            'Sosyal Girişim Etkinlikleri': '<i class="fas fa-heart"></i>',
            'Eğitim': '<i class="fas fa-graduation-cap"></i>',
            'Panel': '<i class="fas fa-comments"></i>',
            'Özel Lansman': '<i class="fas fa-star"></i>',
            'Küçük Workshop': '<i class="fas fa-user-friends"></i>',
            'Ekip Toplantıları': '<i class="fas fa-users-cog"></i>',
            'Kitap Lansmanı': '<i class="fas fa-book"></i>',
            'İntim Eğitimler': '<i class="fas fa-user-graduate"></i>',
            'Sanat Sergisi': '<i class="fas fa-palette"></i>',
            'Kültürel Etkinlik': '<i class="fas fa-theater-masks"></i>',
            'Atölye': '<i class="fas fa-hammer"></i>',
            'Film Gösterimi': '<i class="fas fa-film"></i>',
            'Müzik Dinletisi': '<i class="fas fa-music"></i>',
            'Büyük Konferans': '<i class="fas fa-microphone-alt"></i>',
            'Kongre': '<i class="fas fa-building"></i>',
            'Fuar': '<i class="fas fa-store"></i>',
            'Kurumsal Lansman': '<i class="fas fa-briefcase"></i>',
            'Sempozyum': '<i class="fas fa-university"></i>',
            'Ödül Töreni': '<i class="fas fa-trophy"></i>',
            'Sanat Lansmanı': '<i class="fas fa-paint-brush"></i>',
            'Teknoloji Etkinliği': '<i class="fas fa-laptop"></i>',
            'Prestijli Lansman': '<i class="fas fa-crown"></i>',
            'Özel Davet': '<i class="fas fa-glass-cheers"></i>',
            'Kurumsal Etkinlik': '<i class="fas fa-building"></i>',
            'Medya Lansmanı': '<i class="fas fa-camera"></i>'
        };

        suitableGrid.innerHTML = this.venue.suitableFor.map(suitable => {
            const icon = suitableIcons[suitable] || '<i class="fas fa-check-circle"></i>';
            return `
                <div class="suitable-item">
                    <span class="suitable-icon">${icon}</span>
                    <span class="suitable-name">${suitable}</span>
                </div>
            `;
        }).join('');
    }

    loadContactInfo() {
        const contactGrid = document.getElementById('contact-grid');
        
        if (!this.venue.contact) {
            contactGrid.innerHTML = '<p>İletişim bilgisi bulunmamaktadır</p>';
            return;
        }

        const contactItems = [];
        
        if (this.venue.contact.phone) {
            contactItems.push(`
                <div class="contact-item">
                    <span class="contact-icon">📞</span>
                    <div class="contact-info">
                        <span class="contact-label">Telefon</span>
                        <span class="contact-value">${this.venue.contact.phone}</span>
                    </div>
                </div>
            `);
        }
        
        if (this.venue.contact.email) {
            contactItems.push(`
                <div class="contact-item">
                    <span class="contact-icon">✉️</span>
                    <div class="contact-info">
                        <span class="contact-label">E-posta</span>
                        <span class="contact-value">${this.venue.contact.email}</span>
                    </div>
                </div>
            `);
        }
        
        if (this.venue.location) {
            contactItems.push(`
                <div class="contact-item">
                    <span class="contact-icon">📍</span>
                    <div class="contact-info">
                        <span class="contact-label">Konum</span>
                        <span class="contact-value">${this.venue.location}</span>
                    </div>
                </div>
            `);
        }
        
        contactGrid.innerHTML = contactItems.join('');
    }

    showNotFound() {
        document.querySelector('.venue-detail-main').innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <h1>Mekan Bulunamadı</h1>
                <p>Aradığınız mekan bulunmamaktadır.</p>
                <a href="/app/venues" class="reserve-btn" style="display: inline-block; text-decoration: none;">
                    Mekanlara Dön
                </a>
            </div>
        `;
    }

    setupEventListeners() {
        // Calendar navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.generateCalendar();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.generateCalendar();
        });

        // Reserve button
        document.getElementById('reserve-btn').addEventListener('click', () => {
            this.handleReservation();
        });
    }

    generateCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month header - Turkish month names
        const monthNames = [
            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
        ];
        document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;

        // Generate calendar days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const calendarDays = document.getElementById('calendar-days');
        calendarDays.innerHTML = '';

        // Generate 42 days (6 weeks)
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date.getDate();
            
            // Add classes based on date
            if (date.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            if (this.isDateAvailable(date)) {
                dayElement.classList.add('available');
            }
            
            if (this.selectedDate && this.isSameDate(date, this.selectedDate)) {
                dayElement.classList.add('selected');
            }

            // Add click handler
            dayElement.addEventListener('click', () => {
                if (date.getMonth() === month && this.isDateAvailable(date)) {
                    this.selectDate(date);
                }
            });

            calendarDays.appendChild(dayElement);
        }
    }

    isDateAvailable(date) {
        const today = new Date();
        
        // Past dates are not available
        if (date < today) {
            return false;
        }

        // Only dates from July 2025 onwards are bookable
        const minDate = new Date(2025, 6, 1); // July 1, 2025
        if (date < minDate) {
            return false;
        }
        
        // Check if this date is in venue's available dates
        return this.bookedDates.some(availableDate => 
            availableDate.getFullYear() === date.getFullYear() &&
            availableDate.getMonth() === date.getMonth() &&
            availableDate.getDate() === date.getDate()
        );
    }

    isSameDate(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    selectDate(date) {
        // Remove previous selection
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });

        this.selectedDate = date;
        this.generateCalendar(); // Regenerate to show selection

        // Update reserve button
        const reserveBtn = document.getElementById('reserve-btn');
        reserveBtn.textContent = `${date.getDate()} ${this.getMonthName(date.getMonth())} tarihini rezerve et`;
    }

    getMonthName(monthIndex) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[monthIndex];
    }

    handleReservation() {
        if (!this.selectedDate) {
            alert('Lütfen önce bir tarih seçiniz.');
            return;
        }

        const eventType = document.getElementById('event-type').value;
        const eventDescription = document.getElementById('event-description').value;

        if (!eventType) {
            alert('Lütfen etkinlik türünü seçiniz.');
            return;
        }

        const dateStr = `${this.selectedDate.getDate()} ${this.getMonthName(this.selectedDate.getMonth())} ${this.selectedDate.getFullYear()}`;
        
        // Show modern reservation confirmation popup
        this.showReservationPopup(dateStr, eventType, eventDescription);
    }

    showReservationPopup(dateStr, eventType, eventDescription) {
        // Create modern popup
        const popup = document.createElement('div');
        popup.className = 'reservation-popup-overlay';
        popup.innerHTML = `
            <div class="reservation-popup">
                <div class="popup-header">
                    <h3><i class="fas fa-calendar-check"></i> Rezervasyon Talebi</h3>
                    <button class="popup-close">&times;</button>
                </div>
                <div class="popup-body">
                    <div class="reservation-summary">
                        <div class="summary-item">
                            <div class="item-icon"><i class="fas fa-map-marker-alt"></i></div>
                            <div class="item-details">
                                <span class="item-label">Mekan</span>
                                <span class="item-value">${this.venue.name}</span>
                            </div>
                        </div>
                        <div class="summary-item">
                            <div class="item-icon"><i class="fas fa-calendar"></i></div>
                            <div class="item-details">
                                <span class="item-label">Tarih</span>
                                <span class="item-value">${dateStr}</span>
                            </div>
                        </div>
                        <div class="summary-item">
                            <div class="item-icon"><i class="fas fa-tag"></i></div>
                            <div class="item-details">
                                <span class="item-label">Fiyat</span>
                                <span class="item-value">${this.venue.price}</span>
                            </div>
                        </div>
                        ${eventType ? `
                        <div class="summary-item">
                            <div class="item-icon"><i class="fas fa-star"></i></div>
                            <div class="item-details">
                                <span class="item-label">Etkinlik Türü</span>
                                <span class="item-value">${eventType}</span>
                            </div>
                        </div>` : ''}
                    </div>
                    ${eventDescription ? `
                    <div class="description-section">
                        <h4><i class="fas fa-info-circle"></i> Açıklama</h4>
                        <p>${eventDescription}</p>
                    </div>` : ''}
                    <div class="contact-section">
                        <h4><i class="fas fa-phone"></i> İletişim Bilgileri</h4>
                        <div class="contact-info">
                            <div class="contact-item">
                                <i class="fas fa-phone"></i>
                                <span>${this.venue.contact?.phone || 'Bilgi yok'}</span>
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-envelope"></i>
                                <span>${this.venue.contact?.email || 'Bilgi yok'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="popup-footer">
                    <button class="btn-secondary" onclick="this.closest('.reservation-popup-overlay').remove()">İptal</button>
                    <button class="btn-primary" onclick="venueDetailApp.confirmReservation('${dateStr}')">Rezervasyon Talebini Gönder</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Close popup functionality
        popup.querySelector('.popup-close').onclick = () => popup.remove();
        popup.onclick = (e) => {
            if (e.target === popup) popup.remove();
        };
    }

    confirmReservation(dateStr) {
        // Remove popup
        document.querySelector('.reservation-popup-overlay')?.remove();
        
        // Show success message
        const successPopup = document.createElement('div');
        successPopup.className = 'success-popup-overlay';
        successPopup.innerHTML = `
            <div class="success-popup">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Rezervasyon Talebiniz Alındı!</h3>
                <p>
                    ${dateStr} tarihinde <strong>${this.venue.name}</strong> için rezervasyon talebiniz başarıyla alınmıştır.
                    <br><br>
                    Mekan sahibi sizinle en kısa sürede iletişime geçecektir.
                </p>
                <button class="btn-primary" onclick="this.closest('.success-popup-overlay').remove()">Tamam</button>
            </div>
        `;
        
        document.body.appendChild(successPopup);
        
        // Reset form
        const eventTypeEl = document.getElementById('event-type');
        const eventDescEl = document.getElementById('event-description');
        if (eventTypeEl) eventTypeEl.value = '';
        if (eventDescEl) eventDescEl.value = '';
        
        this.selectedDate = null;
        this.generateCalendar();
        document.getElementById('reserve-btn').textContent = 'Mekanı Rezerve Et';
        
        // Auto close after 5 seconds
        setTimeout(() => {
            successPopup.remove();
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.venueDetailApp = new VenueDetailApp();
});

// Export for external use
window.VenueDetailApp = VenueDetailApp; 