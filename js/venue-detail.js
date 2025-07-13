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
        if (!this.venue || !this.venue.availableDates) return false;
        
        const dateString = date.toISOString().split('T')[0];
        return this.venue.availableDates.some(availableDate => {
            const available = new Date(availableDate).toISOString().split('T')[0];
            return available === dateString;
        });
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
        
        const confirmationMessage = `
Rezervasyon Talebi:
- Mekan: ${this.venue.name}
- Tarih: ${dateStr}
- Etkinlik Türü: ${eventType}
${eventDescription ? `- Açıklama: ${eventDescription}` : ''}

Bu bilgilerle rezervasyon yapmak istediğinizden emin misiniz?
        `.trim();
        
        if (confirm(confirmationMessage)) {
            // Here you would typically make an API call to reserve the venue
            alert(`Rezervasyon talebiniz alınmıştır! ${dateStr} tarihinde ${this.venue.name} için sizinle iletişime geçeceğiz.`);
            
            // Reset form
            document.getElementById('event-type').value = '';
            document.getElementById('event-description').value = '';
            this.selectedDate = null;
            this.generateCalendar();
            document.getElementById('reserve-btn').textContent = 'Mekanı Rezerve Et';
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.venueDetailApp = new VenueDetailApp();
});

// Export for external use
window.VenueDetailApp = VenueDetailApp; 