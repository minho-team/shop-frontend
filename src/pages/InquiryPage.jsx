
// 문의 게시판 홈/////////////////////////////////////////
// 여기서 자주 묻는 질문과 1:1문의 내역을 클릭에 따라 분기 처리
// 페이징 구현해야 함

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getAllFaqs, getFaqByCategory, searchFaq } from "../api/faqApi";
import { useUser } from "../context/UserContext";

// 문의 카테고리 목록
const CATEGORIES = ["전체", "배송", "주문/결제", "취소/교환/반품", "상품/AS문의", "회원정보", "서비스", "이용안내"];

const InquiryPage = () => {
    const navigate = useNavigate();
    const { user } = useUser();

    // 현재 탭 (faq: 자주묻는질문 / board: 1:1 문의)
    const [activeTab, setActiveTab] = useState("faq");

    // 선택된 카테고리
    const [selectedCategory, setSelectedCategory] = useState("전체");

    // FAQ 목록
    const [faqList, setFaqList] = useState([]);

    // 검색 입력값 (실시간)
    const [searchInput, setSearchInput] = useState("");

    // 실제 검색에 사용되는 키워드 (검색 버튼 클릭 시 적용)
    const [keyword, setKeyword] = useState("");

    // 아코디언 열린 FAQ 번호
    const [openFaqNo, setOpenFaqNo] = useState(null);

    // 로딩 상태
    const [loading, setLoading] = useState(false);

    // 카테고리 또는 키워드 변경 시 FAQ 재조회
    useEffect(() => {
        fetchFaq();
    }, [selectedCategory, keyword]);

    // FAQ 조회 함수 (전체 / 카테고리 / 키워드 검색)
    const fetchFaq = async () => {
        setLoading(true);
        try {
            let data;
            if (keyword) {
                data = await searchFaq(keyword);          // 키워드 검색
            } else if (selectedCategory === "전체") {
                data = await getAllFaqs();                 // 전체 조회
            } else {
                data = await getFaqByCategory(selectedCategory); // 카테고리별 조회
            }
            setFaqList(data);
            setOpenFaqNo(null); // 조회 시 아코디언 초기화
        } catch (e) {
            console.error("FAQ 조회 실패:", e);
        } finally {
            setLoading(false);
        }
    };

    // 검색 실행
    const handleSearch = () => {
        setKeyword(searchInput);
        setSelectedCategory("전체");
    };

    // 엔터키로 검색
    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    // FAQ 아코디언 토글
    const toggleFaq = (faqNo) => {
        setOpenFaqNo(openFaqNo === faqNo ? null : faqNo);
    };

    // 1:1 문의 작성 (로그인 필요)
    const handleInquiryWrite = () => {
        if (!user) {
            alert("로그인 후 이용 가능합니다.");
            navigate("/login");
            return;
        }
        navigate("/inquiry/write");
    };

    // 내 문의 내역 보기 (로그인 필요)
    const handleMyInquiry = () => {
        if (!user) {
            alert("로그인 후 이용 가능합니다.");
            navigate("/login");
            return;
        }
        navigate("/inquiry/my");
    };

    return (
        <>
            <Header />
            <div style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px" }}>

                {/* 탭 메뉴 */}
                <div style={{ display: "flex", borderBottom: "2px solid #222", marginBottom: "30px" }}>
                    <button
                        onClick={() => setActiveTab("faq")}
                        style={{
                            padding: "12px 30px", border: "none", background: "none", cursor: "pointer", fontSize: "15px",
                            fontWeight: activeTab === "faq" ? "bold" : "normal",
                            borderBottom: activeTab === "faq" ? "2px solid #222" : "none",
                        }}
                    >
                        자주 묻는 질문
                    </button>
                    <button
                        onClick={() => setActiveTab("board")}
                        style={{
                            padding: "12px 30px", border: "none", background: "none", cursor: "pointer", fontSize: "15px",
                            fontWeight: activeTab === "board" ? "bold" : "normal",
                            borderBottom: activeTab === "board" ? "2px solid #222" : "none",
                        }}
                    >
                        1:1 문의
                    </button>
                </div>

                {/* ===== FAQ 탭 ===== */}
                {activeTab === "faq" && (
                    <div>
                        {/* 검색창 */}
                        <div style={{ display: "flex", marginBottom: "24px", border: "1px solid #ddd", borderRadius: "4px", overflow: "hidden" }}>
                            <input
                                type="text"
                                placeholder="무엇을 도와드릴까요?"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                style={{ flex: 1, padding: "12px 16px", border: "none", outline: "none", fontSize: "14px" }}
                            />
                            <button
                                onClick={handleSearch}
                                style={{ padding: "12px 20px", background: "#222", color: "#fff", border: "none", cursor: "pointer" }}
                            >
                                검색
                            </button>
                        </div>

                        {/* 카테고리 필터 버튼 */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => { setSelectedCategory(cat); setKeyword(""); setSearchInput(""); }}
                                    style={{
                                        padding: "6px 16px", borderRadius: "20px", cursor: "pointer", fontSize: "13px",
                                        border: "1px solid #ddd",
                                        background: selectedCategory === cat ? "#222" : "#fff",
                                        color: selectedCategory === cat ? "#fff" : "#222",
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* FAQ 아코디언 목록 */}
                        {loading ? (
                            <p style={{ textAlign: "center", color: "#999" }}>로딩 중...</p>
                        ) : faqList.length === 0 ? (
                            <p style={{ textAlign: "center", color: "#999", padding: "40px 0" }}>검색 결과가 없습니다.</p>
                        ) : (
                            faqList.map((faq) => (
                                <div key={faq.faqNo} style={{ borderBottom: "1px solid #eee" }}>
                                    {/* 질문 헤더 */}
                                    <div
                                        onClick={() => toggleFaq(faq.faqNo)}
                                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", cursor: "pointer" }}
                                    >
                                        <div>
                                            <span style={{ fontSize: "12px", color: "#999", marginRight: "10px" }}>{faq.category}</span>
                                            <span style={{ fontSize: "14px" }}>{faq.question}</span>
                                        </div>
                                        <span style={{ fontSize: "18px", color: "#999" }}>
                                            {openFaqNo === faq.faqNo ? "▲" : "▼"}
                                        </span>
                                    </div>
                                    {/* 답변 (아코디언 펼쳐짐) */}
                                    {openFaqNo === faq.faqNo && (
                                        <div style={{ background: "#f9f9f9", padding: "16px 20px", fontSize: "14px", color: "#555", lineHeight: "1.7" }}>
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ===== 1:1 문의 탭 ===== */}
                {activeTab === "board" && (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <p style={{ fontSize: "16px", marginBottom: "12px" }}>📩 궁금한 점이 있으신가요?</p>
                        <p style={{ fontSize: "14px", color: "#666", marginBottom: "30px" }}>
                            1:1 문의를 남겨주시면 빠르게 답변 드리겠습니다.
                        </p>
                        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                            <button
                                onClick={handleInquiryWrite}
                                style={{ padding: "12px 32px", background: "#222", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px" }}
                            >
                                1:1 문의하기
                            </button>
                            <button
                                onClick={handleMyInquiry}
                                style={{ padding: "12px 32px", background: "#fff", color: "#222", border: "1px solid #222", borderRadius: "4px", cursor: "pointer", fontSize: "14px" }}
                            >
                                내 문의 내역
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default InquiryPage;
