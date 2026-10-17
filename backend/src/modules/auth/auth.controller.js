const { Shopkeeper } = require('../../models');

const pendingTokens = new Map();

function formatUser(u) {
  const json = u.toJSON ? u.toJSON() : u;
  return {
    ...json,
    _id: String(json.id),
  };
}

exports.requestToken = async (req, res) => {
  const { mobile, name } = req.body;

  if (!mobile || mobile.length < 10) {
    return res.status(400).json({ error: 'Valid 10-digit mobile number required' });
  }

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const otp = '12345';
  pendingTokens.set(mobile, { otp, name: name.trim(), createdAt: Date.now() });

  console.log(`[AUTH] OTP requested for ${name} (${mobile}). Default test OTP is: 12345`);

  res.json({
    success: true,
    message: 'OTP sent successfully (Use 12345 for verification)',
    otp: '12345',
    mobile,
    name,
  });
};

exports.verifyToken = async (req, res) => {
  const { mobile, otp, token } = req.body;
  const inputOtp = otp || token;

  if (!mobile) {
    return res.status(400).json({ success: false, error: 'Mobile number is required' });
  }

  const isDefaultOtp = inputOtp === '12345' || inputOtp === 'RS-12345';
  const storedData = pendingTokens.get(mobile);
  const isValidStored = storedData && storedData.otp === inputOtp;

  if (isDefaultOtp || isValidStored) {
    try {
      const nameFromRequest = storedData?.name || `Customer ${mobile.slice(-4)}`;

      let user = await Shopkeeper.findOne({ where: { mobile } });
      if (!user) {
        user = await Shopkeeper.create({
          name: nameFromRequest,
          mobile,
          shopName: `Store ${mobile.slice(-4)}`,
          role: 'buyer',
        });
      } else {
        if (nameFromRequest && nameFromRequest !== `Customer ${mobile.slice(-4)}`) {
          await user.update({ name: nameFromRequest });
        }
      }

      pendingTokens.delete(mobile);
      const formatted = formatUser(user);
      return res.json({
        success: true,
        message: 'Authentication successful',
        token: String(user.id),
        user: formatted,
      });
    } catch (err) {
      console.error('DB authentication error:', err.message);
      return res.status(500).json({ success: false, error: 'Database authentication failed' });
    }
  }

  return res.status(400).json({ success: false, error: 'Invalid OTP. Please enter 12345' });
};
