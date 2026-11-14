const { DeliveryZone } = require('../../models');

// In-memory cache for pincode resolution to eliminate redundant external calls
const postalCache = new Map();

/**
 * Fetch official Indian postal info for a 6-digit pincode (Third-party API held exclusively on Backend)
 */
async function fetchIndiaPostData(pincode) {
  if (postalCache.has(pincode)) {
    return postalCache.get(pincode);
  }

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      signal: AbortSignal.timeout(4000),
      headers: { 'User-Agent': 'RSIndustries-Backend/1.0' },
    });

    if (!response.ok) return null;
    const data = await response.json();

    if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice)) {
      const offices = data[0].PostOffice;
      const primary = offices[0];
      const result = {
        city: primary.District || primary.Division || primary.Block || '',
        state: primary.State || '',
        district: primary.District || primary.Division || '',
        localities: offices.map((o) => o.Name).filter(Boolean),
      };
      postalCache.set(pincode, result);
      return result;
    }
  } catch (err) {
    console.warn(`[ZoneController] Postal API error for ${pincode}:`, err.message);
  }

  return null;
}

/**
 * Check if a pincode is serviceable by RS Industries
 * GET /api/zones/check?pincode=208001
 */
exports.checkServiceability = async (req, res) => {
  try {
    const rawPincode = req.query.pincode || req.params.pincode || '';
    const cleanPincode = String(rawPincode).replace(/\D/g, '').slice(0, 6);

    if (!cleanPincode || cleanPincode.length !== 6) {
      return res.status(400).json({
        success: false,
        isServiceable: false,
        error: 'Please enter a valid 6-digit delivery pincode.',
      });
    }

    // 1. Check in our delivery_zones database
    let zone = await DeliveryZone.findOne({ where: { pincode: cleanPincode } });

    // 2. If zone exists in DB
    if (zone) {
      return res.json({
        success: true,
        isServiceable: Boolean(zone.isServiceable),
        pincode: zone.pincode,
        city: zone.city,
        state: zone.state,
        district: zone.district || zone.city,
        hubName: zone.hubName,
        estimatedDays: zone.estimatedDays,
        outOfStockSkus: zone.outOfStockSkus || [],
        minOrderAmount: zone.minOrderAmount,
        message: zone.isServiceable
          ? `Delivery available in ${zone.city} (${zone.estimatedDays})`
          : `Delivery is currently paused in ${zone.city} (${cleanPincode}).`,
      });
    }

    // 3. If not in DB, resolve city & state via postal service
    const postalInfo = await fetchIndiaPostData(cleanPincode);
    const resolvedCity = postalInfo?.city || '';
    const resolvedState = postalInfo?.state || '';

    return res.json({
      success: true,
      isServiceable: false,
      pincode: cleanPincode,
      city: resolvedCity,
      state: resolvedState,
      message: resolvedCity
        ? `Delivery is not available in ${resolvedCity} (${cleanPincode}).`
        : `Delivery is not available in pincode ${cleanPincode}.`,
    });
  } catch (err) {
    console.error('[ZoneController] checkServiceability error:', err);
    return res.status(500).json({
      success: false,
      isServiceable: false,
      error: 'Failed to verify location serviceability.',
    });
  }
};

/**
 * Get City, State & Localities for a Pincode
 * GET /api/zones/pincode/:pincode
 */
exports.getPincodeDetails = async (req, res) => {
  try {
    const rawPincode = req.params.pincode || req.query.pincode || '';
    const cleanPincode = String(rawPincode).replace(/\D/g, '').slice(0, 6);

    if (!cleanPincode || cleanPincode.length !== 6) {
      return res.status(400).json({ success: false, error: 'Valid 6-digit pincode required' });
    }

    // Check DB first
    const zone = await DeliveryZone.findOne({ where: { pincode: cleanPincode } });
    const postalInfo = await fetchIndiaPostData(cleanPincode);

    const city = zone?.city || postalInfo?.city || '';
    const state = zone?.state || postalInfo?.state || '';
    const district = zone?.district || postalInfo?.district || city;
    const localities = postalInfo?.localities || [];

    return res.json({
      success: true,
      pincode: cleanPincode,
      city,
      state,
      district,
      localities,
      isServiceable: zone ? Boolean(zone.isServiceable) : false,
      estimatedDays: zone?.estimatedDays || '',
      hubName: zone?.hubName || '',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Reverse Geocode GPS coordinates (Lat, Lng) into Pincode, City, State, Area, Street
 * Backend proxies third-party Nominatim API so client app touches NO third-party endpoints.
 * GET /api/zones/reverse-geocode?lat=26.4499&lng=80.3319
 */
exports.reverseGeocode = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: 'Latitude and longitude are required' });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=json&addressdetails=1`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(4500),
      headers: {
        'User-Agent': 'RSIndustriesBackend/1.0 (info@rsindustries.com)',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding service returned status ${response.status}`);
    }

    const data = await response.json();
    const addr = data?.address || {};
    const rawPostcode = addr.postcode || '';
    const cleanPincode = String(rawPostcode).replace(/\D/g, '').slice(0, 6);

    const city = addr.city || addr.town || addr.village || addr.district || addr.county || '';
    const state = addr.state || '';
    const area = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || addr.road || '';
    const road = addr.road || '';
    const streetAddress = [road, area].filter(Boolean).join(', ') || area || city;
    const landmark = addr.neighbourhood || addr.suburb || '';

    // Check serviceability for the detected pincode strictly against DB
    let isServiceable = false;
    let hubName = '';
    let estimatedDays = '';

    if (cleanPincode && cleanPincode.length === 6) {
      const zone = await DeliveryZone.findOne({ where: { pincode: cleanPincode } });
      if (zone) {
        isServiceable = Boolean(zone.isServiceable);
        hubName = zone.hubName;
        estimatedDays = zone.estimatedDays;
      }
    }

    return res.json({
      success: true,
      pincode: cleanPincode,
      city,
      state,
      area,
      road,
      streetAddress,
      landmark,
      formattedAddress: data?.display_name || [streetAddress, city, state, cleanPincode].filter(Boolean).join(', '),
      isServiceable,
      hubName,
      estimatedDays,
    });
  } catch (err) {
    console.warn('[ZoneController] Reverse geocode error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Could not determine location from GPS coordinates.',
    });
  }
};

/**
 * List all delivery zones (Admin / Catalog)
 * GET /api/zones
 */
exports.getAllZones = async (req, res) => {
  try {
    const zones = await DeliveryZone.findAll({
      order: [['city', 'ASC'], ['pincode', 'ASC']],
    });
    return res.json({ success: true, zones });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Add or update delivery zone (Admin)
 * POST /api/zones
 */
exports.addOrUpdateZone = async (req, res) => {
  try {
    const { pincode, city, state, district, hubName, isServiceable, estimatedDays, minOrderAmount, outOfStockSkus } = req.body;
    const cleanPincode = String(pincode).replace(/\D/g, '').slice(0, 6);

    if (!cleanPincode || cleanPincode.length !== 6) {
      return res.status(400).json({ success: false, error: 'Valid 6-digit pincode is required' });
    }

    let zone = await DeliveryZone.findOne({ where: { pincode: cleanPincode } });
    if (zone) {
      await zone.update({
        city: city !== undefined ? city : zone.city,
        state: state !== undefined ? state : zone.state,
        district: district !== undefined ? district : zone.district,
        hubName: hubName !== undefined ? hubName : zone.hubName,
        isServiceable: isServiceable !== undefined ? Boolean(isServiceable) : zone.isServiceable,
        estimatedDays: estimatedDays !== undefined ? estimatedDays : zone.estimatedDays,
        minOrderAmount: minOrderAmount !== undefined ? minOrderAmount : zone.minOrderAmount,
        outOfStockSkus: outOfStockSkus !== undefined ? outOfStockSkus : zone.outOfStockSkus,
      });
    } else {
      zone = await DeliveryZone.create({
        pincode: cleanPincode,
        city: city || '',
        state: state || '',
        district: district || city || '',
        hubName: hubName || '',
        isServiceable: isServiceable !== undefined ? Boolean(isServiceable) : true,
        estimatedDays: estimatedDays || '',
        minOrderAmount: minOrderAmount || 0,
        outOfStockSkus: outOfStockSkus || [],
      });
    }

    return res.json({ success: true, zone });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
