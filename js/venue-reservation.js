import { auth, db } from './firebase-config.js';
import { 
    collection, 
    doc, 
    getDoc,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import { startNewConversation } from './messages.js';

let currentVenue = null;
let selectedDate = null;

// Initialize venue reservation system
export async function initializeVenueReservation() {
    // Get venue ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const venueId = urlParams.get('id');
    
    if (!venueId) {
        console.error('Venue ID not found in URL');
        return;
    }

    // Get venue details
    try {
        const venueDoc = await getDoc(doc(db, 'venues', venueId));
        if (venueDoc.exists()) {
            currentVenue = venueDoc.data();
            currentVenue.id = venueDoc.id;
            setupDatePicker();
            displayAvailableDates();
            setupRequestButton();
        } else {
            console.error('Venue not found');
        }
    } catch (error) {
        console.error('Error fetching venue:', error);
    }
}

// Setup date picker
function setupDatePicker() {
    const datePicker = document.getElementById('reservation-date');
    const requestBtn = document.getElementById('request-btn');
    
    // Set min date to today
    const today = new Date();
    datePicker.min = today.toISOString().split('T')[0];
    
    // Set max date to 6 months from now
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);
    datePicker.max = maxDate.toISOString().split('T')[0];
    
    datePicker.addEventListener('change', (e) => {
        selectedDate = e.target.value;
        const isAvailableDate = currentVenue.availableDates.some(date => 
            new Date(date).toISOString().split('T')[0] === selectedDate
        );
        
        requestBtn.disabled = !isAvailableDate;
        
        if (!isAvailableDate) {
            alert('Seçilen tarih müsait değil. Lütfen müsait tarihlerden birini seçin.');
            datePicker.value = '';
            selectedDate = null;
        }
    });
}

// Display available dates
function displayAvailableDates() {
    const datesList = document.getElementById('available-dates-list');
    datesList.innerHTML = '';
    
    if (!currentVenue.availableDates || currentVenue.availableDates.length === 0) {
        datesList.innerHTML = '<li>Şu anda müsait tarih bulunmuyor</li>';
        return;
    }
    
    currentVenue.availableDates.forEach(date => {
        const formattedDate = new Date(date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const li = document.createElement('li');
        li.textContent = formattedDate;
        datesList.appendChild(li);
    });
}

// Setup request button
function setupRequestButton() {
    const requestBtn = document.getElementById('request-btn');
    
    requestBtn.addEventListener('click', async () => {
        if (!auth.currentUser) {
            window.location.href = '/hub/giris';
            return;
        }
        
        if (!selectedDate) {
            alert('Lütfen bir tarih seçin');
            return;
        }
        
        try {
            // Get venue owner's user ID (assuming it's stored in venue data)
            const venueOwnerUid = currentVenue.contact.uid || 'admin'; // Fallback to admin if not set
            
            // Format the reservation message
            const formattedDate = new Date(selectedDate).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const message = `Rezervasyon Talebi\n\nMekan: ${currentVenue.name}\nTarih: ${formattedDate}\n\nBu tarih için rezervasyon talebinde bulunmak istiyorum. Müsaitlik durumunu onaylayabilir misiniz?`;
            
            // Start a new conversation or use existing one
            const conversation = await startNewConversation(venueOwnerUid);
            
            // Add the reservation request message
            await addDoc(collection(db, 'conversations', conversation.id, 'messages'), {
                text: message,
                senderId: auth.currentUser.uid,
                timestamp: serverTimestamp(),
                type: 'reservation_request',
                venueId: currentVenue.id,
                requestedDate: selectedDate,
                status: 'pending'
            });
            
            // Redirect to messages page
            window.location.href = '/hub/messages.html';
            
        } catch (error) {
            console.error('Error sending reservation request:', error);
            alert('Rezervasyon talebi gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeVenueReservation); 