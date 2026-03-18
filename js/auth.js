// js/auth.js — Authentication utilities

import { auth, db, ALLOWED_DOMAIN, ADMIN_EMAILS } from './firebase-config.js';

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc, setDoc, getDoc, updateDoc,
  collection, query, where, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Google Sign-In ──────────────────────────────────────────────────
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ hd: 'neu.edu.ph', prompt: 'select_account' });

  const result = await signInWithPopup(auth, provider);
  const user   = result.user;

  if (!user.email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
    await signOut(auth);
    throw new Error('Only @neu.edu.ph accounts are allowed.');
  }

  // Check if user doc already exists
  const ref  = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // No account — sign out and signal the caller to redirect to register
    await signOut(auth);
    const err = new Error('NO_ACCOUNT');
    err.email     = user.email;
    err.firstName = (user.displayName || '').split(' ')[0] || '';
    err.lastName  = (user.displayName || '').split(' ').slice(1).join(' ') || '';
    throw err;
  }

  // Existing account — proceed
  const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
  const d = snap.data();
  if (isAdmin && d.role !== 'admin') {
    await updateDoc(ref, { role: 'admin' });
  }
  if (d.blocked) {
    await signOut(auth);
    throw new Error('Your account has been blocked. Contact the library administrator.');
  }

  return user;
}

// ── Email / StudentID + Password sign-in ────────────────────────────
export async function loginWithCredentials(input, password) {
  let email = input.trim().toLowerCase();

  // Student ID format: yy-xxxxx-xxx
  if (/^\d{2}-\d{5}-\d{3}$/.test(input.trim())) {
    const found = await emailFromStudentId(input.trim());
    if (!found) throw new Error('Student ID not found. Please register first.');
    email = found;
  }

  // Accept institutional email as-is (must end with allowed domain)
  if (!email.endsWith(ALLOWED_DOMAIN)) {
    throw new Error(`Only ${ALLOWED_DOMAIN} accounts are permitted.`);
  }

  const cred = await signInWithEmailAndPassword(auth, email, password);
  await checkBlocked(cred.user.uid);
  return cred.user;
}

// ── RFID sign-in ─────────────────────────────────────────────────────
// USB RFID readers act as HID keyboards: they type the card ID + Enter.
// We look up the user's email by rfidId, then auto-fill and require password.
export async function lookupByRFID(rfidId) {
  const q    = query(collection(db, 'users'), where('rfidId', '==', rfidId.trim()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const data = snap.docs[0].data();
  if (data.blocked) throw new Error('Your account has been blocked. Contact the library administrator.');
  return data; // returns { email, firstName, lastName, ... }
}

// ── Register ────────────────────────────────────────────────────────
export async function registerUser({
  email, password, studentId,
  firstName, lastName, middleInitial,
  department, program, isEmployee, rfidId
}) {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail.endsWith(ALLOWED_DOMAIN))
    throw new Error(`Only ${ALLOWED_DOMAIN} accounts are allowed for registration.`);

  // Validate student ID format
  if (!isEmployee && studentId && !/^\d{2}-\d{5}-\d{3}$/.test(studentId.trim()))
    throw new Error('Student ID must follow the format yy-xxxxx-xxx (e.g. 24-12345-678).');

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  const uid  = cred.user.uid;

  const isAdmin = ADMIN_EMAILS.includes(cleanEmail);

  await setDoc(doc(db, 'users', uid), {
    uid, email: cleanEmail,
    studentId:     studentId?.trim()     || '',
    firstName:     firstName.trim(),
    lastName:      lastName.trim(),
    middleInitial: middleInitial?.trim() || '',
    department, program,
    isEmployee:    !!isEmployee,
    rfidId:        rfidId?.trim()        || null,
    role:          isAdmin ? 'admin' : 'visitor',
    blocked:       false,
    createdAt:     new Date().toISOString()
  });

  return cred.user;
}

// ── Role check ───────────────────────────────────────────────────────
export async function getUserRole(uid) {
  // Hardcoded admins take priority
  const user = auth.currentUser;
  if (user && ADMIN_EMAILS.includes(user.email.toLowerCase())) return 'admin';

  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return 'visitor';
  const data = snap.data();
  if (data.blocked) throw new Error('Your account has been blocked. Contact the library administrator.');
  return data.role || 'visitor';
}

// ── Fetch user profile ───────────────────────────────────────────────
export async function getUserData(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// ── Block / unblock user ─────────────────────────────────────────────
export async function setUserBlocked(uid, blocked) {
  await updateDoc(doc(db, 'users', uid), { blocked });
}

// ── Auth state listener ──────────────────────────────────────────────
export function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}

// ── Logout ───────────────────────────────────────────────────────────
export function logout() {
  return signOut(auth);
}

// ── Helpers ─────────────────────────────────────────────────────────
async function ensureUserDoc(firebaseUser) {
  const ref  = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);
  const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase());

  if (!snap.exists()) {
    const parts = (firebaseUser.displayName || '').split(' ');
    await setDoc(ref, {
      uid:           firebaseUser.uid,
      email:         firebaseUser.email,
      firstName:     parts[0]              || '',
      lastName:      parts.slice(1).join(' ') || '',
      middleInitial: '',
      studentId:     '',
      department:    '',
      program:       '',
      isEmployee:    isAdmin,
      rfidId:        null,
      role:          isAdmin ? 'admin' : 'visitor',
      blocked:       false,
      createdAt:     new Date().toISOString()
    });
  } else {
    // Promote to admin if in ADMIN_EMAILS list
    const d = snap.data();
    if (isAdmin && d.role !== 'admin') {
      await updateDoc(ref, { role: 'admin' });
    }
    if (d.blocked) {
      await signOut(auth);
      throw new Error('Your account has been blocked. Contact the library administrator.');
    }
  }
}

async function checkBlocked(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists() && snap.data().blocked) {
    await signOut(auth);
    throw new Error('Your account has been blocked. Contact the library administrator.');
  }
}

async function emailFromStudentId(studentId) {
  const q    = query(collection(db, 'users'), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data().email;
}