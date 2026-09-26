require('dotenv').config();
const app = require('./src/app');
const http = require('http');

let server;

function startServer() {
  return new Promise((resolve) => {
    server = app.listen(5001, () => {
      console.log('Test Server listening on port 5001');
      resolve();
    });
  });
}

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTest() {
  console.log('--- Testing Payment Verification & Reconciliation Architecture ---');
  await startServer();

  try {
    // Test 1: Create Payment Intent
    const orderId = `RS-TEST-${Date.now()}`;
    console.log('\n1. Creating Payment Intent for Order:', orderId);
    const intentRes = await makeRequest('/api/payments/create-intent', 'POST', {
      orderData: {
        orderId,
        subtotal: 720,
        totalAmount: 800,
        items: [{ name: 'RS Ultra Sanitizer', unitPrice: 720, quantity: 1 }],
        deliveryAddress: 'Indiranagar, Bengaluru',
      },
    });
    console.log('Intent Result:', JSON.stringify(intentRes, null, 2));

    if (!intentRes.success) {
      console.error('Failed to create intent!');
      server.close();
      return;
    }

    const { reference, payeeVpa, amount } = intentRes.data;

    // Test 2: Server Verification (Anti-Fraud Checks)
    console.log('\n2. Verifying Payment with Node.js 5-Layer Anti-Fraud Engine...');
    const verifyRes = await makeRequest('/api/payments/verify', 'POST', {
      reference,
      transactionId: `TXN-UPI-${Date.now()}`,
      upiStatus: 'SUCCESS',
      paidAmount: amount,
    });
    console.log('Verification Result:', JSON.stringify(verifyRes, null, 2));

    // Test 3: Check Final Order & Payment Status
    console.log('\n3. Checking Final Order & Payment Status in MongoDB...');
    const statusRes = await makeRequest(`/api/payments/status/${orderId}`, 'GET');
    console.log('Status Check Result:', JSON.stringify(statusRes, null, 2));

  } catch (err) {
    console.error('Test Error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTest();
