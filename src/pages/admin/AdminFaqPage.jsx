// =========================================
// 관리자 FAQ 페이지 컴포넌트
// 기능: FAQ 목록 조회, 카테고리 필터링, 검색, 아코디언 표시, 페이징, FAQ 추가/삭제
// =========================================
import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import { getAllFaqs, getFaqByCategory, createFaq, deleteFaq } from "../../api/faqApi";

const CATEGORY_LABELS = ["전체", "배송", "주문/결제", "취소/교환/반품", "상품/AS문의", "회원정보", "서비스", "이용안내"];

// 페이지당 FAQ 표시 개수
const PAGE_SIZE = 10;

const AdminFaqPage = () => {
    // 상태 변수들 (useState)
    const [faqList, setFaqList] = useState([]);                 // FAQ 목록 (배열)
    const [categoryFilter, setCategoryFilter] = useState("전체"); // 카테고리 필터 ("전체", "배송" 등)
    const [searchKeyword, setSearchKeyword] = useState("");     // 검색 키워드 (문자열)
    const [filtered, setFiltered] = useState([]);              // 필터링된 목록 (배열)
    const [openFaqNo, setOpenFaqNo] = useState(null);          // 펼쳐진 FAQ 번호 (숫자 또는 null)
    const [loading, setLoading] = useState(false);             // 로딩 상태 (불리언)
    const [currentPage, setCurrentPage] = useState(1);         // 현재 페이지 번호 (1부터 시작)
    const [showAddModal, setShowAddModal] = useState(false);   // FAQ 등록 모달 표시 여부 (불리언)

    // FAQ 등록 폼 입력값
    const [addForm, setAddForm] = useState({
        category: "배송",   // 카테고리 (기본값: 배송)
        question: "",        // 질문
        answer: "",          // 답변
        sortOrder: 0,        // 정렬 순서
    });

    // =========================================
    // 카테고리 필터 변경 시 목록 조회 및 페이지 초기화
    // =========================================
    useEffect(() => {
        fetchList();
        setCurrentPage(1);  // 필터 변경 시 첫 페이지로 이동
    }, [categoryFilter]);

    // =========================================
    // 검색어에 따라 목록 필터링 및 페이지 초기화
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
        setCurrentPage(1);  // 검색어 변경 시 첫 페이지로 이동
    }, [faqList, searchKeyword]);

    // =========================================
    // FAQ 목록 조회 함수
    // =========================================
    const fetchList = async () => {
        setLoading(true);  // 로딩 시작
        try {
            const data = categoryFilter === "전체"
                ? await getAllFaqs()                          // 전체 FAQ 조회
                : await getFaqByCategory(categoryFilter);    // 카테고리별 조회
            setFaqList(data);   // 목록 설정
            setOpenFaqNo(null); // 펼침 초기화
        } catch (e) {
            console.error("FAQ 조회 실패:", e);  // 에러 로그
        } finally {
            setLoading(false);  // 로딩 종료
        }
    };

    // =========================================
    // FAQ 삭제 처리 (관리자 전용, soft delete)
    // faqNo: 삭제할 FAQ 번호
    // =========================================
    const handleDelete = async (faqNo) => {
        if (!window.confirm("FAQ를 삭제하시겠습니까?")) return;  // 확인 대화상자
        try {
            await deleteFaq(faqNo);  // FAQ 삭제 API 호출
            alert("삭제되었습니다.");
            fetchList();  // 목록 재조회
        } catch (e) {
            alert("FAQ 삭제에 실패했습니다.");  // 실패 알림
        }
    };

    // =========================================
    // FAQ 등록 폼 입력값 변경 핸들러
    // =========================================
    const handleAddFormChange = (e) => {
        const { name, value } = e.target;
        setAddForm(prev => ({ ...prev, [name]: value }));
    };

    // =========================================
    // FAQ 등록 처리 (관리자 전용)
    // =========================================
    const handleAddSubmit = async () => {
        if (!addForm.question.trim() || !addForm.answer.trim()) {
            alert("질문과 답변을 모두 입력해주세요.");  // 유효성 검사
            return;
        }
        try {
            await createFaq({ ...addForm, sortOrder: Number(addForm.sortOrder) });  // FAQ 등록 API 호출
            alert("FAQ가 등록되었습니다.");
            setShowAddModal(false);  // 모달 닫기
            setAddForm({ category: "배송", question: "", answer: "", sortOrder: 0 });  // 폼 초기화
            fetchList();  // 목록 재조회
        } catch (e) {
            alert("FAQ 등록에 실패했습니다.");  // 실패 알림
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

    // =========================================
    // 페이징 계산
    // totalPages: 전체 페이지 수
    // pagedList: 현재 페이지에 해당하는 목록
    // =========================================
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const pagedList = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // =========================================
    // 페이지 변경 핸들러
    // page: 이동할 페이지 번호
    // =========================================
    const handlePageChange = (page) => {
        setCurrentPage(page);
        setOpenFaqNo(null);  // 페이지 변경 시 아코디언 초기화
    };

    return (
        <>
            <AdminHeader />
            <AdminLayout pageTitle="FAQ 관리">

                {/* 상단 FAQ 등록 버튼 */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            padding: "8px 18px", background: "#222", color: "#fff",
                            border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px"
                        }}
                    >
                        + FAQ 등록
                    </button>
                </div>

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

                {/* 전체 건수 */}
                <div style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>
                    총 {filtered.length}건
                </div>

                {/* FAQ 목록 (현재 페이지 데이터만 표시) */}
                {loading ? (
                    <p style={{ textAlign: "center", padding: "40px", color: "#999" }}>로딩 중...</p>
                ) : filtered.length === 0 ? (
                    <p style={{ textAlign: "center", padding: "40px", color: "#999" }}>등록된 FAQ가 없습니다.</p>
                ) : (
                    <div style={{ border: "1px solid #eee", borderRadius: "6px", overflow: "hidden" }}>
                        {/* 테이블 헤더 */}
                        <div style={{
                            display: "grid", gridTemplateColumns: "60px 130px 1fr 100px 70px",
                            background: "#f5f5f5", borderBottom: "2px solid #222",
                            padding: "10px 16px", fontSize: "13px", fontWeight: "bold", color: "#444"
                        }}>
                            <span style={{ textAlign: "center" }}>번호</span>
                            <span>카테고리</span>
                            <span>질문</span>
                            <span style={{ textAlign: "center" }}>등록일</span>
                            <span style={{ textAlign: "center" }}>관리</span>
                        </div>

                        {/* FAQ 아코디언 목록 */}
                        {pagedList.map(faq => (
                            <div key={faq.faqNo} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                {/* 질문 행 */}
                                <div style={{
                                    display: "grid", gridTemplateColumns: "60px 130px 1fr 100px 70px",
                                    padding: "12px 16px", alignItems: "center",
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
                                    {/* 질문 클릭 시 아코디언 토글 */}
                                    <span
                                        onClick={() => setOpenFaqNo(openFaqNo === faq.faqNo ? null : faq.faqNo)}
                                        style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                        <span style={{ color: "#999", fontSize: "12px" }}>Q.</span>
                                        {faq.question}
                                        <span style={{ marginLeft: "auto", color: "#aaa", fontSize: "16px" }}>
                                            {openFaqNo === faq.faqNo ? "▲" : "▼"}
                                        </span>
                                    </span>
                                    <span style={{ textAlign: "center", fontSize: "12px", color: "#aaa" }}>{formatDate(faq.createdAt)}</span>
                                    {/* 삭제 버튼 */}
                                    <span style={{ textAlign: "center" }}>
                                        <button
                                            onClick={() => handleDelete(faq.faqNo)}
                                            style={{
                                                background: "none", border: "1px solid #e00", color: "#e00",
                                                borderRadius: "4px", padding: "3px 8px", fontSize: "12px", cursor: "pointer"
                                            }}
                                        >
                                            삭제
                                        </button>
                                    </span>
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

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "24px" }}>
                        {/* 이전 버튼 */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{
                                padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px",
                                background: "#fff", cursor: currentPage === 1 ? "default" : "pointer",
                                color: currentPage === 1 ? "#ccc" : "#333", fontSize: "13px"
                            }}
                        >
                            이전
                        </button>

                        {/* 페이지 번호 목록 */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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

                        {/* 다음 버튼 */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px",
                                background: "#fff", cursor: currentPage === totalPages ? "default" : "pointer",
                                color: currentPage === totalPages ? "#ccc" : "#333", fontSize: "13px"
                            }}
                        >
                            다음
                        </button>
                    </div>
                )}

                {/* FAQ 등록 모달 */}
                {showAddModal && (
                    <div style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <div style={{
                            background: "#fff", borderRadius: "8px", width: "560px", maxHeight: "85vh",
                            overflow: "auto", padding: "32px", position: "relative"
                        }}>
                            {/* 닫기 버튼 */}
                            <button onClick={() => setShowAddModal(false)} style={{
                                position: "absolute", top: "16px", right: "20px",
                                background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#666"
                            }}>✕</button>

                            <h3 style={{ fontSize: "17px", fontWeight: "bold", marginBottom: "20px" }}>FAQ 등록</h3>

                            {/* 카테고리 선택 */}
                            <div style={{ marginBottom: "14px" }}>
                                <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "6px" }}>카테고리</label>
                                <select name="category" value={addForm.category} onChange={handleAddFormChange}
                                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}>
                                    {CATEGORY_LABELS.filter(c => c !== "전체").map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 질문 입력 */}
                            <div style={{ marginBottom: "14px" }}>
                                <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "6px" }}>질문</label>
                                <input type="text" name="question" value={addForm.question}
                                    onChange={handleAddFormChange} placeholder="질문을 입력하세요"
                                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box" }} />
                            </div>

                            {/* 답변 입력 */}
                            <div style={{ marginBottom: "14px" }}>
                                <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "6px" }}>답변</label>
                                <textarea name="answer" value={addForm.answer}
                                    onChange={handleAddFormChange} placeholder="답변을 입력하세요"
                                    rows={5}
                                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }} />
                            </div>

                            {/* 정렬 순서 입력 */}
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ fontSize: "13px", color: "#666", display: "block", marginBottom: "6px" }}>정렬 순서</label>
                                <input type="number" name="sortOrder" value={addForm.sortOrder}
                                    onChange={handleAddFormChange} min={0}
                                    style={{ width: "100px", padding: "8px 12px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }} />
                            </div>

                            {/* 버튼 영역 */}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                <button onClick={() => setShowAddModal(false)}
                                    style={{
                                        padding: "8px 20px", border: "1px solid #ddd", borderRadius: "4px",
                                        background: "#fff", cursor: "pointer", fontSize: "14px"
                                    }}>
                                    취소
                                </button>
                                <button onClick={handleAddSubmit}
                                    style={{
                                        padding: "8px 20px", background: "#222", color: "#fff", border: "none",
                                        borderRadius: "4px", cursor: "pointer", fontSize: "14px"
                                    }}>
                                    등록
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AdminLayout>
        </>
    );
};

export default AdminFaqPage;