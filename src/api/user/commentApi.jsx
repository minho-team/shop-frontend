import apiClient from "../common/apiClient";


const prefix = "/api/comment";


// =========================================
// 관리자 답변 작성
// request: { boardNo, content }
// =========================================
export const createComment = async (request) => {
    // 답변 작성 API 호출 (별도 엔드포인트)
    const res = await apiClient.post(`${prefix}`, request, {
        withCredentials: true,
    });
    return res.data;
};

// =========================================
// 관리자 답변 삭제
// =========================================
export const deleteComment = async (commentNo) => {
    // 답변 삭제 API 호출
    const res = await apiClient.delete(`${prefix}/${commentNo}`)
    return res.data;
};