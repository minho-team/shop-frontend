import apiClient from "./apiClient";

const prefix = "/api/product";

export const getProductList = async () => {
  const res = await apiClient.get(`${prefix}`);
  return res.data;
};

export const getProductDetail = async (id) => {
  const res = await apiClient.get(`${prefix}/${id}`);
  return res.data;
};

export const getHomeMainData = async () => {
  const res = await apiClient.get(`${prefix}/home`);
  return res.data;
};