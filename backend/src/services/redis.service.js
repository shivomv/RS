const net = require('net');

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const DEFAULT_TTL_SECONDS = 60; // 60 seconds short-lived cache as requested

let client = null;
let isConnected = false;
let pendingCallbacks = [];
let buffer = '';

// In-Memory Fallback Cache (for local dev or if Redis is offline)
const memoryCache = new Map();

function formatRespCommand(args) {
  let cmd = `*${args.length}\r\n`;
  for (const arg of args) {
    const s = String(arg);
    cmd += `$${Buffer.byteLength(s)}\r\n${s}\r\n`;
  }
  return cmd;
}

function parseResp(dataStr) {
  // Simple RESP parser for GET/SET/DEL/KEYS responses
  if (!dataStr) return { parsed: null, remaining: '' };

  const firstChar = dataStr[0];
  const crlfIndex = dataStr.indexOf('\r\n');
  if (crlfIndex === -1) return { parsed: null, remaining: dataStr, incomplete: true };

  const line = dataStr.substring(1, crlfIndex);

  if (firstChar === '+') {
    // Simple String e.g. +OK\r\n
    return { parsed: line, remaining: dataStr.substring(crlfIndex + 2) };
  } else if (firstChar === ':') {
    // Integer e.g. :1\r\n
    return { parsed: parseInt(line, 10), remaining: dataStr.substring(crlfIndex + 2) };
  } else if (firstChar === '$') {
    // Bulk String e.g. $5\r\nhello\r\n or $-1\r\n (null)
    const len = parseInt(line, 10);
    if (len === -1) {
      return { parsed: null, remaining: dataStr.substring(crlfIndex + 2) };
    }
    const valStart = crlfIndex + 2;
    const valEnd = valStart + len;
    if (dataStr.length < valEnd + 2) {
      return { parsed: null, remaining: dataStr, incomplete: true };
    }
    const val = dataStr.substring(valStart, valEnd);
    return { parsed: val, remaining: dataStr.substring(valEnd + 2) };
  } else if (firstChar === '*') {
    // Array
    const count = parseInt(line, 10);
    if (count === -1) return { parsed: null, remaining: dataStr.substring(crlfIndex + 2) };
    let cur = dataStr.substring(crlfIndex + 2);
    const arr = [];
    for (let i = 0; i < count; i++) {
      const res = parseResp(cur);
      if (res.incomplete) return { parsed: null, remaining: dataStr, incomplete: true };
      arr.push(res.parsed);
      cur = res.remaining;
    }
    return { parsed: arr, remaining: cur };
  } else if (firstChar === '-') {
    // Error
    return { error: new Error(line), remaining: dataStr.substring(crlfIndex + 2) };
  }

  return { parsed: null, remaining: '' };
}

function connect() {
  try {
    client = net.createConnection({ host: REDIS_HOST, port: REDIS_PORT }, () => {
      isConnected = true;
      console.log(`✅ [Redis Service] Connected to Redis server at ${REDIS_HOST}:${REDIS_PORT}`);
    });

    client.setEncoding('utf8');

    client.on('data', (chunk) => {
      buffer += chunk;
      while (buffer.length > 0 && pendingCallbacks.length > 0) {
        const result = parseResp(buffer);
        if (result.incomplete) break;
        buffer = result.remaining;
        const cb = pendingCallbacks.shift();
        if (cb) {
          if (result.error) cb(result.error);
          else cb(null, result.parsed);
        }
      }
    });

    client.on('error', (err) => {
      if (isConnected) {
        console.warn('⚠️ [Redis Service] Redis connection error, switching to in-memory cache:', err.message);
      }
      isConnected = false;
      // Resolve any pending callbacks with null so requests don't hang
      while (pendingCallbacks.length > 0) {
        const cb = pendingCallbacks.shift();
        try { cb(null, null); } catch (_) {}
      }
    });

    client.on('close', () => {
      isConnected = false;
    });
  } catch (err) {
    isConnected = false;
    console.warn('⚠️ [Redis Service] Could not connect to Redis, using in-memory cache:', err.message);
  }
}

connect();

function executeCommand(args) {
  return new Promise((resolve) => {
    if (!isConnected || !client) {
      return resolve(null);
    }
    const timeout = setTimeout(() => {
      resolve(null);
    }, 1500);

    pendingCallbacks.push((err, result) => {
      clearTimeout(timeout);
      if (err) resolve(null);
      else resolve(result);
    });

    try {
      client.write(formatRespCommand(args));
    } catch (_) {
      clearTimeout(timeout);
      resolve(null);
    }
  });
}

/**
 * Get value by key (with fallback to memory cache)
 */
async function get(key) {
  if (isConnected) {
    const raw = await executeCommand(['GET', key]);
    if (raw !== null && raw !== undefined) {
      try {
        return JSON.parse(raw);
      } catch (_) {
        return raw;
      }
    }
  }

  // Memory fallback
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Set value with short TTL (default: 60s)
 */
async function set(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const serialized = JSON.stringify(value);

  if (isConnected) {
    await executeCommand(['SET', key, serialized, 'EX', String(ttlSeconds)]);
  }

  // Also update memory fallback
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
  return true;
}

/**
 * Delete key
 */
async function del(key) {
  if (isConnected) {
    await executeCommand(['DEL', key]);
  }
  memoryCache.delete(key);
}

/**
 * Delete keys matching pattern
 */
async function delByPattern(pattern) {
  if (isConnected) {
    const keys = await executeCommand(['KEYS', pattern]);
    if (Array.isArray(keys) && keys.length > 0) {
      await executeCommand(['DEL', ...keys]);
    }
  }

  // Memory fallback cleanup
  const cleanPrefix = pattern.replace('*', '');
  for (const k of memoryCache.keys()) {
    if (k.startsWith(cleanPrefix)) {
      memoryCache.delete(k);
    }
  }
}

/**
 * Invalidate all products and catalog cache immediately
 * Whenever admin changes a product or price, this ensures users instantly see the new price
 */
async function invalidateProductCache() {
  await Promise.all([
    delByPattern('products:*'),
    delByPattern('categories:*'),
    delByPattern('catalog:*'),
  ]);
  console.log('🔄 [Redis Service] Invalidation complete. Fresh prices will be loaded on next request.');
}

module.exports = {
  get,
  set,
  del,
  delByPattern,
  invalidateProductCache,
  isConnected: () => isConnected,
  DEFAULT_TTL_SECONDS,
};
