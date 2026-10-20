/**
 * @format
 */

import './global.css';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { floatingOverlayService } from './src/services/floatingOverlayService';

// Register Firebase Background Message Handler to trigger Floating Overlay
try {
  const fbMessagingMod = require('@react-native-firebase/messaging');
  const messaging = typeof fbMessagingMod.getMessaging === 'function'
    ? fbMessagingMod.getMessaging()
    : typeof fbMessagingMod.default === 'function'
      ? fbMessagingMod.default()
      : typeof fbMessagingMod === 'function'
        ? fbMessagingMod()
        : null;

  if (messaging && typeof messaging.setBackgroundMessageHandler === 'function') {
    messaging.setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('[Background FCM] Message received:', remoteMessage);
      const data = remoteMessage?.data || {};
      if (data.type === 'NEW_ORDER' || data.orderId) {
        floatingOverlayService.showOrderAlert({
          orderId: data.orderId,
          customerName: data.customerName || data.buyerName,
          totalAmount: data.totalAmount,
          itemsCount: data.itemsCount,
        });
      }
    });
  }
} catch (err) {
  console.warn('[Background FCM] Setup error:', err.message);
}

AppRegistry.registerComponent(appName, () => App);
