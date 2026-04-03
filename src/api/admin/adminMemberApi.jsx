import apiClient from "../common/apiClient";

const prefix = "/api/admin/member";

export const getAdminMemberList = async ({ page = 1, size = 5, status, keyword } = {}) => {
  const params = { page, size };
  if (status) params.status = status;             // ③ null이면 파라미터 생략 → 전체 조회
  if (keyword && keyword.trim()) params.keyword = keyword.trim(); // ② 빈값이면 생략 → MyBatis <if> 조건 제외
  const res = await apiClient.get(`${prefix}/list`, { params });
  return res.data;
};

export const getAdminMemberDetail = async (memberNo) => {
  const res = await apiClient.get(`${prefix}/${memberNo}`);
  return res.data;
};

export const updateAdminMemberStatus = async (memberNo, status) => {
  const res = await apiClient.patch(`${prefix}/${memberNo}/status`, null, { params: { status } });
  return res.data;
};

export const updateAdminMember = async (memberNo, data) => {
  const res = await apiClient.put(`${prefix}/${memberNo}`, data);
  return res.data;
};

export const deleteAdminMember = async (memberNo) => {
  const res = await apiClient.delete(`${prefix}/${memberNo}`);
  return res.data;
};

export const getAdminMemberOrderPage = async (memberNo, { page = 1, size = 5 } = {}) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/orders`, { params: { page, size } });
  return res.data;
};

export const getAdminMemberInquiryPage = async (memberNo, { page = 1, size = 5 } = {}) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/inquiries`, { params: { page, size } });
  return res.data;
};

export const getAdminMemberCartItems = async (memberNo) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/cart`);
  return res.data;
};

export const getAdminMemberMemos = async (memberNo) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/memos`);
  return res.data;
};

export const addAdminMemberMemo = async (memoData) => {
  const res = await apiClient.post(`${prefix}/memos`, memoData);
  return res.data;
};

export const deleteAdminMemberMemo = async (memoNo) => {
  const res = await apiClient.delete(`${prefix}/memos/${memoNo}`);
  return res.data;
};

export const getAdminMemberCoupons = async (memberNo) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/coupons`);
  return res.data;
};

export const getAdminAllCouponList = async () => {
  const res = await apiClient.get(`${prefix}/coupons/master`);
  return res.data;
};

// 쿠폰 마스터 생성
export const createAdminCoupon = async (couponData) => {
  const res = await apiClient.post(`${prefix}/coupons`, couponData);
  return res.data;
};

// 쿠폰 마스터 삭제
export const deleteAdminMasterCoupon = async (couponNo) => {
  const res = await apiClient.delete(`${prefix}/coupons/master/${couponNo}`);
  return res.data;
};

// 회원 보유 쿠폰 삭제
export const deleteAdminMemberCoupon = async (memberCouponNo) => {
  const res = await apiClient.delete(`${prefix}/coupons/${memberCouponNo}`);
  return res.data;
};

// 회원에게 쿠폰 발급
export const issueAdminMemberCoupon = async (memberNo, couponNo, validDays = 30) => {
  const res = await apiClient.post(`${prefix}/${memberNo}/coupons/issue`, null, {
    params: { couponNo, validDays }
  });
  return res.data;
};

// 쿠폰 사용 내역 조회
export const getAdminMemberCouponHistory = async (memberNo) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/coupons/history`);
  return res.data;
};

// 전체 회원에게 쿠폰 일괄 지급
export const issueAdminCouponToAll = async (couponNo, validDays = 30) => {
  const res = await apiClient.post(`${prefix}/coupons/issue-all`, null, {
    params: { couponNo, validDays }
  });
  return res.data;
};

// 특정 회원의 리뷰 목록 조회 (관리자용)
export const getAdminMemberReviews = async (memberNo) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/reviews`);
  return res.data;
};