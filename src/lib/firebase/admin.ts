import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Initialize Firebase Admin SDK
function createFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  // Check if we have service account credentials
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    // Use service account credentials
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
      ...firebaseAdminConfig,
    });
  } else {
    // Fallback to default credentials (useful for development/local testing)
    return initializeApp(firebaseAdminConfig);
  }
}

// Initialize Firebase Admin
const firebaseAdminApp = createFirebaseAdminApp();

// Initialize Firestore with Admin SDK
export const adminDb = getFirestore(firebaseAdminApp);

export default firebaseAdminApp;
