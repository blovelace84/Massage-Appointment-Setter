// src/lib/firebase/admin.ts
import * as admin from 'firebase-admin';
import 'server-only'; // Ensure this file is only bundled on the server

// Declare a variable to hold the initialized app instance
let cachedAdminApp: admin.app.App | null = null;

// Function to get or initialize the Firebase Admin app
export function getFirebaseAdminApp() {
  if (cachedAdminApp) {
    return cachedAdminApp;
  }

  // Check if an app is already initialized, for robustness
  if (admin.apps.length > 0) {
    cachedAdminApp = admin.app(); // Get the existing default app
    return cachedAdminApp;
  }

  // Load environment variables
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin SDK environment variables are not set. Check your .env.local file.'
    );
  }

  // Important: Replace literal \n with actual newline characters
  // This step is critical if your privateKey in .env.local used \\n
  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

  try {
    cachedAdminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: formattedPrivateKey, // Use the formatted private key
      }),
    });
    return cachedAdminApp;
  } catch (error: any) {
    console.error('Firebase Admin initialization error:', error);
    // Re-throw or handle as appropriate
    throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
  }
}

// Export the services obtained from the initialized app
// These will be lazily initialized when getFirebaseAdminApp() is first called
export const adminDb = getFirebaseAdminApp().firestore();
export const adminAuth = getFirebaseAdminApp().auth();