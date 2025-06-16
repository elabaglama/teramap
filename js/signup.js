// Signup page Firebase integration
import { signUpWithEmail, signInWithGoogle } from './auth.js';
import { redirectIfAuthenticated } from './auth-guard.js';

document.addEventListener('DOMContentLoaded', () => {
  // Redirect if user is already authenticated
  redirectIfAuthenticated('/profile.html');
  
  const signupForm = document.getElementById('signup-form');
  const googleSignupBtn = document.getElementById('google-signup');
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');

  // Email ile kayıt ol
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const displayName = document.getElementById('name').value;
      
      // Form validasyonu
      if (password !== confirmPassword) {
        showError('Şifreler eşleşmiyor.');
        return;
      }
      
      if (password.length < 6) {
        showError('Şifre en az 6 karakter olmalıdır.');
        return;
      }
      
      // Loading durumu
      const submitBtn = signupForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Kayıt oluşturuluyor...';
      submitBtn.disabled = true;
      
      try {
        const result = await signUpWithEmail(email, password, displayName);
        
        if (result.success) {
          showSuccess('Kayıt başarılı! Hoş geldiniz.');
          setTimeout(() => {
            window.location.href = '/profil';
          }, 2000);
        } else {
          showError(result.error);
        }
      } catch (error) {
        showError('Bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Google ile kayıt ol
  if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const originalText = googleSignupBtn.textContent;
      googleSignupBtn.textContent = 'Google ile bağlanıyor...';
      googleSignupBtn.disabled = true;
      
      try {
        const result = await signInWithGoogle();
        
        if (result.success) {
          showSuccess('Google ile giriş başarılı!');
          setTimeout(() => {
            window.location.href = '/profil';
          }, 1500);
        } else {
          showError(result.error);
        }
      } catch (error) {
        showError('Google ile giriş yapılamadı.');
      } finally {
        googleSignupBtn.textContent = originalText;
        googleSignupBtn.disabled = false;
      }
    });
  }

  // Hata mesajı göster
  function showError(message) {
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
      if (successMessage) successMessage.style.display = 'none';
    }
  }

  // Başarı mesajı göster
  function showSuccess(message) {
    if (successMessage) {
      successMessage.textContent = message;
      successMessage.style.display = 'block';
      if (errorMessage) errorMessage.style.display = 'none';
    }
  }
}); 