// js/firebase-config.js
// ─── Replace placeholder values with your Firebase project config ───

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth }        from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore }   from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFhA_a8PpX_cXPKJPjdDISmbLn6_flw6g",
  authDomain: "wissenlib-neu.firebaseapp.com",
  projectId: "wissenlib-neu",
  storageBucket: "wissenlib-neu.firebasestorage.app",
  messagingSenderId: "116880882776",
  appId: "1:116880882776:web:58a9c24443d92375009e2d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);

// ── Domain & Admin Config ────────────────────────────────────────────
export const ALLOWED_DOMAIN = "@neu.edu.ph";

// Emails that always get admin role (add more as needed)
export const ADMIN_EMAILS = [
  "jcesperanza@neu.edu.ph"
];

// NEU Departments + Programs map
export const DEPARTMENTS = {
  "CICS": ["BSIT", "BSCS", "BSIS", "BSEMC", "BSDS"],
  "CAS":  ["BSPsych", "BSBio", "AB Communication", "AB Political Science", "BS Mathematics"],
  "CBA":  ["BSBA – Financial Management", "BSBA – Marketing Management", "BSBA – HRDM", "BSAccountancy"],
  "CEA":  ["BSCE", "BSEE", "BSME", "BSARCH", "BSECE", "BSIE"],
  "CED":  ["BSED – Math", "BSED – English", "BSED – Filipino", "BSED – Science", "BEED"],
  "CFAD": ["BSID", "BFA", "AB Advertising"],
  "CN":   ["BSN"],
  "COM":  ["MD"],
  "CLA":  ["JD"],
  "ADMIN / Staff": ["Faculty", "Staff", "Administration"]
};
