const grid = document.getElementById('venuesGrid');
const filterBtns = document.querySelectorAll('.filter-btn');

async function fetchVenues(filter = 'all') {
    const res = await fetch(`/api/venues?filter=${filter}`);
    return res.json();
}

function renderVenues(venues) {
    grid.innerHTML = '';
    venues.forEach(v => {
        const card = document.createElement('div');
        card.className = 'venue-card';
        // Adjust image path for /app/venues context
        let imgSrc = v.image.replace('..', '..');
        if (imgSrc.startsWith('../images/')) imgSrc = imgSrc.replace('../images/', '/images/');
        card.innerHTML = `
            <img class="venue-img" src="${imgSrc}" alt="${v.name}">
            <div class="venue-info">
                <div class="venue-title">${v.name}</div>
                <div class="venue-meta">${v.location}, Kapasite: ${v.capacity}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function setActive(btn) {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        setActive(btn);
        const filter = btn.dataset.filter;
        const venues = await fetchVenues(filter);
        renderVenues(venues);
    });
});

// Initial load
fetchVenues().then(renderVenues); 