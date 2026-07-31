import axiosClient from "./axiosClient";

export const productApi = {
  getAll: async ({ search = "", page = 1, limit = 20 }) => {
    const { data } = await axiosClient.get("/products", { params: { search, page, limit } });
    return data;
  },

  getById: async (id) => {
    const { data } = await axiosClient.get(`/products/${id}`);
    return data.data;
  },

  create: async (payload) => {
    const { data } = await axiosClient.post("/products", payload);
    return data.data;
  },

  update: async ({ id, payload }) => {
    const { data } = await axiosClient.put(`/products/${id}`, payload);
    return data.data;
  },

  deleteOne: async (id) => {
    const { data } = await axiosClient.delete(`/products/${id}`);
    return data;
  },

  deleteSelected: async (ids) => {
    const { data } = await axiosClient.post("/products/delete-selected", { ids });
    return data;
  },

};