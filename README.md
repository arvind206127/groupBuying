# Real Togather - Real Estate Group Buying SaaS 🏢🤝

A production-ready, scalable, and premium full-stack platform where buyers can join groups to purchase properties at significantly discounted prices.

## ✨ Features
*   **OTP-Based Auth:** Secure email OTP login (No passwords).
*   **Group Engine:** Real-time group formation with Socket.io updates.
*   **Property Discovery:** Search and filter based on city, budget, and BHK.
*   **Calculators:** Savings and EMI calculators with interactive UI.
*   **Admin Control:** Full CRUD for properties, content, and CRM.
*   **Premium UI:** Built with Framer Motion, Tailwind CSS, and Lucide Icons.

## 🚀 Quick Start

### 1. Prerequisites
*   Node.js (v18+)
*   MySQL Server
*   NPM or Yarn

### 2. Backend Setup
```bash
cd backend
npm install
# Copy .env.example to .env and configure your variables
npm run db:init
npm run db:seed
npm run dev
```

### YouTube Channel Videos
The site shows a default YouTube channel when no environment variable is set. To replace it with your own channel, add this in `backend/.env`:

```env
YOUTUBE_CHANNEL_ID=your_channel_id
```

Without an API key, the backend uses YouTube's public feed and shows recent uploads with the newest video first. To list the full upload history, also add:

```env
YOUTUBE_API_KEY=your_youtube_data_api_key
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🏗️ Tech Stack
*   **Frontend:** React (Vite), Tailwind CSS, Framer Motion.
*   **Backend:** Node.js, Express, Socket.io.
*   **Database:** MySQL with prepared SQL queries.
*   **Auth:** JWT & Email OTP.

## 📁 Folder Structure
*   `/backend`: REST API, SQL database layer, Socket server.
*   `/frontend`: React application, components, pages.
*   `/uploads`: local storage for property images/videos.

## 🛡️ Security
*   JWT-based session management.
*   Rate limiting on auth routes.
*   SQL injection protection via parameterized queries.

---
Built with ❤️ for Indian Home Buyers.
