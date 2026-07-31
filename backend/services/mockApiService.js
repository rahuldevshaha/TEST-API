const axios = require("axios");

const BASE_URL = process.env.MOCKAPI_BASE_URL;

if (!BASE_URL) {
  console.warn("[MockAPI] WARNING: MOCKAPI_BASE_URL is not set in .env - requests will fail.");
}

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

/**
 * Thin wrapper around the MockAPI.io REST resource. This is the ONLY file
 * that knows about MockAPI's URL shape - everything else in the app talks
 * to productService, which talks to this.
 *
 * Unlike DummyJSON, MockAPI genuinely persists writes, so no local database
 * is needed - MockAPI IS the data store.
 */
const mockApiService = {
  // NOTE: MockAPI.io does NOT reliably send an X-Total-Count header when
  // ?page=&limit= are used (that's a json-server thing, not MockAPI), so
  // we can't trust a header for the total count. Instead we only forward
  // `search` here and fetch the full (search-filtered) array; pagination
  // itself is applied locally in productService, where we can compute an
  // accurate total from the array length.
  //
  // Also NOTE: MockAPI.io responds with a 404 - instead of a 200 + empty
  // array - whenever a request would resolve to zero records (a search
  // with no matches, but also just an empty collection e.g. right after
  // deleting the last/only remaining items). That's a quirk of MockAPI
  // itself, not a real error, so we always treat a 404 here as "no
  // results" rather than letting it surface as a 500 to the client.
  getAll: async ({ search } = {}) => {
    const params = {};
    if (search) params.search = search;
    try {
      const { data } = await client.get("/", { params });
      return { data };
    } catch (err) {
      if (err.response?.status === 404) {
        return { data: [] };
      }
      throw err;
    }
  },

  getById: async (id) => {
    const { data } = await client.get(`/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await client.post("/", payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await client.put(`/${id}`, payload);
    return data;
  },

  remove: async (id) => {
    const { data } = await client.delete(`/${id}`);
    return data;
  },
};

module.exports = mockApiService;