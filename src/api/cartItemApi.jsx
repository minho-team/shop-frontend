import apiClient from "./apiClient";

const prefix = "/api/cart/item";

// 장바구니 상품 추가
export const addCartItem = async (data) => {
  const res = await apiClient.post(prefix, data);
  return res.data;
};

export const readMyCartItems = async () => {
  const res = await apiClient.get(prefix);
  return res.data;
};
