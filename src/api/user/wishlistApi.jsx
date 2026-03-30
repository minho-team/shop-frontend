import apiClient from "../common/apiClient";

const prefix = "/api/wishlist";

export const getMyWishlist = async () => {
  const res = await apiClient.get(`${prefix}/me`);
  return res.data;
};

export const checkWishlist = async (productNo) => {
  const res = await apiClient.get(`${prefix}/check/${productNo}`);
  return res.data;
};

export const addWishlist = async (productNo) => {
  const res = await apiClient.post(`${prefix}/${productNo}`);
  return res.data;
};

export const removeWishlist = async (productNo) => {
  const res = await apiClient.delete(`${prefix}/${productNo}`);
  return res.data;
};
