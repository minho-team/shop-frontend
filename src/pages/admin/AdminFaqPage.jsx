// =========================================
// 관리자 FAQ 페이지 컴포넌트
// 기능: FAQ 목록 조회, 카테고리 필터링, 검색, 아코디언 스타일 표시
// =========================================
import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import { getAllFaqs, getFaqByCategory } from "../../api/faqApi";

const CATEGORY_LABELS = ["전체", "배송", "주문/결제", "취소/교환/반품", "상품/AS문의", "회원정보", "서비스", "이용안내"];

const AdminFaqPage = () => {
    // 상태 변수들 (useState)
    const [faqList, setFaqList] = useState([]);                 // FAQ 목록 (배열)
    const [categoryFilter, setCategoryFilter] = useState("전체"); // 카테고리 필터 ("전체", "배송" 등)
    const [searchKeyword, setSearchKeyword] = useState("");     // 검색 키워드 (문자열)
    const [filtered, setFiltered] = useState([]);              // 필터링된 목록 (배열)
    const [openFaqNo, setOpenFaqNo] = useState(null);          // 펼쳐진 FAQ 번호 (숫자 또는 null)
    const [loading, setLoading] = useState(false);             // 로딩 상태 (불리언)

    // =========================================
    // 카테고리 필터 변경 시 목록 조회
    // =========================================
    useEffect(() => { fetchList(); }, [categoryFilter]);

    // =========================================
    // 검색어에 따라 목록 필터링
    // =========================================
    useEffect(() => {
        if (searchKeyword.trim()) {
            const kw = searchKeyword.toLowerCase();  // 소문자 변환
            setFiltered(faqList.filter(f =>
                f.question.toLowerCase().includes(kw) || f.answer.toLowerCase().includes(kw)  // 질문/답변 검색
            ));
        } else {
            setFiltered(faqList);  // 전체 목록 설정
        }
    }, [faqList, searchKeyword]);

    // =========================================
    // FAQ 목록 조회 함수
    // =========================================
    const fetchList = async () => {
        setLoading(true);  // 로딩 시작
        try {
            const data = categoryFilter === "전체"
                ? await getAllFaqs()  // 전체 FAQ 조회
                : await getFaqByCategory(categoryFilter);  // 카테고리별 조회
            setFaqList(data);  // 목록 설정
            setOpenFaqNo(null);  // 펼침 초기화
        } catch (e) {
            console.error("FAQ 조회 실패:", e);  // 에러 로그
        } finally {
            setLoading(false);  // 로딩 종료
        }
    };

    // =========================================
    // 날짜 포맷팅 함수
    // ts: 타임스탬프
    // =========================================
    const formatDate = (ts) => {
        if (!ts) return "-";  // null/undefined 처리
        return new Date(ts).toLocaleDateString("ko-KR");  // 한국어 날짜 형식
    };

    return (
        <>
            <AdminHeader />
            <AdminLayout pageTitle="FAQ 관리">

                {/* 필터 영역 */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
                    {/* 카테고리 탭 */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {CATEGORY_LABELS.map(c => (
                            <button key={c} onClick={() => { setCategoryFilter(c); setSearchKeyword(""); }}
                                style={{
                                    padding: "6px 14px", borderRadius: "20px", fontSize: "13px", cursor: "pointer",
                                    border: "1px solid #ddd",
                                    background: categoryFilter === c ? "#222" : "#fff",
                                    color: categoryFilter === c ? "#fff" : "#333"
                                }}>
                                {c}
                            </button>
                        ))}
                    </div>

                    {/* 키워드 검색 */}
                    <input type="text" placeholder="질문/답변 검색" value={searchKeyword}
                        onChange={e => setSearchKeyword(e.target.value)}
                        style={{
                            marginLeft: "auto", padding: "6px 12px", borderRadius: "4px",
                            border: "1px solid #ddd", fontSize: "13px", width: "200px"
                        }} />
                </div>

                <div style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>
                    총 {filtered.length}건
                </div>

                {/* FAQ 목록 */}
                {loading ? (
                    <p style={{ textAlign: "center", padding: "40px", color: "#999" }}>로딩 중...</p>
                ) : filtered.length === 0 ? (
                    <p style={{ textAlign: "center", padding: "40px", color: "#999" }}>등록된 FAQ가 없습니다.</p>
                ) : (
                    <div style={{ border: "1px solid #eee", borderRadius: "6px", overflow: "hidden" }}>
                        {/* 테이블 헤더 */}
                        <div style={{
                            display: "grid", gridTemplateColumns: "60px 130px 1fr 100px",
                            background: "#f5f5f5", borderBottom: "2px solid #222",
                            padding: "10px 16px", fontSize: "13px", fontWeight: "bold", color: "#444"
                        }}>
                            <span style={{ textAlign: "center" }}>번호</span>
                            <span>카테고리</span>
                            <span>질문</span>
                            <span style={{ textAlign: "center" }}>등록일</span>
                        </div>

                        {/* FAQ 아코디언 목록 */}
                        {filtered.map(faq => (
                            <div key={faq.faqNo} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                {/* 질문 행 */}
                                <div onClick={() => setOpenFaqNo(openFaqNo === faq.faqNo ? null : faq.faqNo)}
                                    style={{
                                        display: "grid", gridTemplateColumns: "60px 130px 1fr 100px",
                                        padding: "12px 16px", cursor: "pointer", alignItems: "center",
                                        background: openFaqNo === faq.faqNo ? "#fafafa" : "#fff"
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                                    onMouseLeave={e => e.currentTarget.style.background = openFaqNo === faq.faqNo ? "#fafafa" : "#fff"}>
                                    <span style={{ textAlign: "center", fontSize: "13px", color: "#999" }}>{faq.faqNo}</span>
                                    <span style={{ fontSize: "13px" }}>
                                        <span style={{
                                            padding: "2px 8px", borderRadius: "10px", background: "#f0f0f0",
                                            fontSize: "12px", color: "#555"
                                        }}>{faq.category}</span>
                                    </span>
                                    <span style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ color: "#999", fontSize: "12px" }}>Q.</span>
                                        {faq.question}
                                        <span style={{ marginLeft: "auto", color: "#aaa", fontSize: "16px" }}>
                                            {openFaqNo === faq.faqNo ? "▲" : "▼"}
                                        </span>
                                    </span>
                                    <span style={{ textAlign: "center", fontSize: "12px", color: "#aaa" }}>{formatDate(faq.createdAt)}</span>
                                </div>

                                {/* 답변 펼침 */}
                                {openFaqNo === faq.faqNo && (
                                    <div style={{
                                        background: "#f8f8f8", padding: "14px 16px 14px 80px",
                                        borderTop: "1px solid #f0f0f0"
                                    }}>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <span style={{ color: "#2e7d32", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}>A.</span>
                                            <p style={{
                                                fontSize: "14px", color: "#444", lineHeight: "1.7",
                                                whiteSpace: "pre-wrap", margin: 0
                                            }}>{faq.answer}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </AdminLayout>
        </>
    );
};

export default AdminFaqPage;
