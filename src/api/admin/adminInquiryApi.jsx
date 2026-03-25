import apiClient from "../common/apiClient";

const prefix = "/api/admin/inquiry";

// =========================================
// 전체 문의 페이징 조회 (관리자용)
// GET /api/admin/inquiry/page?page=1&size=10&status=...&category=...&keyword=...
// =========================================
export const getInquiryPage = async ({ page = 1, size = 10, status, category, keyword } = {}) => {
  const params = { page, size };
  if (status && status !== "전체") params.status = status;
  if (category && category !== "전체") params.category = category;
  if (keyword && keyword.trim()) params.keyword = keyword.trim();
  const res = await apiClient.get(`${prefix}/page`, { params });
  return res.data;
};

// =========================================
// 문의 삭제 (관리자 전용)
// DELETE /api/admin/inquiry/{inquiryNo}
// =========================================
export const adminDeleteInquiry = async (inquiryNo) => {
  const res = await apiClient.delete(`${prefix}/${inquiryNo}`);
  return res.data;
};
