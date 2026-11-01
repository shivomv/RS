const path = require('path');
const { Op } = require('sequelize');
const { connectDB } = require('../config/database');
const { AdminUser } = require('../models');

async function seedAdminOnly() {
  console.log('\n======================================================');
  console.log(' RS ENTERPRISE: SAFE ADMIN SEED SCRIPT (LIVE DATABASE)');
  console.log('======================================================');

  try {
    await connectDB();
    console.log('✅ Connected to database. Preserving all existing live catalog, orders, and shopkeepers.');

    // 1. Read existing admin accounts
    console.log('\n--- EXISTING ADMIN USERS IN DATABASE ---');
    const existing = await AdminUser.findAll();
    if (existing.length === 0) {
      console.log('No admin users currently in database.');
    } else {
      existing.forEach((a) => {
        console.log(`[ID ${a.id}] Name: "${a.name}" | Email: ${a.email} | Mobile: ${a.mobile} | Role: ${a.role} | Active: ${a.isActive}`);
      });
    }

    // 2. Read Super Admin details from CLI args or ENV (fallback to prompt values)
    const args = process.argv.slice(2);
    // Usage: node seed.js [email] [mobile] [name]
    const targetEmail = args[0] || process.env.SUPERADMIN_EMAIL || 'oms43711@gmail.com';
    const targetMobile = args[1] || process.env.SUPERADMIN_MOBILE || '9026773268';
    const targetName = args[2] || process.env.SUPERADMIN_NAME || 'Super Admin (Director)';

    let superAdmin = await AdminUser.findOne({
      where: {
        [Op.or]: [
          { email: targetEmail },
          { mobile: targetMobile },
          { id: 1 },
        ],
      },
    });

    if (!superAdmin) {
      superAdmin = await AdminUser.create({
        name: targetName,
        email: targetEmail,
        mobile: targetMobile,
        role: 'SUPERADMIN',
        isActive: true,
      });
      console.log(`\n✅ Created New Super Admin: ${targetEmail} (${targetMobile})`);
    } else {
      await superAdmin.update({
        name: targetName,
        email: targetEmail,
        mobile: targetMobile,
        role: 'SUPERADMIN',
        isActive: true,
      });
      console.log(`\n✅ Synchronized Super Admin: ${targetEmail} (${targetMobile})`);
    }

    // 3. Verify final list of admins in DB
    console.log('\n--- VERIFIED ADMIN USERS IN DATABASE ---');
    const allAdmins = await AdminUser.findAll();
    allAdmins.forEach((a) => {
      console.log(`[ID ${a.id}] Name: "${a.name}" | Email: ${a.email} | Mobile: ${a.mobile} | Role: ${a.role} | Active: ${a.isActive}`);
    });

    console.log('\n======================================================');
    console.log(' ADMIN SEED COMPLETED SAFELY (ZERO CATALOG IMPACT)');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Error during admin seed:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedAdminOnly();
