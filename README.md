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

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWhLeZBun0W7ytwiboaCrgAC8gbHLqpLI",
  authDomain: "timetrack-47197.firebaseapp.com",
  projectId: "timetrack-47197",
  storageBucket: "timetrack-47197.firebasestorage.app",
  messagingSenderId: "433043549592",
  appId: "1:433043549592:web:b673b04892743d0efe4fed",
  measurementId: "G-B3CREZE8CG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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

## Spec

FINAL GAME SPEC — Online Timeline Board Game (0–9 Ranges + Board Events)
0) เป้าหมายเกม

เว็บเกมเล่นออนไลน์แบบบอร์ดเกม ทุกคนเล่นพร้อมกัน ในแต่ละรอบ
ตอบคำถาม Timeline โดยเลือก “ช่วงเวลา 0–9”
ตอบถูกถึงได้เดินบนกระดาน
ใครถึงเส้นชัยก่อนชนะ
เกมต้องเล่นง่าย เร็ว สนุก ไม่จำเจ โดยใช้ “ช่องพิเศษบนกระดาน + Round Types”

1) สิ่งที่ผู้เล่นทำได้ (User Flow)
1.1 สร้างตัวละคร (Guest)

ใส่ชื่อเล่น displayName

เลือก avatar (icon/รูปจาก list)

ได้ playerId (เก็บ local)

1.2 ห้องเกม

ปุ่ม Create Room → ได้ roomCode (เช่น 6 ตัว)

ปุ่ม Join Room → ใส่ roomCode

เข้าได้เฉพาะสถานะ waiting

ถ้า playing แล้ว ห้าม join

ผู้สร้างเป็น Host

1.3 Lobby (waiting)

แสดงรายชื่อผู้เล่น + avatar

Host กด Start Game

Start แล้วเปลี่ยนเป็น playing และล็อคห้อง

2) Timeline 0–9 Definition (ช่วงเวลาที่ใช้ตอบ)

ผู้เล่นตอบเป็นตัวเลข 0–9 ตาม “ช่วงเวลา” นี้

0 — Prehistoric Age

ก่อนปี -500 (ยุคหิน/ก่อนอารยธรรม)

1 — Ancient Civilizations

-500 ถึง 500

2 — Early Middle Ages

500 ถึง 1000

3 — Late Middle Ages

1000 ถึง 1500

4 — Renaissance & Exploration

1500 ถึง 1700

5 — Revolution & Industry

1700 ถึง 1800

6 — Industrial & Nationalism

1800 ถึง 1900

7 — World Wars Era

1900 ถึง 1950

8 — Cold War & Space Age

1950 ถึง 2000

9 — Digital Age

2000 ถึง ปัจจุบัน

3) รูปแบบเกมหลัก (Core Gameplay)
3.1 กระดานเดิน (Board)

กระดานเส้นตรง (linear)

ช่อง Start → Finish

แนะนำ 20 ช่อง (ปรับได้)

ผู้เล่นทุกคนเริ่มที่ช่อง 0

3.2 เล่นเป็นรอบ (Round-Based, simultaneous)

ในแต่ละรอบ:

ระบบกำหนด roundType (ดูหัวข้อ 6)

ระบบสุ่ม “เหตุการณ์/คำถาม” 1 ข้อ จากหมวดที่กำหนด

แสดงให้ผู้เล่นทุกคนพร้อมกัน:

title

description (สั้น ๆ)

ตัวเลือก 0–9

ทุกคนเลือก 0–9 และกด Submit

เมื่อ “ทุกคนส่งครบ” (หรือถ้ามี timer ในอนาคต) → Reveal

เฉลย correctRange

ผู้เล่นที่ตอบถูก “เดิน” ตามกติกา roundType / ช่องพิเศษ

เช็คผู้ชนะ ถ้ายังไม่จบ → ไป round ถัดไป

4) Event / Question Data (เนื้อหาเกม)

ข้อมูลเหตุการณ์เก็บใน Next.js เป็นไฟล์ events.ts หรือ JSON

โครงสร้างเหตุการณ์

id

title

description

category (หมวด)

correctRange (0–9)

สำคัญ: ห้ามส่ง correctRange ไป client ก่อนเฉลย
ตรวจคำตอบฝั่ง server เท่านั้น

5) หมวดคำถาม (Categories)

มีหลายหมวดเพื่อไม่ให้จำเจ เช่น:

HISTORY (ประวัติศาสตร์)

SCI_TECH (วิทย์/เทค)

CULTURE (ศิลปะ/บันเทิง/วัฒนธรรม)

TRAVEL (ท่องเที่ยว/การบิน) (optional)

RANDOM (ผสม)

6) Round Types (ตัวกำหนด “รอบนี้เล่นแบบไหน”)

ทุกคนต้องเล่นกติกาเดียวกันในแต่ละรอบ

Round Types ที่ใช้ใน Version 1 (แนะนำ)

NORMAL: ตอบถูกเดิน +1

RISK: ตอบถูกเดิน +2 / ตอบผิด 0 (หรือ -1 ถ้าอยากเพิ่มความลุ้น)

SUPPORT: รอบนี้มี hint (เช่น “ช่วงที่ถูกต้องอยู่ประมาณ 4–6”) แล้วตอบถูกเดิน +1

CATEGORY: รอบนี้ล็อคหมวด (เช่น SCI_TECH) แล้วตอบถูกเดิน +1

Version 1 แนะนำใช้ 3–4 แบบนี้พอ (ไม่เยอะ)

7) วิธีเลือก Round Type (SYSTEM + BOARD)

ใช้แบบผสมเพื่อให้ยุติธรรมและกระดานมีความหมาย

กติกาเลือก roundType

ปกติ: ระบบสุ่ม roundType จาก pool

แต่ถ้าหลังรอบก่อนมี “ช่องพิเศษ” ที่ต้องมีผล → override โดยกระดาน

Priority (ตัวอย่าง)

CHAOS > RISK > CATEGORY > SUPPORT > NORMAL

8) ช่องพิเศษบนกระดาน (Board Tiles)

เพื่อให้เกมไม่น่าเบื่อ มี effect ตามประเภทช่อง

Tile Types ที่ใช้ใน Version 1 (แนะนำ)

NORMAL_TILE: ไม่มี effect

CATEGORY_TILE: รอบถัดไปเป็น CATEGORY (สุ่มหมวด หรือกำหนดหมวด)

RISK_TILE: รอบถัดไปเป็น RISK

SUPPORT_TILE: รอบถัดไปเป็น SUPPORT

ช่องพิเศษมีแค่บางช่อง เช่น 20 ช่อง ใส่พิเศษ ~6 ช่อง กำลังดี

9) เงื่อนไขชนะ

ใครถึงหรือเกินช่อง Finish ก่อน → ชนะทันที

เปลี่ยน room status เป็น finished

10) Out of Scope (ไม่ทำในเวอร์ชันนี้)

ไม่มี ranking / leaderboard

ไม่มี matchmaking

ไม่มี reconnect

ไม่มี analytics

ไม่มีระบบ account จริงจัง

ไม่มีระบบ chat

11) Tech Direction (สำหรับ dev)

Frontend: Next.js + TS + Tailwind

Realtime State: Firebase Firestore

Auth: Firebase Anonymous (หรือ guest id local)

Server validation: Next.js API routes / Server Actions หรือ Cloud Functions

Event data: เก็บใน repo (events.ts)

12) หน้า UI ที่ต้องมี (Minimum Screens)

Character Setup (name + avatar)

Home (Create / Join room)

Lobby (players list + host start)

Game

Board + positions

Round banner (roundType)

Event card

0–9 selector

Submit button

“waiting for players” indicator

Reveal result

✅ Prompt สั้นมากสำหรับ v0 / Codex (คัดลอกไปใช้ได้เลย)

Build a web-based multiplayer party board game (Next.js + TS + Tailwind). Players enter a display name and choose an avatar (guest). They can Create Room (generate 6-char room code) or Join Room by code. Only rooms in status “waiting” can be joined; if status is “playing” join is blocked. In lobby, host can Start Game, which locks the room and sets status to “playing”.

Gameplay is round-based and simultaneous: each round all players see the same event question and must choose a timeline range 0–9 (predefined eras). Everyone submits; when all submitted, the server reveals the correct range and only correct players move forward on a linear board. First to reach finish wins.

Timeline ranges 0–9 are mapped to eras: 0 prehistory (<-500), 1 -500..500, 2 500..1000, 3 1000..1500, 4 1500..1700, 5 1700..1800, 6 1800..1900, 7 1900..1950, 8 1950..2000, 9 2000..present.

To avoid repetition, introduce round types and board tiles: NORMAL (+1 on correct), RISK (+2 on correct), SUPPORT (show hint, +1), CATEGORY (force category, +1). Each round type is selected by SYSTEM random, but overridden by board tiles stepped on in previous round using priority: RISK/CATEGORY/SUPPORT > NORMAL. Board tiles include NORMAL_TILE, RISK_TILE, CATEGORY_TILE, SUPPORT_TILE. Event content is stored in Next.js (events.ts) with {id,title,description,category,correctRange}. Do not send correctRange to client until reveal; validate on server. Use Firebase Firestore for realtime room/game state. No ranking, matchmaking, reconnect, analytics.