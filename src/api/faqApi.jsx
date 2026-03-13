import axios from "axios";
import { API_SERVER_HOST } from "./authApi";

// FAQ API 기본 경로
const prefix = `${API_SERVER_HOST}/api/faq`;

// axios 인스턴스 (쿠키 자동 포함 - 관리자 인증용)
const api = axios.create({
    baseURL: prefix,
    withCredentials: true,
});

// =========================================
// FAQ 전체 조회
// GET /api/faq
// =========================================
export const getAllFaqs = async () => {
    const res = await axios.get(prefix);
    return res.data;
};

// =========================================
// 카테고리별 FAQ 조회
// GET /api/faq/category?category=배송
// =========================================
export const getFaqByCategory = async (category) => {
    const res = await axios.get(`${prefix}/category`, { params: { category } });
    return res.data;
};

// =========================================
// FAQ 키워드 검색
// GET /api/faq/search?keyword=배송
// =========================================
export const searchFaq = async (keyword) => {
    const res = await axios.get(`${prefix}/search`, { params: { keyword } });
    return res.data;
};

// =========================================
// FAQ 등록 (관리자 전용)
// request: { category, question, answer, sortOrder }
// =========================================
export const createFaq = async (request) => {
    // 관리자 인증 포함하여 FAQ 등록 API 호출
    const res = await api.post("", request);
    return res.data;
};

// =========================================
// FAQ 삭제 (관리자 전용, soft delete)
// faqNo: 삭제할 FAQ 번호
// =========================================
export const deleteFaq = async (faqNo) => {
    // 관리자 인증 포함하여 FAQ 삭제 API 호출
    const res = await api.delete(`/${faqNo}`);
    return res.data;
};