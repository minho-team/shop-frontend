import apiClient from "../common/apiClient";

const prefix = "/api/admin/orders";

// 관리자 페이지 주문 목록 조회 + 검색/필터
export const getOrderList = async (params) => {
  const res = await apiClient.get(prefix, { params });
  return res.data;
};
