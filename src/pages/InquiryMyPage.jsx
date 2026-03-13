// 1:1 문의의 내 문의 내역 리스트 페이지


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getMyBoards, deleteBoard } from "../api/inquiryApi";

const InquiryMyPage = () => {
    const navigate = useNavigate();

    // 내 문의 목록
    const [boards, setBoards] = useState([]);

    // 로딩 상태
    const [loading, setLoading] = useState(true);

    // 컴포넌트 마운트 시 내 문의 내역 조회
    useEffect(() => {
        fetchMyBoards();
    }, []);

    const fetchMyBoards = async () => {
        setLoading(true);
        try {
            const data = await getMyBoards();
            setBoards(data);
        } catch (e) {
            console.error("문의 내역 조회 실패:", e);
        } finally {
            setLoading(false);
        }
    };

    // 게시글 삭제 (소프트 딜리트)
    const handleDelete = async (boardNo) => {
        if (!window.confirm("문의를 삭제하시겠습니까?")) return;
        try {
            await deleteBoard(boardNo);
            alert("삭제되었습니다.");
            fetchMyBoards(); // 목록 재조회
        } catch (e) {
            alert("삭제에 실패했습니다.");
        }
    };

    // 날짜 포맷 (YYYY-MM-DD)
    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        return new Date(timestamp).toLocaleDateString("ko-KR");
    };

    return (
        <>
            <Header />
            <div style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>내 문의 내역</h2>
                    <button
                        onClick={() => navigate("/inquiry/write")}
                        style={{ padding: "10px 20px", background: "#222", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
                    >
                        + 문의하기
                    </button>
                </div>

                {loading ? (
                    <p style={{ textAlign: "center", color: "#999", padding: "40px 0" }}>로딩 중...</p>
                ) : boards.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#999", padding: "60px 0" }}>문의 내역이 없습니다.</p>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                        <thead>
                            <tr style={{ borderTop: "2px solid #222", borderBottom: "1px solid #ddd", background: "#f9f9f9" }}>
                                <th style={{ padding: "12px 8px", textAlign: "center", width: "60px" }}>번호</th>
                                <th style={{ padding: "12px 8px", textAlign: "center", width: "110px" }}>카테고리</th>
                                <th style={{ padding: "12px 8px", textAlign: "left" }}>제목</th>
                                <th style={{ padding: "12px 8px", textAlign: "center", width: "90px" }}>상태</th>
                                <th style={{ padding: "12px 8px", textAlign: "center", width: "90px" }}>작성일</th>
                                <th style={{ padding: "12px 8px", textAlign: "center", width: "60px" }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {boards.map((board) => (
                                <tr key={board.boardNo} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={{ padding: "12px 8px", textAlign: "center", color: "#999" }}>{board.boardNo}</td>
                                    <td style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: "13px" }}>{board.category}</td>
                                    <td style={{ padding: "12px 8px" }}>
                                        <span
                                            onClick={() => navigate(`/inquiry/${board.boardNo}`)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            {/* 비밀글이면 자물쇠 아이콘 표시 */}
                                            {board.secretYn === "Y" && <span style={{ marginRight: "6px", fontSize: "12px" }}>🔒</span>}
                                            {board.title}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                                        {/* 답변 상태 배지 */}
                                        <span style={{
                                            padding: "3px 10px", borderRadius: "12px", fontSize: "12px",
                                            background: board.status === "답변완료" ? "#e8f5e9" : "#fff3e0",
                                            color: board.status === "답변완료" ? "#2e7d32" : "#e65100",
                                        }}>
                                            {board.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px 8px", textAlign: "center", color: "#999", fontSize: "13px" }}>
                                        {formatDate(board.createdAt)}
                                    </td>
                                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                                        <button
                                            onClick={() => handleDelete(board.boardNo)}
                                            style={{ background: "none", border: "none", color: "#e00", cursor: "pointer", fontSize: "12px" }}
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
};

export default InquiryMyPage;
