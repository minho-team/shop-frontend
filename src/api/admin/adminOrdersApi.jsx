import apiClient from "../apiClient";

const prefix = "/api/orders";
const adminPrefix = "/api/admin/orders";

// 내 모든 주문내역 불러오기
export const getMyOrderList = async (page = 1) => {
  const res = await apiClient.get(`${prefix}?page=${page}`);
  return res.data;
};

// 특정 주문 상세내역 불러오기
export const getOrderDetail = async (orderNo) => {
  const res = await apiClient.get(`${prefix}/${orderNo}`);
  return res.data;
};

//관리자 페이지에서 모든 주문 내역 불러오기
export const getOrderList = async (page = 1, size = 10) => {
  const res = await apiClient.get(`${adminPrefix}?page=${page}&size=${size}`);
  return res.data;
};
