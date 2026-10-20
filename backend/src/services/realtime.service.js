const { WebSocketServer } = require('ws');
const fcmService = require('./fcm.service');

// Store active WebSocket connections
let wss = null;
const activeSockets = new Set();

// Store active SSE response streams
const activeSseClients = new Set();

/**
 * Attach WebSocket server to the existing HTTP server instance
 */
function initRealtimeServer(httpServer) {
  wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const pathname = request.url ? request.url.split('?')[0] : '';
    if (pathname === '/api/admin/ws' || pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws) => {
    activeSockets.add(ws);
    console.log(`[Realtime] Admin WebSocket connected. Active sockets: ${activeSockets.size}`);

    // Send initial handshake
    ws.send(JSON.stringify({
      type: 'CONNECTED',
      message: 'Real-time order channel active',
      timestamp: new Date().toISOString(),
    }));

    ws.on('close', () => {
      activeSockets.delete(ws);
      console.log(`[Realtime] Admin WebSocket disconnected. Remaining: ${activeSockets.size}`);
    });

    ws.on('error', (err) => {
      console.warn('[Realtime] WebSocket error:', err.message);
      activeSockets.delete(ws);
    });
  });

  console.log('✅ [Realtime] Real-time order dispatch engine initialized.');
}

/**
 * Handle Server-Sent Events (SSE) connection
 * GET /api/admin/order-stream
 */
function handleSseConnection(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*',
  });

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  activeSseClients.add(res);
  console.log(`[Realtime] Admin SSE client connected. Active SSE listeners: ${activeSseClients.size}`);

  req.on('close', () => {
    activeSseClients.delete(res);
    console.log(`[Realtime] Admin SSE client closed. Remaining: ${activeSseClients.size}`);
  });
}

/**
 * Broadcasts a real incoming order in real-time across ALL connected Admin devices (WebSocket + SSE + FCM)
 */
async function broadcastNewOrder(order) {
  const orderId = String(order.orderId || order.id || 'N/A');
  const customerName = String(order.buyerName || order.buyerSnapshot?.name || 'Customer');
  const totalAmount = String(order.totalAmount || order.total || 0);
  const itemsCount = String(Array.isArray(order.items) ? order.items.length : 1);

  const payload = {
    type: 'NEW_ORDER',
    orderId,
    customerName,
    totalAmount,
    itemsCount,
    timestamp: new Date().toISOString(),
    order: order.toJSON ? order.toJSON() : order,
  };

  const payloadString = JSON.stringify(payload);
  console.log(`📢 [Realtime] Broadcasting REAL Order #${orderId} (₹${totalAmount}) to Admin devices...`);

  // 1. Broadcast via active WebSockets
  let wsSentCount = 0;
  for (const client of activeSockets) {
    if (client.readyState === 1 /* OPEN */) {
      try {
        client.send(payloadString);
        wsSentCount++;
      } catch (e) {
        console.warn('[Realtime] Error broadcasting to WS client:', e.message);
      }
    }
  }

  // 2. Broadcast via active SSE clients
  let sseSentCount = 0;
  for (const res of activeSseClients) {
    try {
      res.write(`data: ${payloadString}\n\n`);
      sseSentCount++;
    } catch (e) {
      console.warn('[Realtime] Error writing to SSE client:', e.message);
    }
  }

  console.log(`[Realtime] Dispatched order event to ${wsSentCount} WS clients and ${sseSentCount} SSE clients.`);

  // 3. Dispatch via Firebase Cloud Messaging for devices that are minimized or phone locked
  fcmService.sendNewOrderNotification(order).catch((err) => {
    console.warn('[Realtime] FCM dispatch error:', err.message);
  });

  return {
    wsSentCount,
    sseSentCount,
  };
}

module.exports = {
  initRealtimeServer,
  handleSseConnection,
  broadcastNewOrder,
};
