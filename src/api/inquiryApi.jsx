import axios from "axios";
import { API_SERVER_HOST } from "./authApi";

// 게시판 API 기본 경로
const prefix = `${API_SERVER_HOST}/api/board`;

// axios 인스턴스 (쿠키 자동 포함 - JWT 인증용)
const api = axios.create({
    baseURL: prefix,
    withCredentials: true,
});

// =========================================
// 게시글 작성 (첨부파일 포함)
// request: { category, title, content, secretYn }
// files: File[] 첨부 이미지 배열 (선택)
// =========================================
export const createBoard = async (request, files) => {
    const formData = new FormData();

    // 게시글 데이터를 JSON Blob으로 변환하여 추가
    formData.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));

    // 첨부파일 추가 (여러 장 가능)
    if (files && files.length > 0) {
        files.forEach((file) => formData.append("files", file));
    }

    const res = await api.post("", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

// =========================================
// 게시글 전체 조회 (관리자용)
// =========================================
export const getAllBoards = async () => {
    const res = await api.get("");
    return res.data;
};

// =========================================
// 내 문의 내역 조회 (로그인한 회원)
// =========================================
export const getMyBoards = async () => {
    const res = await api.get("/my");
    return res.data;
};

// =========================================
// 게시글 하나 조회 (첨부파일 + 관리자 답변 포함)
// 반환값: { board, files, comments }
// =========================================
export const getOneBoard = async (boardNo) => {
    const res = await api.get(`/${boardNo}`);
    return res.data;
};

// =========================================
// 게시글 수정
// dto: { category, title, content, secretYn }
// =========================================
export const updateBoard = async (boardNo, dto) => {
    const res = await api.put(`/${boardNo}`, dto);
    return res.data;
};

// =========================================
// 게시글 삭제 (본인 글만 가능)
// =========================================
export const deleteBoard = async (boardNo) => {
    const res = await api.delete(`/${boardNo}`);
    return res.data;
};

// =========================================
// 관리자 답변 작성
// request: { boardNo, content }
// =========================================
export const createComment = async (request) => {
    const res = await axios.post(`${API_SERVER_HOST}/api/comment`, request, {
        withCredentials: true,
    });
    return res.data;
};

// =========================================
// 관리자 답변 삭제
// =========================================
export const deleteComment = async (commentNo) => {
    const res = await axios.delete(`${API_SERVER_HOST}/api/comment/${commentNo}`, {
        withCredentials: true,
    });
    return res.data;
};
