const LOCKED_PAYEE_VPA = process.env.UPI_PAYEE_VPA || 'shivom3268@naviaxis';
const LOCKED_PAYEE_NAME = process.env.UPI_PAYEE_NAME || 'RS Industries';

/**
 * Generates a unique, trackable payment reference (e.g., RS2026000125)
 */
function generatePaymentReference(orderId) {
  const cleanId = String(orderId || '').replace(/[^a-zA-Z0-9]/g, '');
  const timestampSuffix = Date.now().toString().slice(-4);
  return `RS${cleanId}${timestampSuffix}`.toUpperCase();
}

/**
 * Builds a clean P2P UPI URL for shivom3268@naviaxis (No mc/tr to prevent bank limit blocks)
 */
function generateUpiUrl({ reference, amount, note }) {
  const formattedAmount = String(Math.round(Number(amount || 0)));
  const txnNote = note || `Order Payment #${reference}`;

  const encodedVpa = encodeURIComponent(LOCKED_PAYEE_VPA);
  const encodedName = encodeURIComponent(LOCKED_PAYEE_NAME);
  const encodedAmount = encodeURIComponent(formattedAmount);
  const encodedNote = encodeURIComponent(txnNote);

  // Pure P2P UPI URL format
  const upiUrl = `upi://pay?pa=${encodedVpa}&pn=${encodedName}&am=${encodedAmount}&cu=INR&tn=${encodedNote}`;
  const gpayUrl = `gpay://upi/pay?pa=${encodedVpa}&pn=${encodedName}&am=${encodedAmount}&cu=INR&tn=${encodedNote}`;

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
