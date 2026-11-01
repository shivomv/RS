const { AdminDevice, AdminUser } = require('../../models');
const { generateToken } = require('../../middlewares/auth.middleware');
const { hashPin, verifyPin } = require('../../services/security.service');

/**
 * Admin Login & Automatic Device Registration
 * POST /api/admin/login
 * Allows direct login without PIN or with PIN
 */
exports.loginAdmin = async (req, res) => {
  try {
    const { mobile, email, pin, deviceToken, deviceModel } = req.body;

    const cleanMobile = mobile ? String(mobile).trim() : '';
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';

    if (!cleanMobile && !cleanEmail) {
      return res.status(400).json({ success: false, error: 'Mobile number or Email is required' });
    }

    const where = { isActive: true };
    if (cleanEmail) where.email = cleanEmail;
    else if (cleanMobile) where.mobile = cleanMobile;

    const admin = await AdminUser.findOne({ where });
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Access denied: You are not registered as an authorized Admin.',
      });
    }

    // Optional PIN validation if PIN was provided and admin has pin set
    if (pin && admin.pin) {
      const isPinValid = verifyPin(String(pin).trim(), admin.pin);
      if (!isPinValid) {
        return res.status(401).json({ success: false, error: 'Invalid Admin PIN.' });
      }
    }

    // Generate secure JWT token
    const token = generateToken({
      id: admin.id,
      name: admin.name,
      mobile: admin.mobile,
      email: admin.email,
      role: admin.role,
      isAdmin: true,
    });

    const adminIdStr = cleanEmail || cleanMobile || 'admin';

    // Auto-register Device Token on Login if provided
    if (deviceToken && typeof deviceToken === 'string' && deviceToken.trim()) {
      const trimmedToken = deviceToken.trim();
      const [device, created] = await AdminDevice.findOrCreate({
        where: { token: trimmedToken },
        defaults: {
          token: trimmedToken,
          deviceModel: deviceModel || 'Android Admin App',
          platform: 'android',
          adminIdentifier: adminIdStr,
          isActive: true,
          lastSeenAt: new Date(),
        },
      });
      if (!created) {
        await device.update({
          adminIdentifier: adminIdStr,
          deviceModel: deviceModel || device.deviceModel,
          isActive: true,
          lastSeenAt: new Date(),
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Admin authenticated successfully (No PIN required)',
      token,
      user: {
        id: admin.id,
        name: admin.name,
        mobile: admin.mobile,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('[AdminController] Login error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Admin Login via Google (Zero PIN needed)
 * POST /api/admin/google
 */
exports.loginAdminGoogle = async (req, res) => {
  try {
    const { email, name, googleId, deviceToken, deviceModel } = req.body;
    if (!email && !googleId) {
      return res.status(400).json({ success: false, error: 'Google authentication details required.' });
    }

    const cleanEmail = email ? String(email).trim().toLowerCase() : '';

    // Search by email or googleId in registered admin database
    let admin = null;
    if (cleanEmail) {
      admin = await AdminUser.findOne({ where: { email: cleanEmail, isActive: true } });
    }
    if (!admin && googleId) {
      admin = await AdminUser.findOne({ where: { googleId, isActive: true } });
    }

    if (!admin) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: ${cleanEmail || 'This account'} is not an authorized administrator. Please contact Super Admin.`,
      });
    }

    // Register FCM device token
    if (deviceToken && typeof deviceToken === 'string' && deviceToken.trim()) {
      const trimmedToken = deviceToken.trim();
      const [device, created] = await AdminDevice.findOrCreate({
        where: { token: trimmedToken },
        defaults: {
          token: trimmedToken,
          deviceModel: deviceModel || 'Android Admin App',
          platform: 'android',
          adminIdentifier: cleanEmail || admin.mobile || 'admin',
          isActive: true,
          lastSeenAt: new Date(),
        },
      });
      if (!created) {
        await device.update({
          adminIdentifier: cleanEmail || admin.mobile || 'admin',
          deviceModel: deviceModel || device.deviceModel,
          isActive: true,
          lastSeenAt: new Date(),
        });
      }
    }

    const token = generateToken({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      mobile: admin.mobile,
      role: admin.role,
      isAdmin: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Admin authenticated successfully via Google (No PIN required)',
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        mobile: admin.mobile,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('[AdminController] Google login error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * List all admin users
 * GET /api/admin/users
 */
exports.getAdminUsers = async (req, res) => {
  try {
    const admins = await AdminUser.findAll({
      order: [['role', 'DESC'], ['createdAt', 'ASC']],
      attributes: ['id', 'name', 'email', 'mobile', 'role', 'isActive', 'avatarUrl', 'createdAt'],
    });

    return res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create a new admin user (Super Admin action)
 * POST /api/admin/users
 */
exports.createAdminUser = async (req, res) => {
  try {
    const { name, email, mobile, pin, role } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const cleanEmail = email ? String(email).trim().toLowerCase() : null;
    const cleanMobile = mobile ? String(mobile).trim() : null;

    if (cleanMobile) {
      const existing = await AdminUser.findOne({ where: { mobile: cleanMobile } });
      if (existing) {
        return res.status(400).json({ success: false, error: 'An admin with this mobile already exists' });
      }
    }

    if (cleanEmail) {
      const existingEmail = await AdminUser.findOne({ where: { email: cleanEmail } });
      if (existingEmail) {
        return res.status(400).json({ success: false, error: 'An admin with this email already exists' });
      }
    }

    const rawPin = pin ? String(pin).trim() : '9999';
    const newAdmin = await AdminUser.create({
      name: name.trim(),
      email: cleanEmail,
      mobile: cleanMobile,
      pin: hashPin(rawPin),
      role: role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN',
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'New admin created successfully',
      data: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        mobile: newAdmin.mobile,
        role: newAdmin.role,
        isActive: newAdmin.isActive,
      },
    });
  } catch (error) {
    console.error('[AdminController] Create admin error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update an existing admin user (Super Admin action)
 * PUT /api/admin/users/:id
 */
exports.updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, role, isActive, avatarUrl } = req.body;

    const admin = await AdminUser.findByPk(id);
    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin account not found' });
    }

    const updates = {};
    if (name && name.trim()) updates.name = name.trim();
    if (email !== undefined) updates.email = email ? String(email).trim().toLowerCase() : null;
    if (mobile !== undefined) updates.mobile = mobile ? String(mobile).trim() : null;
    if (role && ['SUPERADMIN', 'ADMIN'].includes(role)) updates.role = role;
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    if (avatarUrl) {
      if (avatarUrl.startsWith('data:') || avatarUrl.length > 500) {
        const { uploadBase64 } = require('../../services/s3.service');
        updates.avatarUrl = await uploadBase64(avatarUrl, 'admin-avatars');
      } else {
        updates.avatarUrl = avatarUrl;
      }
    }

    await admin.update(updates);

    return res.status(200).json({
      success: true,
      message: 'Admin account updated successfully',
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        mobile: admin.mobile,
        role: admin.role,
        isActive: admin.isActive,
        avatarUrl: admin.avatarUrl,
      },
    });
  } catch (error) {
    console.error('[AdminController] Update admin error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete an admin user
 * DELETE /api/admin/users/:id
 */
exports.deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await AdminUser.findByPk(id);

    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }

    // Role-based protection: Super Admins cannot be deleted
    if (admin.role === 'SUPERADMIN') {
      return res.status(403).json({ success: false, error: 'Super Admin accounts cannot be deleted' });
    }

    await admin.destroy();

    return res.status(200).json({
      success: true,
      message: 'Admin removed successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Register or refresh an Admin FCM Device Token
 * POST /api/admin/device-token
 */
exports.registerDeviceToken = async (req, res) => {
  try {
    const { token, deviceId, deviceModel, platform, adminIdentifier } = req.body;

    if (!token || typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({ success: false, error: 'Device token is required' });
    }

    const trimmedToken = token.trim();

    // Upsert: Find existing record by token
    const [device, created] = await AdminDevice.findOrCreate({
      where: { token: trimmedToken },
      defaults: {
        token: trimmedToken,
        deviceId: deviceId || null,
        deviceModel: deviceModel || null,
        platform: platform || 'android',
        adminIdentifier: adminIdentifier || 'primary_admin',
        isActive: true,
        lastSeenAt: new Date(),
      },
    });

    if (!created) {
      await device.update({
        deviceId: deviceId || device.deviceId,
        deviceModel: deviceModel || device.deviceModel,
        platform: platform || device.platform,
        adminIdentifier: adminIdentifier || device.adminIdentifier,
        isActive: true,
        lastSeenAt: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      message: created ? 'Device registered successfully' : 'Device token refreshed',
      deviceId: device.id,
    });
  } catch (error) {
    console.error('[AdminDeviceController] Error registering token:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete an Admin FCM Device Token on Admin Logout
 * DELETE /api/admin/device-token
 */
exports.unregisterDeviceToken = async (req, res) => {
  try {
    const { token, adminIdentifier } = req.body || {};

    const where = {};
    if (token && typeof token === 'string' && token.trim()) {
      where.token = token.trim();
    } else if (adminIdentifier && typeof adminIdentifier === 'string' && adminIdentifier.trim()) {
      where.adminIdentifier = adminIdentifier.trim();
    } else {
      return res.status(400).json({ success: false, error: 'Token or adminIdentifier is required' });
    }

    const deletedCount = await AdminDevice.destroy({ where });
    console.log(`[AdminDeviceController] Deleted ${deletedCount} device(s) on logout.`);

    return res.status(200).json({
      success: true,
      message: 'Device deleted successfully on logout',
      deletedCount,
    });
  } catch (error) {
    console.error('[AdminDeviceController] Error deleting device on logout:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get list of registered admin devices
 * GET /api/admin/devices
 */
exports.getRegisteredDevices = async (req, res) => {
  try {
    const devices = await AdminDevice.findAll({
      order: [['updatedAt', 'DESC']],
      attributes: ['id', 'deviceId', 'deviceModel', 'platform', 'adminIdentifier', 'isActive', 'lastSeenAt', 'createdAt'],
    });

    return res.status(200).json({
      success: true,
      count: devices.length,
      data: devices,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
