import apiClient from "../common/apiClient";

const prefix = "/api/admin/refund";

export const getAdminRefundList = async (params) => {
  const res = await apiClient.get(`${prefix}/list`, { params });
  return res.data;
};

export const getAdminRefundDetail = async (refundNo) => {
  const res = await apiClient.get(`${prefix}/${refundNo}`);
  return res.data;
};

export const updateAdminRefundStatus = async (refundNo, refundStatus) => {
  const res = await apiClient.put(`${prefix}/${refundNo}/status`, {
    refundStatus,
  });
  return res.data;
};