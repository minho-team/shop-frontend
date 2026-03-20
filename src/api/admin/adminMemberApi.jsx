import apiClient from "../apiClient";

const prefix = "/api/admin/member";

// 회원 목록 페이징 조회
export const getAdminMemberList = async ({ page = 1, size = 5, status, keyword } = {}) => {
  const params = { page, size };
  if (status) params.status = status;
  if (keyword && keyword.trim()) params.keyword = keyword.trim();
  const res = await apiClient.get(`${prefix}/list`, { params });
  return res.data;
};

// 회원 단건 상세 조회
export const getAdminMemberDetail = async (memberNo) => {
  const res = await apiClient.get(`${prefix}/${memberNo}`);
  return res.data;
};

// 특정 회원 주문 목록 페이징 조회
export const getAdminMemberOrderPage = async (memberNo, { page = 1, size = 5 } = {}) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/orders`, { params: { page, size } });
  return res.data;
};

// 특정 회원 문의 목록 페이징 조회
export const getAdminMemberInquiryPage = async (memberNo, { page = 1, size = 5 } = {}) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/inquiries`, { params: { page, size } });
  return res.data;
};

// 특정 회원 장바구니 상품 목록 조회
export const getAdminMemberCartItems = async (memberNo) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/cart`);
  return res.data;
};

// 회원 상태 변경
export const updateAdminMemberStatus = async (memberNo, status) => {
  const res = await apiClient.patch(`${prefix}/${memberNo}/status`, null, { params: { status } });
  return res.data;
};

// 회원 정보 수정
export const updateAdminMember = async (memberNo, data) => {
  const res = await apiClient.put(`${prefix}/${memberNo}`, data);
  return res.data;
};

// 회원 삭제
export const deleteAdminMember = async (memberNo) => {
  const res = await apiClient.delete(`${prefix}/${memberNo}`);
  return res.data;
};

// 특정 회원 로그인 이력 페이징 조회
export const getAdminMemberLoginHistory = async (memberNo, { page = 1, size = 10 } = {}) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/login-history`, { params: { page, size } });
  return res.data;
};

// 메모 저장
export const insertAdminMemo = async (memberNo, content) => {
  const res = await apiClient.post(`${prefix}/${memberNo}/memo`, { content });
  return res.data;
};

// 특정 회원 메모 전체 조회
export const getAdminMemos = async (memberNo) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/memo`);
  return res.data;
};

// 메모 삭제
export const deleteAdminMemo = async (memoNo) => {
  const res = await apiClient.delete(`${prefix}/memo/${memoNo}`);
  return res.data;
};

// 포인트 지급/차감
export const insertAdminPoint = async (memberNo, point, type) => {
  const res = await apiClient.post(`${prefix}/${memberNo}/point`, { point, type });
  return res.data;
};

// 특정 회원 포인트 잔액 조회
export const getAdminPointBalance = async (memberNo) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/point/balance`);
  return res.data;
};

// 특정 회원 포인트 이력 페이징 조회 (5개씩)
export const getAdminPointPage = async (memberNo, { page = 1, size = 5 } = {}) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/point`, { params: { page, size } });
  return res.data;
};

// 쿠폰 생성
export const insertAdminCoupon = async (coupon) => {
  const res = await apiClient.post(`${prefix}/coupon`, coupon);
  return res.data;
};

// 쿠폰 전체 목록 조회
export const getAdminCoupons = async () => {
  const res = await apiClient.get(`${prefix}/coupon`);
  return res.data;
};

// 쿠폰 소프트 삭제 여부 변경 (N=정상, Y=삭제)
export const updateAdminCouponDeleteYn = async (couponNo, deleteYn) => {
  const res = await apiClient.patch(`${prefix}/coupon/${couponNo}/delete-yn`, null, { params: { deleteYn } });
  return res.data;
};

// 쿠폰 삭제 (발급된 쿠폰 없을 때만 가능)
export const deleteAdminCoupon = async (couponNo) => {
  const res = await apiClient.delete(`${prefix}/coupon/${couponNo}`);
  return res.data;
};

// 특정 회원에게 쿠폰 발급
export const issueCouponToMember = async (memberNo, couponNo, startAt, endAt) => {
  const res = await apiClient.post(`${prefix}/${memberNo}/coupon`, { couponNo, startAt, endAt });
  return res.data;
};

// 특정 회원 보유 쿠폰 목록 조회
export const getAdminMemberCoupons = async (memberNo) => {
  const res = await apiClient.get(`${prefix}/${memberNo}/coupon`);
  return res.data;
};

// 회원 보유 쿠폰 삭제
export const deleteAdminMemberCoupon = async (memberCouponNo) => {
  const res = await apiClient.delete(`${prefix}/member-coupon/${memberCouponNo}`);
  return res.data;
};

// 회원 보유 쿠폰 만료 처리
export const expireAdminMemberCoupon = async (memberCouponNo) => {
  const res = await apiClient.patch(`${prefix}/member-coupon/${memberCouponNo}/expire`);
  return res.data;
};