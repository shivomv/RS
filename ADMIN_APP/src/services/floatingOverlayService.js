import { NativeModules, Platform } from 'react-native';

const { FloatingOverlayModule } = NativeModules;

export const floatingOverlayService = {
  /**
   * Check if the app has permission to draw over other apps (SYSTEM_ALERT_WINDOW)
   * @returns {Promise<boolean>}
   */
  checkPermission: async () => {
    if (Platform.OS !== 'android' || !FloatingOverlayModule) return false;
    try {
      return await FloatingOverlayModule.checkOverlayPermission();
    } catch (e) {
      console.warn('[FloatingOverlayService] Check permission error:', e.message);
      return false;
    }
  },

  /**
   * Request overlay permission by opening system Settings
   */
  requestPermission: () => {
    if (Platform.OS !== 'android' || !FloatingOverlayModule) return;
    try {
      FloatingOverlayModule.requestOverlayPermission();
    } catch (e) {
      console.warn('[FloatingOverlayService] Request permission error:', e.message);
    }
  },

  /**
   * Display the system-level floating order card over any running app
   * @param {Object} orderData { orderId, customerName, totalAmount, itemsCount }
   */
  showOrderAlert: (orderData) => {
    if (Platform.OS !== 'android' || !FloatingOverlayModule) return;
    try {
      FloatingOverlayModule.showFloatingOrder({
        orderId: String(orderData?.orderId || orderData?.id || 'N/A'),
        customerName: String(orderData?.customerName || orderData?.buyerName || 'Shopkeeper'),
        totalAmount: String(orderData?.totalAmount || orderData?.total || '0'),
        itemsCount: String(orderData?.itemsCount || (orderData?.items ? orderData.items.length : '1')),
      });
    } catch (e) {
      console.warn('[FloatingOverlayService] Show alert error:', e.message);
    }
  },

  /**
   * Dismiss the floating order alert
   */
  dismissOrderAlert: () => {
    if (Platform.OS !== 'android' || !FloatingOverlayModule) return;
    try {
      FloatingOverlayModule.dismissFloatingOrder();
    } catch (e) {
      console.warn('[FloatingOverlayService] Dismiss error:', e.message);
    }
  },

  /**
   * Check if app was launched via "View Order" click on floating overlay
   * @returns {Promise<string|null>}
   */
  getInitialOrderId: async () => {
    if (Platform.OS !== 'android' || !FloatingOverlayModule) return null;
    try {
      return await FloatingOverlayModule.getInitialOrderId();
    } catch {
      return null;
    }
  },
};
