const { connectDB } = require('../config/database');
const { AdminUser } = require('../models');

async function addAdmins() {
  console.log('\n======================================================');
  console.log(' RS ENTERPRISE: ADD ADMIN ACCOUNTS SCRIPT');
  console.log('======================================================');

  try {
    await connectDB();
    console.log('✅ Connected to database.\n');

    // 1. Target: dinkaryadav8528@gmail.com (assign to ID 2 / mobile 8528939087)
    const emailDinkar = 'dinkaryadav8528@gmail.com'.toLowerCase().trim();
    let adminDinkar = await AdminUser.findOne({ where: { email: emailDinkar } });
    if (!adminDinkar) {
      const byMobile = await AdminUser.findOne({ where: { mobile: '8528939087' } });
      if (byMobile) {
        byMobile.email = emailDinkar;
        byMobile.name = 'Dinkar Yadav';
        byMobile.role = 'ADMIN';
        byMobile.isActive = true;
        await byMobile.save();
        adminDinkar = byMobile;
        console.log(`[UPDATED] Assigned ID 2 to ${adminDinkar.email} (Mobile: ${adminDinkar.mobile})`);
      } else {
        adminDinkar = await AdminUser.create({
          name: 'Dinkar Yadav',
          email: emailDinkar,
          mobile: '8528939087',
          role: 'ADMIN',
          isActive: true,
        });
        console.log(`[CREATED] Created admin: ${adminDinkar.email} (Mobile: ${adminDinkar.mobile})`);
      }
    } else {
      adminDinkar.role = 'ADMIN';
      adminDinkar.isActive = true;
      await adminDinkar.save();
      console.log(`[EXISTING] Verified admin: ${adminDinkar.email}`);
    }

    // 2. Target: rsd535600@gmail.com (create dedicated admin with unique mobile)
    const emailRsd = 'rsd535600@gmail.com'.toLowerCase().trim();
    let adminRsd = await AdminUser.findOne({ where: { email: emailRsd } });
    if (!adminRsd) {
      // Find a safe unique mobile that doesn't conflict
      const candidateMobile = '8528939088';
      const existingMob = await AdminUser.findOne({ where: { mobile: candidateMobile } });
      const finalMobile = existingMob ? `91000${Math.floor(10000 + Math.random() * 90000)}` : candidateMobile;

      adminRsd = await AdminUser.create({
        name: 'RS Admin (rsd535600)',
        email: emailRsd,
        mobile: finalMobile,
        role: 'ADMIN',
        isActive: true,
      });
      console.log(`[CREATED] Created admin: ${adminRsd.email} (Mobile: ${adminRsd.mobile})`);
    } else {
      adminRsd.role = 'ADMIN';
      adminRsd.isActive = true;
      await adminRsd.save();
      console.log(`[EXISTING] Verified admin: ${adminRsd.email}`);
    }

    console.log('\n--- ALL CURRENT ADMINS IN DATABASE ---');
    const allAdmins = await AdminUser.findAll();
    allAdmins.forEach((a) => {
      console.log(`[ID ${a.id}] Name: "${a.name}" | Email: ${a.email} | Mobile: ${a.mobile} | Role: ${a.role} | Active: ${a.isActive}`);
    });

    console.log('\n======================================================');
    console.log(' ADMIN ACCOUNTS PROVISIONED SUCCESSFULLY');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding admins:', err);
    process.exit(1);
  }
}

addAdmins();
