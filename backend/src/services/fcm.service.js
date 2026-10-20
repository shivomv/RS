const fs = require('fs');
const path = require('path');
const { AdminDevice } = require('../models');

let adminApp = null;
let messagingInstance = null;
let isInitialized = false;

function initFirebase() {
  if (isInitialized) return { adminApp, messaging: messagingInstance };

  let admin;
  let getMessaging;
  try {
    admin = require('firebase-admin');
    const msgModule = require('firebase-admin/messaging');
    getMessaging = msgModule.getMessaging;
  } catch (err) {
    console.warn('⚠️ [FCM Service] firebase-admin package is not available.');
    return null;
  }

  try {
    const rawKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 'firebase-service-account.json';
    const resolvedPath = path.isAbsolute(rawKeyPath)
      ? rawKeyPath
      : path.join(__dirname, '../../', rawKeyPath.replace(/^\.\//, ''));

    if (fs.existsSync(resolvedPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
      const credential = typeof admin.cert === 'function'
        ? admin.cert(serviceAccount)
        : (admin.credential && admin.credential.cert(serviceAccount));

      adminApp = admin.initializeApp({ credential });
      messagingInstance = getMessaging(adminApp);
      isInitialized = true;
      console.log('✅ [FCM Service] Firebase Admin SDK initialized successfully for project:', serviceAccount.project_id);
      return { adminApp, messaging: messagingInstance };
    }

    console.warn('⚠️ [FCM Service] Service account file not found at:', resolvedPath);
  } catch (err) {
    console.error('❌ [FCM Service] Error initializing Firebase Admin:', err.message);
  }

  return null;
}

// Automatically attempt initialization on load
initFirebase();

/**
 * Dispatches real-time instant order notification to all registered admin devices.
 * Uses high-priority data payload designed to trigger the Android Native Floating Draw-Over-Apps Overlay
 * as well as the system notification drawer.
 */
async function sendNewOrderNotification(order) {
  try {
    const orderId = String(order.orderId || order.id || 'N/A');
    const customerName = String(order.buyerName || order.buyerSnapshot?.name || 'Customer');
    const totalAmount = String(order.totalAmount || order.total || 0);
    const itemsCount = String(Array.isArray(order.items) ? order.items.length : 1);

    console.log(`[FCM Service] Preparing New Order alert for Order #${orderId} (${customerName}, ₹${totalAmount})...`);

    // 1. Fetch active admin device tokens
    const devices = await AdminDevice.findAll({
      where: { isActive: true },
      attributes: ['id', 'token'],
    });

    if (!devices || devices.length === 0) {
      console.log('[FCM Service] No active admin device tokens registered in database.');
      return { success: false, reason: 'NO_DEVICES_REGISTERED' };
    }

    const tokens = devices.map((d) => d.token).filter(Boolean);
    console.log(`[FCM Service] Found ${tokens.length} active admin device token(s).`);

    const fb = initFirebase();
    if (!fb || !isInitialized) {
      console.warn(`[FCM Service] Notice: Place firebase-service-account.json in backend/ to deliver FCM push when app is closed.`);
      return { success: false, reason: 'FIREBASE_NOT_CONFIGURED' };
    }

    // 2. Build High-Priority FCM Multicast Payload
    const message = {
      tokens,
      notification: {
        title: '🔔 New Order Received!',
        body: `Order #${orderId} • ₹${Number(totalAmount).toLocaleString('en-IN')} by ${customerName}`,
      },
      data: {
        type: 'NEW_ORDER',
        orderId: orderId,
        customerName: customerName,
        totalAmount: totalAmount,
        itemsCount: itemsCount,
        timestamp: new Date().toISOString(),
        channelId: 'order_alerts_channel',
        sound: 'order_alert',
      },
      android: {
        priority: 'high',
        ttl: 60 * 60, // 1 hour
        notification: {
          channelId: 'order_alerts_channel',
          sound: 'order_alert',
          defaultSound: false,
          priority: 'max',
          visibility: 'public',
          icon: 'ic_launcher',
          color: '#006948',
          clickAction: 'FLT_NOTIFICATION_CLICK',
        },
      },
    };

    const response = await fb.messaging.sendEachForMulticast(message);
    console.log(`[FCM Service] Push sent: ${response.successCount} successful, ${response.failureCount} failed.`);

    // 3. Clean up invalid/stale tokens
    if (response.failureCount > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          if (
            errCode === 'messaging/invalid-registration-token' ||
            errCode === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      if (invalidTokens.length > 0) {
        console.log(`[FCM Service] Deactivating ${invalidTokens.length} unregistered token(s)...`);
        await AdminDevice.update(
          { isActive: false },
          { where: { token: invalidTokens } }
        );
      }
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('[FCM Service] Exception while sending notification:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendNewOrderNotification,
  initFirebase,
};
