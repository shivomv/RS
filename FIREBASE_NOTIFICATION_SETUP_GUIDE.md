# RS Enterprises: Firebase & Real-Time Order Notifications Setup Guide

This guide walks you through configuring Firebase Cloud Messaging (FCM) and enabling the **System-Level Floating "Draw Over Other Apps"** order alerts for the RS Enterprises Admin Android app and Node.js backend.

---

## 🎯 Production Architecture (Zero Mock, 100% Real)

This system uses a **Dual Real-Time Delivery Pipeline**:
1. **Live WebSocket Stream (`/api/admin/ws`)**:
   - Delivers real customer orders directly from the backend to the Admin app with **0 millisecond latency**.
   - Triggers the **Native Floating Draw-Over-Apps Card** even if you are on WhatsApp, YouTube, or your phone home screen.
2. **Firebase Cloud Messaging (FCM)**:
   - Delivers high-priority system drawer notifications with sound even when the phone is locked or the app is killed.
3. **Real Database Events Only**:
   - Whenever a buyer creates an order (`POST /api/orders`), the backend commits the record in SQLite/Sequelize and broadcasts the verified order payload.
   - Tapping **"Live Test Order"** creates an actual order directly in the database to test the live end-to-end pipeline in real conditions.

---

## 📋 Step 1: Create Firebase Project

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Project Name: Enter **`RS Enterprises`** (or your preferred name).
4. Google Analytics: Optional (can be left disabled or enabled).
5. Click **Create project** and wait for initialization to complete.

---

## 📱 Step 2: Register Admin Android App in Firebase

1. On the Firebase Project Overview page, click the **Android icon** (`</>`) to add an Android app.
2. Enter the **Android package name** (must match exactly):
   ```
   com.rsindustries.admin
   ```
3. App nickname: **`RS Admin App`**
4. (Optional) Debug signing certificate SHA-1:
   - To retrieve your debug SHA-1, open a terminal in `ADMIN_APP/android` and run:
     ```bash
     ./gradlew signingReport
     ```
   - Copy the SHA-1 from `Task :app:signingReport` (variant: debug) and paste it into Firebase.
5. Click **Register app**.

---

## 📄 Step 3: Place `google-services.json` in Admin App

1. Download the **`google-services.json`** file provided by Firebase.
2. Copy and replace the existing file at:
   ```
   ADMIN_APP/android/app/google-services.json
   ```
3. Ensure the file name is strictly `google-services.json`.

---

## 🔑 Step 4: Generate Backend Firebase Service Account Key

To allow the Node.js backend to securely dispatch notifications:

1. In the Firebase Console, click the **Settings Gear** icon (top-left next to Project Overview) → select **Project settings**.
2. Switch to the **Service accounts** tab.
3. Select **Node.js** as the environment.
4. Click the blue **Generate new private key** button.
5. Confirm by clicking **Generate key**. A `.json` credential file will download to your computer.
6. Rename this file to:
   ```
   firebase-service-account.json
   ```
7. Move this file into your `backend/` folder:
   ```
   backend/firebase-service-account.json
   ```
8. In `backend/.env`, verify or add the following line:
   ```env
   FIREBASE_SERVICE_ACCOUNT_KEY=./firebase-service-account.json
   ```

> ⚠️ **Security Warning**: `firebase-service-account.json` contains private server credentials. It is already added to `.gitignore` and must **never** be committed to public repositories or bundled inside the mobile app.

---

## ⚡ Step 5: Enable "Display Over Other Apps" on Admin Phone

For the floating card to draw over other apps (e.g., when the admin is chatting on WhatsApp or browsing):

1. Launch the **RS Admin App** on your Android phone.
2. On the **Dashboard**, you will see a banner:
   > 🔔 **Floating Order Alerts Disabled**  
   > *Allow "Display over other apps" to see floating order cards even while on WhatsApp or Home Screen.*
3. Tap **Enable Now**.
4. Android Settings will open to the **"Display over other apps"** (or "Appear on top") permission page.
5. Find **RS Admin** and toggle the switch to **Allowed (ON)**.
6. Return to the RS Admin App. The banner will immediately turn green:
   > ⚡ **Floating Order Alerts Active (Draw Over Apps Enabled)**

---

## 🧪 Step 6: Testing the Notification & Floating Overlay

### Method A: One-Tap Test in App
- On the Admin Dashboard, tap the **"Test Alert"** button on the green banner.
- A floating card will pop up on your screen with the RS chime:
  - 🔔 *RS ENTERPRISES • NEW ORDER!*
  - *Order #RS-TEST-101 • Buyer: Demo Retail Partner • 4 item(s)*
  - *Total: ₹4,850*
  - Buttons: **Dismiss** and **View Order →**
- Tap **View Order →** to verify that it smoothly routes into the order details view!

### Method B: Live End-to-End Test
1. Make a test order via the Buyer app or via cURL:
   ```bash
   curl -X POST http://localhost:5000/api/orders \
     -H "Content-Type: application/json" \
     -d '{
       "buyerName": "Gupta Kirana Store",
       "totalAmount": 3499,
       "items": [{"name": "Premium Mustard Oil 1L", "unitPrice": 165, "quantity": 20}]
     }'
   ```
2. Check the backend logs:
   ```
   [FCM Service] Preparing New Order alert for Order #RS-ORD-XXXX...
   [FCM Service] Found 1 active admin device token(s).
   [FCM Service] Push sent: 1 successful, 0 failed.
   ```
3. Minimize the RS Admin App or switch to another app.
4. The floating alert card will immediately appear on the phone screen with sound!
