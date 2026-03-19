import apiClient from "./apiClient";

const prefix = "/api/orders";

//결제 시
export const createOrder = async (orderData) => {
  const res = await apiClient.post(prefix, orderData);
  return res.data;
};

// 내 모든 주문내역 불러오기
export const getMyOrderList = async (page = 1) => {
  const res = await apiClient.get(`${prefix}?page=${page}`);
  return res.data;
};

// 특정 주문 상세내역 불러오기
export const getOrderDetail = async (orderNo) => {
  const res = await apiClient.get(`${prefix}/${orderNo}`);
  console.log(res.data);
  return res.data;
};