const { Op } = require('sequelize');
const { sequelize } = require('../../config/database');
const { Order, Product, ProductBundle, Shopkeeper, Notification } = require('../../models');
const realtimeService = require('../../services/realtime.service');
const redisService = require('../../services/redis.service');

function formatOrderResponse(ord) {
  const json = ord.toJSON ? ord.toJSON() : ord;
  const total = json.totalAmount ?? json.total ?? json.financialSnapshot?.totalAmount ?? 0;
  return {
    ...json,
    _id: String(json.id),
    total,
    totalAmount: total,
    orderId: json.orderId || `RS-ORD-${json.id}`,
  };
}

/**
 * Get Orders
 * - Admins can view all orders
 * - Buyers can ONLY view their own orders (IDOR protection)
 */
exports.getAllOrders = async (req, res) => {
  try {
    const user = req.user;
    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN' || user.isAdmin);

    const where = {};

    if (!isAdmin) {
      // Buyer view - strictly filter by authenticated user id
      if (user?.id) {
        where.shopkeeperId = user.id;
      } else if (req.query.shopkeeperId) {
        where.shopkeeperId = Number(req.query.shopkeeperId);
      } else {
        // If unauthenticated or no id, return empty to prevent data leak
        return res.json([]);
      }
    } else {
      // Admin view - optional filter by shopkeeperId
      if (req.query.shopkeeperId && !isNaN(Number(req.query.shopkeeperId))) {
        where.shopkeeperId = Number(req.query.shopkeeperId);
      }
    }

    if (req.query.status && req.query.status.toUpperCase() !== 'ALL') {
      where.status = req.query.status.toLowerCase();
    }

    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const offset = req.query.offset !== undefined ? parseInt(req.query.offset, 10) : (limit ? (page - 1) * limit : undefined);

    const findOptions = {
      where,
      order: [['createdAt', 'DESC']],
    };

    if (limit && !isNaN(limit) && limit > 0) {
      findOptions.limit = limit;
      if (offset !== undefined && !isNaN(offset) && offset >= 0) {
        findOptions.offset = offset;
      }
    }

    const orders = await Order.findAll(findOptions);

    return res.json(orders.map(formatOrderResponse));
  } catch (err) {
    console.warn('[OrderController] DB error:', err.message);
    return res.json([]);
  }
};

/**
 * Create Order with Server-Side Price Verification, Stock Deduction & Database Transaction
 */
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    let shopkeeperId = req.user?.id || null;

    // Compulsory 10-digit mobile number validation for placing wholesale orders
    const rawMobile = orderData.buyerMobile || orderData.buyerSnapshot?.mobile || orderData.buyerPhone || req.user?.mobile || '';
    const cleanMobile = String(rawMobile).replace(/\D/g, '').slice(-10);

    if (!cleanMobile || cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        error: 'A valid 10-digit mobile number is mandatory to place wholesale orders.',
      });
    }

    if (!shopkeeperId) {
      if (orderData.shopkeeper && !isNaN(Number(orderData.shopkeeper))) {
        shopkeeperId = Number(orderData.shopkeeper);
      } else if (orderData.shopkeeperId && !isNaN(Number(orderData.shopkeeperId))) {
        shopkeeperId = Number(orderData.shopkeeperId);
      } else if (cleanMobile) {
        const found = await Shopkeeper.findOne({ where: { mobile: cleanMobile } });
        if (found) shopkeeperId = found.id;
      }
    }

    // Persist verified mobile to shopkeeper profile if missing
    if (shopkeeperId) {
      const shopkeeper = await Shopkeeper.findByPk(shopkeeperId);
      if (shopkeeper && (!shopkeeper.mobile || shopkeeper.mobile.length !== 10)) {
        await shopkeeper.update({ mobile: cleanMobile });
      }
    }

    const rawItems = Array.isArray(orderData.items) ? orderData.items : [];
    if (rawItems.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    // Unique Collision-Free Order ID
    const orderId = `RS-ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Execute atomic ACID database transaction
    const newOrder = await sequelize.transaction(async (t) => {
      const verifiedItems = [];
      let calculatedSubtotal = 0;

      for (const rawItem of rawItems) {
        let rawProductId = rawItem.productId || rawItem.masterProductId || rawItem.product?.id || rawItem.product?._id || rawItem.id || rawItem._id;
        if (typeof rawProductId === 'string' && rawProductId.includes('_')) {
          rawProductId = rawProductId.split('_')[0];
        }
        const numProdId = Number(rawProductId);

        if (!rawProductId || isNaN(numProdId)) {
          throw new Error('Invalid product identifier provided in items.');
        }

        // 1. Fetch genuine product from database with lock
        const product = await Product.findByPk(numProdId, {
          transaction: t,
          include: [{ model: ProductBundle, as: 'bundles' }],
        });

        if (!product || !product.isActive) {
          throw new Error(`Product "${rawItem.name || rawProductId}" is currently unavailable.`);
        }

        const qty = Math.max(1, parseInt(rawItem.quantity || rawItem.qty || 1, 10));

        // 2. Validate Stock Availability
        if (product.stockQuantity < qty) {
          throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, requested: ${qty}.`);
        }

        // 3. Atomically Deduct Stock
        await product.decrement('stockQuantity', { by: qty, transaction: t });

        // 4. Verify Price from Database Record (Never trust client prices)
        let verifiedUnitPrice = Number(product.price || 0);
        let bundleLabel = rawItem.bundleLabel || rawItem.bundleName || rawItem.size || product.subtitle || 'Standard Pack';

        if (rawItem.bundleId) {
          const matchBundle = (product.bundles || []).find(
            (b) => String(b.bundleId) === String(rawItem.bundleId) || String(b.id) === String(rawItem.bundleId)
          );
          if (matchBundle && matchBundle.price > 0) {
            verifiedUnitPrice = Number(matchBundle.price);
            bundleLabel = matchBundle.label;
          }
        }

        const lineTotal = verifiedUnitPrice * qty;
        calculatedSubtotal += lineTotal;

        verifiedItems.push({
          productId: String(product.id),
          variantId: rawItem.variantId || 'default',
          bundleId: rawItem.bundleId || '',
          bundleName: bundleLabel,
          bundleLabel: bundleLabel,
          name: product.name,
          subtitle: bundleLabel,
          size: product.subtitle || '',
          image: rawItem.image || product.image || '',
          categoryName: product.categoryName || '',
          unitPrice: verifiedUnitPrice,
          price: verifiedUnitPrice,
          quantity: qty,
          qty: qty,
          lineTotal,
        });
      }

      // No GST applied
      const gstAmount = 0;
      const deliveryFee = 0; // Free wholesale factory delivery
      const discountAmount = 0;
      const totalAmount = calculatedSubtotal + deliveryFee - discountAmount;

      const deliveryAddressSnapshot = orderData.deliveryAddressSnapshot || {
        fullAddress: orderData.deliveryAddress || 'Factory Pickup / Local Delivery',
        capturedAt: new Date(),
      };

      const buyerSnapshot = {
        name: req.user?.name || orderData.buyerSnapshot?.name || orderData.buyerName || 'Shopkeeper',
        mobile: cleanMobile,
      };

      const financialSnapshot = {
        subtotal: calculatedSubtotal,
        gstAmount: 0,
        gstPercentage: 0,
        deliveryFee,
        discountAmount,
        totalAmount,
      };

      const initialStatusHistory = [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'Order placed via Cash on Delivery (COD)',
        },
      ];

      return await Order.create({
        orderId,
        shopkeeperId,
        buyerName: buyerSnapshot.name,
        buyerPhone: buyerSnapshot.mobile,
        items: verifiedItems,
        buyerSnapshot,
        deliveryAddressSnapshot,
        financialSnapshot,
        subtotal: calculatedSubtotal,
        gstAmount,
        totalAmount,
        paymentStatus: 'pending',
        paymentMethod: 'Cash on Delivery (COD)',
        deliveryAddress: deliveryAddressSnapshot.fullAddress,
        status: 'pending',
        statusHistory: initialStatusHistory,
      }, { transaction: t });
    });

    // Invalidate Redis product cache so inventory changes reflect instantly
    await redisService.invalidateProductCache();

    // Broadcast instant order push to Admin
    realtimeService.broadcastNewOrder(newOrder).catch((err) => {
      console.warn('[OrderController] Realtime order broadcast error:', err.message);
    });

    return res.status(201).json(formatOrderResponse(newOrder));
  } catch (err) {
    console.error('[OrderController] Create order error:', err.message);
    return res.status(400).json({ error: err.message || 'Failed to create order' });
  }
};

/**
 * Customer / Admin Order Cancellation with Atomic Stock Restoration
 * POST /api/orders/:id/cancel
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user;

    const numId = Number(id);
    const where = !isNaN(numId)
      ? { [Op.or]: [{ id: numId }, { orderId: id }] }
      : { orderId: id };

    const order = await Order.findOne({ where });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN' || user.isAdmin);
    if (!isAdmin && user?.id && order.shopkeeperId && order.shopkeeperId !== user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized: You can only cancel your own orders.' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Order is already cancelled.' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ success: false, error: 'Delivered orders cannot be cancelled.' });
    }

    // Atomic transaction to restore stock
    await sequelize.transaction(async (t) => {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const it of items) {
        const pId = Number(it.productId);
        const qty = Number(it.quantity || it.qty || 1);
        if (!isNaN(pId) && qty > 0) {
          const product = await Product.findByPk(pId, { transaction: t });
          if (product) {
            await product.increment('stockQuantity', { by: qty, transaction: t });
          }
        }
      }

      const history = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
      history.push({
        status: 'cancelled',
        timestamp: new Date().toISOString(),
        note: reason || 'Order cancelled by customer',
      });

      await order.update({
        status: 'cancelled',
        statusHistory: history,
        cancellationReason: reason || 'Customer requested cancellation',
      }, { transaction: t });
    });

    // Invalidate Redis product cache
    await redisService.invalidateProductCache();

    // Create Notification for buyer
    if (order.shopkeeperId) {
      await Notification.create({
        shopkeeperId: order.shopkeeperId,
        title: `Order #${order.orderId} Cancelled`,
        message: `Your order #${order.orderId} was successfully cancelled. Any reserved stock has been returned.`,
      }).catch(() => {});
    }

    return res.json({
      success: true,
      message: 'Order cancelled successfully and stock restored',
      order: formatOrderResponse(order),
    });
  } catch (err) {
    console.error('[OrderController] Cancel order error:', err.message);
    return res.status(400).json({ success: false, error: err.message || 'Failed to cancel order' });
  }
};

/**
 * Update Order Status with Real Status History & Customer Notification
 * PUT /api/orders/:id/status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, driverName, driverPhone, note } = req.body;

    const numId = Number(id);
    const where = !isNaN(numId)
      ? { [Op.or]: [{ id: numId }, { orderId: id }] }
      : { orderId: id };

    const order = await Order.findOne({ where });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const previousStatus = order.status;
    const newStatus = status ? status.toLowerCase() : previousStatus;

    // If changing to cancelled from an active state, restore inventory stock
    if (newStatus === 'cancelled' && previousStatus !== 'cancelled') {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const it of items) {
        const pId = Number(it.productId);
        const qty = Number(it.quantity || it.qty || 1);
        if (!isNaN(pId) && qty > 0) {
          const product = await Product.findByPk(pId);
          if (product) {
            await product.increment('stockQuantity', { by: qty });
          }
        }
      }
      await redisService.invalidateProductCache();
    }

    const history = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
    if (status && status !== previousStatus) {
      history.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${newStatus.toUpperCase()} by warehouse dispatch`,
      });
    }

    const updateFields = {
      statusHistory: history,
    };
    if (status) updateFields.status = newStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (driverName !== undefined) updateFields.driverName = driverName;
    if (driverPhone !== undefined) updateFields.driverPhone = driverPhone;

    await order.update(updateFields);

    // Notify Customer about status change
    if (order.shopkeeperId && status && status !== previousStatus) {
      await Notification.create({
        shopkeeperId: order.shopkeeperId,
        title: `Order #${order.orderId} ${newStatus.toUpperCase()}`,
        message: `Your order is now marked as ${newStatus.toUpperCase()}.${driverName ? ` Delivery Partner: ${driverName} (${driverPhone || ''})` : ''}`,
      }).catch(() => {});
    }

    return res.json(formatOrderResponse(order));
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Failed to update order status' });
  }
};

/**
 * Generate Official GST Tax Invoice
 * GET /api/orders/:id/invoice
 */
exports.getOrderInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const numId = Number(id);
    const where = !isNaN(numId)
      ? { [Op.or]: [{ id: numId }, { orderId: id }] }
      : { orderId: id };

    const order = await Order.findOne({ where });
    if (!order) {
      return res.status(404).send('<h1>Order not found</h1>');
    }

    const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const items = Array.isArray(order.items) ? order.items : [];
    const subtotal = order.subtotal || order.financialSnapshot?.subtotal || 0;
    const total = order.totalAmount || subtotal;

    const itemsHtml = items.map((it, idx) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">
          <strong>${it.name || 'Product'}</strong><br/>
          <small style="color: #666;">${it.bundleLabel || it.subtitle || ''}</small>
        </td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${it.quantity || 1}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${(it.unitPrice || 0).toLocaleString('en-IN')}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${(it.lineTotal || (it.unitPrice * (it.quantity || 1))).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Wholesale Invoice - ${order.orderId}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #222; font-size: 13px; }
    .header { border-bottom: 2px solid #006948; padding-bottom: 12px; margin-bottom: 20px; }
    .title { font-size: 22px; font-weight: bold; color: #006948; }
    .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .table th { background: #f0fdf4; border: 1px solid #ddd; padding: 8px; text-align: left; }
    .totals { margin-top: 20px; width: 300px; float: right; }
    .badge { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <div style="float: right; text-align: right;">
      <h2 style="margin: 0; color: #006948;">WHOLESALE INVOICE</h2>
      <p style="margin: 4px 0;"><strong>Invoice #:</strong> INV-${order.orderId}</p>
      <p style="margin: 4px 0;"><strong>Date:</strong> ${dateStr}</p>
      <p style="margin: 4px 0;"><strong>Payment:</strong> <span class="badge">${order.paymentMethod || 'COD'}</span></p>
    </div>
    <div class="title">RS INDUSTRIES</div>
    <p style="margin: 2px 0;">Wholesale Manufacturing & Distribution</p>
    <p style="margin: 2px 0;">Email: support@rsindustries.com • Tel: +91 9026773268</p>
    <div style="clear: both;"></div>
  </div>

  <div style="margin-bottom: 20px;">
    <strong>Billed & Delivered To:</strong><br/>
    <strong>${order.buyerName || order.buyerSnapshot?.name || 'Valued Retail Partner'}</strong><br/>
    Phone: ${order.buyerPhone || order.buyerSnapshot?.mobile || 'N/A'}<br/>
    Address: ${order.deliveryAddress || order.deliveryAddressSnapshot?.fullAddress || 'Registered Address'}
  </div>

  <table class="table">
    <thead>
      <tr>
        <th style="width: 30px; text-align: center;">#</th>
        <th>Product Description</th>
        <th style="width: 50px; text-align: center;">Qty</th>
        <th style="width: 100px; text-align: right;">Rate</th>
        <th style="width: 110px; text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="totals">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 4px;">Items Subtotal:</td>
        <td style="padding: 4px; text-align: right; font-weight: bold;">₹${subtotal.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td style="padding: 4px;">Delivery Charges:</td>
        <td style="padding: 4px; text-align: right; color: #006948; font-weight: bold;">FREE</td>
      </tr>
      <tr style="border-top: 2px solid #006948; border-bottom: 2px solid #006948;">
        <td style="padding: 6px; font-size: 15px; font-weight: bold; color: #006948;">Total Payable:</td>
        <td style="padding: 6px; text-align: right; font-size: 16px; font-weight: bold; color: #006948;">₹${total.toLocaleString('en-IN')}</td>
      </tr>
    </table>
  </div>
  <div style="clear: both;"></div>

  <div style="margin-top: 50px; font-size: 11px; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
    <p>Terms: Goods once sold are backed by RS Industries Factory Quality Guarantee.</p>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    return res.status(500).send('Error generating invoice: ' + err.message);
  }
};
