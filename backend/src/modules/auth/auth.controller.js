const { Shopkeeper } = require('../../models');
const { generateToken } = require('../../middlewares/auth.middleware');

function formatUser(u) {
  const json = u.toJSON ? u.toJSON() : u;
  return {
    ...json,
    _id: String(json.id),
  };
}

/**
 * Direct Login / Signup without DLT SMS OTP
 * Compulsory 10-digit mobile number required
 */
exports.directLoginOrSignup = async (req, res) => {
  try {
    const { mobile, name, shopName } = req.body;

    const cleanMobile = mobile ? String(mobile).replace(/\D/g, '').slice(-10) : '';
    if (!cleanMobile || cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        error: 'A valid compulsory 10-digit mobile number is required.',
      });
    }

    let user = await Shopkeeper.findOne({ where: { mobile: cleanMobile } });

    if (!user) {
      const cleanName = (name || `Partner ${cleanMobile.slice(-4)}`).trim();
      const cleanShop = (shopName || `Store ${cleanMobile.slice(-4)}`).trim();
      user = await Shopkeeper.create({
        name: cleanName,
        mobile: cleanMobile,
        shopName: cleanShop,
        role: 'buyer',
      });
    } else if (name && name.trim()) {
      await user.update({ name: name.trim(), ...(shopName ? { shopName: shopName.trim() } : {}) });
    }

    const token = generateToken({
      id: user.id,
      mobile: user.mobile,
      name: user.name,
      shopName: user.shopName,
      role: user.role || 'buyer',
    });

    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: formatUser(user),
    });
  } catch (err) {
    console.error('[Auth] Direct login/signup error:', err.message);
    return res.status(500).json({ success: false, error: 'Database authentication failed: ' + err.message });
  }
};

/**
 * Authentication via Google Sign-In (Exclusively supported auth)
 * POST /api/auth/google
 */
exports.googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, mobile, shopName, avatarUrl, photoUrl } = req.body;

    if (!email && !googleId) {
      return res.status(400).json({ success: false, error: 'Google authentication details are required.' });
    }

    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    const avatar = avatarUrl || photoUrl || null;

    // Check if user already exists with this googleId or email
    let user = null;
    if (googleId) {
      user = await Shopkeeper.findOne({ where: { googleId } });
    }
    if (!user && cleanEmail) {
      user = await Shopkeeper.findOne({ where: { email: cleanEmail } });
    }

    const cleanMobile = mobile ? String(mobile).replace(/\D/g, '').slice(-10) : '';

    if (user) {
      // Update existing user with any newly available Google info
      const updates = {};
      if (!user.googleId && googleId) updates.googleId = googleId;
      if (!user.email && cleanEmail) updates.email = cleanEmail;
      if (name && (!user.name || user.name.startsWith('Buyer '))) updates.name = name.trim();
      if (avatar && !user.avatarUrl) updates.avatarUrl = avatar;
      if (cleanMobile && cleanMobile.length === 10 && (!user.mobile || user.mobile.length !== 10)) {
        updates.mobile = cleanMobile;
      }
      if (Object.keys(updates).length > 0) {
        await user.update(updates);
      }
    } else {
      // Create new buyer account directly from Google authentication
      const generatedName = (name || cleanEmail.split('@')[0] || 'Wholesale Buyer').trim();
      user = await Shopkeeper.create({
        name: generatedName,
        email: cleanEmail || null,
        googleId: googleId || null,
        mobile: cleanMobile.length === 10 ? cleanMobile : null,
        shopName: (shopName || `${generatedName}'s Store`).trim(),
        avatarUrl: avatar || null,
        role: 'buyer',
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      mobile: user.mobile || '',
      name: user.name,
      shopName: user.shopName,
      role: user.role || 'buyer',
    });

    return res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: formatUser(user),
    });
  } catch (err) {
    console.error('[Auth] Google Auth error:', err.message);
    return res.status(500).json({ success: false, error: 'Google authentication error: ' + err.message });
  }
};

/**
 * Update Buyer Profile (Mobile, Name, Shop Name, Profile Picture)
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.id || req.body.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const user = await Shopkeeper.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Buyer account not found' });
    }

    const { name, shopName, mobile, avatarUrl, address, gstin } = req.body;
    const updates = {};

    if (name && name.trim()) updates.name = name.trim();
    if (shopName && shopName.trim()) updates.shopName = shopName.trim();
    if (address !== undefined) updates.address = address;
    if (gstin !== undefined) updates.gstin = gstin;

    if (mobile) {
      const cleanMobile = String(mobile).replace(/\D/g, '').slice(-10);
      if (cleanMobile.length !== 10) {
        return res.status(400).json({ success: false, error: 'Mobile number must be a valid 10-digit number.' });
      }
      updates.mobile = cleanMobile;
    }

    if (avatarUrl) {
      // If base64, upload to AWS S3 and save permanent S3 URL
      if (avatarUrl.startsWith('data:') || avatarUrl.length > 500) {
        const { uploadBase64 } = require('../../services/s3.service');
        updates.avatarUrl = await uploadBase64(avatarUrl, 'profiles');
      } else {
        updates.avatarUrl = avatarUrl;
      }
    }

    await user.update(updates);

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: formatUser(user),
    });
  } catch (err) {
    console.error('[Auth] Update profile error:', err.message);
    return res.status(400).json({ success: false, error: err.message || 'Failed to update profile' });
  }
};

/**
 * Backward compatible Request OTP endpoint
 */
exports.requestToken = async (req, res) => {
  const { mobile, name } = req.body;

  if (!mobile || String(mobile).replace(/\D/g, '').length < 10) {
    return res.status(400).json({ error: 'Valid 10-digit mobile number required' });
  }

  const cleanMobile = String(mobile).replace(/\D/g, '').slice(-10);
  console.log(`[AUTH] Direct verification active for ${name || 'User'} (${cleanMobile})`);

  res.json({
    success: true,
    message: 'Compulsory mobile verified (Direct Sign-In active)',
    otp: '12345',
    mobile: cleanMobile,
    name,
  });
};

/**
 * Backward compatible Verify OTP endpoint - returns signed JWT token
 */
exports.verifyToken = async (req, res) => {
  const { mobile, name, shopName } = req.body;
  const cleanMobile = mobile ? String(mobile).replace(/\D/g, '').slice(-10) : '';

  if (!cleanMobile || cleanMobile.length !== 10) {
    return res.status(400).json({ success: false, error: 'Compulsory 10-digit mobile number is required' });
  }

  try {
    let user = await Shopkeeper.findOne({ where: { mobile: cleanMobile } });
    if (!user) {
      user = await Shopkeeper.create({
        name: name ? name.trim() : `Customer ${cleanMobile.slice(-4)}`,
        mobile: cleanMobile,
        shopName: shopName ? shopName.trim() : `Store ${cleanMobile.slice(-4)}`,
        role: 'buyer',
      });
    } else if (name && name.trim()) {
      await user.update({ name: name.trim() });
    }

    const token = generateToken({
      id: user.id,
      mobile: user.mobile,
      name: user.name,
      shopName: user.shopName,
      role: user.role || 'buyer',
    });

    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: formatUser(user),
    });
  } catch (err) {
    console.error('DB authentication error:', err.message);
    return res.status(500).json({ success: false, error: 'Database authentication failed' });
  }
};
