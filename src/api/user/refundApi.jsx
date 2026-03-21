import apiClient from "../common/apiClient";

const prefix = "/api/refund";

export const createRefund = async (payload) => {
  const res = await apiClient.post(`${prefix}`, payload);
  return res.data;
};