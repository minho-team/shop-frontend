import apiClient from "../common/apiClient";

const prefix = "/api/admin/faq";

// =========================================
// FAQ 등록 (관리자 전용)
// POST /api/admin/faq
// =========================================
export const adminCreateFaq = async (request) => {
    const res = await apiClient.post(`${prefix}`, request);
    return res.data;
};

// =========================================
// FAQ 삭제 (관리자 전용, soft delete)
// DELETE /api/admin/faq/{faqNo}
// =========================================
export const adminDeleteFaq = async (faqNo) => {
    const res = await apiClient.delete(`${prefix}/${faqNo}`);
    return res.data;
};
