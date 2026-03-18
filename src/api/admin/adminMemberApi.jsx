import apiClient from "../apiClient";

const prefix = "/api/admin/member";

// ================================================
// 관리자 - 회원 목록 페이징 조회
// ================================================
export const getAdminMemberList = async ({ page = 1, size = 5, status, keyword } = {}) => {
  const params = { page, size };
  if (status) params.status = status;
  if (keyword && keyword.trim()) params.keyword = keyword.trim();
  const res = await apiClient.get(`${prefix}/list`, { params });
  return res.data;
};

// ================================================
// 관리자 - 회원 단건 상세 조회
// 반환: { member, recentOrders, recentInquiries, cartItemCount }
// ================================================
export const getAdminMemberDetail = async (memberNo) => {
  const res = await apiClient.get(`${prefix}/${memberNo}`);
  return res.data;
};

// ================================================
// 관리자 - 특정 회원 주문 목록 페이징 조회 (5개씩)
// GET /api/admin/member/{memberNo}/orders?page=1&size=5
// ================================================
export const getAdminMemberOrderPage = async (memberNo, { page = 1, size = 5 } = {}) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/orders`, { params: { page, size } });
  return res.data;
};

// ================================================
// 관리자 - 특정 회원 문의 목록 페이징 조회 (5개씩)
// GET /api/admin/member/{memberNo}/inquiries?page=1&size=5
// ================================================
export const getAdminMemberInquiryPage = async (memberNo, { page = 1, size = 5 } = {}) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/inquiries`, { params: { page, size } });
  return res.data;
};

// ================================================
// 관리자 - 특정 회원 장바구니 상품 목록 조회
// GET /api/admin/member/{memberNo}/cart
// ================================================
export const getAdminMemberCartItems = async (memberNo) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/cart`);
  return res.data;
};

// ================================================
// 관리자 - 회원 상태 변경
// ================================================
export const updateAdminMemberStatus = async (memberNo, status) => {
  const res = await apiClient.patch(`${prefix}/${memberNo}/status`, null, { params: { status } });
  return res.data;
};

// ================================================
// 관리자 - 회원 정보 수정
// ================================================
export const updateAdminMember = async (memberNo, data) => {
  const res = await apiClient.put(`${prefix}/${memberNo}`, data);
  return res.data;
};

// ================================================
// 관리자 - 회원 삭제
// ================================================
export const deleteAdminMember = async (memberNo) => {
  const res = await apiClient.delete(`${prefix}/${memberNo}`);
  return res.data;
};