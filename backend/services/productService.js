const { invalidateProductsCache } = require("../config/cache");
const axios = require("axios");
const BASE_URL = process.env.MOCKAPI_BASE_URL;




if (!BASE_URL) {
//console.warn("[MockAPI] WARNING: MOCKAPI_BASE_URL may not set in .env.");
}

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});



const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));



const createProduct = async (payload) => {
  const { data } = await client.post("/", payload);
  invalidateProductsCache();
  return data;
};



const getAllProducts = async ({ searchQuery, page = 1, limit = 20 }) => {
  let data = [];

  try {
    const response = await client.get("/", {
      params: { search: searchQuery }
    });
    data = response.data;
  } catch (err) {
    if (err.response?.status === 404) {
      data = [];
    } else {
      throw err;
    }
  }


  if (!searchQuery && data.length === 0) {
    data = [];
  }


  const sorted = [...data].sort((a, b) => {
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    return bTime - aTime;  // newest first
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

    let {data} = await client.get(`/${id}`);
    return data;

  } catch (err) {
    if (err.response?.status === 404) return null;
    throw err;
  }
};



const updateProduct = async (id, data) => {
  const { data: updatedData } = await client.put(`/${id}`, data);
  invalidateProductsCache();
  return updatedData;

};



const deleteProduct = async (id) => {
  const existing = await getProductById(id);
  if (!existing) return null;
  const { data } = await client.delete(`/${id}`);
  invalidateProductsCache();
  return existing;
};




const deleteOneWithRetry = async (id, maxAttempts = 5) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data } = await client.delete(`/${id}`);
      return { id, ok: true };
    } catch (err) {
      if (err.response?.status === 404) {
        return { id, ok: true };
      }
      if (attempt === maxAttempts) {
        return { id, ok: false };
      }
      await sleep(500 * 2 ** (attempt - 1));
    }
  }
  return { id, ok: false };
};



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
    await sleep(150);
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