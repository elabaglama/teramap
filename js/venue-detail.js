// Venue Detail Page Functionality
class VenueDetailApp {
    constructor() {
        this.venue = null;
        this.currentDate = new Date();
        this.selectedDate = null;
        this.venues = [];
        this.amenityIcons = {
            'Catering': '🍽️',
            'A/V Equipment': '📺',
            'Sound System': '🔊',
            'Sergi': '🎨',
            'Performans': '🎭',
            'Kültür': '📚',
            'Teknik': '⚙️',
            'Sahne': '🎪',
            'Bahçe': '🌳',
            'Modern': '🏢',
            'Özel': '⭐',
            'Küçük': '🏠',
            'Sanat': '🎨',
            'Manzara': '🏞️',
            'Workshop': '👥',
            'Geniş': '🏟️',
            'Konser': '🎵',
            'Prestijli': '👑',
            'Profesyonel': '💼'
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
        document.getElementById('venue-area').textContent = this.venue.area;
        document.getElementById('venue-description').textContent = this.venue.description;

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
            const icon = this.amenityIcons[feature] || '📍';
            return `
                <div class="amenity-item">
                    <span class="amenity-icon">${icon}</span>
                    <span class="amenity-name">${feature}</span>
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
        // Generate random available dates for demonstration
        const today = new Date();
        const nextTwoMonths = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());
        
        // Only show dates from today onwards
        if (date < today) return false;
        
        // Don't show dates more than 2 months in advance
        if (date > nextTwoMonths) return false;
        
        // Create a seed based on date for consistent random generation
        const seed = date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
        const random = Math.sin(seed) * 10000;
        const randomValue = random - Math.floor(random);
        
        // Random availability with higher chance on weekends
        const day = date.getDay();
        const isWeekend = day === 5 || day === 6; // Friday or Saturday
        
        // 80% chance for weekends, 40% chance for weekdays
        return isWeekend ? randomValue > 0.2 : randomValue > 0.6;
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
            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
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