const LOCKED_PAYEE_VPA = '9026773268-1@okbizaxis';
const LOCKED_PAYEE_NAME = 'RS Industries';
const LOCKED_MERCHANT_CODE = 'BCR2DN6T36M4XDLR';

/**
 * Generates a unique, trackable payment reference (e.g., RS2026000125)
 */
function generatePaymentReference(orderId) {
  const cleanId = String(orderId || '').replace(/[^a-zA-Z0-9]/g, '');
  const timestampSuffix = Date.now().toString().slice(-4);
  return `RS${cleanId}${timestampSuffix}`.toUpperCase();
}

/**
 * Builds a Merchant (P2M) UPI URL for 9026773268-1@okbizaxis with BCR Merchant ID
 */
function generateUpiUrl({ reference, amount }) {
  const formattedAmount = String(Math.round(Number(amount || 0)));

  const encodedVpa = encodeURIComponent(LOCKED_PAYEE_VPA);
  const encodedName = encodeURIComponent(LOCKED_PAYEE_NAME);
  const encodedAmount = encodeURIComponent(formattedAmount);
  const encodedTr = encodeURIComponent(reference || `RS${Date.now()}`);
  const encodedMc = encodeURIComponent(LOCKED_MERCHANT_CODE);
  const encodedNote = encodeURIComponent(`RS Order ${reference}`);

  // Merchant (P2M) UPI URL with Google Pay Merchant ID BCR2DN6T36M4XDLR
  const upiUrl = `upi://pay?pa=${encodedVpa}&pn=${encodedName}&mc=${encodedMc}&orgid=${encodedMc}&tr=${encodedTr}&am=${encodedAmount}&cu=INR&tn=${encodedNote}`;
  const gpayUrl = `gpay://upi/pay?pa=${encodedVpa}&pn=${encodedName}&mc=${encodedMc}&orgid=${encodedMc}&tr=${encodedTr}&am=${encodedAmount}&cu=INR&tn=${encodedNote}`;

  return {
    upiUrl,
    gpayUrl,
    payeeVpa: LOCKED_PAYEE_VPA,
    payeeName: LOCKED_PAYEE_NAME,
    mc: LOCKED_MERCHANT_CODE,
    reference,
    formattedAmount,
  };
}

module.exports = {
  LOCKED_PAYEE_VPA,
  LOCKED_PAYEE_NAME,
  generatePaymentReference,
  generateUpiUrl,
};
