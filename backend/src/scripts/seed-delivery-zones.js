const { connectDB } = require('../config/database');
const { DeliveryZone, syncDatabase } = require('../models');

const INITIAL_ZONES = [
  // Kanpur Hub (Primary)
  { pincode: '208001', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', hubName: 'Kanpur Central Hub', estimatedDays: 'Same Day / Next Day' },
  { pincode: '208002', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', hubName: 'Kanpur Central Hub', estimatedDays: 'Same Day / Next Day' },
  { pincode: '208003', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', hubName: 'Kanpur Central Hub', estimatedDays: 'Same Day / Next Day' },
  { pincode: '208004', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', hubName: 'Kanpur Central Hub', estimatedDays: 'Same Day / Next Day' },
  { pincode: '208005', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', hubName: 'Kanpur Central Hub', estimatedDays: 'Same Day / Next Day' },
  { pincode: '208006', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', hubName: 'Kanpur Central Hub', estimatedDays: 'Same Day / Next Day' },
  { pincode: '208007', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', hubName: 'Kanpur Central Hub', estimatedDays: 'Same Day / Next Day' },
  { pincode: '208011', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', hubName: 'Kanpur Central Hub', estimatedDays: 'Same Day / Next Day' },
  { pincode: '208012', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', hubName: 'Kanpur Central Hub', estimatedDays: 'Same Day / Next Day' },
  { pincode: '208013', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', hubName: 'Kanpur Central Hub', estimatedDays: 'Same Day / Next Day' },
  { pincode: '208017', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', hubName: 'Kanpur Central Hub', estimatedDays: 'Same Day / Next Day' },
  { pincode: '208020', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', hubName: 'Kanpur Central Hub', estimatedDays: 'Same Day / Next Day' },
  { pincode: '208021', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', hubName: 'Kanpur Central Hub', estimatedDays: 'Same Day / Next Day' },
  { pincode: '208022', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', hubName: 'Panki Industrial Hub', estimatedDays: 'Same Day' },
  { pincode: '208024', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', hubName: 'Kanpur Central Hub', estimatedDays: 'Same Day / Next Day' },
  { pincode: '208025', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', hubName: 'Kanpur Central Hub', estimatedDays: 'Same Day / Next Day' },
  { pincode: '208027', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', hubName: 'Kanpur Central Hub', estimatedDays: 'Same Day / Next Day' },

  // Unnao Hub
  { pincode: '209801', city: 'Unnao', state: 'Uttar Pradesh', district: 'Unnao', hubName: 'Unnao Industrial Hub', estimatedDays: '1-2 Days' },

  // Lucknow Hub
  { pincode: '226001', city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', hubName: 'Lucknow City Hub', estimatedDays: '1-2 Days' },
  { pincode: '226002', city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', hubName: 'Lucknow City Hub', estimatedDays: '1-2 Days' },
  { pincode: '226003', city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', hubName: 'Lucknow City Hub', estimatedDays: '1-2 Days' },
  { pincode: '226010', city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', hubName: 'Gomti Nagar Hub', estimatedDays: '1-2 Days' },
  { pincode: '226012', city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', hubName: 'Lucknow City Hub', estimatedDays: '1-2 Days' },
  { pincode: '226016', city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', hubName: 'Indira Nagar Hub', estimatedDays: '1-2 Days' },
  { pincode: '226020', city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', hubName: 'Lucknow City Hub', estimatedDays: '1-2 Days' },
  { pincode: '226024', city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', hubName: 'Lucknow City Hub', estimatedDays: '1-2 Days' },
  { pincode: '226028', city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', hubName: 'Lucknow City Hub', estimatedDays: '1-2 Days' },
];

async function seedZones() {
  console.log('\n======================================================');
  console.log(' RS INDUSTRIES: SEED DELIVERY ZONES SCRIPT');
  console.log('======================================================\n');

  try {
    await connectDB();
    await syncDatabase();
    console.log('✅ Connected to database & synced models.');

    let createdCount = 0;
    let updatedCount = 0;

    for (const z of INITIAL_ZONES) {
      const existing = await DeliveryZone.findOne({ where: { pincode: z.pincode } });
      if (!existing) {
        await DeliveryZone.create({
          pincode: z.pincode,
          city: z.city,
          state: z.state,
          district: z.district,
          hubName: z.hubName,
          isServiceable: true,
          estimatedDays: z.estimatedDays,
          minOrderAmount: 0,
          outOfStockSkus: [],
        });
        createdCount++;
      } else {
        await existing.update({
          city: z.city,
          state: z.state,
          district: z.district,
          hubName: z.hubName,
          isServiceable: true,
          estimatedDays: z.estimatedDays,
        });
        updatedCount++;
      }
    }

    console.log(`\n🎉 Seed Complete! Created: ${createdCount}, Updated: ${updatedCount}, Total Active Zones: ${INITIAL_ZONES.length}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed delivery zones:', err);
    process.exit(1);
  }
}

seedZones();
