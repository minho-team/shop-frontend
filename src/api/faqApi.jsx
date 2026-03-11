import axios from "axios";
import { API_SERVER_HOST } from "./authApi";

// FAQ API 기본 경로
const prefix = `${API_SERVER_HOST}/api/faq`;

// =========================================
// FAQ 전체 조회
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
