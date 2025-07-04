import { auth, db } from './firebase-config.js';
import { 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot, 
  where, 
  updateDoc, 
  serverTimestamp,
  setDoc,
  limit
} from 'firebase/firestore';

let currentUser = null;
let currentConversation = null;
let messagesUnsubscribe = null;
let conversationsUnsubscribe = null;

// DOM Elements
const conversationsList = document.getElementById('conversations-list');
const emptyState = document.getElementById('empty-state');
const chatHeader = document.getElementById('chat-header');
const messagesArea = document.getElementById('messages-area');
const messageInputArea = document.getElementById('message-input-area');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const searchInput = document.getElementById('search-input');

// Initialize messaging system
export function initializeMessaging() {
  // Auth state management
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      await initializeUser(user);
      loadConversations();
      setupMessageInput();
    } else {
      window.location.href = '/hub/giris';
    }
  });
}

// Initialize user in Firestore
async function initializeUser(user) {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Kullanıcı',
      lastSeen: serverTimestamp(),
      isOnline: true
    }, { merge: true });
  } catch (error) {
    console.error('Kullanıcı başlatma hatası:', error);
  }
}

// Load conversations
function loadConversations() {
  if (conversationsUnsubscribe) {
    conversationsUnsubscribe();
  }
  
  const conversationsQuery = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', currentUser.uid),
    orderBy('lastMessageTime', 'desc')
  );
  
  conversationsUnsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
    displayConversations(snapshot.docs);
  }, (error) => {
    console.error('Konuşmalar yükleme hatası:', error);
    conversationsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #717171;">Konuşmalar yüklenemedi</div>';
  });
}

// Display conversations
function displayConversations(conversations) {
  if (conversations.length === 0) {
    conversationsList.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #717171;">
        <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
        <p>Henüz konuşmanız yok</p>
        <button class="start-conversation-btn" onclick="openNewConversationModal()" style="margin-top: 16px;">
          Yeni Konuşma Başlat
        </button>
      </div>
    `;
    return;
  }
  
  conversationsList.innerHTML = '';
  
  conversations.forEach(async (conversationDoc) => {
    const conversation = conversationDoc.data();
    const conversationId = conversationDoc.id;
    
    // Get other participant
    const otherParticipantId = conversation.participants.find(p => p !== currentUser.uid);
    
    if (otherParticipantId) {
      try {
        const otherUserDoc = await getDocs(query(
          collection(db, 'users'),
          where('uid', '==', otherParticipantId)
        ));
        
        if (!otherUserDoc.empty) {
          const otherUser = otherUserDoc.docs[0].data();
          
          const conversationElement = document.createElement('div');
          conversationElement.className = 'conversation-item';
          conversationElement.onclick = () => openConversation(conversationId, otherUser);
          
          const lastMessageTime = conversation.lastMessageTime ? 
            formatTime(conversation.lastMessageTime.toDate()) : '';
          
          conversationElement.innerHTML = `
            <div class="conversation-avatar">
              ${(otherUser.displayName || 'U').charAt(0).toUpperCase()}
            </div>
            <div class="conversation-content">
              <div class="conversation-name">${otherUser.displayName || 'Kullanıcı'}</div>
              <div class="conversation-preview">${conversation.lastMessage || 'Henüz mesaj yok'}</div>
              <div class="conversation-time">${lastMessageTime}</div>
            </div>
          `;
          
          conversationsList.appendChild(conversationElement);
        }
      } catch (error) {
        console.error('Kullanıcı bilgisi yüklenemedi:', error);
      }
    }
  });
}

// Open conversation
async function openConversation(conversationId, otherUser) {
  currentConversation = conversationId;
  
  // Update UI
  emptyState.style.display = 'none';
  chatHeader.style.display = 'flex';
  messagesArea.style.display = 'block';
  messageInputArea.style.display = 'block';
  
  // Update header
  document.getElementById('chat-avatar').textContent = 
    (otherUser.displayName || 'U').charAt(0).toUpperCase();
  document.getElementById('chat-name').textContent = 
    otherUser.displayName || 'Kullanıcı';
  
  // Mark active conversation
  document.querySelectorAll('.conversation-item').forEach(item => {
    item.classList.remove('active');
  });
  
  loadMessages(conversationId);
}

// Load messages
function loadMessages(conversationId) {
  if (messagesUnsubscribe) {
    messagesUnsubscribe();
  }
  
  document.getElementById('messages-loading').style.display = 'block';
  
  const messagesQuery = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(50)
  );
  
  messagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
    document.getElementById('messages-loading').style.display = 'none';
    displayMessages(snapshot.docs);
    scrollToBottom();
  }, (error) => {
    console.error('Mesajlar yükleme hatası:', error);
    document.getElementById('messages-loading').style.display = 'none';
    messagesArea.innerHTML = '<div style="text-align: center; color: #717171; padding: 20px;">Mesajlar yüklenemedi</div>';
  });
}

// Display messages
function displayMessages(messages) {
  const messagesContainer = document.createElement('div');
  
  messages.forEach((messageDoc) => {
    const message = messageDoc.data();
    const messageElement = document.createElement('div');
    
    const isSent = message.senderId === currentUser.uid;
    messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
    
    const timestamp = message.timestamp ? 
      formatTime(message.timestamp.toDate()) : '';

    // Handle reservation request messages specially
    if (message.type === 'reservation_request') {
      messageElement.classList.add('reservation-request');
      
      const formattedDate = new Date(message.requestedDate).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      let statusBadge = '';
      let actionButtons = '';
      
      switch(message.status) {
        case 'pending':
          statusBadge = '<span class="status-badge pending">Beklemede</span>';
          // Only show action buttons to venue owner and for pending requests
          if (!isSent) {
            actionButtons = `
              <div class="reservation-actions">
                <button class="action-btn approve" onclick="handleReservationResponse('${messageDoc.id}', 'approved')">
                  <i class="fas fa-check"></i> Onayla
                </button>
                <button class="action-btn reject" onclick="handleReservationResponse('${messageDoc.id}', 'rejected')">
                  <i class="fas fa-times"></i> Reddet
                </button>
              </div>
            `;
          }
          break;
        case 'approved':
          statusBadge = '<span class="status-badge approved">Onaylandı</span>';
          break;
        case 'rejected':
          statusBadge = '<span class="status-badge rejected">Reddedildi</span>';
          break;
      }

      messageElement.innerHTML = `
        <div class="reservation-header">
          <i class="fas fa-calendar-alt"></i>
          Rezervasyon Talebi ${statusBadge}
        </div>
        <div class="reservation-content">
          ${message.text}
        </div>
        ${actionButtons}
        <div class="message-time">${timestamp}</div>
      `;
    } else {
      messageElement.innerHTML = `
        <div>${message.text}</div>
        <div class="message-time">${timestamp}</div>
      `;
    }
    
    messagesContainer.appendChild(messageElement);
  });
  
  // Replace messages area content
  messagesArea.innerHTML = '';
  messagesArea.appendChild(messagesContainer);

  // Add styles for reservation messages if not already added
  if (!document.getElementById('reservation-styles')) {
    const styles = document.createElement('style');
    styles.id = 'reservation-styles';
    styles.textContent = `
      .message.reservation-request {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        padding: 1rem;
        border-radius: 12px;
      }

      .reservation-header {
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .reservation-content {
        white-space: pre-line;
        color: #495057;
        margin-bottom: 1rem;
      }

      .reservation-actions {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .action-btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.3rem;
        transition: all 0.2s ease;
      }

      .action-btn.approve {
        background: #28a745;
        color: white;
      }

      .action-btn.approve:hover {
        background: #218838;
      }

      .action-btn.reject {
        background: #dc3545;
        color: white;
      }

      .action-btn.reject:hover {
        background: #c82333;
      }

      .status-badge {
        font-size: 0.8rem;
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
        margin-left: 0.5rem;
      }

      .status-badge.pending {
        background: #fff3cd;
        color: #856404;
      }

      .status-badge.approved {
        background: #d4edda;
        color: #155724;
      }

      .status-badge.rejected {
        background: #f8d7da;
        color: #721c24;
      }
    `;
    document.head.appendChild(styles);
  }
}

// Send message
async function sendMessage() {
  if (!currentConversation || !messageInput.value.trim()) return;
  
  const messageText = messageInput.value.trim();
  messageInput.value = '';
  sendBtn.disabled = true;
  
  try {
    // Add message to conversation
    await addDoc(collection(db, 'conversations', currentConversation, 'messages'), {
      text: messageText,
      senderId: currentUser.uid,
      timestamp: serverTimestamp(),
      status: 'sent'
    });
    
    // Update conversation last message
    await updateDoc(doc(db, 'conversations', currentConversation), {
      lastMessage: messageText,
      lastMessageTime: serverTimestamp()
    });
    
  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
    messageInput.value = messageText; // Restore message
  } finally {
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

// Setup message input
function setupMessageInput() {
  messageInput.addEventListener('input', () => {
    sendBtn.disabled = !messageInput.value.trim();
    
    // Auto-resize textarea
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
  });
  
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) {
        sendMessage();
      }
    }
  });
  
  sendBtn.addEventListener('click', sendMessage);
}

// Utility functions
function formatTime(date) {
  const now = new Date();
  const diff = now - date;
  const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (dayDiff === 0) {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  } else if (dayDiff === 1) {
    return 'Dün';
  } else if (dayDiff < 7) {
    return date.toLocaleDateString('tr-TR', { weekday: 'long' });
  } else {
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
  }
}

function scrollToBottom() {
  setTimeout(() => {
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }, 100);
}

// User management functions
export async function loadUsers() {
  const usersList = document.getElementById('users-list');
  usersList.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i> Kullanıcılar yükleniyor...</div>';
  
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('uid', '!=', currentUser.uid)
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    usersList.innerHTML = '';
    
    if (usersSnapshot.empty) {
      usersList.innerHTML = '<div style="text-align: center; color: #717171; padding: 20px;">Başka kullanıcı bulunamadı</div>';
      return;
    }
    
    usersSnapshot.forEach((userDoc) => {
      const user = userDoc.data();
      const userElement = document.createElement('div');
      userElement.className = 'user-item';
      userElement.onclick = () => startNewConversation(user);
      
      userElement.innerHTML = `
        <div class="user-avatar-small">
          ${(user.displayName || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <div style="font-weight: 500;">${user.displayName || 'Kullanıcı'}</div>
          <div style="font-size: 12px; color: #717171;">${user.email}</div>
        </div>
      `;
      
      usersList.appendChild(userElement);
    });
    
  } catch (error) {
    console.error('Kullanıcılar yükleme hatası:', error);
    usersList.innerHTML = '<div style="text-align: center; color: #717171; padding: 20px;">Kullanıcılar yüklenemedi</div>';
  }
}

export async function startNewConversation(otherUser) {
  try {
    // Create new conversation
    const conversationRef = await addDoc(collection(db, 'conversations'), {
      participants: [currentUser.uid, otherUser.uid],
      createdAt: serverTimestamp(),
      lastMessage: '',
      lastMessageTime: serverTimestamp()
    });
    
    closeNewConversationModal();
    openConversation(conversationRef.id, otherUser);
    
  } catch (error) {
    console.error('Konuşma başlatma hatası:', error);
    alert('Konuşma başlatılamadı. Lütfen tekrar deneyin.');
  }
}

// Modal functions
export function openNewConversationModal() {
  document.getElementById('new-conversation-modal').style.display = 'flex';
  loadUsers();
}

export function closeNewConversationModal() {
  document.getElementById('new-conversation-modal').style.display = 'none';
}

// Search functionality
export function setupSearch() {
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const conversationItems = document.querySelectorAll('.conversation-item');
    
    conversationItems.forEach(item => {
      const nameElement = item.querySelector('.conversation-name');
      const previewElement = item.querySelector('.conversation-preview');
      
      if (nameElement && previewElement) {
        const name = nameElement.textContent.toLowerCase();
        const preview = previewElement.textContent.toLowerCase();
        
        if (name.includes(searchTerm) || preview.includes(searchTerm)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      }
    });
  });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (messagesUnsubscribe) messagesUnsubscribe();
  if (conversationsUnsubscribe) conversationsUnsubscribe();
});

// Make functions globally available
window.openConversation = openConversation;
window.openNewConversationModal = openNewConversationModal;
window.closeNewConversationModal = closeNewConversationModal;
window.startNewConversation = startNewConversation;

// Handle reservation response
window.handleReservationResponse = async function(messageId, status) {
  if (!currentConversation) return;
  
  try {
    // Update the message status
    await updateDoc(doc(db, 'conversations', currentConversation, 'messages', messageId), {
      status: status
    });
    
    // Send a response message
    const responseMessage = status === 'approved' 
      ? 'Rezervasyon talebiniz onaylanmıştır. İyi eğlenceler!'
      : 'Üzgünüz, rezervasyon talebiniz reddedilmiştir.';
    
    await addDoc(collection(db, 'conversations', currentConversation, 'messages'), {
      text: responseMessage,
      senderId: currentUser.uid,
      timestamp: serverTimestamp(),
      type: 'reservation_response',
      status: status
    });
    
  } catch (error) {
    console.error('Error handling reservation response:', error);
    alert('Rezervasyon yanıtı gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
  }
} 