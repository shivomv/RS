import { Platform, Linking, NativeModules } from 'react-native';

const { GooglePayTezNative } = NativeModules;

// Merchant Payment Configuration
const DEFAULT_MERCHANT_VPA = 'shivom3268@naviaxis';
const DEFAULT_MERCHANT_NAME = 'RS Industries';

/**
 * Directly opens Google Pay App for UPI Payment to shivom3268@naviaxis
 */
export async function triggerGooglePayTezPayment({
  amount,
  orderId,
  merchantVpa = DEFAULT_MERCHANT_VPA,
  merchantName = DEFAULT_MERCHANT_NAME,
  note = '',
}) {
  const formattedAmount = String(Math.round(Number(amount || 0)));
  const txnNote = note || `Order Payment #${orderId}`;

  // 1. Direct Native Android Module targeting Google Pay app specifically
  if (Platform.OS === 'android' && GooglePayTezNative) {
    try {
      console.log('[GooglePayNative] Launching Google Pay directly...');
      const res = await GooglePayTezNative.payWithGooglePay(merchantVpa, merchantName, formattedAmount, txnNote);
      console.log('[GooglePayNative] Result:', res);

      if (res && res.status === 'SUCCESS') {
        return {
          success: true,
          txnId: res.txnId || orderId,
          raw: res,
        };
      } else {
        return {
          success: false,
          error: 'Payment was cancelled or not completed in Google Pay.',
          raw: res,
        };
      }
    } catch (nativeErr) {
      console.warn('[GooglePayNative] Native module error:', nativeErr.message);
    }
  }

  // 2. Direct Fallback: Launch Google Pay via GPay Intent (no app chooser)
  try {
    const gpayUrl = `gpay://upi/pay?pa=${encodeURIComponent(merchantVpa)}&pn=${encodeURIComponent(
      merchantName
    )}&am=${encodeURIComponent(formattedAmount)}&cu=INR&tn=${encodeURIComponent(txnNote)}`;

    await Linking.openURL(gpayUrl);
    return {
      success: true,
      txnId: orderId,
    };
  } catch (intentErr) {
    console.error('[GooglePay] Intent error:', intentErr.message);
    return {
      success: false,
      error: 'Google Pay app is not installed on this device.',
    };
  }
}
