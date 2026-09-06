# Shemet Agency Dashboard

## Overview
The Shemet Agency Dashboard is the web-based administrative panel for agency owners and super-admins managing the Dating Live App ecosystem. Built with Next.js and Firebase, it provides real-time monitoring of agency performance, live host management, revenue tracking, and application processing.

The dashboard connects directly to the production Firestore database of the main Flutter app, allowing real-time bidirectional updates.

## Tech Stack
* **Framework**: Next.js 14 (App Router)
* **Styling**: Tailwind CSS
* **Database & Auth**: Firebase / Firestore (Client SDK & Admin SDK)
* **State Management**: React Context (`AgencyContext`) + Custom Hooks
* **Deployment**: Vercel / Node.js Server

## Architecture
The application follows a standard Next.js App Router structure with dedicated API routes for secure operations.

### Key Directories
* `/app`: Next.js pages, layouts, and API routes.
* `/app/api`: Server-side secure endpoints (e.g., Session handling).
* `/components`: Reusable UI components (buttons, modals, tables).
* `/hooks`: Encapsulated Firebase listeners and business logic (e.g., `useAgencyStats`).
* `/lib`: Firebase initialization, utility functions, and constants.
* `/public`: Static assets, images, and fonts.
* `/scripts`: Administrative scripts for database setup/migration.

### Security & Authentication
* **Client SDK**: Used for UI-level data fetching and initial login (`signInWithEmailAndPassword`).
* **Admin SDK (`lib/firebase-admin.js`)**: Used in secure API routes to verify ID tokens and handle privileged database updates.
* **Middleware (`middleware.js`)**: Protects routes by verifying the presence of a secure `__session` HTTP-only cookie.
* **Session API (`app/api/auth/session/route.js`)**: Securely converts a client-side Firebase ID token into a verifiable server-side session cookie, verifying roles directly against Firestore.

## Setup Instructions

### 1. Prerequisites
* Node.js (v18 or newer recommended)
* npm or yarn

### 2. Environment Variables
Create a `.env.local` file in the root directory by duplicating `.env.example`:
```bash
cp .env.example .env.local
```

Fill in the required Firebase credentials. The dashboard requires **both** Client SDK and Admin SDK credentials.
* **Client Keys**: Found in Firebase Console -> Project Settings -> General -> Web App.
* **Admin Private Key**: Found in Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key. *(Store the private key string exactly as provided, preserving the `\n` characters).*

### 3. Installation
```bash
npm install
```

### 4. Running the Development Server
```bash
npm run dev
```
The application will start on `http://localhost:3000` (or another port if 3000 is in use).

### 5. Building for Production
```bash
npm run build
npm start
```

## Known Limitations
* **Missing Components**: The `LeaderboardTable` and `PartyRoomTable` components are currently referenced in their respective pages but are undefined, causing runtime/linting errors on those specific routes.
* **Client-side Pagination**: Many tables load all documents into memory rather than using Firestore pagination (`limit`, `startAfter`), which may cause performance issues as the user base scales.
* **Firestore Rules**: Security relies heavily on Firestore Security Rules (managed via the Firebase Console or the main Flutter app repository), as direct client-side reads bypass Next.js middleware.
