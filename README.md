# Hytech Hotel and Bistro - Online Reservation & Management System

A full-stack hotel reservation, bistro ordering, and hospitality management system built for **Hytech Hotel and Bistro** (located in Bongabong, Oriental Mindoro, Philippines).

Replicated with 100% functional fidelity from the system designs and UI specifications.

---

## 🌟 Key Features

### 🏨 Guest Portal (Public Facing)
1. **Hero & Hotel Showcase**:
   - High-fidelity facade visuals, Google Reviews badge (4.8 ★), overview of Bongabong accommodations.
   - Amenities: Bistro & rooftop dining, high-speed Wi-Fi, 24/7 security, convenient port/coastal access.
2. **Room Directory & Accommodations**:
   - 11 room types categorized by `Solo`, `Standard`, `Deluxe`, `Family`, `Group`, `Suite`.
   - Real-time pricing, bed configurations, guest capacity, and room detail modal.
3. **Dining & Beverages (Bistro Menu)**:
   - Filipino Buffet Breakfast (₱350/head), Fresh Seafood Platter (₱850/platter), Artisanal Coffee & Pastries (₱180+), Sunset Mojito (₱240), Tapsilog Morning Set (₱180), Crispy Calamari Basket (₱320).
   - In-app ordering tray allowing guests to specify Table # or Room #, add custom requests (e.g., "EXTRA RICE"), and place live kitchen orders.
4. **4-Step Online Reservation Wizard**:
   - **Step 1 (Rooms)**: Select room type, specify room quantity, and choose guest count.
   - **Step 2 (Your Stay)**: Full guest contact info, check-in/out date range, and special requests.
   - **Step 3 (Extras & Services)**: Massage Relaxation (₱300 per person), Airport/Port Shuttle (₱450), Extra Bed (₱350/night), Late Check-out.
   - **Step 4 (Payment)**: Real-time price calculation, promotional voucher discounts (e.g., `MINSU` for 99% off, `SUMMER0123` for 30% off, `CODE123` for ₱35 off), GCash payment instructions (`0923-456-7890`), reference number input, or Cash.
5. **Official Reservation Receipt**:
   - Displays official receipt with booking reference (`RES-XXXXXXXXXXXXXX`), dates, payment breakdown, discount verification, and 1-click Print Receipt.
6. **Guest Self-Service ("My Bookings")**:
   - Real-time reservation tracker with Pending/Confirmed/Checked-out badges.
   - Food order history.
   - 1-to-5 star review system for confirmed stays.

### 🛡️ Admin & Front Desk Panel
- **Dashboard**: Operational metrics (Total bookings, Confirmed stays, Revenue collected, Active keys, Bistro orders).
- **Calendar**: Room occupancy calendar with month-by-month navigation, Available vs. Reserved day cards, and night-by-night staying guest list.
- **Bookings**: Manage reservations, filter by `All | Pending | Confirmed | Cancelled | Checked out`, search by guest or ID, 1-click status transitions, and direct front-desk booking creator.
- **Clients**: Comprehensive directory of registered guests and their stay histories.
- **Rooms**: Capacity, inventory, pricing, and amenities editor.
- **Key Management (Access Control)**: Key inventory counters (Total, Available, Assigned, Lost/damaged), RFID card and physical key assignment to guest bookings, and return tracking.
- **Discounts (Vouchers)**: Promo voucher creator supporting percentage or fixed discounts, expiry dates, and instant pause/resume.
- **Food Orders**: Live kitchen dashboard with auto-refreshing orders (every 20s), item details, delivery location, and status progression (`Preparing`, `Served`, `Completed`, `Cancelled`).
- **Extras**: Configure add-on hospitality services, billing units (`per person / stay`, `per stay`, `per night`, `per item`), and availability.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Lucide React, Canvas Confetti.
- **Backend**: Node.js 22+, Express 5, CORS, Dotenv.
- **Database**: SQLite via Node's native `node:sqlite` (zero external C++ compilation needed, reliable cross-platform persistence).
- **Deployment**:
  - Frontend: Netlify (`netlify.toml` + SPA redirect rules).
  - Backend / Fullstack: Render (`render.yaml` + Express static client hosting).
  - Version Control: Git & GitHub.

---

## 🚀 Running Locally

### 1. Prerequisites
- Node.js (v22 or newer recommended)
- Git

### 2. Install Dependencies
```bash
# Install root dependencies (Express, CORS, etc.)
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Build & Run Full-Stack System
```bash
# Build the React frontend
npm run build

# Start the Node.js server (serves API and built frontend)
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser!

### 4. Development Mode (Hot Reload)
To run client and server independently during development:
- **Terminal 1 (Backend API)**: `npm run server` (runs on `http://localhost:5000`)
- **Terminal 2 (Frontend React)**: `npm run client` (runs Vite on `http://localhost:3000` with proxy to 5000)

---

## 🌐 Deployment Instructions

### A. Deploy to GitHub
1. Create a new repository on your GitHub account (e.g., `hytech-hotel-and-bistro`).
2. Run the following in your project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Hytech Hotel and Bistro online reservation system"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/hytech-hotel-and-bistro.git
   git push -u origin main
   ```

---

### B. Deploy to Render (Backend or Full-Stack)
Render can run the entire fullstack app in one free web service because Express serves the built frontend:

1. Log in to [Render.com](https://render.com) and click **New → Web Service**.
2. Connect your GitHub repository `hytech-hotel-and-bistro`.
3. Configure the service:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. Add Environment Variable:
   - `PORT`: `5000`
5. Click **Create Web Service**.
6. Once deployed, Render will provide your public URL (e.g., `https://hytech-hotel-and-bistro.onrender.com`).

---

### C. Deploy to Netlify (Frontend)
If you prefer hosting the React frontend on Netlify's global CDN:

1. Log in to [Netlify.com](https://netlify.com) and click **Add new site → Import an existing project**.
2. Select your GitHub repository.
3. Netlify will automatically detect settings from `netlify.toml`:
   - **Base directory**: (leave blank or `.`)
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
4. In **Site settings → Environment variables**, add:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://hytech-hotel-and-bistro.onrender.com`)
5. Click **Deploy Site**. Netlify will build and deploy your site with SPA routing support!

---

## 📋 Pre-Seeded Sample Data & Credentials

### Promotional Discount Vouchers
- `MINSU` : 99% off (No expiry)
- `SUMMER0123` : 30% off (Valid until Oct 11, 2027)
- `CODE123` : ₱35 off (Valid until Dec 6, 2026)
- `HYTECHWELCOME` : 15% off

### Sample Guest Accounts
- `Carl Faa` (`guesthotel968@gmail.com` | `09141278921`)
- `Marvin Digman` (`guesthotel968@gmail.com` | `09319505863`)

### Payment Information
- **GCash Number**: `0923-456-7890` (Hytech Hotel and Bistro)
- **Cash**: Pay upon arrival at front desk.

---

## 📍 Contact & Hotel Info
- **Address**: Bongabong, Oriental Mindoro, Philippines
- **Phone**: +63 (09) 66793-2441
- **Email**: hytechhotel@gmail.com
- **Copyright**: © 2026 Hytech HOTEL AND BISTRO. All rights reserved.
