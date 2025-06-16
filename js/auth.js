// Firebase Authentication Functions
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from './firebase-config.js';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Kullanıcı giriş durumunu izle
export const monitorAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Email ile kayıt ol
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Kullanıcı profil bilgilerini güncelle
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
    }
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Email ile giriş yap
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Google ile giriş yap
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Çıkış yap
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Şifre sıfırlama emaili gönder
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Mevcut kullanıcıyı al
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Hata mesajlarını Türkçe'ye çevir
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/user-not-found': 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.',
    'auth/wrong-password': 'Yanlış şifre girdiniz.',
    'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda.',
    'auth/weak-password': 'Şifre en az 6 karakter olmalıdır.',
    'auth/invalid-email': 'Geçersiz e-posta adresi.',
    'auth/too-many-requests': 'Çok fazla hatalı deneme. Lütfen daha sonra tekrar deneyin.',
    'auth/network-request-failed': 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.',
    'auth/popup-closed-by-user': 'Giriş penceresi kapatıldı.',
    'auth/cancelled-popup-request': 'Giriş işlemi iptal edildi.'
  };
  
  return errorMessages[errorCode] || 'Bir hata oluştu. Lütfen tekrar deneyin.';
};

// Sayfa yüklendiğinde auth durumunu kontrol et
document.addEventListener('DOMContentLoaded', () => {
  monitorAuthState((user) => {
    updateNavigationForUser(user);
  });
});

// Navigation'ı kullanıcı durumuna göre güncelle
const updateNavigationForUser = (user) => {
  const signupBtn = document.querySelector('.signup-btn');
  
  if (user && signupBtn) {
    signupBtn.href = '/profil';
    signupBtn.textContent = 'Profil';
    signupBtn.classList.add('logged-in');
  } else if (signupBtn) {
    signupBtn.href = 'https://www.teramap.works/kaydol';
    signupBtn.textContent = 'Kaydol';
    signupBtn.classList.remove('logged-in');
  }
}; 