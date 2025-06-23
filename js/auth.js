import { auth, googleProvider } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';

// Show error message
function showError(message, elementId = 'error-message') {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
}

// Show success message
function showSuccess(message, elementId = 'success-message') {
  const successElement = document.getElementById(elementId);
  if (successElement) {
    successElement.textContent = message;
    successElement.style.display = 'block';
    setTimeout(() => {
      successElement.style.display = 'none';
    }, 5000);
  }
}

// Hide all messages
function hideAllMessages() {
  const errorElement = document.getElementById('error-message');
  const successElement = document.getElementById('success-message');
  if (errorElement) errorElement.style.display = 'none';
  if (successElement) successElement.style.display = 'none';
}

// Sign up with email and password
export async function signUpWithEmail(email, password, displayName) {
  try {
    hideAllMessages();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
    }
    
    showSuccess('Hesabınız başarıyla oluşturuldu! Giriş yapabilirsiniz.');
    
    // Redirect to hub sign in page after 2 seconds
    setTimeout(() => {
              window.location.href = '/hub/giris.html';
    }, 2000);
    
    return userCredential.user;
  } catch (error) {
    let errorMessage = 'Kayıt sırasında bir hata oluştu.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Bu e-posta adresi zaten kullanımda.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Şifre çok zayıf. En az 6 karakter olmalıdır.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Geçersiz e-posta adresi.';
        break;
      default:
        errorMessage = error.message;
    }
    
    showError(errorMessage);
    throw error;
  }
}

// Sign in with email and password
export async function signInWithEmail(email, password) {
  try {
    hideAllMessages();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    showSuccess('Başarıyla giriş yaptınız!');
    
    // Redirect to hub page after 1 second
    setTimeout(() => {
      window.location.href = '/hub/mekanlar.html';
    }, 1000);
    
    return userCredential.user;
  } catch (error) {
    let errorMessage = 'Giriş sırasında bir hata oluştu.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Yanlış şifre.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Geçersiz e-posta adresi.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Bu hesap devre dışı bırakılmış.';
        break;
      default:
        errorMessage = error.message;
    }
    
    showError(errorMessage);
    throw error;
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    hideAllMessages();
    const result = await signInWithPopup(auth, googleProvider);
    showSuccess('Google ile başarıyla giriş yaptınız!');
    
    // Redirect to hub page after 1 second
    setTimeout(() => {
      window.location.href = '/hub/mekanlar.html';
    }, 1000);
    
    return result.user;
  } catch (error) {
    let errorMessage = 'Google ile giriş yapılırken bir hata oluştu.';
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Giriş penceresi kapatıldı.';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Açılır pencere engellendi. Lütfen tarayıcı ayarlarınızı kontrol edin.';
        break;
      default:
        errorMessage = error.message;
    }
    
    showError(errorMessage);
    throw error;
  }
}

// Sign out
export async function logOut() {
  try {
    await signOut(auth);
    window.location.href = '/hub/index.html';
  } catch (error) {
    showError('Çıkış yapılırken bir hata oluştu.');
    throw error;
  }
}

// Reset password
export async function resetPassword(email) {
  try {
    hideAllMessages();
    await sendPasswordResetEmail(auth, email);
    showSuccess('Şifre sıfırlama e-postası gönderildi. E-posta kutunuzu kontrol edin.');
  } catch (error) {
    let errorMessage = 'Şifre sıfırlanırken bir hata oluştu.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Geçersiz e-posta adresi.';
        break;
      default:
        errorMessage = error.message;
    }
    
    showError(errorMessage);
    throw error;
  }
}

// Auth state observer
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
} 