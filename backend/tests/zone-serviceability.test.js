const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { connectDB } = require('../src/config/database');
const { syncDatabase, DeliveryZone } = require('../src/models');
const zoneController = require('../src/modules/zone/zone.controller');

// Mock Express Req / Res Helper
function createMockReqRes(query = {}, params = {}, body = {}) {
  const req = { query, params, body };
  let statusCode = 200;
  let responseData = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    },
    getStatusCode: () => statusCode,
    getData: () => responseData,
  };

  return { req, res };
}

describe('Delivery Zones & Serviceability Test Suite', () => {
  before(async () => {
    await connectDB();
    await syncDatabase();

    // Ensure test serviceable zone exists
    await DeliveryZone.findOrCreate({
      where: { pincode: '208001' },
      defaults: {
        city: 'Kanpur',
        state: 'Uttar Pradesh',
        district: 'Kanpur Nagar',
        hubName: 'Kanpur Central Hub',
        isServiceable: true,
        estimatedDays: 'Same Day / Next Day',
      },
    });

    // Ensure a paused / unserviceable zone exists for testing
    await DeliveryZone.findOrCreate({
      where: { pincode: '208999' },
      defaults: {
        city: 'Kanpur Outer',
        state: 'Uttar Pradesh',
        district: 'Kanpur Dehat',
        hubName: 'Kanpur Hub',
        isServiceable: false,
        estimatedDays: 'Paused',
      },
    });
  });

  describe('Edge Cases: checkServiceability', () => {
    test('Edge Case 1: Empty or missing pincode returns 400', async () => {
      const { req, res } = createMockReqRes({ pincode: '' });
      await zoneController.checkServiceability(req, res);
      assert.equal(res.getStatusCode(), 400);
      assert.equal(res.getData().success, false);
      assert.equal(res.getData().isServiceable, false);
      assert.match(res.getData().error, /valid 6-digit/i);
    });

    test('Edge Case 2: Pincode with less than 6 digits returns 400', async () => {
      const { req, res } = createMockReqRes({ pincode: '2080' });
      await zoneController.checkServiceability(req, res);
      assert.equal(res.getStatusCode(), 400);
      assert.equal(res.getData().success, false);
    });

    test('Edge Case 3: Pincode with alphabets and symbols strips non-digits', async () => {
      // '208-001' has 6 digits after cleanup
      const { req, res } = createMockReqRes({ pincode: '208-001' });
      await zoneController.checkServiceability(req, res);
      assert.equal(res.getStatusCode(), 200);
      assert.equal(res.getData().success, true);
      assert.equal(res.getData().pincode, '208001');
      assert.equal(res.getData().isServiceable, true);
    });

    test('Edge Case 4: Pincode with whitespace padded returns clean result', async () => {
      const { req, res } = createMockReqRes({ pincode: '  208001   ' });
      await zoneController.checkServiceability(req, res);
      assert.equal(res.getStatusCode(), 200);
      assert.equal(res.getData().pincode, '208001');
      assert.equal(res.getData().isServiceable, true);
      assert.equal(res.getData().city, 'Kanpur');
    });

    test('Edge Case 5: Serviceable zone in DB returns isServiceable: true', async () => {
      const { req, res } = createMockReqRes({ pincode: '208001' });
      await zoneController.checkServiceability(req, res);
      assert.equal(res.getStatusCode(), 200);
      const data = res.getData();
      assert.equal(data.success, true);
      assert.equal(data.isServiceable, true);
      assert.equal(data.city, 'Kanpur');
      assert.ok(data.hubName);
      assert.ok(data.estimatedDays);
    });

    test('Edge Case 6: Paused zone in DB returns isServiceable: false with clear message', async () => {
      const { req, res } = createMockReqRes({ pincode: '208999' });
      await zoneController.checkServiceability(req, res);
      assert.equal(res.getStatusCode(), 200);
      const data = res.getData();
      assert.equal(data.success, true);
      assert.equal(data.isServiceable, false);
      assert.match(data.message, /paused/i);
    });

    test('Edge Case 7: Pincode outside DB returns isServiceable: false gracefully', async () => {
      const { req, res } = createMockReqRes({ pincode: '110001' });
      await zoneController.checkServiceability(req, res);
      assert.equal(res.getStatusCode(), 200);
      const data = res.getData();
      assert.equal(data.success, true);
      assert.equal(data.isServiceable, false);
      assert.match(data.message, /not available/i);
    });

    test('Edge Case 8: Completely non-existent pincode (999999) does not throw 500', async () => {
      const { req, res } = createMockReqRes({ pincode: '999999' });
      await zoneController.checkServiceability(req, res);
      assert.equal(res.getStatusCode(), 200);
      assert.equal(res.getData().isServiceable, false);
    });
  });

  describe('Edge Cases: getPincodeDetails', () => {
    test('Edge Case 9: Invalid pincode parameter returns 400', async () => {
      const { req, res } = createMockReqRes({}, { pincode: 'abc' });
      await zoneController.getPincodeDetails(req, res);
      assert.equal(res.getStatusCode(), 400);
      assert.equal(res.getData().success, false);
    });

    test('Edge Case 10: Valid pincode returns resolved details', async () => {
      const { req, res } = createMockReqRes({}, { pincode: '208001' });
      await zoneController.getPincodeDetails(req, res);
      assert.equal(res.getStatusCode(), 200);
      const data = res.getData();
      assert.equal(data.success, true);
      assert.equal(data.pincode, '208001');
      assert.equal(data.city, 'Kanpur');
    });
  });

  describe('Edge Cases: reverseGeocode', () => {
    test('Edge Case 11: Missing latitude returns 400', async () => {
      const { req, res } = createMockReqRes({ lng: '80.3319' });
      await zoneController.reverseGeocode(req, res);
      assert.equal(res.getStatusCode(), 400);
      assert.match(res.getData().error, /latitude and longitude/i);
    });

    test('Edge Case 12: Missing longitude returns 400', async () => {
      const { req, res } = createMockReqRes({ lat: '26.4499' });
      await zoneController.reverseGeocode(req, res);
      assert.equal(res.getStatusCode(), 400);
      assert.match(res.getData().error, /latitude and longitude/i);
    });
  });

  describe('Edge Cases: addOrUpdateZone (Admin)', () => {
    test('Edge Case 13: Adding zone without 6-digit pincode returns 400', async () => {
      const { req, res } = createMockReqRes({}, {}, { pincode: '123' });
      await zoneController.addOrUpdateZone(req, res);
      assert.equal(res.getStatusCode(), 400);
    });

    test('Edge Case 14: Creating and updating a zone toggles serviceability', async () => {
      const testPin = '209999';
      // Create as serviceable
      const { req: req1, res: res1 } = createMockReqRes({}, {}, {
        pincode: testPin,
        city: 'Test City',
        state: 'Uttar Pradesh',
        isServiceable: true,
        estimatedDays: '1 Day',
      });
      await zoneController.addOrUpdateZone(req1, res1);
      assert.equal(res1.getStatusCode(), 200);
      assert.equal(res1.getData().zone.isServiceable, true);

      // Update to unserviceable
      const { req: req2, res: res2 } = createMockReqRes({}, {}, {
        pincode: testPin,
        isServiceable: false,
      });
      await zoneController.addOrUpdateZone(req2, res2);
      assert.equal(res2.getStatusCode(), 200);
      assert.equal(res2.getData().zone.isServiceable, false);

      // Clean up
      await DeliveryZone.destroy({ where: { pincode: testPin } });
    });

    test('Edge Case 15: Deleting nonexistent pincode returns 404', async () => {
      const { req, res } = createMockReqRes({}, { pincode: '000000' });
      await zoneController.deleteZone(req, res);
      assert.equal(res.getStatusCode(), 404);
      assert.equal(res.getData().success, false);
    });

    test('Edge Case 16: Creating and then deleting a zone succeeds', async () => {
      const tempPin = '209998';
      // Create
      const { req: req1, res: res1 } = createMockReqRes({}, {}, {
        pincode: tempPin,
        city: 'Temp Zone',
        state: 'Uttar Pradesh',
      });
      await zoneController.addOrUpdateZone(req1, res1);
      assert.equal(res1.getStatusCode(), 200);

      // Delete
      const { req: req2, res: res2 } = createMockReqRes({}, { pincode: tempPin });
      await zoneController.deleteZone(req2, res2);
      assert.equal(res2.getStatusCode(), 200);
      assert.equal(res2.getData().success, true);

      // Verify gone
      const found = await DeliveryZone.findOne({ where: { pincode: tempPin } });
      assert.equal(found, null);
    });

    test('Edge Case 17: getAllZones returns active zones array', async () => {
      const { req, res } = createMockReqRes();
      await zoneController.getAllZones(req, res);
      assert.equal(res.getStatusCode(), 200);
      assert.equal(res.getData().success, true);
      assert.ok(Array.isArray(res.getData().zones));
      assert.ok(res.getData().zones.length > 0);
    });
  });
});
