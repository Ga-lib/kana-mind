// Firebase web config. These values are public by design: they only identify the project.
// Access to data is enforced server-side by Firestore security rules (see firestore.rules).
export const firebaseConfig = {
  apiKey: 'AIzaSyCIvfYvlNSHaJUHIXm1Kqazvz0lgOJCoU4',
  // Sign-in runs through this site's own domain (vercel.json proxies /__/auth to Firebase),
  // so Google shows 'continue to kana-mind.vercel.app'.
  authDomain: 'kana-mind.vercel.app',
  projectId: 'flutter-application-1-cc253',
  storageBucket: 'flutter-application-1-cc253.firebasestorage.app',
  messagingSenderId: '367538313931',
  appId: '1:367538313931:web:e451139a3192f2a3d1194e',
}
