# WissenLib — NEU Library Visitor Log System

A web-based visitor log system for the New Era University Library, built with vanilla JavaScript (ES Modules), Firebase Authentication, and Cloud Firestore.

🔗 **Live Application:** https://wissenlib-neu.web.app/

---

## Features

- **Authentication** — Google OAuth (NEU domain only), Email/Password, and RFID (USB HID tap-to-login)
- **Role-Based Access Control** — Admin and Visitor roles managed securely via Firestore + hardcoded admin list
- **Visitor Check-In** — Selectable reason tiles with Firestore logging
- **Admin Dashboard** — Statistics cards, daily chart, full visitor table with filters, block/unblock, and PDF export
- **Theming** — Light/Dark × Golden Jubilee / Classic (4 combos, persisted in localStorage)
- **Responsive** — Works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML, CSS (custom properties), JavaScript ES Modules |
| Auth | Firebase Authentication (Google + Email/Password) |
| Database | Cloud Firestore |
| Hosting | Firebase Hosting |
| Charts | Chart.js 4 |
| PDF Export | jsPDF + jspdf-autotable |
| Font | Inter (Google Fonts) |

---

## Project Structure

```
wissenlib/
├── index.html          # Login / Register page
├── checkin.html        # Visitor check-in page
├── admin.html          # Admin dashboard
├── firebase.json       # Firebase Hosting config
├── firestore.rules     # Firestore security rules
├── css/
│   └── styles.css      # All styles + theme system
└── js/
    ├── firebase-config.js  # Firebase init + constants
    ├── auth.js             # Auth utilities (Google, Email, RFID, RBAC)
    └── theme.js            # Theme manager (light/dark × palette)
```

---

## Setup & Deployment

### 1 · Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com) → **Add project**
2. Enable **Authentication** → Sign-in methods:
   - Google ✔
   - Email/Password ✔
3. Create a **Firestore Database** (start in Production mode)
4. Copy your web app config

### 2 · Configure the App

Open `js/firebase-config.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

### 3 · Deploy Firestore Rules

```bash
firebase login
firebase init firestore   # select your project, accept defaults
firebase deploy --only firestore:rules
```

### 4 · Deploy Hosting

```bash
firebase init hosting
# Public directory: .  (current directory)
# Single-page app: No
firebase deploy --only hosting
```

After deployment, paste the **Hosting URL** at the top of this README.

---

## Admin Access

The following email is pre-configured as an admin:

```
jcesperanza@neu.edu.ph
```

Additional admins can be added to the `ADMIN_EMAILS` array in `js/firebase-config.js`. Any email in that list will automatically receive the `admin` role on first login, regardless of what is stored in Firestore.

---

## Firestore Collections

### `users`
| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Firebase Auth UID |
| `email` | string | Institutional email |
| `studentId` | string | Format: `yy-xxxxx-xxx` |
| `firstName` / `lastName` / `middleInitial` | string | Name parts |
| `department` / `program` | string | College & course |
| `isEmployee` | boolean | Faculty/Staff flag |
| `rfidId` | string \| null | RFID card ID |
| `role` | `'admin'` \| `'visitor'` | Access role |
| `blocked` | boolean | Block flag |
| `createdAt` | string | ISO timestamp |

### `visits`
| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Visitor's UID |
| `reasonForVisit` | string | Selected reason |
| `date` | string | `YYYY-MM-DD` |
| `checkInTime` | Timestamp | Firestore server timestamp |
| `checkInTimeISO` | string | ISO string for sorting |
| _(+ full user snapshot)_ | | Name, ID, dept, program, etc. |

---

## RFID Integration

The system supports any **USB HID RFID reader** (the kind that acts as a keyboard). No drivers required.

1. Click the RFID tap zone on the login page
2. Tap the RFID card — the reader types the card ID and sends Enter
3. If the card is registered, the account email is pre-filled; enter the password to complete login

To register an RFID card, use the **Register** tab → Step 2 → RFID tap zone.

---

## License

For academic/institutional use — New Era University, CICS.
