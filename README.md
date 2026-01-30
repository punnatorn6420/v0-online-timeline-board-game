# Online timeline board game

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/punnatorns-projects/v0-online-timeline-board-game)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/KtLtmBHPwpP)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/punnatorns-projects/v0-online-timeline-board-game](https://vercel.com/punnatorns-projects/v0-online-timeline-board-game)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/KtLtmBHPwpP](https://v0.app/chat/KtLtmBHPwpP)**

## Firebase setup (Firestore realtime)

This project now uses Firestore for realtime room/game state and keeps answer
validation on the server. You must configure Firebase for both the server
(admin SDK) and client SDK.

### 1) Create Firebase project + Firestore

1. Create a Firebase project.
2. Enable **Firestore Database** (production mode is fine; adjust rules below).
3. (Optional) Enable Firebase Authentication if you want to add anonymous auth later.

### 2) Client SDK configuration

Create a `.env.local` file and set:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3) Server (Admin SDK) configuration

Create a Firebase **Service Account** and set:

```
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> Note: Keep the quotes and `\n` newlines in the private key.

### 4) Firestore security rules (starter)

Allow clients to read rooms (for realtime updates), while server actions
write game state. Tighten these rules as needed.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### 5) Install dependencies

```
pnpm install
```

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
