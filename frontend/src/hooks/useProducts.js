import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { productApi } from "../api/productApi";

const PRODUCTS_KEY = "products";

export const useProducts = ({ search = "", page = 1, limit = 20 }) => {
  return useQuery({
    queryKey: [PRODUCTS_KEY, { search, page, limit }],
    queryFn: () => productApi.getAll({ search, page, limit }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: [PRODUCTS_KEY, id],
    queryFn: () => productApi.getById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.deleteOne,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
};

export const useDeleteSelectedProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.deleteSelected,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
};