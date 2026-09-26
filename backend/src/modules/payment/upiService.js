const LOCKED_PAYEE_VPA = '9026773268-1@okbizaxis';
const LOCKED_PAYEE_NAME = 'RS Industries';

/**
 * Generates a unique, trackable payment reference (e.g., RS2026000125)
 */
function generatePaymentReference(orderId) {
  const cleanId = String(orderId || '').replace(/[^a-zA-Z0-9]/g, '');
  const timestampSuffix = Date.now().toString().slice(-4);
  return `RS${cleanId}${timestampSuffix}`.toUpperCase();
}

/**
 * Builds a clean P2P UPI URL for shivom3268@naviaxis (No mc/tr/tn to prevent bank limit blocks)
 */
function generateUpiUrl({ reference, amount }) {
  const formattedAmount = String(Math.round(Number(amount || 0)));

  const encodedVpa = encodeURIComponent(LOCKED_PAYEE_VPA);
  const encodedName = encodeURIComponent(LOCKED_PAYEE_NAME);
  const encodedAmount = encodeURIComponent(formattedAmount);

  // Pure P2P UPI URL format matching banking name 'Shivom' without commercial note flags
  const upiUrl = `upi://pay?pa=${encodedVpa}&pn=${encodedName}&am=${encodedAmount}&cu=INR`;
  const gpayUrl = `gpay://upi/pay?pa=${encodedVpa}&pn=${encodedName}&am=${encodedAmount}&cu=INR`;

  return {
    upiUrl,
    gpayUrl,
    payeeVpa: LOCKED_PAYEE_VPA,
    payeeName: LOCKED_PAYEE_NAME,
    formattedAmount,
  };
}

module.exports = {
  LOCKED_PAYEE_VPA,
  LOCKED_PAYEE_NAME,
  generatePaymentReference,
  generateUpiUrl,
};
