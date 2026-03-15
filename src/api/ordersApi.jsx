import apiClient from "./apiClient";

const prefix = "/api/orders";

// 내 모든 주문내역 불러오기
export const getMyOrderList = async () => {
  const res = await apiClient.get(`${prefix}`);
  return res.data;
};

// 특정 주문 상세내역 불러오기
export const getOrderDetail = async (orderNo) => {
  const res = await apiClient.get(`${prefix}/${orderNo}`);
  return res.data;
};


