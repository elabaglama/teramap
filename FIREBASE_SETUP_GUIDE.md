# Firebase Authentication Setup Guide

## 🔥 What I've Built For You

I've implemented a complete Firebase Authentication system with:
- ✅ Email/Password Sign Up
- ✅ Email/Password Sign In
- ✅ Google Sign In
- ✅ Password Reset
- ✅ Turkish language error messages
- ✅ Proper form validation
- ✅ Automatic redirects after successful auth

## 🚀 What You Need To Do

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "tera-map")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Click "Enable" toggle
   - **Google**: Click "Enable" toggle, add your support email

### Step 3: Add Your Website to Firebase

1. In the Firebase project overview, click the web icon `</>`
2. Enter your app nickname (e.g., "tera-map-web")
3. Check "Also set up Firebase Hosting" if you want (optional)
4. Click "Register app"
5. **IMPORTANT**: Copy the `firebaseConfig` object - you'll need this!

### Step 4: Update Your Code

Replace the placeholder Firebase configuration in **BOTH** files:

#### In `kaydol.html` (around line 8):
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID", 
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

#### In `signin.html` (around line 8):
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com", 
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**Replace the placeholder values with your actual Firebase config values!**

### Step 5: Configure Authorized Domains (Important!)

1. In Firebase Console, go to Authentication > Settings
2. In the "Authorized domains" section, add your domain:
   - For local development: `localhost`
   - For production: your actual domain (e.g., `yourdomain.com`)

### Step 6: Test Your Authentication

1. Open your website
2. Try signing up with a new email
3. Check your Firebase Console > Authentication > Users to see if the user was created
4. Try signing in with the created account
5. Test Google sign-in
6. Test password reset

## 🔧 Troubleshooting

### Common Issues:

1. **"Firebase is not defined" error**
   - Make sure you replaced the Firebase config with your actual values
   - Check browser console for specific errors

2. **Google Sign-in not working**
   - Make sure you enabled Google authentication in Firebase Console
   - Check if your domain is added to authorized domains

3. **"auth/unauthorized-domain" error**
   - Add your domain to authorized domains in Firebase Console

4. **Users not appearing in Firebase Console**
   - Double-check your Firebase config values
   - Make sure you're looking at the correct project

### Testing Locally:

If testing on localhost, make sure to:
1. Add `localhost` to authorized domains in Firebase
2. Use `http://localhost:YOUR_PORT` or `http://127.0.0.1:YOUR_PORT`

## 📱 Features Included

### Sign Up Page (`kaydol.html`):
- Collects: Name, Email, Community Name, Password
- Validates email format and password strength
- Creates Firebase user with display name
- Redirects to sign-in page after successful registration

### Sign In Page (`signin.html`):
- Email/password authentication
- Google sign-in button
- Forgot password functionality
- Redirects to home page after successful login

### Security Features:
- Password minimum length (6 characters)
- Email format validation
- Proper error handling with Turkish messages
- Automatic token management by Firebase

## 🎉 That's It!

Once you complete these steps, your authentication system will be fully functional! Users can:
- Sign up with email/password
- Sign in with email/password or Google
- Reset their passwords
- Stay signed in across browser sessions

The system automatically handles user sessions, tokens, and security for you.

Need help? Check the browser console for error messages or let me know what specific issue you're facing! 