// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    // In a real app, ensure this endpoint is protected and only accessible by admins
    const { email, password, name, role } = await request.json();

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // Set custom claim for role (useful for authorization)
    await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    // Store user info in Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      email,
      name,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ message: 'User created', userId: userRecord.uid }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
  }
}