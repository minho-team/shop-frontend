import apiClient from "../common/apiClient";

// 관리자 전용 답변 API - /api/admin/comment 엔드포인트 사용
const prefix = "/api/admin/comment";

// =========================================
// 관리자 답변 작성
// request: { inquiryNo, content }
// memberNo는 서버에서 JWT 토큰으로 자동 추출
// =========================================
export const createComment = async (request) => {
    const res = await apiClient.post(`${prefix}`, request);
    return res.data;
};

// =========================================
// 관리자 답변 삭제
// commentNo: 삭제할 답변 번호
// =========================================
export const deleteComment = async (commentNo) => {
    const res = await apiClient.delete(`${prefix}/${commentNo}`);
    return res.data;
};