const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

/**
 * Standard RS Mobile Number Sanitizer & Validator function
 */
function cleanAndValidateMobile(input) {
  if (!input) return { valid: false, mobile: null, error: 'Mobile number is required' };
  const rawStr = String(input).trim();
  const digitsOnly = rawStr.replace(/\D/g, '');

  // Handle +91 or 0 prefix
  let mobile10 = digitsOnly;
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    mobile10 = digitsOnly.slice(2);
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    mobile10 = digitsOnly.slice(1);
  } else if (digitsOnly.length > 10) {
    mobile10 = digitsOnly.slice(-10);
  }

  if (mobile10.length !== 10) {
    return { valid: false, mobile: null, error: 'Mobile number must be exactly 10 digits' };
  }

  // Indian mobile numbers must start with 6, 7, 8, or 9
  if (!/^[6-9]\d{9}$/.test(mobile10)) {
    return { valid: false, mobile: null, error: 'Invalid Indian mobile number format' };
  }

  return { valid: true, mobile: mobile10, error: null };
}

describe('Compulsory Buyer Mobile Number Validation Edge Cases', () => {
  test('Standard 10-digit mobile passes', () => {
    const res = cleanAndValidateMobile('9876543210');
    assert.equal(res.valid, true);
    assert.equal(res.mobile, '9876543210');
  });

  test('Mobile with +91 country code prefix stripped properly', () => {
    const res = cleanAndValidateMobile('+91 9876543210');
    assert.equal(res.valid, true);
    assert.equal(res.mobile, '9876543210');
  });

  test('Mobile with 0 prefix stripped properly', () => {
    const res = cleanAndValidateMobile('09876543210');
    assert.equal(res.valid, true);
    assert.equal(res.mobile, '9876543210');
  });

  test('Mobile with spaces, dashes, parentheses formatted properly', () => {
    const res = cleanAndValidateMobile('+91 (98765) 43-210');
    assert.equal(res.valid, true);
    assert.equal(res.mobile, '9876543210');
  });

  test('Short mobile (< 10 digits) fails validation', () => {
    const res = cleanAndValidateMobile('98765');
    assert.equal(res.valid, false);
    assert.match(res.error, /10 digits/i);
  });

  test('Invalid starting digit (e.g. starting with 1, 2, 3, 4, 5) fails validation', () => {
    const res = cleanAndValidateMobile('1234567890');
    assert.equal(res.valid, false);
    assert.match(res.error, /Indian mobile number/i);
  });

  test('Alphabetic characters only fails validation', () => {
    const res = cleanAndValidateMobile('abcdefghij');
    assert.equal(res.valid, false);
  });

  test('Null, undefined or empty string fails validation', () => {
    assert.equal(cleanAndValidateMobile(null).valid, false);
    assert.equal(cleanAndValidateMobile(undefined).valid, false);
    assert.equal(cleanAndValidateMobile('').valid, false);
    assert.equal(cleanAndValidateMobile('   ').valid, false);
  });
});
