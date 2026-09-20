require('dotenv').config();
const mongoose = require('mongoose');

// Import All 14 Mongoose Models
const Shopkeeper = require('./modules/shopkeeper/shopkeeper.model');
const Address = require('./modules/address/address.model');
const AuditLog = require('./modules/audit/auditLog.model');
const Category = require('./modules/category/category.model');
const Product = require('./modules/product/product.model');
const InventoryBatch = require('./modules/inventory/inventoryBatch.model');
const Review = require('./modules/review/review.model');
const Cart = require('./modules/cart/cart.model');
const Order = require('./modules/order/order.model');
const Payment = require('./modules/payment/payment.model');
const Ledger = require('./modules/ledger/ledger.model');
const SupportTicket = require('./modules/ticket/ticket.model');
const Banner = require('./modules/banner/banner.model');
const Notification = require('./modules/notification/notification.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rs_industries';

async function runMasterSeed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Master 14-Collection Seeding...');

    // Clear all 14 collections
    await Promise.all([
      Shopkeeper.deleteMany({}),
      Address.deleteMany({}),
      AuditLog.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      InventoryBatch.deleteMany({}),
      Review.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({}),
      Payment.deleteMany({}),
      Ledger.deleteMany({}),
      SupportTicket.deleteMany({}),
      Banner.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('✅ Cleared existing data across all 14 collections.');

    // 1. Seed Categories
    const categories = await Category.insertMany([
      { name: 'Floor Cleaners', slug: 'floor-cleaners', icon: 'cleaning-services', displayOrder: 1 },
      { name: 'Disinfectants', slug: 'disinfectants', icon: 'sanitizer', displayOrder: 2 },
      { name: 'Dishwash & Degreaser', slug: 'dishwash-degreaser', icon: 'flatware', displayOrder: 3 },
      { name: 'Glass & Surface', slug: 'glass-surface', icon: 'window', displayOrder: 4 },
      { name: 'Handwash', slug: 'handwash', icon: 'wash', displayOrder: 5 },
      { name: 'Bulk Drums', slug: 'bulk-drums', icon: 'inventory-2', displayOrder: 6 },
    ]);
    console.log(`1. Seeded ${categories.length} Categories.`);

    // 2. Seed Products
    const products = await Product.insertMany([
      {
        name: 'RS Pro Citrus Floor Cleaner',
        category: 'Floor Cleaners',
        categorySlug: 'floor-cleaners',
        categoryRef: categories[0]._id,
        price: 99,
        mrp: 125,
        badge: 'Save 18%',
        subtitle: '500ml Bottle',
        description: 'High performance citrus formula for marble, tile, and granite floor sanitation.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNr66zlhIrUzGurptkQYA93OEcc1VXgahlM0JmA9InCJ5rctZ9LPlbSqKW9fyIn2_fxSCMsqGRkevrp7nz_q7tgLC54K6avCWzJf3cakk1BW7pW_ZAfSAh236c2jX-FlvFGyOUYW2JjWHwCTZjA_CTo2mwx7N2IHZPmWju2U6rmSgu-p8xmxHftLVHGWFWMQYAr-M1lnB7jGJZM6zomx7eff2qIizM7_yTELQsxDNP58neTP3xdD4P',
        stockQuantity: 250,
        packSizes: ['500ml', '1L', '5L'],
        tierRates: [{ minQty: 10, ratePerUnit: 85 }, { minQty: 50, ratePerUnit: 75 }],
      },
      {
        name: 'Active Bleach 10X Cleaner',
        category: 'Floor Cleaners',
        categorySlug: 'floor-cleaners',
        categoryRef: categories[0]._id,
        price: 135,
        mrp: 160,
        badge: 'Heavy Duty',
        subtitle: '1L Sanitizing Liquid',
        description: 'Heavy duty bleaching agent for deep stain removal in commercial restrooms.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5hqxVZb8BQ6Oe46KWidiOLut43Pum3zC3-lJtEJfOXhXiLqWWMqdnqU7RYaEMcUBFpdpSePhDEXYyICHqNuIeWDk6jacFoAWkNcoc_0f-XJDeD7xRJiiSalNqLgbn6REwgwHQWvN1LDFG1iffMiK4cma4hYi7CPIaiDt3f2uaLh1uyjPadJnMvH_0gBbaQgqxY1BmTu433rKnoA0uLvaitQE6hOFZ5DTh1cyefo517XoRAJU4pEtF',
        stockQuantity: 180,
        packSizes: ['1L', '5L'],
      },
      {
        name: 'PowerShield Pine Disinfectant',
        category: 'Disinfectants',
        categorySlug: 'disinfectants',
        categoryRef: categories[1]._id,
        price: 149,
        mrp: 195,
        badge: 'Bulk Deal',
        subtitle: '1L Concentrated Liquid',
        description: 'Natural pine oil disinfectant with 99.9% germ protection.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLdGi__j6mLWDUmVo9OG0e5D5GfSaQkXr8o6OAe3aBESdgDrtF8VZma1MzvenCjvrngELgPSqNtJ02z1IhArTUx8o8sSHeZ2wqcbAsyI58WOy4J-WS32WWbBaMDo8hi0yXFihdg708Oi8YnnlGBZwz6M0qdc0o4hMI-1L76QWIGsyyy29hEmSm3LfVwAH2p8vU-uT4_kgm5eAu0-XGv5W4yJWFyxXaRgmK_mroPMpx9opFeEnQ7_oU',
        stockQuantity: 300,
        packSizes: ['1L', '5L'],
      },
      {
        name: 'Pro Ultra Surface Sanitizer',
        category: 'Disinfectants',
        categorySlug: 'disinfectants',
        categoryRef: categories[1]._id,
        price: 89,
        mrp: 110,
        badge: 'Eco-Safe',
        subtitle: '500ml 99.99% Efficacy',
        description: 'Alcohol-free medical grade sanitizer for healthcare facilities.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw4YOsMqYuT52tBmNbLFzA0wc0TrmJxxut2UFFUqKqr_Smr1zMCVv95ks_Gf3d9ocqYiaE2dxH6ZZOXcgdWVHScWIPCM6W7qW6fNFiFA5anaOA0_jV9CG0SF2jPTZKjG28nWIyGaIZNqxq9eGsAEl1YAlC45lcQ5l_oja7igXr-s9spqmKqvxZjysywBCocqrikglxpsjQN4kN9VSubVT4zA_whmWUXGaT9RUQGlL1CoBsej4QlW7s',
        stockQuantity: 400,
        packSizes: ['500ml', '1L'],
      },
      {
        name: 'SparkleCut Dishwash Gel',
        category: 'Dishwash & Degreaser',
        categorySlug: 'dishwash-degreaser',
        categoryRef: categories[2]._id,
        price: 115,
        mrp: 140,
        badge: 'Kitchen Pro',
        subtitle: '750ml Squeeze Bottle',
        description: 'Tough lemon grease-cutting formulation for industrial kitchens.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-SpPcqcipF88iVFJb2dbPrvZVDnolEod4WwTg-3fpvMZGi_923iR9-b9HJuAtNyoMbfI3u-JSk4zJcPxfuI06b7z6xbde3qHQJ0WRVti8ObWYV0Ie9s6vxXYSPrt-pUTjmpsZ7b1jh2IP-nszPgyOqz9BX4oV-9Vr3K6VI9JO6GOU1hW4NWmSi5IZOdoEyx58g1ChzLW85jglUTB2rxVPWCM6OcxIX8dzZSfpK4PEa59k2kdECF7J',
        stockQuantity: 210,
        packSizes: ['750ml', '5L'],
      },
      {
        name: 'Crystal Glass Cleaner Spray',
        category: 'Glass & Surface',
        categorySlug: 'glass-surface',
        categoryRef: categories[3]._id,
        price: 95,
        mrp: 120,
        badge: 'Streak-Free',
        subtitle: '500ml Spray Bottle',
        description: 'Streak-free window and mirror cleaner with anti-dust shield.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfVjmNjoL8CHcJeSmxKyV0jM_r3L1ALbHzQKOtQaTY4--wBJ3mPLjNAWYOH2i9at_nj19eDhSnqLv0fR4vpdF_oo-JLd8rRVmt80QenxVsBDg-1u-y_QIJ-vW9kg5JR87_vro00yfkexxSXWqEZw-4ZVJaFkF0XAwhUkYi1uPFwtnjHztCduxUcgTl6BMVhmFeuvWrR_eKwCL_N4y5bixDXmnMd-ubk9ELsuKwvYeIbYBYeVJwC-mO',
        stockQuantity: 150,
        packSizes: ['500ml', '1L'],
      },
      {
        name: 'SoftCare Liquid Handwash',
        category: 'Handwash',
        categorySlug: 'handwash',
        categoryRef: categories[4]._id,
        price: 420,
        mrp: 550,
        badge: 'Institutional',
        subtitle: '5L Refill Container',
        description: 'Moisturizing aloe hand soap concentrate for high-traffic dispensers.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7IF4_ngv62in4wn0uXeJyZB5HZtXpSTm4JTxkYglzYrE1CsIF_Iq5bv-aIjgFXPImk3Wmel-ohxvYiVDfbp038rcPDofZH0zvQ-lKaj4ym9AdDu9HY4S_cIj38iXLXRjAEGoZzwdboHoNx_f0mxn_EvtMZ-KyOhRR22T9bK4_gV1GOez-SV5i2SZ9GeYUjAQRrabOJECK6iECN0SEIUy8Z2Qrv1E3KFyAuu6Jsmau8aEr0th_lj6n',
        stockQuantity: 85,
        packSizes: ['5L'],
      },
      {
        name: 'RS Master Barrel 200L',
        category: 'Bulk Drums',
        categorySlug: 'bulk-drums',
        categoryRef: categories[5]._id,
        price: 14500,
        mrp: 18000,
        badge: 'Save ₹3,500',
        subtitle: 'Industrial Barrel',
        description: '200 Litre industrial drum with tamper-proof seal for factory procurement.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNr66zlhIrUzGurptkQYA93OEcc1VXgahlM0JmA9InCJ5rctZ9LPlbSqKW9fyIn2_fxSCMsqGRkevrp7nz_q7tgLC54K6avCWzJf3cakk1BW7pW_ZAfSAh236c2jX-FlvFGyOUYW2JjWHwCTZjA_CTo2mwx7N2IHZPmWju2U6rmSgu-p8xmxHftLVHGWFWMQYAr-M1lnB7jGJZM6zomx7eff2qIizM7_yTELQsxDNP58neTP3xdD4P',
        stockQuantity: 25,
        packSizes: ['200L'],
      },
    ]);
    console.log(`2. Seeded ${products.length} Products.`);

    // 3. Seed Users (Shopkeeper Buyer + Admin)
    const buyer = await Shopkeeper.create({
      name: 'Indiranagar Facilities Ltd',
      mobile: '9876543210',
      shopName: 'Indiranagar Facilities & Maintenance Ltd',
      address: 'Plot 42, 10th Main, Indiranagar, Bengaluru - 560038',
      gstin: '29AABCU9603R1ZM',
      email: 'procurement@indiranagarfacilities.com',
      role: 'buyer',
      outstandingBalance: 3450,
      creditLimit: 100000,
    });

    const admin = await Shopkeeper.create({
      name: 'RS Factory Administrator',
      mobile: '9999999999',
      shopName: 'RS Industries Main Factory Dispatch',
      address: 'Peenya 1st Stage, Industrial Suburb, Bengaluru - 560058',
      gstin: '29AABCU9603R1ZM',
      role: 'admin',
    });
    console.log('3. Seeded Buyer and Admin Users.');

    // 4. Seed Saved Delivery Addresses
    const addresses = await Address.insertMany([
      {
        shopkeeper: buyer._id,
        facilityName: 'Indiranagar Central Warehouse (Default)',
        streetAddress: 'Plot 42, 10th Main, Indiranagar',
        landmark: 'Near Indiranagar Metro Station',
        pincode: '560038',
        city: 'Bengaluru',
        state: 'Karnataka',
        contactPhone: '+919876543210',
        isDefault: true,
      },
      {
        shopkeeper: buyer._id,
        facilityName: 'Peenya Factory Plant',
        streetAddress: 'Shed 14, Peenya 1st Stage',
        landmark: 'Near TVS Cross Road',
        pincode: '560058',
        city: 'Bengaluru',
        state: 'Karnataka',
        contactPhone: '+919876599887',
        isDefault: false,
      },
    ]);
    console.log(`4. Seeded ${addresses.length} Facility Addresses.`);

    // 5. Seed Chemical Inventory Batches & QC Lab Certificates
    const batches = await InventoryBatch.insertMany([
      {
        product: products[0]._id,
        productName: products[0].name,
        batchNumber: 'BATCH-2026-091',
        mfgDate: new Date(),
        expDate: new Date(Date.now() + 86400000 * 365),
        qcCertificateNo: 'COA-ISO-9941',
        batchQuantity: 1000,
      },
      {
        product: products[7]._id,
        productName: products[7].name,
        batchNumber: 'BATCH-DRUM-402',
        mfgDate: new Date(),
        expDate: new Date(Date.now() + 86400000 * 730),
        qcCertificateNo: 'COA-ISO-8812',
        batchQuantity: 50,
      },
    ]);
    console.log(`5. Seeded ${batches.length} Chemical QC Inventory Batches.`);

    // 6. Seed Orders
    const order = await Order.create({
      orderId: 'RS-ORD-8942',
      shopkeeper: buyer._id,
      buyerName: buyer.name,
      buyerPhone: buyer.mobile,
      subtotal: 2829,
      gstAmount: 621,
      totalAmount: 3450,
      paymentMethod: 'UPI',
      deliveryAddress: addresses[0].streetAddress + ', ' + addresses[0].city,
      driverName: 'Ramesh Kumar (RS Dispatch)',
      driverPhone: '+919876512345',
      status: 'dispatching',
      items: [
        {
          product: products[0]._id,
          name: products[0].name,
          subtitle: products[0].subtitle,
          quantity: 10,
          price: products[0].price,
        },
        {
          product: products[2]._id,
          name: products[2].name,
          subtitle: products[2].subtitle,
          quantity: 5,
          price: products[2].price,
        },
      ],
    });
    console.log('6. Seeded Sample B2B Procurement Order.');

    // 7. Seed Payment Transaction Logs
    await Payment.create({
      order: order._id,
      orderId: order.orderId,
      shopkeeper: buyer._id,
      amount: order.totalAmount,
      paymentMethod: 'UPI',
      transactionId: 'TXN-UPI-994102',
      status: 'success',
    });
    console.log('7. Seeded Payment Log.');

    // 8. Seed Net 30 B2B Credit Ledger & Tax Invoices
    await Ledger.create({
      invoiceId: 'INV-2026-8942',
      shopkeeper: buyer._id,
      order: order._id,
      amount: order.totalAmount,
      gstTax: order.gstAmount,
      dueDate: new Date(Date.now() + 86400000 * 30),
      status: 'unpaid',
      terms: 'Net 30 Days',
    });
    console.log('8. Seeded B2B Credit Ledger Invoice.');

    // 9. Seed Cart
    await Cart.create({
      shopkeeper: buyer._id,
      items: [{ product: products[0]._id, quantity: 2, size: '500ml' }],
      couponCode: 'RSBULK100',
      gstRequested: true,
    });
    console.log('9. Seeded Buyer Shopping Cart.');

    // 10. Seed Customer Support Tickets
    await SupportTicket.create({
      ticketId: 'TKT-8841',
      shopkeeper: buyer._id,
      buyerName: buyer.name,
      subject: 'GST Invoice E-Filing Confirmation',
      issueType: 'GST Invoice',
      status: 'resolved',
      message: 'Can you please resend the 18% IGST credit invoice for Order #RS-ORD-8942?',
    });
    console.log('10. Seeded Support Ticket.');

    // 11. Seed Home Banners
    await Banner.insertMany([
      {
        title: 'Save up to 45% on Bulk Packs',
        subtitle: 'Direct from Factory Dispatch',
        badge: 'Wholesale B2B',
        discountPercent: 45,
        targetCategory: 'Floor Cleaners',
        image: products[0].image,
      },
      {
        title: 'Hospital Grade Disinfectants',
        subtitle: '99.99% Certified Germ Shield',
        badge: 'Lab Certified',
        discountPercent: 30,
        targetCategory: 'Disinfectants',
        image: products[2].image,
      },
    ]);
    console.log('11. Seeded Promotional Banners.');

    // 12. Seed Verified Reviews
    await Review.create({
      product: products[0]._id,
      shopkeeper: buyer._id,
      buyerName: buyer.name,
      rating: 5,
      comment: 'Excellent citrus floor cleaner! Removed tough grease stains from ourIndiranagar facility.',
      verifiedPurchase: true,
    });
    console.log('12. Seeded Verified Reviews.');

    // 13. Seed Push Notifications
    await Notification.create({
      shopkeeper: buyer._id,
      title: 'Order Dispatched!',
      message: 'Your B2B order #RS-ORD-8942 is en route via Express 25-minute dispatch.',
      type: 'order',
    });
    console.log('13. Seeded Notifications.');

    // 14. Seed Security Audit Logs
    await AuditLog.create({
      admin: admin._id,
      adminName: admin.name,
      action: 'UPDATE_ORDER_STATUS',
      targetModule: 'Orders',
      details: 'Changed status of Order #RS-ORD-8942 to DISPATCHING',
    });
    console.log('14. Seeded Security Audit Log.');

    console.log('\n🎉 ALL 14 COLLECTIONS SEEDED SUCCESSFULLY!');
    console.log('👉 You can log in with any mobile number and test OTP: 12345');
    process.exit(0);
  } catch (err) {
    console.error('Master Seeding Error:', err);
    process.exit(1);
  }
}

runMasterSeed();
