import { Platform, PermissionsAndroid } from 'react-native';
import { adminApi } from './api';
import { floatingOverlayService } from './floatingOverlayService';
import { navigate } from '../navigation/navigationRef';
import ENV from '../config/env';

/**
 * Robust instance getter for React Native Firebase Messaging (supports v26 modular and legacy)
 */
export function getMessagingInstance() {
  try {
    const mod = require('@react-native-firebase/messaging');
    if (typeof mod.getMessaging === 'function') {
      return mod.getMessaging();
    }
    if (typeof mod.default === 'function') {
      return mod.default();
    }
    if (typeof mod === 'function') {
      return mod();
    }
    return null;
  } catch (e) {
    console.log('[NotificationService] Firebase messaging module not available yet in bundle:', e.message);
    return null;
  }
}

/**
 * Request notification permissions on Android 13+ (API 33+)
 */
export async function requestNotificationPermission() {
  if (Platform.OS !== 'android') return true;

  try {
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'RS Enterprises Order Notifications',
          message: 'Enable notifications to receive instant alerts when buyers place new orders.',
          buttonPositive: 'Allow',
          buttonNegative: 'Not Now',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  } catch (err) {
    console.warn('[NotificationService] Permission error:', err.message);
    return false;
  }
}

/**
 * Get or fetch FCM device token (requests permission if needed)
 */
export async function getFCMToken() {
  const messaging = getMessagingInstance();
  if (!messaging) return null;
  try {
    await requestNotificationPermission();
    if (typeof messaging.requestPermission === 'function') {
      await messaging.requestPermission().catch(() => {});
    }
    const token = await messaging.getToken();
    return token || null;
  } catch (err) {
    console.warn('[NotificationService] getFCMToken error:', err.message);
    return null;
  }
}

/**
 * Register FCM device token with the backend
 */
export async function registerDeviceToken(adminIdentifier = 'primary_admin') {
  const messaging = getMessagingInstance();
  if (!messaging) return null;

  try {
    await requestNotificationPermission();
    if (typeof messaging.requestPermission === 'function') {
      await messaging.requestPermission().catch(() => {});
    }

    let token = await messaging.getToken().catch((e) => {
      console.warn('[NotificationService] Initial getToken failed:', e.message);
      return null;
    });

    if (!token) {
      // Retry once after short delay
      await new Promise((r) => setTimeout(r, 1200));
      token = await messaging.getToken().catch(() => null);
    }

    if (token) {
      console.log('[NotificationService] Registering FCM Device Token with backend:', token.substring(0, 15) + '...');
      const res = await adminApi.registerDeviceToken({
        token,
        platform: 'android',
        deviceModel: `${Platform.OS} API ${Platform.Version}`,
        adminIdentifier: adminIdentifier || 'primary_admin',
      });
      console.log('[NotificationService] FCM Token registered with backend:', res?.message || 'OK');
      return token;
    }
  } catch (err) {
    console.warn('[NotificationService] Token registration failed:', err.message);
  }
  return null;
}

/**
 * Connects to the real-time WebSocket order channel for 0-latency live order delivery
 */
export function connectRealtimeOrderStream(onNewOrderReceived) {
  let ws = null;
  let reconnectTimer = null;
  let isClosedManually = false;

  const connect = () => {
    try {
      const baseUrl = ENV.API_BASE_URL || 'https://api.prabhat708.in/api';
      const wsUrl = baseUrl.replace(/^http/, 'ws') + '/admin/ws';
      console.log('[NotificationService] Connecting real-time live order stream to:', wsUrl);

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ [NotificationService] Live Real-time Order Stream connected.');
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload?.type === 'NEW_ORDER' || payload?.orderId) {
            console.log('🔥 [NotificationService] REAL LIVE ORDER RECEIVED VIA WS:', payload.orderId);
            // Trigger native floating overlay card over other apps
            floatingOverlayService.showOrderAlert({
              orderId: payload.orderId,
              customerName: payload.customerName || payload.buyerName,
              totalAmount: payload.totalAmount,
              itemsCount: payload.itemsCount,
            });

            if (typeof onNewOrderReceived === 'function') {
              onNewOrderReceived(payload);
            }
          }
        } catch (e) {
          console.warn('[NotificationService] Stream message parsing error:', e.message);
        }
      };

      ws.onerror = (err) => {
        console.log('[NotificationService] WebSocket connection error (will auto-reconnect):', err.message);
      };

      ws.onclose = () => {
        if (!isClosedManually) {
          reconnectTimer = setTimeout(connect, 5000);
        }
      };
    } catch (e) {
      if (!isClosedManually) {
        reconnectTimer = setTimeout(connect, 5000);
      }
    }
  };

  connect();

  return () => {
    isClosedManually = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (ws) ws.close();
  };
}

/**
 * Initialize Notification Listeners for Foreground, Background, and Terminated states
 */
export function initNotificationListeners(onNewOrderReceived) {
  // 1. Start persistent real-time live order stream (0 latency for active app & background)
  const unsubscribeStream = connectRealtimeOrderStream(onNewOrderReceived);

  const messaging = getMessagingInstance();
  if (!messaging) {
    return () => {
      unsubscribeStream();
    };
  }

  // 2. Foreground FCM Message Handler
  let unsubscribeOnMessage = () => {};
  if (typeof messaging.onMessage === 'function') {
    unsubscribeOnMessage = messaging.onMessage(async (remoteMessage) => {
      console.log('[NotificationService] FCM message received:', remoteMessage);

      const data = remoteMessage?.data || {};
      if (data.type === 'NEW_ORDER' || data.orderId) {
        floatingOverlayService.showOrderAlert({
          orderId: data.orderId,
          customerName: data.customerName || data.buyerName,
          totalAmount: data.totalAmount,
          itemsCount: data.itemsCount,
        });

        if (typeof onNewOrderReceived === 'function') {
          onNewOrderReceived(data);
        }
      }
    });
  }

  // 3. Token Refresh Handler
  let unsubscribeTokenRefresh = () => {};
  if (typeof messaging.onTokenRefresh === 'function') {
    unsubscribeTokenRefresh = messaging.onTokenRefresh(async (newToken) => {
      console.log('[NotificationService] FCM Token refreshed:', newToken.substring(0, 15) + '...');
      try {
        await adminApi.registerDeviceToken({
          token: newToken,
          platform: 'android',
          deviceModel: `${Platform.OS} API ${Platform.Version}`,
        });
      } catch (_) {}
    });
  }

  // 4. Notification tapped while app was in background
  if (typeof messaging.onNotificationOpenedApp === 'function') {
    messaging.onNotificationOpenedApp((remoteMessage) => {
      console.log('[NotificationService] Notification opened from background:', remoteMessage);
      const orderId = remoteMessage?.data?.orderId;
      if (orderId) {
        navigate('OrderList', { orderId });
      }
    });
  }

  // 5. Notification tapped that opened app from closed/terminated state
  if (typeof messaging.getInitialNotification === 'function') {
    messaging.getInitialNotification().then((remoteMessage) => {
      if (remoteMessage) {
        console.log('[NotificationService] App launched from quit state by notification:', remoteMessage);
        const orderId = remoteMessage?.data?.orderId;
        if (orderId) {
          setTimeout(() => {
            navigate('OrderList', { orderId });
          }, 500);
        }
      }
    });
  }

  // 6. Check if launched via Floating Overlay "View Order" button
  floatingOverlayService.getInitialOrderId().then((orderId) => {
    if (orderId) {
      console.log('[NotificationService] App launched from Floating Overlay for Order #', orderId);
      setTimeout(() => {
        navigate('OrderList', { orderId });
      }, 500);
    }
  });

  return () => {
    unsubscribeStream();
    if (typeof unsubscribeOnMessage === 'function') unsubscribeOnMessage();
    if (typeof unsubscribeTokenRefresh === 'function') unsubscribeTokenRefresh();
  };
}
