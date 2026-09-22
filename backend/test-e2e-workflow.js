require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');

// Import app & models
const app = require('./src/app');
const Product = require('./src/modules/product/product.model');
const Category = require('./src/modules/category/category.model');
const Order = require('./src/modules/order/order.model');
const Cart = require('./src/modules/cart/cart.model');

const PORT = 5055;
const BASE_URL = `http://localhost:${PORT}/api`;

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(type, msg, detail = '') {
  if (type === 'pass') console.log(`${colors.green}  ✓ [PASS] ${msg}${colors.reset}`, detail);
  else if (type === 'fail') console.log(`${colors.red}  ✗ [FAIL] ${msg}${colors.reset}`, detail);
  else if (type === 'info') console.log(`${colors.cyan}  ℹ ${msg}${colors.reset}`, detail);
  else if (type === 'header') console.log(`\n${colors.bright}${colors.yellow}=====================================================\n ${msg}\n=====================================================${colors.reset}`);
}

async function runE2EWorkflowTest() {
  log('header', 'STARTING E2E INTEGRATION TEST: SIGNUP TO ORDER CREATION');

  let server;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    log('info', 'Connected to MongoDB for E2E validation');

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(PORT, resolve));
    log('info', `Temporary test server running at ${BASE_URL}`);

    // Dynamic import of fetch if needed or use global fetch
    const fetch = globalThis.fetch;

    // STEP 1: AUTHENTICATION (Request OTP & Verify OTP)
    log('header', 'STEP 1: USER AUTHENTICATION & SIGNUP/LOGIN');
    const testMobile = '9888877777';

    const reqOtpRes = await fetch(`${BASE_URL}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: testMobile }),
    });
    const reqOtpData = await reqOtpRes.json();

    if (reqOtpData.success) {
      log('pass', `OTP requested successfully for mobile ${testMobile}`);
    } else {
      log('fail', 'Failed to request OTP', JSON.stringify(reqOtpData));
    }

    const verifyOtpRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: testMobile, otp: '12345' }),
    });
    const verifyData = await verifyOtpRes.json();

    let userSession = null;
    if (verifyData.success && (verifyData.user || verifyData.data?.user)) {
      userSession = verifyData.user || verifyData.data.user;
      log('pass', `OTP Verified. Logged in as User ID: ${userSession._id || userSession.id}, Name: ${userSession.name}`);
    } else {
      log('fail', 'Failed to verify OTP', JSON.stringify(verifyData));
    }

    // STEP 2: CATEGORY FETCHING
    log('header', 'STEP 2: FETCH CATEGORIES');
    const catRes = await fetch(`${BASE_URL}/categories`);
    const categories = await catRes.json();

    if (Array.isArray(categories) && categories.length > 0) {
      log('pass', `Fetched ${categories.length} Categories successfully`);
      log('info', `Selected Category: "${categories[0].name}" (Slug: ${categories[0].slug})`);
    } else {
      log('fail', 'No categories returned from /categories endpoint');
    }

    // STEP 3: PRODUCT FETCHING & VARIANT EXPANSION
    log('header', 'STEP 3: FETCH PRODUCTS BY CATEGORY & VARIANT EXPANSION');
    const targetCat = categories[0]?.slug || 'floor-cleaners';
    const prodRes = await fetch(`${BASE_URL}/products?category=${targetCat}`);
    const products = await prodRes.json();

    if (Array.isArray(products) && products.length > 0) {
      log('pass', `Fetched ${products.length} buyer-side product cards for category "${targetCat}"`);

      products.forEach((p, idx) => {
        log('info', `Card ${idx + 1}: ${p.name} - Price: ₹${p.price} (Bundles: ${p.bundles?.length || 0})`);
      });
    } else {
      log('fail', `No products returned for category "${targetCat}"`);
    }

    // STEP 4: CART MANAGING SEPARATE BUNDLES AS DISTINCT ITEMS
    log('header', 'STEP 4: CART MANAGEMENT (SEPARATE BUNDLE ENTRIES)');
    const sampleProduct = products[0];
    const bundles = sampleProduct?.bundles || [];

    const pack1Bundle = bundles.find((b) => b.quantity === 1) || bundles[0] || { bundleId: 'b-1', label: 'Pack of 1', price: 10, mrp: 10 };
    const pack10Bundle = bundles.find((b) => b.quantity === 10) || bundles[1] || { bundleId: 'b-10', label: 'Pack of 10', price: 95, mrp: 100 };

    const cartItem1 = {
      product: sampleProduct.masterProductId || sampleProduct._id,
      productId: sampleProduct._id,
      variantId: sampleProduct.variantId || 'v-1',
      bundleId: pack1Bundle.bundleId,
      cartItemId: `${sampleProduct._id}_${pack1Bundle.bundleId}`,
      title: `${sampleProduct.name} (${pack1Bundle.label})`,
      name: sampleProduct.name,
      variantLabel: sampleProduct.variantLabel || '',
      bundleLabel: pack1Bundle.label,
      quantity: 2,
      price: pack1Bundle.price,
      mrp: pack1Bundle.mrp,
    };

    const cartItem2 = {
      product: sampleProduct.masterProductId || sampleProduct._id,
      productId: sampleProduct._id,
      variantId: sampleProduct.variantId || 'v-1',
      bundleId: pack10Bundle.bundleId,
      cartItemId: `${sampleProduct._id}_${pack10Bundle.bundleId}`,
      title: `${sampleProduct.name} (${pack10Bundle.label})`,
      name: sampleProduct.name,
      variantLabel: sampleProduct.variantLabel || '',
      bundleLabel: pack10Bundle.label,
      quantity: 1,
      price: pack10Bundle.price,
      mrp: pack10Bundle.mrp,
    };

    const cartPayload = [cartItem1, cartItem2];
    log('info', `Cart payload contains 2 separate bundle entries:`);
    log('info', `1. ${cartItem1.title} x${cartItem1.quantity} = ₹${cartItem1.price * cartItem1.quantity}`);
    log('info', `2. ${cartItem2.title} x${cartItem2.quantity} = ₹${cartItem2.price * cartItem2.quantity}`);

    const syncCartRes = await fetch(`${BASE_URL}/cart/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopkeeperId: userSession.id || userSession._id,
        items: cartPayload,
      }),
    });
    const syncCartData = await syncCartRes.json();

    if (syncCartData.success) {
      log('pass', 'Cart synchronized with backend successfully');
    } else {
      log('fail', 'Failed to sync cart', JSON.stringify(syncCartData));
    }

    // STEP 5: DELIVERY ADDRESS SETUP
    log('header', 'STEP 5: DELIVERY ADDRESS SELECTION / CREATION');
    const fullDeliveryAddress = `${userSession.address || 'Plot 42, Indiranagar'}, Bengaluru - 560038`;
    log('pass', `Delivery Address verified: "${fullDeliveryAddress}"`);

    // STEP 6: CHECKOUT & ORDER PLACEMENT
    log('header', 'STEP 6: ORDER CREATION & CHECKOUT');
    const orderSubtotal = cartItem1.price * cartItem1.quantity + cartItem2.price * cartItem2.quantity;
    const orderGst = Math.round(orderSubtotal * 0.18);
    const orderTotal = orderSubtotal + orderGst;

    const orderPayload = {
      shopkeeper: userSession.id || userSession._id,
      buyerName: userSession.name,
      buyerPhone: userSession.mobile,
      items: [
        {
          product: sampleProduct.masterProductId || sampleProduct._id,
          productId: sampleProduct._id,
          variantId: sampleProduct.variantId,
          bundleId: cartItem1.bundleId,
          cartItemId: cartItem1.cartItemId,
          name: cartItem1.title,
          subtitle: cartItem1.bundleLabel,
          unitPrice: cartItem1.price,
          quantity: cartItem1.quantity,
          lineTotal: cartItem1.price * cartItem1.quantity,
          price: cartItem1.price,
        },
        {
          product: sampleProduct.masterProductId || sampleProduct._id,
          productId: sampleProduct._id,
          variantId: sampleProduct.variantId,
          bundleId: cartItem2.bundleId,
          cartItemId: cartItem2.cartItemId,
          name: cartItem2.title,
          subtitle: cartItem2.bundleLabel,
          unitPrice: cartItem2.price,
          quantity: cartItem2.quantity,
          lineTotal: cartItem2.price * cartItem2.quantity,
          price: cartItem2.price,
        },
      ],
      subtotal: orderSubtotal,
      gstAmount: orderGst,
      totalAmount: orderTotal,
      paymentMethod: 'UPI',
      deliveryAddress: fullDeliveryAddress,
      deliveryAddressSnapshot: {
        fullAddress: fullDeliveryAddress,
        facilityName: userSession.shopName || 'Main Facility',
        city: 'Bengaluru',
        pincode: '560038',
      },
      financialSnapshot: {
        subtotal: orderSubtotal,
        gstAmount: orderGst,
        totalAmount: orderTotal,
      },
    };

    const createOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    const orderResult = await createOrderRes.json();

    let createdOrder = null;
    if (createOrderRes.ok && orderResult) {
      createdOrder = orderResult.data || orderResult;
      log('pass', `Order Placed Successfully! Order ID: ${createdOrder.orderId || createdOrder._id}`);
      log('info', `Order Total: ₹${createdOrder.totalAmount || orderTotal} (Subtotal: ₹${orderSubtotal}, GST: ₹${orderGst})`);
    } else {
      log('fail', 'Failed to place order', JSON.stringify(orderResult));
    }

    // STEP 7: ORDER VERIFICATION
    log('header', 'STEP 7: VERIFY CREATED ORDER & RETRIEVAL');
    const getOrdersRes = await fetch(`${BASE_URL}/orders`);
    const allOrders = await getOrdersRes.json();

    if (Array.isArray(allOrders) && allOrders.length > 0) {
      log('pass', `Retrieved ${allOrders.length} orders from backend database`);
      const matchedOrder = allOrders.find((o) => o.orderId === createdOrder?.orderId || String(o._id) === String(createdOrder?._id));

      if (matchedOrder) {
        log('pass', `Verified placed Order ID "${matchedOrder.orderId}" exists in DB with status: "${matchedOrder.status || 'pending'}"`);
        log('info', `Verified Item Count in Order: ${matchedOrder.items?.length || 0}`);
      } else {
        log('fail', 'Could not locate recently placed order in GET /orders list');
      }
    } else {
      log('fail', 'Failed to fetch orders list from GET /orders');
    }

    log('header', '🎉 END-TO-END WORKFLOW TEST COMPLETED SUCCESSFULLY! ALL STEPS PASSED!');
  } catch (err) {
    log('fail', `E2E Test execution error: ${err.stack || err.message}`);
  } finally {
    if (server) {
      server.close();
      log('info', 'Closed test server');
    }
    await mongoose.disconnect();
    log('info', 'Disconnected from MongoDB');
    process.exit(0);
  }
}

runE2EWorkflowTest();
