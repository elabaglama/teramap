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
            const response = await fetch('../../data/venues.json');
            const data = await response.json();
            this.venues = data.venues || [];
        } catch (error) {
            console.error('Error loading venues:', error);
            this.venues = [];
        }
    }

    extractVenueFromURL() {
        const path = window.location.pathname;
        const venueSlug = path.split('/').pop();
        
        // Convert slug back to venue (simple mapping for now)
        const slugToId = {
            'postanegalata': '1',
            'rahatevahabcelieve': '2', 
            'fenerevleri': '3',
            'metrohan': '4',
            'borusan': '5'
        };
        
        const venueId = slugToId[venueSlug];
        this.venue = this.venues.find(v => v.id === venueId);
    }

    loadVenueData() {
        if (!this.venue) {
            this.showNotFound();
            return;
        }

        // Update page title
        document.title = `${this.venue.name} - TeraMap`;
        
        // Load venue details
        document.getElementById('venue-image').src = this.venue.image;
        document.getElementById('venue-image').alt = this.venue.name;
        document.getElementById('venue-name').textContent = this.venue.name;
        document.getElementById('venue-location').textContent = this.venue.location;
        document.getElementById('venue-capacity').textContent = this.venue.capacity;
        document.getElementById('venue-description').textContent = this.venue.description;

        // Load amenities
        this.loadAmenities();
    }

    loadAmenities() {
        const amenitiesGrid = document.getElementById('amenities-grid');
        
        if (!this.venue.features || this.venue.features.length === 0) {
            amenitiesGrid.innerHTML = '<p>No amenities listed</p>';
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

    showNotFound() {
        document.querySelector('.venue-detail-main').innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <h1>Venue Not Found</h1>
                <p>The venue you're looking for doesn't exist.</p>
                <a href="../venues.html" class="reserve-btn" style="display: inline-block; text-decoration: none;">
                    Back to Venues
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
        
        // Update month header
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
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
        
        // Add selection to clicked date
        event.target.classList.add('selected');
        this.selectedDate = new Date(date);
        
        // Enable reserve button
        document.getElementById('reserve-btn').disabled = false;
    }

    handleReservation() {
        if (!this.selectedDate) {
            alert('Please select a date first.');
            return;
        }

        const formattedDate = this.selectedDate.toLocaleDateString('tr-TR');
        const message = `Reservation request for ${this.venue.name} on ${formattedDate}`;
        
        // In a real app, this would make an API call
        alert(`Reservation request submitted!\n\nVenue: ${this.venue.name}\nDate: ${formattedDate}\n\nWe'll contact you shortly.`);
        
        console.log('Reservation details:', {
            venue: this.venue,
            date: this.selectedDate,
            user: 'Current User'
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.venueDetailApp = new VenueDetailApp();
});

// Export for external use
window.VenueDetailApp = VenueDetailApp; 