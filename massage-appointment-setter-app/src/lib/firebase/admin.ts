// src/lib/firebase/admin.ts
import * as admin from 'firebase-admin';
import 'server-only';

let cachedAdminApp: admin.app.App | null = null;

export function getFirebaseAdminApp() {
  console.log('--- getFirebaseAdminApp called ---');

  if (cachedAdminApp) {
    console.log('Returning cached Firebase Admin app.');
    return cachedAdminApp;
  }

  // Check if an app is already initialized, for robustness
  if (admin.apps.length > 0) {
    console.log('Found existing Firebase Admin app, retrieving it.');
    cachedAdminApp = admin.app(); // Get the existing default app
    return cachedAdminApp;
  }

  console.log('Attempting to initialize new Firebase Admin app.');

  // --- ADD THESE DEBUG LOGS ---
  console.log('DEBUG: process.env.FIREBASE_ADMIN_PROJECT_ID:', process.env.FIREBASE_ADMIN_PROJECT_ID);
  console.log('DEBUG: process.env.FIREBASE_ADMIN_CLIENT_EMAIL:', process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
  console.log('DEBUG: process.env.FIREBASE_ADMIN_PRIVATE_KEY is defined:', !!process.env.FIREBASE_ADMIN_PRIVATE_KEY);
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      console.log('DEBUG: Private Key (first 50 chars):', process.env.FIREBASE_ADMIN_PRIVATE_KEY.substring(0, 50));
      console.log('DEBUG: Private Key (last 50 chars):', process.env.FIREBASE_ADMIN_PRIVATE_KEY.substring(process.env.FIREBASE_ADMIN_PRIVATE_KEY.length - 50));
      console.log('DEBUG: Private Key length:', process.env.FIREBASE_ADMIN_PRIVATE_KEY.length);
  }
  // --- END DEBUG LOGS ---


  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY; // This is the variable that is undefined

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Firebase Admin SDK environment variables are NOT loading correctly.');
    console.error('projectId:', projectId);
    console.error('clientEmail:', clientEmail);
    console.error('privateKey is null/undefined:', privateKey === undefined || privateKey === null);
    console.error('privateKey is empty string:', privateKey === '');

    throw new Error(
      'Firebase Admin SDK environment variables are not set. Check your .env.local file.'
    );
  }

  // Important: Replace literal \\n with actual newline characters
  // This step is critical if your privateKey in .env.local used \\n
  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

  try {
    cachedAdminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: formattedPrivateKey,
      }),
    });
    console.log('Firebase Admin app initialized successfully!');
    return cachedAdminApp;
  } catch (error: any) {
    console.error('Firebase Admin initialization FAILED:', error.message);
    console.error(error.stack); // Log the full stack trace of the init error
    throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
  }
}

export const adminDb = getFirebaseAdminApp().firestore();
export const adminAuth = getFirebaseAdminApp().auth();