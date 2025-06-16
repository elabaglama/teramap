// Signin page Firebase integration
import { signInWithEmail, signInWithGoogle, resetPassword } from './auth.js';
import { redirectIfAuthenticated } from './auth-guard.js';

document.addEventListener('DOMContentLoaded', () => {
  // Redirect if user is already authenticated
  redirectIfAuthenticated('/profile.html');
  
  const signinForm = document.getElementById('signin-form');
  const googleSigninBtn = document.getElementById('google-signin');
  const forgotPasswordBtn = document.getElementById('forgot-password');
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');

  // Email ile giriş yap
  if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Loading durumu
      const submitBtn = signinForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Giriş yapılıyor...';
      submitBtn.disabled = true;
      
      try {
        const result = await signInWithEmail(email, password);
        
        if (result.success) {
          showSuccess('Giriş başarılı! Yönlendiriliyorsunuz...');
          setTimeout(() => {
            window.location.href = '/profil';
          }, 1500);
        } else {
          showError(result.error);
        }
      } catch (error) {
        showError('Giriş yapılamadı. Lütfen tekrar deneyin.');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Google ile giriş yap
  if (googleSigninBtn) {
    googleSigninBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const originalText = googleSigninBtn.textContent;
      googleSigninBtn.textContent = 'Google ile bağlanıyor...';
      googleSigninBtn.disabled = true;
      
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
        googleSigninBtn.textContent = originalText;
        googleSigninBtn.disabled = false;
      }
    });
  }

  // Şifremi unuttum
  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      
      if (!email) {
        showError('Lütfen önce e-posta adresinizi girin.');
        return;
      }
      
      const originalText = forgotPasswordBtn.textContent;
      forgotPasswordBtn.textContent = 'Email gönderiliyor...';
      forgotPasswordBtn.disabled = true;
      
      try {
        const result = await resetPassword(email);
        
        if (result.success) {
          showSuccess('Şifre sıfırlama emaili gönderildi. E-postanızı kontrol edin.');
        } else {
          showError(result.error);
        }
      } catch (error) {
        showError('Email gönderilemedi. Lütfen tekrar deneyin.');
      } finally {
        forgotPasswordBtn.textContent = originalText;
        forgotPasswordBtn.disabled = false;
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