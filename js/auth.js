// js/auth.js — Google OAuth only

import { auth, db, ALLOWED_DOMAIN, ADMIN_EMAILS } from './firebase-config.js';

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc, setDoc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ hd: 'neu.edu.ph', prompt: 'select_account' });

  const result = await signInWithPopup(auth, provider);
  const user   = result.user;

  if (!user.email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
    await signOut(auth);
    throw new Error('Only @neu.edu.ph accounts are allowed.');
  }

  const ref  = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const err       = new Error('NO_ACCOUNT');
    err.uid         = user.uid;
    err.email       = user.email;
    err.displayName = user.displayName || '';
    throw err;
  }

  const d = snap.data();
  if (d.blocked) {
    await signOut(auth);
    throw new Error('Your account has been blocked. Contact the library administrator.');
  }

  const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
  if (isAdmin && d.role !== 'admin') {
    await updateDoc(ref, { role: 'admin' });
  }

  return user;
}

export async function createUserDocOnly(uid, {
  email, displayName, studentId, department, program, isEmployee
}) {
  const cleanEmail = email.trim().toLowerCase();
  const parts      = (displayName || '').trim().split(/\s+/);
  const firstName  = parts[0] || '';
  const lastName   = parts.length > 1 ? parts.slice(1).join(' ') : '';

  await setDoc(doc(db, 'users', uid), {
    uid,
    email:         cleanEmail,
    displayName:   displayName || '',
    firstName,
    lastName,
    middleInitial: '',
    studentId:     studentId?.trim() || '',
    department,
    program,
    isEmployee:    !!isEmployee,
    rfidId:        null,
    role:          'visitor',
    blocked:       false,
    createdAt:     new Date().toISOString()
  });
}

export async function getUserRole(uid) {
  const user = auth.currentUser;
  if (user && ADMIN_EMAILS.includes(user.email.toLowerCase())) return 'admin';

  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return 'visitor';
  const data = snap.data();
  if (data.blocked) throw new Error('Your account has been blocked. Contact the library administrator.');
  return data.role || 'visitor';
}

export async function getUserData(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function setUserBlocked(uid, blocked) {
  await updateDoc(doc(db, 'users', uid), { blocked });
}

export function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}

export function logout() {
  return signOut(auth);
}
