const axios = require("axios");

const BASE_URL = process.env.MOCKAPI_BASE_URL;

if (!BASE_URL) {
  console.warn("[MockAPI] WARNING: MOCKAPI_BASE_URL is not set in .env - requests will fail.");
}

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});


const mockApiService = {
  getById: async (id) => {
    const { data } = await client.get(`/${id}`);
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