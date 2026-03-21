// =========================================
// 1:1 문의 내 문의 내역 리스트 페이지 컴포넌트
// 기능: 내 문의 목록 조회, 삭제, 페이징 (서버사이드)
// =========================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/user/Header";
import { getMyInquiryPage, deleteInquiry } from "../../api/user/inquiryApi";

// 페이지당 문의 표시 개수
const PAGE_SIZE = 10;

// 한 번에 표시할 페이지 번호 개수
const PAGE_GROUP_SIZE = 5;

const InquiryMyPage = () => {
    const navigate = useNavigate();

    // 현재 페이지에 표시할 문의 목록
    const [boards, setBoards] = useState([]);

    // 전체 건수 (서버에서 받아온 값)
    const [totalCount, setTotalCount] = useState(0);

    // 전체 페이지 수 (서버에서 받아온 값)
    const [totalPages, setTotalPages] = useState(1);

    // 현재 페이지 번호 (1부터 시작)
    const [currentPage, setCurrentPage] = useState(1);

    // 로딩 상태
    const [loading, setLoading] = useState(true);

    // =========================================
    // 페이지 변경 시 내 문의 내역 재조회
    // =========================================
    useEffect(() => {
        fetchMyBoards();
    }, [currentPage]);

    // =========================================
    // 내 문의 목록 페이징 조회 함수 (서버사이드)
    // 서버에서 현재 페이지 데이터만 받아옴
    // =========================================
    const fetchMyBoards = async () => {
        setLoading(true);
        try {
            // 서버에 page, size 전달 (memberNo는 서버에서 JWT로 추출)
            const data = await getMyInquiryPage({
                page: currentPage,
                size: PAGE_SIZE,
            });
            setBoards(data.list);           // 현재 페이지 문의 목록
            setTotalCount(data.totalCount); // 전체 건수
            setTotalPages(data.totalPages); // 전체 페이지 수
        } catch (e) {
            console.error("문의 내역 조회 실패:", e);
        } finally {
            setLoading(false);
        }
    };

    // =========================================
    // 문의 삭제 처리 (소프트 딜리트)
    // inquiryNo: 삭제할 문의 번호
    // =========================================
    const handleDelete = async (inquiryNo) => {
        if (!window.confirm("문의를 삭제하시겠습니까?")) return;
        try {
            await deleteInquiry(inquiryNo);
            alert("삭제되었습니다.");
            fetchMyBoards(); // 목록 재조회
        } catch (e) {
            alert("삭제에 실패했습니다.");
        }
    };

    // =========================================
    // 날짜 포맷 함수 (YYYY-MM-DD)
    // timestamp: 서버에서 받은 타임스탬프
    // =========================================
    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        return new Date(timestamp).toLocaleDateString("ko-KR");
    };

    // =========================================
    // 페이지 그룹 계산 (5개씩 표시)
    // currentGroup: 현재 페이지가 속한 그룹 번호
    // startPage: 현재 그룹의 시작 페이지
    // endPage: 현재 그룹의 끝 페이지
    // =========================================
    const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
    const startPage = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
    const endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

    // =========================================
    // 페이지 변경 핸들러
    // page: 이동할 페이지 번호
    // =========================================
    const handlePageChange = (page) => {
        setCurrentPage(page);
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

                {/* 전체 건수 표시 (서버에서 받아온 실제 총 건수) */}
                <div style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>
                    총 {totalCount}건
                </div>

                {loading ? (
                    <p style={{ textAlign: "center", color: "#999", padding: "40px 0" }}>로딩 중...</p>
                ) : boards.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#999", padding: "60px 0" }}>문의 내역이 없습니다.</p>
                ) : (
                    <>
                        {/* 문의 목록 테이블 (현재 페이지 데이터만 표시) */}
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
                                    <tr key={board.inquiryNo} style={{ borderBottom: "1px solid #eee" }}>
                                        <td style={{ padding: "12px 8px", textAlign: "center", color: "#999" }}>
                                            {board.inquiryNo}
                                        </td>
                                        <td style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: "13px" }}>{board.category}</td>
                                        <td style={{ padding: "12px 8px" }}>
                                            <span
                                                onClick={() => navigate(`/inquiry/my/detail/${board.inquiryNo}`)}
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
                                                onClick={() => handleDelete(board.inquiryNo)}
                                                style={{ background: "none", border: "none", color: "#e00", cursor: "pointer", fontSize: "12px" }}
                                            >
                                                삭제
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* 페이지네이션 (5개씩 그룹으로 표시) */}
                        {totalPages > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "32px" }}>
                                {/* 이전 그룹 버튼: 현재 그룹의 이전 페이지로 이동 */}
                                <button
                                    onClick={() => handlePageChange(startPage - 1)}
                                    disabled={startPage === 1}
                                    style={{
                                        padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px",
                                        background: "#fff", cursor: startPage === 1 ? "default" : "pointer",
                                        color: startPage === 1 ? "#ccc" : "#333", fontSize: "13px"
                                    }}
                                >
                                    &lt;
                                </button>

                                {/* 페이지 번호 목록 (현재 그룹의 5개만 표시) */}
                                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        style={{
                                            padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px",
                                            background: currentPage === page ? "#222" : "#fff",
                                            color: currentPage === page ? "#fff" : "#333",
                                            cursor: "pointer", fontSize: "13px"
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}

                                {/* 다음 그룹 버튼: 현재 그룹의 다음 페이지로 이동 */}
                                <button
                                    onClick={() => handlePageChange(endPage + 1)}
                                    disabled={endPage === totalPages}
                                    style={{
                                        padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px",
                                        background: "#fff", cursor: endPage === totalPages ? "default" : "pointer",
                                        color: endPage === totalPages ? "#ccc" : "#333", fontSize: "13px"
                                    }}
                                >
                                    &gt;
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default InquiryMyPage;
