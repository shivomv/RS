const { connectDB } = require('./config/database');
const {
  syncDatabase,
  Category,
  Product,
  ProductBundle,
  Banner,
  Shopkeeper,
  Cart,
} = require('./models');

async function seedRelationalData() {
  try {
    await connectDB();
    // Drop and re-create tables cleanly for seed
    await syncDatabase({ force: true });
    console.log('✅ Tables dropped and recreated.');

    // 1. Seed Categories (Image only - NO icons)
    const categoriesData = [
      {
        name: 'Floor Cleaners',
        slug: 'floor-cleaners',
        image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&q=80',
        displayOrder: 1,
      },
      {
        name: 'Disinfectants',
        slug: 'disinfectants',
        image: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&q=80',
        displayOrder: 2,
      },
      {
        name: 'Dishwash & Degreaser',
        slug: 'dishwash-degreaser',
        image: 'https://images.unsplash.com/photo-1585670270608-b4b4f1da0d00?w=400&q=80',
        displayOrder: 3,
      },
      {
        name: 'Glass & Surface',
        slug: 'glass-surface',
        image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80',
        displayOrder: 4,
      },
      {
        name: 'Handwash',
        slug: 'handwash',
        image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80',
        displayOrder: 5,
      },
      {
        name: 'Bulk Drums',
        slug: 'bulk-drums',
        image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80',
        displayOrder: 6,
      },
    ];

    const createdCategories = await Category.bulkCreate(categoriesData);
    console.log(`✅ Seeded ${createdCategories.length} Categories (with images, no icons).`);

    // 2. Seed Shopkeeper
    const shopkeeper = await Shopkeeper.create({
      name: 'Indiranagar Facilities Ltd',
      mobile: '+919876543210',
      shopName: 'Indiranagar Corporate Office',
      address: 'Indiranagar, Bengaluru - 560038',
      gstin: '29AABCU9603R1ZM',
      email: 'procurement@indiranagarfacilities.com',
      role: 'buyer',
      outstandingBalance: 0,
      creditLimit: 100000,
      isApproved: true,
    });
    console.log('✅ Seeded Shopkeeper Account.');

    // 3. Seed Products & Bundles
    const p1 = await Product.create({
      name: 'RS Pro Citrus Floor Cleaner',
      slug: 'rs-pro-citrus-floor-cleaner',
      subtitle: 'Citrus Formula 500ml',
      description: 'High performance citrus formula for marble, tile, and granite floor sanitation.',
      brand: 'RS Pro',
      categoryId: createdCategories[0].id,
      categoryName: createdCategories[0].name,
      categorySlug: createdCategories[0].slug,
      price: 90,
      mrp: 120,
      badge: 'Popular Tiers',
      image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&q=80',
      stockQuantity: 250,
      displayOrder: 1,
      isActive: true,
      isFeatured: true,
    });

    await ProductBundle.bulkCreate([
      { productId: p1.id, bundleId: 'b-1', label: 'Pack of 1 Bottle', quantity: 1, price: 90, mrp: 120, isDefault: true },
      { productId: p1.id, bundleId: 'b-10', label: 'Box of 10 Bottles', quantity: 10, price: 850, mrp: 1200, isDefault: false },
      { productId: p1.id, bundleId: 'b-50', label: 'Master Carton (50 Bottles)', quantity: 50, price: 4000, mrp: 6000, isDefault: false },
    ]);

    const p2 = await Product.create({
      name: 'Active Bleach 10X Cleaner',
      slug: 'active-bleach-10x-cleaner',
      subtitle: 'Bleaching Liquid 1L',
      description: 'Concentrated industrial bleach for deep stain removal and surface whitening.',
      brand: 'RS Pro',
      categoryId: createdCategories[0].id,
      categoryName: createdCategories[0].name,
      categorySlug: createdCategories[0].slug,
      price: 140,
      mrp: 180,
      badge: 'Heavy Duty',
      image: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&q=80',
      stockQuantity: 180,
      displayOrder: 2,
      isActive: true,
      isFeatured: false,
    });

    await ProductBundle.bulkCreate([
      { productId: p2.id, bundleId: 'b-1', label: 'Single 1L Bottle', quantity: 1, price: 140, mrp: 180, isDefault: true },
      { productId: p2.id, bundleId: 'b-12', label: 'Box of 12 Bottles', quantity: 12, price: 1550, mrp: 2160, isDefault: false },
    ]);

    const p3 = await Product.create({
      name: 'Pine Industrial Surface Disinfectant',
      slug: 'pine-industrial-surface-disinfectant',
      subtitle: 'Pine Fragrance 5L Can',
      description: 'Natural pine oil disinfectant for commercial establishments and hospital corridors.',
      brand: 'RS Pro',
      categoryId: createdCategories[1].id,
      categoryName: createdCategories[1].name,
      categorySlug: createdCategories[1].slug,
      price: 450,
      mrp: 600,
      badge: 'Commercial',
      image: 'https://images.unsplash.com/photo-1585670270608-b4b4f1da0d00?w=400&q=80',
      stockQuantity: 90,
      displayOrder: 3,
      isActive: true,
      isFeatured: true,
    });

    await ProductBundle.bulkCreate([
      { productId: p3.id, bundleId: 'b-1', label: '5L Canister', quantity: 1, price: 450, mrp: 600, isDefault: true },
      { productId: p3.id, bundleId: 'b-4', label: 'Carton of 4 Cans (20L)', quantity: 4, price: 1650, mrp: 2400, isDefault: false },
    ]);

    console.log('✅ Seeded Products and Bulk Bundles.');

    // 4. Seed Banners
    await Banner.bulkCreate([
      {
        title: 'Direct From RS Factory',
        subtitle: 'Factory-direct wholesale pricing on all commercial bulk drums',
        badge: 'Direct from Factory',
        discountPercent: 45,
        image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&q=80',
        targetCategory: 'Bulk Drums',
        isActive: true,
      },
      {
        title: 'Monsoon Cleaners Special',
        subtitle: 'Heavy-duty disinfectants with hospital-grade certification',
        badge: 'Limited Stock',
        discountPercent: 30,
        image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80',
        targetCategory: 'Disinfectants',
        isActive: true,
      },
    ]);
    console.log('✅ Seeded Banners.');

    // 5. Seed Initial Empty Cart
    await Cart.create({
      shopkeeperId: shopkeeper.id,
      items: [],
      couponCode: 'RSBULK100',
      gstRequested: true,
    });
    console.log('✅ Initialized Cart for Shopkeeper.');

    console.log('\n🎉 ALL RELATIONAL DATA SEEDED INTO SQL DATABASE SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedRelationalData();
