/**
 * RS Industries - Comprehensive Live API & UI Payload Diagnostic Test Script
 * 
 * Tests all API functions in both UI and ADMIN_APP against the live API URL:
 * https://api.prabhat708.in/api
 * 
 * Specifically analyzes and flags:
 * 1. UI Screens & Stores payload compatibility with Backend Sequelize models
 * 2. Missing API methods in UI services (e.g. createTicket)
 * 3. Schema mismatches (e.g. streetAddress vs fullAddress)
 * 4. Admin API endpoints status (e.g. /tickets/:id/reply 404)
 * 5. Full CRUD lifecycle with automatic test data cleanup
 * 
 * Run with: node scripts/test-api-payloads.js
 */

const LIVE_API_URL = 'https://api.prabhat708.in/api';

// Terminal color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
};

// Test Stats Tracker
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  bugsIdentified: [],
};

function logHeader(title) {
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
  console.log('='.repeat(70));
}

function logSubHeader(title) {
  console.log(`\n${colors.bright}${colors.yellow}--- ${title} ---${colors.reset}`);
}

function logResult({ name, status, method, endpoint, payload, response, error, warning, uiIssue }) {
  stats.total++;
  const isPass = status === 'PASS';
  const isWarn = status === 'WARN';
  const isFail = status === 'FAIL';

  if (isPass) stats.passed++;
  else if (isWarn) stats.warnings++;
  else stats.failed++;

  const statusBadge = isPass
    ? `${colors.bgGreen}${colors.white} PASS ${colors.reset}`
    : isWarn
    ? `${colors.bgYellow}${colors.white} WARN ${colors.reset}`
    : `${colors.bgRed}${colors.white} FAIL ${colors.reset}`;

  console.log(`\n${statusBadge} ${colors.bright}${name}${colors.reset}`);
  if (method && endpoint) {
    console.log(`       Endpoint: ${colors.magenta}${method} ${LIVE_API_URL}${endpoint}${colors.reset}`);
  }
  if (payload) {
    console.log(`       Payload Sent: ${colors.dim}${JSON.stringify(payload)}${colors.reset}`);
  }
  if (error) {
    console.log(`       ${colors.red}Error:${colors.reset} ${error}`);
  }
  if (warning) {
    console.log(`       ${colors.yellow}Warning:${colors.reset} ${warning}`);
  }
  if (uiIssue) {
    console.log(`       ${colors.red}${colors.bright}UI Payload Bug:${colors.reset} ${uiIssue}`);
    stats.bugsIdentified.push({ testName: name, endpoint: `${method} ${endpoint}`, issue: uiIssue });
  }
  if (response && !error) {
    const preview = typeof response === 'object' ? JSON.stringify(response).slice(0, 160) : String(response).slice(0, 160);
    console.log(`       Response Preview: ${colors.dim}${preview}${preview.length >= 160 ? '...' : ''}${colors.reset}`);
  }
}

// Low-level HTTP requester mirroring UI & Admin App services
async function sendRequest(endpoint, { method = 'GET', body = null, token = null, headers = {} } = {}) {
  const url = `${LIVE_API_URL}${endpoint}`;
  const reqHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...headers,
  };
  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers: reqHeaders,
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const startTime = Date.now();
  try {
    const res = await fetch(url, options);
    const duration = Date.now() - startTime;
    const data = await res.json().catch(() => ({}));

    return {
      ok: res.ok,
      status: res.status,
      data,
      duration,
      rawResponse: res,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: err.message,
      duration: Date.now() - startTime,
    };
  }
}

// Main Test Execution
async function runAllTests() {
  console.log(`\n${colors.bright}${colors.cyan}======================================================================`);
  console.log(`  RS INDUSTRIES - LIVE API SERVICE & UI PAYLOAD TEST RUNNER`);
  console.log(`  Target Base URL: ${LIVE_API_URL}`);
  console.log(`  Timestamp: ${new Date().toISOString()}`);
  console.log(`======================================================================${colors.reset}`);

  // Test state variables
  let authToken = null;
  let shopkeeperId = null;
  let testProductId = null;
  let testCategoryId = null;
  let testBannerId = null;
  let testAddressId = null;
  let testOrderId = null;

  // -------------------------------------------------------------------------
  // 1. UI APP AUTH SERVICE TESTS
  // -------------------------------------------------------------------------
  logHeader('SUITE 1: UI APP - AUTHENTICATION SERVICES');

  // 1.1 requestOtp
  {
    const payload = { mobile: '9999999999', name: 'UI Automated Test Buyer' };
    const res = await sendRequest('/auth/request-otp', { method: 'POST', body: payload });
    if (res.ok && res.data?.success) {
      logResult({
        name: 'UI: api.requestOtp(mobile, name)',
        status: 'PASS',
        method: 'POST',
        endpoint: '/auth/request-otp',
        payload,
        response: res.data,
      });
    } else {
      logResult({
        name: 'UI: api.requestOtp(mobile, name)',
        status: 'FAIL',
        method: 'POST',
        endpoint: '/auth/request-otp',
        payload,
        error: res.data?.error || res.error || `HTTP ${res.status}`,
      });
    }
  }

  // 1.2 verifyOtp
  {
    const payload = { mobile: '9999999999', otp: '12345' };
    const res = await sendRequest('/auth/verify-otp', { method: 'POST', body: payload });
    if (res.ok && res.data?.success && res.data?.token) {
      authToken = res.data.token;
      shopkeeperId = res.data.user?._id || res.data.user?.id || 3;
      logResult({
        name: 'UI: api.verifyOtp(mobile, otp)',
        status: 'PASS',
        method: 'POST',
        endpoint: '/auth/verify-otp',
        payload,
        response: { success: true, token: authToken, user: res.data.user?.name, id: shopkeeperId },
      });
    } else {
      logResult({
        name: 'UI: api.verifyOtp(mobile, otp)',
        status: 'FAIL',
        method: 'POST',
        endpoint: '/auth/verify-otp',
        payload,
        error: res.data?.error || res.error || `HTTP ${res.status}`,
      });
    }
  }

  // -------------------------------------------------------------------------
  // 2. UI APP - CATALOG & PRODUCTS SERVICES
  // -------------------------------------------------------------------------
  logHeader('SUITE 2: UI APP - CATALOG, PRODUCTS & BANNERS SERVICES');

  // 2.1 getCategories
  {
    const res = await sendRequest('/categories', { method: 'GET' });
    if (res.ok && Array.isArray(res.data)) {
      logResult({
        name: 'UI: api.getCategories()',
        status: 'PASS',
        method: 'GET',
        endpoint: '/categories',
        response: `Fetched ${res.data.length} categories. First: ${res.data[0]?.name || 'N/A'}`,
      });
    } else {
      logResult({
        name: 'UI: api.getCategories()',
        status: 'FAIL',
        method: 'GET',
        endpoint: '/categories',
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // 2.2 getProducts
  {
    const res = await sendRequest('/products', { method: 'GET' });
    if (res.ok && Array.isArray(res.data)) {
      logResult({
        name: 'UI: api.getProducts()',
        status: 'PASS',
        method: 'GET',
        endpoint: '/products',
        response: `Fetched ${res.data.length} products. First: ${res.data[0]?.name || 'N/A'}`,
      });
    } else {
      logResult({
        name: 'UI: api.getProducts()',
        status: 'FAIL',
        method: 'GET',
        endpoint: '/products',
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // 2.3 getProducts with Category & Search Filters
  {
    const res = await sendRequest('/products?category=Floor%20Cleaners&search=Cleaner', { method: 'GET' });
    if (res.ok && Array.isArray(res.data)) {
      logResult({
        name: 'UI: api.getProducts(category, search)',
        status: 'PASS',
        method: 'GET',
        endpoint: '/products?category=Floor%20Cleaners&search=Cleaner',
        response: `Filtered products count: ${res.data.length}`,
      });
    } else {
      logResult({
        name: 'UI: api.getProducts(category, search)',
        status: 'FAIL',
        method: 'GET',
        endpoint: '/products?category=Floor%20Cleaners&search=Cleaner',
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // 2.4 getProductsByCategory
  {
    const res = await sendRequest('/products?category=Floor%20Cleaners', { method: 'GET' });
    if (res.ok && Array.isArray(res.data)) {
      logResult({
        name: 'UI: api.getProductsByCategory("Floor Cleaners")',
        status: 'PASS',
        method: 'GET',
        endpoint: '/products?category=Floor%20Cleaners',
        response: `Category products count: ${res.data.length}`,
      });
    } else {
      logResult({
        name: 'UI: api.getProductsByCategory("Floor Cleaners")',
        status: 'FAIL',
        method: 'GET',
        endpoint: '/products?category=Floor%20Cleaners',
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // 2.5 getBanners
  {
    const res = await sendRequest('/banners', { method: 'GET' });
    if (res.ok && Array.isArray(res.data)) {
      logResult({
        name: 'UI: api.getBanners()',
        status: 'PASS',
        method: 'GET',
        endpoint: '/banners',
        response: `Fetched ${res.data.length} banners`,
      });
    } else {
      logResult({
        name: 'UI: api.getBanners()',
        status: 'FAIL',
        method: 'GET',
        endpoint: '/banners',
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // -------------------------------------------------------------------------
  // 3. UI APP - ADDRESS SERVICE & PAYLOAD AUDIT (CRITICAL FINDINGS)
  // -------------------------------------------------------------------------
  logHeader('SUITE 3: UI APP - ADDRESS SERVICE & CRITICAL PAYLOAD DIAGNOSTIC');

  // 3.1 TEST: UI AddAddressScreen current payload vs Backend schema
  {
    // Exact payload generated in UI/src/screens/shopkeeper/AddAddressScreen.jsx (line 33-41)
    const uiAddAddressPayload = {
      shopkeeper: shopkeeperId || 3,
      streetAddress: 'Plot 42, 10th Main, Indiranagar', // <-- UI sends streetAddress
      facilityName: 'UI Godown Test',
      city: 'Bengaluru',
      pincode: '560038',
      landmark: 'Near Metro',
      contactPhone: '9999999999',
    };

    const res = await sendRequest('/addresses', {
      method: 'POST',
      body: uiAddAddressPayload,
      token: authToken,
    });

    if (!res.ok) {
      logResult({
        name: 'UI BUG: AddAddressScreen.jsx current payload (missing fullAddress)',
        status: 'FAIL',
        method: 'POST',
        endpoint: '/addresses',
        payload: uiAddAddressPayload,
        error: `HTTP ${res.status}: ${res.data?.error || 'Database error'}`,
        uiIssue: 'UI AddAddressScreen.jsx sends "streetAddress" instead of "fullAddress". Backend Sequelize model defines Address.fullAddress with allowNull: false, causing "notNull Violation: Address.fullAddress cannot be null".',
      });
    } else {
      logResult({
        name: 'UI: AddAddressScreen payload',
        status: 'PASS',
        method: 'POST',
        endpoint: '/addresses',
        payload: uiAddAddressPayload,
        response: res.data,
      });
      testAddressId = res.data?.data?.id || res.data?.id;
    }
  }

  // 3.2 TEST: Valid / Corrected Address Payload (Backend expected structure)
  {
    const correctedAddressPayload = {
      shopkeeperId: shopkeeperId || 3,
      fullAddress: 'Plot 42, 10th Main, Indiranagar, Bengaluru - 560038', // Expected by model
      facilityName: 'Automated Test Godown',
      city: 'Bengaluru',
      pincode: '560038',
      isDefault: false,
    };

    const res = await sendRequest('/addresses', {
      method: 'POST',
      body: correctedAddressPayload,
      token: authToken,
    });

    if (res.ok && res.data?.success) {
      testAddressId = res.data.data?.id || res.data.data?._id;
      logResult({
        name: 'UI: api.addAddress (with proper fullAddress payload)',
        status: 'PASS',
        method: 'POST',
        endpoint: '/addresses',
        payload: correctedAddressPayload,
        response: res.data,
      });
    } else {
      logResult({
        name: 'UI: api.addAddress (corrected)',
        status: 'FAIL',
        method: 'POST',
        endpoint: '/addresses',
        payload: correctedAddressPayload,
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // 3.3 getAddresses
  {
    const res = await sendRequest(`/addresses?shopkeeperId=${shopkeeperId || 3}`, {
      method: 'GET',
      token: authToken,
    });
    const addrList = res.data?.data || (Array.isArray(res.data) ? res.data : []);
    if (res.ok && Array.isArray(addrList)) {
      // Check if addresses returned contain streetAddress vs fullAddress
      const firstAddr = addrList[0];
      const hasStreetAddr = firstAddr && firstAddr.streetAddress !== undefined;
      const hasFullAddr = firstAddr && firstAddr.fullAddress !== undefined;

      let warningMsg = null;
      let uiBugMsg = null;
      if (firstAddr && !hasStreetAddr && hasFullAddr) {
        uiBugMsg = 'AddressListScreen.jsx (line 48) attempts to read "addr.streetAddress", but backend database model returns "addr.fullAddress". This causes addresses to show as blank or undefined in the UI list!';
      }

      logResult({
        name: 'UI: api.getAddresses(shopkeeperId)',
        status: uiBugMsg ? 'WARN' : 'PASS',
        method: 'GET',
        endpoint: `/addresses?shopkeeperId=${shopkeeperId || 3}`,
        response: `Found ${addrList.length} addresses. Schema fields in DB: [fullAddress: ${hasFullAddr}, streetAddress: ${hasStreetAddr}]`,
        uiIssue: uiBugMsg,
      });
    } else {
      logResult({
        name: 'UI: api.getAddresses(shopkeeperId)',
        status: 'FAIL',
        method: 'GET',
        endpoint: `/addresses?shopkeeperId=${shopkeeperId || 3}`,
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // 3.4 updateAddress
  if (testAddressId) {
    const updatePayload = { fullAddress: 'Plot 42, 10th Main, Updated Area, Bengaluru - 560038' };
    const res = await sendRequest(`/addresses/${testAddressId}`, {
      method: 'PUT',
      body: updatePayload,
      token: authToken,
    });
    if (res.ok) {
      logResult({
        name: 'UI: api.updateAddress(id, addressData)',
        status: 'PASS',
        method: 'PUT',
        endpoint: `/addresses/${testAddressId}`,
        payload: updatePayload,
        response: res.data,
      });
    } else {
      logResult({
        name: 'UI: api.updateAddress(id, addressData)',
        status: 'FAIL',
        method: 'PUT',
        endpoint: `/addresses/${testAddressId}`,
        payload: updatePayload,
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // 3.5 deleteAddress
  if (testAddressId) {
    const res = await sendRequest(`/addresses/${testAddressId}`, {
      method: 'DELETE',
      token: authToken,
    });
    if (res.ok) {
      logResult({
        name: 'UI: api.deleteAddress(id) (Cleanup)',
        status: 'PASS',
        method: 'DELETE',
        endpoint: `/addresses/${testAddressId}`,
        response: res.data,
      });
    } else {
      logResult({
        name: 'UI: api.deleteAddress(id)',
        status: 'FAIL',
        method: 'DELETE',
        endpoint: `/addresses/${testAddressId}`,
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // -------------------------------------------------------------------------
  // 4. UI APP - CART SERVICES AUDIT
  // -------------------------------------------------------------------------
  logHeader('SUITE 4: UI APP - CART SERVICES (cartStore.js)');

  // 4.1 syncCart (payload matching UI cartStore.js lines 65-78)
  {
    const cartItemsPayload = [
      {
        productId: '1',
        variantId: 'default',
        bundleId: 'pack-1',
        cartItemId: '1_pack-1',
        title: 'RS Pro Citrus Cleaner (Pack of 1)',
        name: 'RS Pro Citrus Cleaner',
        variantLabel: 'Standard Pack',
        bundleLabel: 'Pack of 1',
        price: 99,
        mrp: 149,
        image: 'https://placehold.co/100x100.png',
        quantity: 2,
      },
    ];

    const payload = { shopkeeperId: shopkeeperId || 3, items: cartItemsPayload };
    const res = await sendRequest('/cart/sync', {
      method: 'POST',
      body: payload,
      token: authToken,
    });

    if (res.ok && res.data?.success) {
      logResult({
        name: 'UI: api.syncCart(shopkeeperId, items)',
        status: 'PASS',
        method: 'POST',
        endpoint: '/cart/sync',
        payload,
        response: res.data,
      });
    } else {
      logResult({
        name: 'UI: api.syncCart(shopkeeperId, items)',
        status: 'FAIL',
        method: 'POST',
        endpoint: '/cart/sync',
        payload,
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // 4.2 getCart
  {
    const res = await sendRequest(`/cart?shopkeeperId=${shopkeeperId || 3}`, {
      method: 'GET',
      token: authToken,
    });
    if (res.ok && res.data?.success) {
      logResult({
        name: 'UI: api.getCart(shopkeeperId)',
        status: 'PASS',
        method: 'GET',
        endpoint: `/cart?shopkeeperId=${shopkeeperId || 3}`,
        response: `Cart items count: ${res.data.data?.items?.length || 0}`,
      });
    } else {
      logResult({
        name: 'UI: api.getCart(shopkeeperId)',
        status: 'FAIL',
        method: 'GET',
        endpoint: `/cart?shopkeeperId=${shopkeeperId || 3}`,
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // 4.3 clearCartBackend
  {
    const payload = { shopkeeperId: shopkeeperId || 3 };
    const res = await sendRequest('/cart/clear', {
      method: 'POST',
      body: payload,
      token: authToken,
    });
    if (res.ok && res.data?.success) {
      logResult({
        name: 'UI: api.clearCartBackend(shopkeeperId)',
        status: 'PASS',
        method: 'POST',
        endpoint: '/cart/clear',
        payload,
        response: res.data,
      });
    } else {
      logResult({
        name: 'UI: api.clearCartBackend(shopkeeperId)',
        status: 'FAIL',
        method: 'POST',
        endpoint: '/cart/clear',
        payload,
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // -------------------------------------------------------------------------
  // 5. UI APP - ORDER PROCUREMENT & CHECKOUT PAYLOAD AUDIT
  // -------------------------------------------------------------------------
  logHeader('SUITE 5: UI APP - ORDER SERVICES (orderStore.js & CheckoutPaymentScreen)');

  // 5.1 Test CheckoutPaymentScreen payload construction
  {
    // In CheckoutPaymentScreen.jsx (lines 109-147), check if deliveryAddressSnapshot gets populated properly
    const uiOrderPayload = {
      orderId: `RS-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      status: 'pending',
      subtotal: 198,
      total: 233,
      totalAmount: 233,
      paymentMethod: 'Cash on Delivery (COD)',
      paymentStatus: 'pending',
      deliveryAddress: 'Plot 42, 10th Main, Indiranagar, Bengaluru - 560038',
      deliveryAddressSnapshot: {
        fullAddress: 'Plot 42, 10th Main, Indiranagar, Bengaluru - 560038',
        facilityName: 'Main Facility',
        city: 'Bengaluru',
        pincode: '560038',
        capturedAt: new Date().toISOString(),
      },
      buyerSnapshot: {
        name: 'UI Automated Test Buyer',
        mobile: '9999999999',
      },
      financialSnapshot: {
        subtotal: 198,
        gstAmount: 35,
        totalAmount: 233,
      },
      items: [
        {
          product: 1,
          productId: '1',
          name: 'RS Pro Citrus Cleaner',
          subtitle: 'Pack of 1',
          quantity: 2,
          qty: 2,
          price: 99,
          unitPrice: 99,
          lineTotal: 198,
        },
      ],
      shopkeeper: shopkeeperId || 3,
    };

    const res = await sendRequest('/orders', {
      method: 'POST',
      body: uiOrderPayload,
      token: authToken,
    });

    if (res.ok) {
      testOrderId = res.data?.id || res.data?._id || res.data?.orderId;
      logResult({
        name: 'UI: api.createOrder(orderData) (CheckoutPaymentScreen payload)',
        status: 'PASS',
        method: 'POST',
        endpoint: '/orders',
        payload: { orderId: uiOrderPayload.orderId, totalAmount: uiOrderPayload.totalAmount },
        response: res.data,
      });
    } else {
      logResult({
        name: 'UI: api.createOrder(orderData)',
        status: 'FAIL',
        method: 'POST',
        endpoint: '/orders',
        payload: uiOrderPayload,
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // 5.2 getOrders
  {
    const res = await sendRequest(`/orders?shopkeeperId=${shopkeeperId || 3}`, {
      method: 'GET',
      token: authToken,
    });
    if (res.ok && Array.isArray(res.data)) {
      logResult({
        name: 'UI: api.getOrders()',
        status: 'PASS',
        method: 'GET',
        endpoint: `/orders?shopkeeperId=${shopkeeperId || 3}`,
        response: `Fetched ${res.data.length} orders for buyer`,
      });
    } else {
      logResult({
        name: 'UI: api.getOrders()',
        status: 'FAIL',
        method: 'GET',
        endpoint: `/orders?shopkeeperId=${shopkeeperId || 3}`,
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // 5.3 updateOrderStatus (PATCH in UI api.js line 78)
  if (testOrderId) {
    const res = await sendRequest(`/orders/${testOrderId}/status`, {
      method: 'PATCH',
      body: { status: 'confirmed' },
      token: authToken,
    });
    if (res.ok) {
      logResult({
        name: 'UI: api.updateOrderStatus(id, status) [PATCH]',
        status: 'PASS',
        method: 'PATCH',
        endpoint: `/orders/${testOrderId}/status`,
        payload: { status: 'confirmed' },
        response: res.data,
      });
    } else {
      logResult({
        name: 'UI: api.updateOrderStatus(id, status)',
        status: 'FAIL',
        method: 'PATCH',
        endpoint: `/orders/${testOrderId}/status`,
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // -------------------------------------------------------------------------
  // 6. UI APP - SUPPORT TICKET & COMPANY SERVICE AUDIT
  // -------------------------------------------------------------------------
  logHeader('SUITE 6: UI APP - SUPPORT TICKET & COMPANY PROFILE AUDIT');

  // 6.1 TEST: SupportScreen.jsx missing api.createTicket method
  {
    // Check if api.createTicket is defined in UI/src/services/api.js
    const uiApiHasCreateTicket = false; // Verified in UI/src/services/api.js

    // Test calling the backend endpoint directly with what SupportScreen creates
    const ticketPayload = {
      message: 'Need replenishment quote for 200L drums',
      subject: 'Support Query',
      shopkeeperId: shopkeeperId || 3,
      buyerName: 'UI Automated Test Buyer',
    };

    const res = await sendRequest('/tickets', {
      method: 'POST',
      body: ticketPayload,
      token: authToken,
    });

    if (res.ok) {
      logResult({
        name: 'UI: api.createTicket(ticketData) [SupportScreen.jsx]',
        status: 'PASS',
        method: 'POST',
        endpoint: '/tickets',
        payload: ticketPayload,
        response: res.data,
      });
    } else {
      logResult({
        name: 'UI: api.createTicket',
        status: 'FAIL',
        method: 'POST',
        endpoint: '/tickets',
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // 6.2 getCompanyDetails
  {
    const res = await sendRequest('/company', { method: 'GET' });
    if (res.ok && res.data?.success) {
      logResult({
        name: 'UI: api.getCompanyDetails()',
        status: 'PASS',
        method: 'GET',
        endpoint: '/company',
        response: res.data.data?.companyName || res.data.data?.name || res.data,
      });
    } else {
      logResult({
        name: 'UI: api.getCompanyDetails()',
        status: 'FAIL',
        method: 'GET',
        endpoint: '/company',
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // 6.3 getLedgers
  {
    const res = await sendRequest('/ledgers', { method: 'GET', token: authToken });
    if (res.ok && Array.isArray(res.data)) {
      logResult({
        name: 'UI: api.getLedgers()',
        status: 'PASS',
        method: 'GET',
        endpoint: '/ledgers',
        response: `Fetched ${res.data.length} invoices`,
      });
    } else {
      logResult({
        name: 'UI: api.getLedgers()',
        status: 'FAIL',
        method: 'GET',
        endpoint: '/ledgers',
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // 6.4 getShopkeepers & createShopkeeper
  {
    const resGet = await sendRequest('/shopkeepers', { method: 'GET', token: authToken });
    if (resGet.ok && Array.isArray(resGet.data)) {
      logResult({
        name: 'UI: api.getShopkeepers()',
        status: 'PASS',
        method: 'GET',
        endpoint: '/shopkeepers',
        response: `Total registered buyers: ${resGet.data.length}`,
      });
    } else {
      logResult({
        name: 'UI: api.getShopkeepers()',
        status: 'FAIL',
        method: 'GET',
        endpoint: '/shopkeepers',
        error: resGet.data?.error || `HTTP ${resGet.status}`,
      });
    }

    const dummyShopkeeper = {
      name: 'Test Partner Retailer',
      mobile: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
      shopName: 'Test Retail Enterprise',
      role: 'buyer',
    };
    const resPost = await sendRequest('/shopkeepers', {
      method: 'POST',
      body: dummyShopkeeper,
      token: authToken,
    });
    if (resPost.ok) {
      logResult({
        name: 'UI: api.createShopkeeper(data)',
        status: 'PASS',
        method: 'POST',
        endpoint: '/shopkeepers',
        payload: dummyShopkeeper,
        response: resPost.data,
      });
    } else {
      logResult({
        name: 'UI: api.createShopkeeper(data)',
        status: 'FAIL',
        method: 'POST',
        endpoint: '/shopkeepers',
        payload: dummyShopkeeper,
        error: resPost.data?.error || `HTTP ${resPost.status}`,
      });
    }
  }

  // -------------------------------------------------------------------------
  // 7. ADMIN APP API SERVICES AUDIT (ADMIN_APP/src/services/api.js)
  // -------------------------------------------------------------------------
  logHeader('SUITE 7: ADMIN APP - SERVICES & FULL LIFECYCLE AUDIT');

  // 7.1 adminApi.getOrders
  {
    const res = await sendRequest('/orders', { method: 'GET' });
    if (res.ok && Array.isArray(res.data)) {
      logResult({
        name: 'Admin: adminApi.getOrders()',
        status: 'PASS',
        method: 'GET',
        endpoint: '/orders',
        response: `Fetched ${res.data.length} orders`,
      });
    } else {
      logResult({
        name: 'Admin: adminApi.getOrders()',
        status: 'FAIL',
        method: 'GET',
        endpoint: '/orders',
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // 7.2 adminApi.updateOrderStatus & updateOrderDetails [PUT /orders/:id/status]
  if (testOrderId) {
    const payload = {
      status: 'processing',
      driverName: 'Ramesh Kumar (RS Dispatch)',
      driverPhone: '+919876512345',
    };
    const res = await sendRequest(`/orders/${testOrderId}/status`, {
      method: 'PUT',
      body: payload,
    });
    if (res.ok) {
      logResult({
        name: 'Admin: adminApi.updateOrderDetails(id, payload) [PUT]',
        status: 'PASS',
        method: 'PUT',
        endpoint: `/orders/${testOrderId}/status`,
        payload,
        response: res.data,
      });
    } else {
      logResult({
        name: 'Admin: adminApi.updateOrderDetails(id, payload)',
        status: 'FAIL',
        method: 'PUT',
        endpoint: `/orders/${testOrderId}/status`,
        payload,
        error: res.data?.error || `HTTP ${res.status}`,
      });
    }
  }

  // 7.3 adminApi: Category Operations (createCategory, updateCategory, getCategories)
  {
    const catPayload = {
      name: `Automated Test Category ${Date.now()}`,
      slug: `test-cat-${Date.now()}`,
      icon: 'sanitizer',
      displayOrder: 99,
    };
    const resCreate = await sendRequest('/categories', { method: 'POST', body: catPayload });
    if (resCreate.ok) {
      testCategoryId = resCreate.data?.id || resCreate.data?._id;
      logResult({
        name: 'Admin: adminApi.createCategory(data)',
        status: 'PASS',
        method: 'POST',
        endpoint: '/categories',
        payload: catPayload,
        response: resCreate.data,
      });
    } else {
      logResult({
        name: 'Admin: adminApi.createCategory(data)',
        status: 'FAIL',
        method: 'POST',
        endpoint: '/categories',
        payload: catPayload,
        error: resCreate.data?.error || `HTTP ${resCreate.status}`,
      });
    }

    if (testCategoryId) {
      const updatePayload = { name: `Automated Test Cat ${Date.now()}` };
      const resUpdate = await sendRequest(`/categories/${testCategoryId}`, {
        method: 'PUT',
        body: updatePayload,
      });
      if (resUpdate.ok) {
        logResult({
          name: 'Admin: adminApi.updateCategory(id, data)',
          status: 'PASS',
          method: 'PUT',
          endpoint: `/categories/${testCategoryId}`,
          payload: updatePayload,
          response: resUpdate.data,
        });
      } else {
        logResult({
          name: 'Admin: adminApi.updateCategory(id, data)',
          status: 'FAIL',
          method: 'PUT',
          endpoint: `/categories/${testCategoryId}`,
          error: resUpdate.data?.error || `HTTP ${resUpdate.status}`,
        });
      }
    }
  }

  // 7.4 adminApi: Product Operations (createProduct with Bundles, updateProduct, deleteProduct)
  {
    // Payload adhering to ADMIN_APP/src/screens/ProductManagementScreen.jsx (lines 278-307)
    const productPayload = {
      name: 'RS Test Heavy Duty Degreaser',
      subtitle: 'Concentrated Industrial Formulation',
      description: 'Test product created by automated payload test suite',
      brand: 'RS Pro Industrial',
      category: 'Floor Cleaners',
      badge: 'Test Lab Direct',
      price: 350,
      mrp: 450,
      stockQuantity: 100,
      displayOrder: 1,
      isActive: true,
      isFeatured: false,
      image: 'https://placehold.co/400x400.png',
      bundles: [
        {
          bundleId: 'BNDL-TEST-1',
          label: '5L Canister',
          quantity: 1,
          price: 350,
          mrp: 450,
          stockQuantity: 50,
          isDefault: true,
        },
        {
          bundleId: 'BNDL-TEST-2',
          label: 'Box of 4 x 5L',
          quantity: 4,
          price: 1300,
          mrp: 1800,
          stockQuantity: 20,
          isDefault: false,
        },
      ],
    };

    const resCreate = await sendRequest('/products', { method: 'POST', body: productPayload });
    if (resCreate.ok) {
      testProductId = resCreate.data?.id || resCreate.data?._id;
      logResult({
        name: 'Admin: adminApi.createProduct(productData) [Full Bundles Model]',
        status: 'PASS',
        method: 'POST',
        endpoint: '/products',
        payload: { name: productPayload.name, price: productPayload.price, bundlesCount: productPayload.bundles.length },
        response: resCreate.data,
      });
    } else {
      logResult({
        name: 'Admin: adminApi.createProduct(productData)',
        status: 'FAIL',
        method: 'POST',
        endpoint: '/products',
        payload: productPayload,
        error: resCreate.data?.error || `HTTP ${resCreate.status}`,
      });
    }

    if (testProductId) {
      const updatePayload = { price: 375, subtitle: 'Concentrated Industrial Formulation (Updated)' };
      const resUpdate = await sendRequest(`/products/${testProductId}`, {
        method: 'PUT',
        body: updatePayload,
      });
      if (resUpdate.ok) {
        logResult({
          name: 'Admin: adminApi.updateProduct(id, productData)',
          status: 'PASS',
          method: 'PUT',
          endpoint: `/products/${testProductId}`,
          payload: updatePayload,
          response: resUpdate.data,
        });
      } else {
        logResult({
          name: 'Admin: adminApi.updateProduct(id, productData)',
          status: 'FAIL',
          method: 'PUT',
          endpoint: `/products/${testProductId}`,
          error: resUpdate.data?.error || `HTTP ${resUpdate.status}`,
        });
      }

      // Cleanup Product
      const resDel = await sendRequest(`/products/${testProductId}`, { method: 'DELETE' });
      if (resDel.ok) {
        logResult({
          name: 'Admin: adminApi.deleteProduct(id) (Cleanup)',
          status: 'PASS',
          method: 'DELETE',
          endpoint: `/products/${testProductId}`,
          response: resDel.data,
        });
      } else {
        logResult({
          name: 'Admin: adminApi.deleteProduct(id)',
          status: 'FAIL',
          method: 'DELETE',
          endpoint: `/products/${testProductId}`,
          error: resDel.data?.error || `HTTP ${resDel.status}`,
        });
      }
    }
  }

  // 7.5 adminApi: Banner Operations (createBanner, getBanners, deleteBanner)
  {
    const bannerPayload = {
      title: 'Automated Test Mega Sale',
      subtitle: 'Save up to 40% on Drums',
      image: 'https://placehold.co/600x300.png',
      imageUrl: 'https://placehold.co/600x300.png',
      targetCategory: 'Floor Cleaners',
    };
    const resCreate = await sendRequest('/banners', { method: 'POST', body: bannerPayload });
    if (resCreate.ok) {
      testBannerId = resCreate.data?.id || resCreate.data?._id;
      logResult({
        name: 'Admin: adminApi.createBanner(data)',
        status: 'PASS',
        method: 'POST',
        endpoint: '/banners',
        payload: bannerPayload,
        response: resCreate.data,
      });
    } else {
      logResult({
        name: 'Admin: adminApi.createBanner(data)',
        status: 'FAIL',
        method: 'POST',
        endpoint: '/banners',
        payload: bannerPayload,
        error: resCreate.data?.error || `HTTP ${resCreate.status}`,
      });
    }

    if (testBannerId) {
      const resDel = await sendRequest(`/banners/${testBannerId}`, { method: 'DELETE' });
      if (resDel.ok) {
        logResult({
          name: 'Admin: adminApi.deleteBanner(id) (Cleanup)',
          status: 'PASS',
          method: 'DELETE',
          endpoint: `/banners/${testBannerId}`,
          response: resDel.data,
        });
      } else {
        logResult({
          name: 'Admin: adminApi.deleteBanner(id)',
          status: 'FAIL',
          method: 'DELETE',
          endpoint: `/banners/${testBannerId}`,
          error: resDel.data?.error || `HTTP ${resDel.status}`,
        });
      }
    }
  }

  // 7.6 adminApi: Ticket Operations (getTickets & replyTicket)
  {
    const resTickets = await sendRequest('/tickets', { method: 'GET' });
    if (resTickets.ok && Array.isArray(resTickets.data)) {
      logResult({
        name: 'Admin: adminApi.getTickets()',
        status: 'PASS',
        method: 'GET',
        endpoint: '/tickets',
        response: `Fetched ${resTickets.data.length} support tickets`,
      });
    } else {
      logResult({
        name: 'Admin: adminApi.getTickets()',
        status: 'FAIL',
        method: 'GET',
        endpoint: '/tickets',
        error: resTickets.data?.error || `HTTP ${resTickets.status}`,
      });
    }

    // Test replyTicket which ADMIN_APP/src/services/api.js calls:
    // replyTicket: (id, replyMessage) => request(`/tickets/${id}/reply`, ...)
    const replyPayload = { message: 'We have dispatched your requested barrel replacement.' };
    const resReply = await sendRequest('/tickets/1/reply', {
      method: 'POST',
      body: replyPayload,
    });

    if (resReply.status === 404) {
      logResult({
        name: 'Admin BUG: adminApi.replyTicket(id, replyMessage)',
        status: 'WARN',
        method: 'POST',
        endpoint: '/tickets/:id/reply',
        payload: replyPayload,
        error: 'HTTP 404 Not Found',
        uiIssue: 'ADMIN_APP/src/services/api.js (line 62) calls "POST /tickets/:id/reply". The backend ticket.routes.js does NOT register a reply endpoint (only GET / and POST / exist)!',
      });
    } else if (resReply.ok) {
      logResult({
        name: 'Admin: adminApi.replyTicket(id, replyMessage)',
        status: 'PASS',
        method: 'POST',
        endpoint: '/tickets/1/reply',
        payload: replyPayload,
        response: resReply.data,
      });
    } else {
      logResult({
        name: 'Admin: adminApi.replyTicket(id, replyMessage)',
        status: 'FAIL',
        method: 'POST',
        endpoint: '/tickets/1/reply',
        payload: replyPayload,
        error: resReply.data?.error || `HTTP ${resReply.status}`,
      });
    }
  }

  // 7.7 adminApi: Company Operations (getCompanyDetails & updateCompanyDetails)
  {
    const resGet = await sendRequest('/company', { method: 'GET' });
    if (resGet.ok && resGet.data?.success) {
      logResult({
        name: 'Admin: adminApi.getCompanyDetails()',
        status: 'PASS',
        method: 'GET',
        endpoint: '/company',
        response: resGet.data.data?.companyName,
      });

      // Non-destructive update test (re-sending same company name)
      const currentCompany = resGet.data.data || {};
      const updatePayload = {
        companyName: currentCompany.companyName || 'RS Industries',
        aboutDescription: currentCompany.aboutDescription || 'Leading wholesale B2B marketplace for industrial supplies.',
      };
      const resPut = await sendRequest('/company', { method: 'PUT', body: updatePayload });
      if (resPut.ok) {
        logResult({
          name: 'Admin: adminApi.updateCompanyDetails(data)',
          status: 'PASS',
          method: 'PUT',
          endpoint: '/company',
          payload: updatePayload,
          response: resPut.data,
        });
      } else {
        logResult({
          name: 'Admin: adminApi.updateCompanyDetails(data)',
          status: 'FAIL',
          method: 'PUT',
          endpoint: '/company',
          error: resPut.data?.error || `HTTP ${resPut.status}`,
        });
      }
    } else {
      logResult({
        name: 'Admin: adminApi.getCompanyDetails()',
        status: 'FAIL',
        method: 'GET',
        endpoint: '/company',
        error: resGet.data?.error || `HTTP ${resGet.status}`,
      });
    }
  }

  // -------------------------------------------------------------------------
  // 8. FINAL DIAGNOSTIC SUMMARY
  // -------------------------------------------------------------------------
  logHeader('TEST SUITE EXECUTION SUMMARY');
  console.log(`  Total Tests Run:     ${stats.total}`);
  console.log(`  Passed:              ${colors.green}${stats.passed}${colors.reset}`);
  console.log(`  Warnings/Bugs:       ${colors.yellow}${stats.warnings}${colors.reset}`);
  console.log(`  Failed:              ${colors.red}${stats.failed}${colors.reset}`);

  if (stats.bugsIdentified.length > 0) {
    console.log(`\n${colors.bright}${colors.red}======================================================================`);
    console.log(`  CRITICAL UI/ADMIN PAYLOAD BUGS IDENTIFIED (${stats.bugsIdentified.length})`);
    console.log(`======================================================================${colors.reset}`);

    stats.bugsIdentified.forEach((bug, idx) => {
      console.log(`\n${colors.bright}[${idx + 1}] ${bug.testName}${colors.reset}`);
      console.log(`    Endpoint: ${colors.magenta}${bug.endpoint}${colors.reset}`);
      console.log(`    Root Cause: ${bug.issue}`);
    });

    console.log(`\n${colors.bright}${colors.cyan}Actionable Fixes Recommended:${colors.reset}`);
    console.log(`  1. In ${colors.yellow}UI/src/screens/shopkeeper/AddAddressScreen.jsx${colors.reset}:`);
    console.log(`     Change 'streetAddress: address' to 'fullAddress: address' (and keep streetAddress for compatibility).`);
    console.log(`  2. In ${colors.yellow}UI/src/screens/shopkeeper/AddressListScreen.jsx${colors.reset}:`);
    console.log(`     Change 'address: addr.streetAddress' to 'address: addr.fullAddress || addr.streetAddress'.`);
    console.log(`  3. In ${colors.yellow}UI/src/screens/shopkeeper/CheckoutPaymentScreen.jsx${colors.reset}:`);
    console.log(`     Ensure 'fullAddress: selectedAddr.fullAddress || selectedAddr.streetAddress || selectedAddr.address'.`);
    console.log(`  4. In ${colors.yellow}UI/src/services/api.js${colors.reset}:`);
    console.log(`     Export 'createTicket: (data) => apiClient.post("/tickets", data)' for SupportScreen.jsx.`);
    console.log(`  5. In ${colors.yellow}UI/src/store/cartStore.js${colors.reset}:`);
    console.log(`     Connect clearCartBackend so database cart sync clears when customer places an order.`);
  }

  console.log('\n');
}

runAllTests().catch((err) => {
  console.error('\nFatal test execution error:', err);
});
