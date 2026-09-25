import { Platform, Linking } from 'react-native';

// Merchant Payment Configuration
const DEFAULT_MERCHANT_VPA = 'oms43711@okicici';
const DEFAULT_MERCHANT_NAME = 'RS Industries';
const DEFAULT_MERCHANT_CODE = '5411';

/**
 * Trigger UPI Payment via react-native-google-pay-tez
 * @param {Object} params
 * @param {number|string} params.amount - Total order amount
 * @param {string} params.orderId - Unique order reference ID
 * @param {string} [params.merchantVpa] - Payee UPI VPA
 * @param {string} [params.merchantName] - Payee Business Name
 * @param {string} [params.note] - Transaction Note
 * @returns {Promise<{success: boolean, txnId?: string, raw?: any, error?: string}>}
 */
export async function triggerGooglePayTezPayment({
  amount,
  orderId,
  merchantVpa = DEFAULT_MERCHANT_VPA,
  merchantName = DEFAULT_MERCHANT_NAME,
  note = '',
}) {
  const formattedAmount = Number(amount || 0).toFixed(2);
  const txnNote = note || `Order Payment #${orderId}`;

  // 1. Attempt using react-native-google-pay-tez module
  try {
    let GooglePayTez;
    try {
      GooglePayTez = require('react-native-google-pay-tez').default || require('react-native-google-pay-tez');
    } catch (e) {
      GooglePayTez = null;
    }

    if (GooglePayTez && typeof GooglePayTez.pay === 'function') {
      const paymentOptions = {
        pa: merchantVpa,
        pn: merchantName,
        tr: orderId,
        tid: orderId,
        mc: DEFAULT_MERCHANT_CODE,
        am: formattedAmount,
        cu: 'INR',
        tn: txnNote,
      };

      console.log('[GooglePayTez] Initiating payment with options:', paymentOptions);
      const res = await GooglePayTez.pay(paymentOptions);

      // Handle standard UPI Tez response
      if (res && (res.status === 'SUCCESS' || res.responseCode === '00' || res.status === 'success')) {
        return {
          success: true,
          txnId: res.txnId || res.ApprovalRefNo || res.txnRef || orderId,
          raw: res,
        };
      } else if (res && (res.status === 'FAILURE' || res.status === 'CANCELLED')) {
        return {
          success: false,
          error: res.message || 'Payment cancelled by user',
          raw: res,
        };
      }

      // If res is available with valid structure
      return {
        success: true,
        txnId: res?.txnId || orderId,
        raw: res,
      };
    }
  } catch (nativeErr) {
    console.warn('[GooglePayTez] Native module error, trying UPI Intent fallback:', nativeErr.message);
  }

  // 2. Direct UPI Intent fallback for Android devices
  try {
    const upiUrl = `upi://pay?pa=${encodeURIComponent(merchantVpa)}&pn=${encodeURIComponent(
      merchantName
    )}&tr=${encodeURIComponent(orderId)}&am=${encodeURIComponent(formattedAmount)}&cu=INR&tn=${encodeURIComponent(
      txnNote
    )}`;

    const gpayUrl = `gpay://upi/pay?pa=${encodeURIComponent(merchantVpa)}&pn=${encodeURIComponent(
      merchantName
    )}&tr=${encodeURIComponent(orderId)}&am=${encodeURIComponent(formattedAmount)}&cu=INR&tn=${encodeURIComponent(
      txnNote
    )}`;

    const canOpenGPay = await Linking.canOpenURL(gpayUrl).catch(() => false);
    const targetUrl = canOpenGPay ? gpayUrl : upiUrl;

    const supported = await Linking.canOpenURL(targetUrl).catch(() => false);
    if (supported || canOpenGPay) {
      await Linking.openURL(targetUrl);
      return {
        success: true,
        txnId: orderId,
        fallbackIntent: true,
      };
    } else {
      throw new Error('Google Pay / UPI app is not installed on this device.');
    }
  } catch (intentErr) {
    console.error('[GooglePayTez] Fallback Intent error:', intentErr.message);
    return {
      success: false,
      error: intentErr.message || 'Failed to launch Google Pay app.',
    };
  }
}
