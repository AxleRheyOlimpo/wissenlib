# WissenLib — NEU Library Visitor Log System

A web-based kiosk visitor log system for the New Era University Library, built with vanilla JavaScript (ES Modules), Firebase Authentication, and Cloud Firestore.

🔗 **Live Application:** https://wissenlib-neu.web.app/

---

## Features

- **Authentication** — Google OAuth (NEU domain only) with passive RFID card tap support
- **Role-Based Access Control** — Admin and Visitor roles via Firestore + hardcoded admin list
- **Visitor Check-In** — Multi-selectable reason tiles with real-time Firestore logging
- **Admin Dashboard** — Stats cards, daily activity chart, reasons doughnut chart, college bar chart, full visitor log with filters, block/unblock users, PDF and CSV export
- **Blocked Account Popup** — Clear modal directing blocked users to contact library staff
- **Theming** — Light/Dark × Golden Jubilee / Classic (4 combos, persisted in localStorage)
- **Slideshow Background** — Fading NEU library photos on all pages
- **Responsive** — Works on desktop and mobile

---

## Pages

| Page | File | Purpose |
|------|------|---------|
| Login | `index.html` | Google sign-in + passive RFID listener |
| Register | `register.html` | First-time profile completion (college, program, student ID) |
| Check-In | `checkin.html` | Kiosk check-in with reason tiles and auto-logout |
| Admin | `admin.html` | Dashboard with charts, visitor log, and export tools |

---

## Admin Access

The following emails are pre-configured as admins:

```
jcesperanza@neu.edu.ph
axlerhey.olimpo@neu.edu.ph
```

Additional admins can be added to the `ADMIN_EMAILS` array in `js/firebase-config.js`. Any email in that list will automatically receive the `admin` role on login regardless of what is stored in Firestore.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML, CSS (custom properties), JavaScript ES Modules |
| Auth | Firebase Authentication (Google OAuth only) |
| Database | Cloud Firestore (real-time `onSnapshot` listener) |
| Hosting | Firebase Hosting |
| Charts | Chart.js 4 (bar, doughnut, horizontal bar) |
| PDF Export | jsPDF + jspdf-autotable |
| CSV Export | Native Blob + URL.createObjectURL |
| Font | Inter (Google Fonts) |

---

## Auth Flow

### First-time user
1. Click **Continue with Google** → Google popup → NEU account selected
2. No Firestore doc found → redirected to `register.html`
3. Fill in Student ID, College, Program → profile saved → redirected to `checkin.html`

### Returning user
1. Click **Continue with Google** → one click on Google popup → `checkin.html`
2. **Or:** tap RFID card → system finds account by student ID → Google popup pre-filled → one click → `checkin.html`

### Admin user
1. Login → system detects admin email → choice card: **Admin Dashboard** or **Check In as Visitor**

---

## RFID Integration

The RFID reader acts as a USB HID keyboard device. When a card is tapped:
1. The reader types the student ID number into a hidden background input
2. System queries Firestore for a user with matching `studentId`
3. If found → Google sign-in popup opens with the user's email pre-selected via `login_hint`
4. If blocked → blocked account modal is shown
5. If not found → "ID not found — please register first" message shown

No button press required. The system is always passively listening.

---

## Project Structure

```
wissenlib/
├── index.html              # Login page (Google + RFID)
├── register.html           # First-time profile completion
├── checkin.html            # Visitor check-in kiosk
├── admin.html              # Admin dashboard
├── firebase.json           # Firebase Hosting config
├── firestore.rules         # Firestore security rules
├── css/
│   └── styles.css          # All styles + theme system
├── images/
│   ├── logo.png            # NEU / WissenLib logo
│   ├── img1.jpg – img6.jpg # Slideshow background photos
└── js/
    ├── firebase-config.js  # Firebase init + ADMIN_EMAILS + DEPARTMENTS
    ├── auth.js             # Auth utilities (Google OAuth, RBAC)
    └── theme.js            # Theme manager (light/dark × palette)
```

---

## Firestore Collections

### `users`
| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Firebase Auth UID |
| `email` | string | Institutional email |
| `displayName` | string | Full name from Google account |
| `firstName` / `lastName` | string | Parsed from displayName |
| `studentId` | string | Format: `yy-xxxxx-xxx` |
| `department` / `program` | string | College & course |
| `isEmployee` | boolean | Faculty/Staff flag |
| `role` | `'admin'` \| `'visitor'` | Access role |
| `blocked` | boolean | Block flag |
| `createdAt` | string | ISO timestamp |

### `visits`
| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Visitor's UID |
| `email` | string | Visitor's email |
| `displayName` / `fullName` | string | Visitor's full name |
| `studentId` | string | Student ID at time of visit |
| `department` / `program` | string | College & course |
| `isEmployee` | boolean | Faculty/Staff flag |
| `reasonForVisit` | string | Comma-separated selected reasons |
| `date` | string | `YYYY-MM-DD` |
| `checkInTime` | Timestamp | Firestore server timestamp |
| `checkInTimeISO` | string | ISO string for sorting |

---

## Setup & Deployment

### 1 · Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com) → **Add project**
2. Enable **Authentication** → Sign-in methods: **Google** ✔
3. Create a **Firestore Database** (Production mode)
4. Copy your web app config into `js/firebase-config.js`

### 2 · Deploy Firestore Rules

```bash
firebase login
firebase deploy --only firestore:rules
```

### 3 · Deploy Hosting

```bash
firebase deploy --only hosting
```

---

## Reasons for Visit

| Tile | Description |
|------|-------------|
| 📖 Study | Individual study session |
| 🔬 Research | Academic research |
| 📦 Borrow / Return | Book borrowing or returning |
| 🛋️ Student Lounge | Using the student lounge area |
| 💻 Internet Access | Using library computers/internet |
| ✏️ Others | Custom reason (free-text input) |

Multiple reasons can be selected simultaneously.

---

## License

For academic/institutional use — New Era University, CICS.