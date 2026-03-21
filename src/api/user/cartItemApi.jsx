import apiClient from "../common/apiClient";


const prefix = "/api/cart/item";

// 장바구니 상품 추가
export const addCartItem = async (data) => {
  const res = await apiClient.post(prefix, data);
  return res.data;
};

// 내 장바구니 상품 조회
export const readMyCartItems = async () => {
  const res = await apiClient.get(prefix);
  return res.data;
};

// 장바구니 수량 수정
export const updateCartItem = async (cartItemNo, quantity) => {
  const res = await apiClient.put(`${prefix}/${cartItemNo}`, null, {
    params: { cartQty: quantity },
  });
  return res.data;
};

// 장바구니 상품 삭제
export const deleteCartItem = async (cartItemNo) => {
  const res = await apiClient.delete(`${prefix}/${cartItemNo}`);
  return res.data;
};
