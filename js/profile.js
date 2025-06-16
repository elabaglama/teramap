// Profile page Firebase integration
import { logOut, getCurrentUser, monitorAuthState } from './auth.js';
import { requireAuth } from './auth-guard.js';

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn');
  const userInfo = document.getElementById('user-info');
  
  // Protect this page - require authentication
  requireAuth('/signin.html', (user) => {
    // This callback runs when user is authenticated
    displayUserInfo(user);
  }).catch((error) => {
    console.error('Auth required:', error);
  });

  // Çıkış yap butonu
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const originalText = logoutBtn.textContent;
      logoutBtn.textContent = 'Çıkış yapılıyor...';
      logoutBtn.disabled = true;
      
      try {
        const result = await logOut();
        
        if (result.success) {
          // Başarılı çıkış, ana sayfaya yönlendir
          window.location.href = '/';
        } else {
          console.error('Çıkış hatası:', result.error);
          alert('Çıkış yapılamadı. Lütfen tekrar deneyin.');
        }
      } catch (error) {
        console.error('Çıkış hatası:', error);
        alert('Çıkış yapılamadı. Lütfen tekrar deneyin.');
      } finally {
        logoutBtn.textContent = originalText;
        logoutBtn.disabled = false;
      }
    });
  }

  // Kullanıcı bilgilerini göster
  function displayUserInfo(user) {
    if (userInfo) {
      const userEmail = document.getElementById('user-email');
      const userName = document.getElementById('user-name');
      const userAvatar = document.getElementById('user-avatar');
      
      if (userEmail) userEmail.textContent = user.email;
      if (userName) userName.textContent = user.displayName || 'İsim belirtilmemiş';
      if (userAvatar && user.photoURL) userAvatar.src = user.photoURL;
    }
  }
}); 