import apiClient from "../common/apiClient";

const prefix = "/api/member";

// 내 정보 조회
// GET /api/member/me
export const getMyInfo = async () => {
  const res = await apiClient.get(`${prefix}/me`);
  return res.data;
};

// 내 정보 수정
// PUT /api/member/me
export const updateMyInfo = async (formData) => {
  const res = await apiClient.put(`${prefix}/me`, formData);
  return res.data;
};
