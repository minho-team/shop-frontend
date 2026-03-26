import apiClient from "../common/apiClient";

const prefix = "/api/admin/refund";

// 관리자 환불 목록 조회
export const getAdminRefundList = async (params) => {
  const res = await apiClient.get(`${prefix}/list`, { params });
  return res.data;
};

// 관리자 환불 상세 조회
export const getAdminRefundDetail = async (refundNo) => {
  const res = await apiClient.get(`${prefix}/${refundNo}`);
  return res.data;
};

// 관리자 환불 상태 업데이트
export const updateAdminRefundStatus = async (refundNo, refundStatus) => {
  const res = await apiClient.put(`${prefix}/${refundNo}/status`, {
    refundStatus,
  });
  return res.data;
};