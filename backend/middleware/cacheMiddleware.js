const { cache } = require("../config/cache");

/**
 * Generic GET-response cache. Builds a key from the route path + query
 * string, serves straight from cache on a hit, and otherwise wraps
 * res.json to store the response body before it's sent.
 */
const cacheMiddleware = (prefix) => (req, res, next) => {
  const key = `${prefix}:${req.originalUrl}`;
  const cached = cache.get(key);

  if (cached !== undefined) {
    res.set("X-Cache", "HIT");
    return res.json(cached);
  }

  res.set("X-Cache", "MISS");
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    // Never cache error responses (4xx/5xx) - only successful GETs.
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(key, body);
    }
    return originalJson(body);
  };

  next();
};

module.exports = cacheMiddleware;
