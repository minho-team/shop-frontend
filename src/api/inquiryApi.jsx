import apiClient from "./apiClient";


const prefix = "/api/inquiry";


// =========================================
// 문의 작성 (첨부파일 포함)
// request: { category, title, content, secretYn }
// files: File[] 첨부 이미지 배열 (선택)
// =========================================
export const createInquiry = async (request, files) => {
    const formData = new FormData();

    // 게시글 데이터를 JSON Blob으로 변환하여 추가
    formData.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));

    // 첨부파일 추가 (여러 장 가능)
    if (files && files.length > 0) {
        files.forEach((file) => formData.append("files", file));
    }

    // API 요청 (multipart/form-data)
    const res = await apiClient.post(`${prefix}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

// =========================================
// 문의 전체 조회 (관리자용)
// =========================================
export const getAllInquiries = async () => {
    // 전체 문의 목록 조회 API 호출
    const res = await apiClient.get(`${prefix}`);
    return res.data;
};

// =========================================
// 전체 문의 페이징 조회 (관리자용, 서버사이드 페이징)
// GET /api/inquiry/page?page=1&size=10&status=답변대기&category=배송&keyword=검색어
// 반환값: { list, totalCount, totalPages, currentPage, pageSize }
// =========================================
export const getInquiryPage = async ({ page = 1, size = 10, status, category, keyword } = {}) => {
    const params = { page, size };
    // 상태 필터: "전체"면 파라미터 생략
    if (status && status !== "전체") params.status = status;
    // 카테고리 필터: "전체"면 파라미터 생략
    if (category && category !== "전체") params.category = category;
    // 키워드 필터: 빈 문자열이면 파라미터 생략
    if (keyword && keyword.trim()) params.keyword = keyword.trim();
    const res = await apiClient.get(`${prefix}/page`, { params });
    return res.data;
};

// =========================================
// 내 문의 내역 조회 (로그인한 회원)
// =========================================
export const getMyInquiries = async () => {
    // 내 문의 목록 조회 API 호출
    const res = await apiClient.get(`${prefix}/my`);
    return res.data;
};

// =========================================
// 내 문의 페이징 조회 (로그인한 회원, 서버사이드 페이징)
// GET /api/inquiry/my/page?page=1&size=10
// 반환값: { list, totalCount, totalPages, currentPage, pageSize }
// =========================================
export const getMyInquiryPage = async ({ page = 1, size = 10 } = {}) => {
    const res = await apiClient.get(`${prefix}/my/page`, { params: { page, size } });
    return res.data;
};

// =========================================
// 문의 하나 조회 (첨부파일 + 관리자 답변 포함)
// 반환값: { inquiry, files, comments }
// =========================================
export const getOneInquiry = async (inquiryNo) => {
    // 특정 문의 상세 조회 API 호출
    const res = await apiClient.get(`${prefix}/${inquiryNo}`);
    return res.data;
};

// =========================================
// 문의 수정
// dto: { category, title, content, secretYn }
// =========================================
export const updateInquiry = async (inquiryNo, dto) => {
    // 문의 수정 API 호출
    const res = await apiClient.put(`${prefix}/${inquiryNo}`, dto);
    return res.data;
};

// =========================================
// 문의 삭제 (본인 글만 가능)
// =========================================
export const deleteInquiry = async (inquiryNo) => {
    // 문의 삭제 API 호출
    const res = await apiClient.delete(`${prefix}/${inquiryNo}`);
    return res.data;
};

// =========================================
// 문의 삭제 (관리자 전용 - 모든 문의 삭제 가능)
// inquiryNo: 삭제할 문의 번호
// =========================================
export const adminDeleteInquiry = async (inquiryNo) => {
    // 관리자 전용 문의 삭제 API 호출
    const res = await apiClient.delete(`${prefix}/admin/${inquiryNo}`);
    return res.data;
};
