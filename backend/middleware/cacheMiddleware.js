const { cache } = require("../config/cache");


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
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(key, body);
    }
    return originalJson(body);
  };

  next();
};

module.exports = cacheMiddleware;
