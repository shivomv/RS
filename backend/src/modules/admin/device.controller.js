const { AdminDevice, AdminUser } = require('../../models');

/**
 * Admin Login & Automatic Device Registration
 * POST /api/admin/login
 * Pure database-driven authentication with zero hardcoded credentials
 */
exports.loginAdmin = async (req, res) => {
  try {
    const { mobile, pin, deviceToken, deviceModel } = req.body;

    if (!mobile || String(mobile).trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Valid 10-digit mobile number is required' });
    }
    if (!pin) {
      return res.status(400).json({ success: false, error: 'Admin PIN is required' });
    }

    const cleanMobile = String(mobile).trim();
    const cleanPin = String(pin).trim();

    // Pure database query - no hardcoded mobile numbers
    const admin = await AdminUser.findOne({ where: { mobile: cleanMobile, isActive: true } });
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Access denied: Mobile number is not registered as an authorized Admin.',
      });
    }

    // Validate PIN strictly against database record
    if (admin.pin !== cleanPin) {
      return res.status(401).json({ success: false, error: 'Invalid Admin PIN.' });
    }

    // Auto-register Device Token on Login if provided
    if (deviceToken && typeof deviceToken === 'string' && deviceToken.trim()) {
      const trimmedToken = deviceToken.trim();
      const [device, created] = await AdminDevice.findOrCreate({
        where: { token: trimmedToken },
        defaults: {
          token: trimmedToken,
          deviceModel: deviceModel || 'Android Admin App',
          platform: 'android',
          adminIdentifier: cleanMobile,
          isActive: true,
          lastSeenAt: new Date(),
        },
      });
      if (!created) {
        await device.update({
          adminIdentifier: cleanMobile,
          deviceModel: deviceModel || device.deviceModel,
          isActive: true,
          lastSeenAt: new Date(),
        });
      }
      console.log(`[AdminAuth] Device registered on login for admin ${cleanMobile}: ${trimmedToken.substring(0, 15)}...`);
    }

    return res.status(200).json({
      success: true,
      message: 'Admin authenticated successfully',
      user: {
        id: admin.id,
        name: admin.name,
        mobile: admin.mobile,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('[AdminController] Login error:', error);
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
      attributes: ['id', 'name', 'mobile', 'role', 'isActive', 'createdAt'],
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
    const { name, mobile, pin, role } = req.body;

    if (!mobile || String(mobile).trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Valid 10-digit mobile number is required' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const cleanMobile = String(mobile).trim();

    const existing = await AdminUser.findOne({ where: { mobile: cleanMobile } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'An admin with this mobile already exists' });
    }

    const newAdmin = await AdminUser.create({
      name: name.trim(),
      mobile: cleanMobile,
      pin: pin ? String(pin).trim() : '9999',
      role: role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN',
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'New admin created successfully',
      data: {
        id: newAdmin.id,
        name: newAdmin.name,
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
