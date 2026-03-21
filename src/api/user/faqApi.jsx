import apiClient from "../common/apiClient";


const prefix = "/api/faq";
// =========================================
// FAQ 전체 조회
// GET /api/faq
// =========================================
export const getAllFaqs = async () => {
    const res = await apiClient.get(`${prefix}`);
    return res.data;
};

// =========================================
// 카테고리별 FAQ 조회
// GET /api/faq/category?category=배송
// =========================================
export const getFaqByCategory = async (category) => {
    const res = await apiClient.get(`${prefix}/category`, { params: { category } });
    return res.data;
};

// =========================================
// FAQ 키워드 검색
// GET /api/faq/search?keyword=배송
// =========================================
export const searchFaq = async (keyword) => {
    const res = await apiClient.get(`${prefix}/search`, { params: { keyword } });
    return res.data;
};

// =========================================
// FAQ 페이징 조회 (서버사이드 페이징)
// GET /api/faq/page?page=1&size=10&category=배송&keyword=검색어
// 반환값: { list, totalCount, totalPages, currentPage, pageSize }
// =========================================
export const getFaqPage = async ({ page = 1, size = 10, category, keyword } = {}) => {
    const params = { page, size };
    // 카테고리 필터: "전체"면 파라미터 생략 (서버에서 전체 조회)
    if (category && category !== "전체") params.category = category;
    // 키워드 필터: 빈 문자열이면 파라미터 생략
    if (keyword && keyword.trim()) params.keyword = keyword.trim();
    const res = await apiClient.get(`${prefix}/page`, { params });
    return res.data;
};

// =========================================
// FAQ 등록 (관리자 전용)
// request: { category, question, answer, sortOrder }
// =========================================
export const createFaq = async (request) => {
    // 관리자 인증 포함하여 FAQ 등록 API 호출
    const res = await apiClient.post(`${prefix}`, request);
    return res.data;
};

// =========================================
// FAQ 삭제 (관리자 전용, soft delete)
// faqNo: 삭제할 FAQ 번호
// =========================================
export const deleteFaq = async (faqNo) => {
    // 관리자 인증 포함하여 FAQ 삭제 API 호출
    const res = await apiClient.delete(`${prefix}/${faqNo}`);
    return res.data;
};
