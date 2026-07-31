const mockApiService = require("./mockApiService");
const { invalidateProductsCache } = require("../config/cache");
const default_img =process.env.PRODUCT_DEFAULT_THUMB
/**
 * MockAPI.io IS the persistence layer here - there's no local database.
 * This service is a thin business-logic layer over mockApiService that
 * also owns cache invalidation, so controllers never touch the cache or
 * the external API directly.
 */

const getAllProducts = async ({ search, page = 1, limit = 20 }) => {
  // Fetch the full search-filtered list from MockAPI, then paginate it
  // ourselves - this guarantees an accurate `total` regardless of
  // MockAPI's header support (see mockApiService for why).
  const { data: all } = await mockApiService.getAll({ search: search || undefined });

  // Newest first - so a just-created product shows at the top of page 1
  // instead of wherever MockAPI happens to return it.
  const sorted = [...all].sort((a, b) => {
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 20;
  const total = sorted.length;
  const start = (pageNum - 1) * limitNum;
  const items = sorted.slice(start, start + limitNum);

  return {
    items,
    total,
    page: pageNum,
    limit: limitNum,
  };
};


const getProductById = async (id) => {
  try {
    return await mockApiService.getById(id);
  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
};


const createProduct = async (payload) => {
  const product = await mockApiService.create({
    title: payload.title,
    description: payload.description || "",
    category: payload.category || "",
    price: Number(payload.price) || 0,
    discountPercentage: Number(payload.discountPercentage) || 0,
    rating: Number(payload.rating) || 0,
    stock: Number(payload.stock) || 0,
    brand: payload.brand || "",
    thumbnail: payload.thumbnail || default_img,
    images: payload.images || [],
    createdAt: new Date().toISOString(),
  });

  invalidateProductsCache();
  return product;
};


const updateProduct = async (id, payload) => {
  const existing = await getProductById(id);
  if (!existing) return null;

  const product = await mockApiService.update(id, { ...existing, ...payload, id });
  invalidateProductsCache();
  return product;
};


const deleteProduct = async (id) => {
  const existing = await getProductById(id);
  if (!existing) return null;

  await mockApiService.remove(id);
  invalidateProductsCache();
  return existing;
};


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Deletes a single id, retrying with exponential backoff on failure.
 *
 * WHY THIS EXISTS: bulk-deleting used to fire every DELETE request at
 * MockAPI.io at once (or in small concurrent batches). MockAPI.io's free
 * tier rate-limits bursts of requests, so a chunk of the burst would get
 * rejected and "delete 12 selected" would silently only delete 5-10 of
 * them. The only fully reliable fix is to never burst it: send one
 * request at a time, and if MockAPI still rejects one (429/5xx/timeout),
 * back off and retry it several times before giving up on that id.
 *
 * A 404 here means the record is already gone (e.g. deleted by an earlier
 * attempt) - that counts as a successful deletion, not a failure.
 */
const deleteOneWithRetry = async (id, maxAttempts = 5) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await mockApiService.remove(id);
      return { id, ok: true };
    } catch (err) {
      if (err.response?.status === 404) {
        return { id, ok: true };
      }
      if (attempt === maxAttempts) {
        return { id, ok: false };
      }
      // Exponential backoff: 500ms, 1s, 2s, 4s - gives MockAPI's rate
      // limiter time to reset before we hit it again with the same id.
      await sleep(500 * 2 ** (attempt - 1));
    }
  }
  return { id, ok: false };
};

/**
 * Deletes ids ONE AT A TIME (no concurrency at all) so we never trigger
 * MockAPI's burst rate-limiting in the first place. A small pause after
 * every successful delete adds extra headroom for sustained (not just
 * bursty) rate limits. This is slower than parallel deletion, but it's
 * the only approach that reliably deletes every selected id - which is
 * what actually matters for a destructive bulk action.
 */
const deleteSelectedProducts = async (ids = []) => {
  const uniqueIds = [...new Set(ids)];
  const failedIds = [];
  let deletedCount = 0;

  for (const id of uniqueIds) {
    const result = await deleteOneWithRetry(id);
    if (result.ok) {
      deletedCount += 1;
    } else {
      failedIds.push(id);
    }
    await sleep(150); // small pacing gap between requests
  }

  invalidateProductsCache();
  return { deletedCount, failedIds };
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteSelectedProducts,
};