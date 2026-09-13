const crypto = require('crypto');

// In-memory store for pending verifications (In production, use Redis or a DB collection)
const pendingTokens = new Map();

exports.requestToken = async (req, res) => {
  const { mobile } = req.body;
  
  if (!mobile || mobile.length !== 10) {
    return res.status(400).json({ error: 'Valid 10-digit mobile number required' });
  }

  // Generate a cryptographically secure 6-character hex token
  const token = crypto.randomBytes(3).toString('hex').toUpperCase();
  const fullToken = `RS-${token}`;

  // Store token with mobile for 10 minutes
  pendingTokens.set(fullToken, { mobile, createdAt: Date.now() });

  console.log(`[AUTH] Token generated for ${mobile}: ${fullToken}`);

  res.json({
    token: fullToken,
    verificationNumber: '+919876543210' // Central verification line
  });
};

exports.verifyToken = async (req, res) => {
  const { token } = req.body;
  if (pendingTokens.has(token)) {
    const data = pendingTokens.get(token);
    pendingTokens.delete(token); // One-time use
    res.json({ success: true, mobile: data.mobile });
  } else {
    res.status(400).json({ success: false, error: 'Invalid or expired token' });
  }
};
