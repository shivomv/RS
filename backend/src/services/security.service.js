const crypto = require('crypto');

/**
 * Hashes a PIN or password using PBKDF2 with a random salt
 */
function hashPin(pin) {
  if (!pin) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(String(pin), salt, 10000, 32, 'sha256').toString('hex');
  return `${salt}:${derivedKey}`;
}

/**
 * Verifies a PIN or password against a stored hash (or legacy plaintext fallback)
 */
function verifyPin(enteredPin, storedHash) {
  if (!enteredPin || !storedHash) return false;

  // Check if stored is in 'salt:hash' PBKDF2 format
  if (storedHash.includes(':')) {
    const [salt, key] = storedHash.split(':');
    const derivedKey = crypto.pbkdf2Sync(String(enteredPin), salt, 10000, 32, 'sha256').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derivedKey, 'hex'));
  }

  // Backward compatibility: If stored value is legacy plaintext PIN (e.g. '9999' or '123')
  return String(enteredPin) === String(storedHash);
}

module.exports = {
  hashPin,
  verifyPin,
};
