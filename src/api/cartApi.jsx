import apiClient from "./apiClient";

const prefix = "/api/cart";

// 내 장바구니 조회
export const getMyCart = async () => {
  const res = await apiClient.get(prefix);
  return res.data;
};
