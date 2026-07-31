const NodeCache = require("node-cache");

const ttl = parseInt(process.env.CACHE_TTL_SECONDS, 10) || 60;

// stdTTL = default per-key expiry (seconds). useClones=false skips extra
// serialization since we only ever store plain JSON response bodies.
const cache = new NodeCache({ stdTTL: ttl, checkperiod: ttl * 0.5, useClones: false });

/**
 * cacheMiddleware keys every cached GET response as "products:<originalUrl>"
 * - that covers list pages, search results ("products:/api/products?search=..."),
 * AND single-item lookups ("products:/api/products/3") under one prefix.
 *
 * Any write (create/update/delete/deleteAll/deleteSelected) can change what
 * ANY list, search, or byId response should now return, so on every write
 * we simply clear every key under that prefix. This is the safest correct
 * strategy - a stale cache after a write is worse than a slightly less
 * "clever" invalidation.
 */
const invalidateProductsCache = () => {
  const keys = cache.keys().filter((k) => k.startsWith("products:"));
  if (keys.length) cache.del(keys);
};

module.exports = { cache, invalidateProductsCache };
