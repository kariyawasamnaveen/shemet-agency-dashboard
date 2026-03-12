# Agency Dashboard

Modern admin dashboard for managing the Dating Live App platform.

## Features

- ✅ Beautiful login page with Firebase authentication
- ✅ Real-time dashboard with 6 key stats
- ✅ Host management table
- ✅ Live stream monitoring
- ✅ Responsive design

## Setup Instructions

### 1. Install Dependencies

```bash
cd agency-dashboard
npm install
```

### 2. Configure Firebase

Edit `lib/firebase.js` and replace with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Get these values from:
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Click ⚙️ Settings → Project Settings
4. Scroll to "Your apps" → Web app
5. Copy the config object

### 3. Create Admin User

In Firebase Console:
1. Go to Authentication
2. Add a new user with email/password
3. Note the email and password for login

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 5. Login

Use the admin email and password you created in step 3.

## Project Structure

```
agency-dashboard/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.js            # Root layout
│   ├── page.js              # Home page (redirects to login)
│   ├── login/
│   │   └── page.js          # Login page
│   └── dashboard/
│       └── page.js          # Main dashboard
├── lib/
│   └── firebase.js          # Firebase configuration
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind CSS config
└── next.config.js           # Next.js config
```

## Firebase Collections Used

- `users` - All users (filters for `isHost === true`)
- `live_streams` - Active live streams
- `withdrawal_requests` - Pending withdrawals

## Technology Stack

- **Frontend:** Next.js 14 (React)
- **Styling:** Tailwind CSS
- **Backend:** Firebase (Firestore, Auth)
- **Hosting:** Vercel (when deployed)

## Deployment

### Deploy to Vercel (Free)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables (if needed)
5. Deploy!

## Features Implemented

- [x] Login page with Firebase auth
- [x] Protected dashboard routes
- [x] Real-time stats (6 cards)
- [x] Top hosts table
- [x] Sign out functionality
- [x] Responsive mobile design

## Next Steps

To add more features, create new pages in:
- `app/dashboard/hosts/` - Full host list
- `app/dashboard/withdrawals/` - Withdrawal management
- `app/dashboard/analytics/` - Charts and graphs

## Support

මේක run කරන්ට අවශ්‍ය වුණොත්:
1. Firebase config එක හරි විදියට දාලා තියෙනවා ද බලන්න
2. `npm install` run කරලා තියෙනවා ද බලන්න
3. Admin user එකක් Firebase Authentication එකේ තියෙනවා ද බලන්න

Any issues, let me know!
