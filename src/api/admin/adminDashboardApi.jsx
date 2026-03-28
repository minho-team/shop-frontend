import apiClient from "../common/apiClient";

const prefix = "/api/admin/dashboard";

// 관리자 대시보드 조회
export const getAdminDashboard = async () => {
  const response = await apiClient.get(prefix);
  return response.data;
};
