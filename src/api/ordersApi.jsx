import apiClient from "./apiClient";

const prefix = "/api/orders";

export const createOrder = async (orderData) => {
  const res = await apiClient.post(prefix, orderData);
  return res.data;
};
