import apiClient from "../common/apiClient";

const prefix = "/api/admin/orders";

//관리자 페이지에서 모든 주문 내역 불러오기
export const getOrderList = async (page = 1, size = 10) => {
  const res = await apiClient.get(`${prefix}?page=${page}&size=${size}`);
  return res.data;
};
