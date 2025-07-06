// Venues data and functionality
class VenuesApp {
    constructor() {
        this.venues = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        await this.loadVenues();
        this.setupEventListeners();
        this.renderVenues();
    }

    async loadVenues() {
        try {
            const response = await fetch('../data/venues.json');
            const data = await response.json();
            this.venues = data.venues || [];
        } catch (error) {
            console.error('Error loading venues:', error);
            this.venues = [];
        }
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.setFilter(filter);
            });
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        // Re-render venues
        this.renderVenues();
    }

    filterVenues() {
        switch (this.currentFilter) {
            case 'paid':
                return this.venues.filter(venue => venue.isPaid);
            case 'youth-free':
                return this.venues.filter(venue => venue.isYouthFree);
            default:
                return this.venues;
        }
    }

    renderVenues() {
        const grid = document.getElementById('venues-grid');
        const filteredVenues = this.filterVenues();

        if (filteredVenues.length === 0) {
            grid.innerHTML = `
                <div class="no-venues">
                    <h3>Mekan bulunamadı</h3>
                    <p>Seçili filtrelere uygun mekan bulunmamaktadır.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredVenues.map((venue, index) => `
            <div class="venue-card" onclick="venuesApp.openVenueDetail('${venue.id}')">
                <img src="${venue.image}" alt="${venue.name}" class="venue-image" onerror="this.src='../images/general/placeholder.jpg'">
                <div class="venue-info">
                    <h3 class="venue-name">${venue.name}</h3>
                    <p class="venue-location">${venue.location}</p>
                    <p class="venue-capacity">Kapasite: ${venue.capacity}</p>
                </div>
            </div>
        `).join('');

        // Re-apply animation delays
        const cards = grid.querySelectorAll('.venue-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${(index + 1) * 0.1}s`;
        });
    }

    openVenueDetail(venueId) {
        // Create URL-friendly slug from venue name/id
        const venue = this.venues.find(v => v.id === venueId);
        if (!venue) return;
        
        const slugs = {
            '1': 'postanegalata',
            '2': 'rahatevebahceli', 
            '3': 'fenerevleri',
            '4': 'metrohan',
            '5': 'borusan'
        };
        
        const slug = slugs[venueId] || venueId;
        window.location.href = `/app/venues/${slug}`;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.venuesApp = new VenuesApp();
});

// Export for external use
window.VenuesApp = VenuesApp; 