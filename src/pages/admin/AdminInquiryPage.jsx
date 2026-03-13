// =========================================
// 관리자 1:1 문의 페이지 컴포넌트
// 기능: 문의 목록 조회, 필터링, 상세 조회, 답변 작성/삭제
// =========================================
import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import { getAllInquiries, getOneInquiry, createComment, deleteComment } from "../../api/inquiryApi";

const STATUS_LABELS = ["전체", "답변대기", "답변완료"];
const CATEGORY_LABELS = ["전체", "배송", "주문/결제", "취소/교환/반품", "상품/AS문의", "회원정보", "서비스", "이용안내"];

const AdminInquiryPage = () => {
    // 상태 변수들 (useState)
    const [inquiryList, setInquiryList] = useState([]);           // 전체 문의 목록 (배열)
    const [filtered, setFiltered] = useState([]);                // 필터링된 목록 (배열)
    const [statusFilter, setStatusFilter] = useState("전체");     // 상태 필터 ("전체", "답변대기", "답변완료")
    const [categoryFilter, setCategoryFilter] = useState("전체"); // 카테고리 필터 ("전체", "배송" 등)
    const [searchKeyword, setSearchKeyword] = useState("");      // 검색 키워드 (문자열)
    const [selectedInquiry, setSelectedInquiry] = useState(null);  // 선택된 문의 번호 (상세 모달용, 숫자 또는 null)
    const [detail, setDetail] = useState(null);                    // 상세 데이터 { inquiry, files, comments } (객체 또는 null)
    const [commentContent, setCommentContent] = useState("");     // 답변 작성 내용 (문자열)
    const [loading, setLoading] = useState(false);               // 로딩 상태 (불리언)

    // =========================================
    // 컴포넌트 마운트 시 문의 목록 조회
    // =========================================
    useEffect(() => { fetchList(); }, []);

    // =========================================
    // 필터링 로직: 상태, 카테고리, 검색어에 따라 목록 필터링
    // =========================================
    useEffect(() => {
        let list = [...inquiryList];  // 원본 목록 복사
        if (statusFilter !== "전체") list = list.filter(i => i.status === statusFilter);  // 상태 필터 적용
        if (categoryFilter !== "전체") list = list.filter(i => i.category === categoryFilter);  // 카테고리 필터 적용
        if (searchKeyword.trim()) {
            const kw = searchKeyword.toLowerCase();  // 소문자 변환
            list = list.filter(i => i.title.toLowerCase().includes(kw) || i.content.toLowerCase().includes(kw));  // 제목/내용 검색
        }
        setFiltered(list);  // 필터링된 목록 설정
    }, [inquiryList, statusFilter, categoryFilter, searchKeyword]);

    // =========================================
    // 문의 목록 조회 함수
    // =========================================
    const fetchList = async () => {
        setLoading(true);  // 로딩 시작
        try {
            const data = await getAllInquiries();  // API 호출
            setInquiryList(data);  // 목록 설정
        } catch (e) {
            console.error("문의 목록 조회 실패:", e);  // 에러 로그
        } finally {
            setLoading(false);  // 로딩 종료
        }
    };

    // =========================================
    // 행 클릭 시 상세 조회 및 모달 열기
    // inquiryNo: 문의 번호
    // =========================================
    const handleRowClick = async (inquiryNo) => {
        try {
            const data = await getOneInquiry(inquiryNo);  // 상세 조회 API 호출
            setDetail(data);  // 상세 데이터 설정
            setSelectedInquiry(inquiryNo);  // 선택된 문의 설정
            setCommentContent("");  // 답변 내용 초기화
        } catch (e) {
            alert("상세 조회 실패");  // 사용자 알림
        }
    };

    // =========================================
    // 답변 등록 처리
    // =========================================
    const handleCommentSubmit = async () => {
        if (!commentContent.trim()) { alert("답변 내용을 입력해주세요."); return; }  // 유효성 검사
        try {
            await createComment({ inquiryNo: selectedInquiry, content: commentContent });  // 답변 작성 API 호출
            alert("답변이 등록되었습니다.");  // 성공 알림
            setCommentContent("");  // 내용 초기화
            await handleRowClick(selectedInquiry);  // 상세 조회 갱신
            await fetchList();  // 목록 갱신
        } catch (e) {
            alert("답변 등록 실패");  // 실패 알림
        }
    };

    // =========================================
    // 답변 삭제 처리
    // commentNo: 삭제할 답변 번호
    // =========================================
    const handleCommentDelete = async (commentNo) => {
        if (!window.confirm("답변을 삭제하시겠습니까?")) return;  // 확인 대화상자
        try {
            await deleteComment(commentNo);  // 답변 삭제 API 호출
            await handleRowClick(selectedInquiry);  // 상세 조회 갱신
            await fetchList();  // 목록 갱신
        } catch (e) {
            alert("답변 삭제 실패");  // 실패 알림
        }
    };

    // =========================================
    // 모달 닫기
    // =========================================
    const closeModal = () => {
        setSelectedInquiry(null);  // 선택 초기화
        setDetail(null);  // 상세 데이터 초기화
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
            <AdminLayout pageTitle="1:1 문의 관리">

                {/* 필터 영역 */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
                    {/* 상태 필터 */}
                    <div style={{ display: "flex", gap: "6px" }}>
                        {STATUS_LABELS.map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                style={{
                                    padding: "6px 14px", borderRadius: "20px", fontSize: "13px", cursor: "pointer",
                                    border: "1px solid #ddd",
                                    background: statusFilter === s ? "#222" : "#fff",
                                    color: statusFilter === s ? "#fff" : "#333"
                                }}>
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* 카테고리 필터 */}
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                        style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "13px" }}>
                        {CATEGORY_LABELS.map(c => <option key={c}>{c}</option>)}
                    </select>

                    {/* 키워드 검색 */}
                    <input type="text" placeholder="제목/내용 검색" value={searchKeyword}
                        onChange={e => setSearchKeyword(e.target.value)}
                        style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "13px", width: "200px" }} />

                    <span style={{ marginLeft: "auto", fontSize: "13px", color: "#888" }}>
                        총 {filtered.length}건
                    </span>
                </div>

                {/* 목록 테이블 */}
                {loading ? (
                    <p style={{ textAlign: "center", padding: "40px", color: "#999" }}>로딩 중...</p>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                        <thead>
                            <tr style={{ background: "#f5f5f5", borderTop: "2px solid #222" }}>
                                <th style={th}>번호</th>
                                <th style={th}>카테고리</th>
                                <th style={{ ...th, textAlign: "left" }}>제목</th>
                                <th style={th}>회원번호</th>
                                <th style={th}>상태</th>
                                <th style={th}>비밀글</th>
                                <th style={th}>등록일</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                                    조회된 문의가 없습니다.
                                </td></tr>
                            ) : filtered.map(item => (
                                <tr key={item.inquiryNo} onClick={() => handleRowClick(item.inquiryNo)}
                                    style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                                    onMouseLeave={e => e.currentTarget.style.background = ""}>
                                    <td style={td}>{item.inquiryNo}</td>
                                    <td style={td}>{item.category}</td>
                                    <td style={{ ...td, textAlign: "left" }}>
                                        {item.secretYn === "Y" && <span style={{ color: "#e00", marginRight: "6px" }}>🔒</span>}
                                        {item.title}
                                    </td>
                                    <td style={td}>{item.memberNo}</td>
                                    <td style={td}>
                                        <span style={{
                                            padding: "3px 10px", borderRadius: "12px", fontSize: "12px",
                                            background: item.status === "답변완료" ? "#e8f5e9" : "#fff3e0",
                                            color: item.status === "답변완료" ? "#2e7d32" : "#e65100"
                                        }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td style={td}>{item.secretYn === "Y" ? "Y" : "N"}</td>
                                    <td style={td}>{formatDate(item.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* 상세 모달 */}
                {selectedInquiry && detail && (
                    <div style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <div style={{
                            background: "#fff", borderRadius: "8px", width: "680px", maxHeight: "85vh",
                            overflow: "auto", padding: "32px", position: "relative"
                        }}>

                            {/* 닫기 버튼 */}
                            <button onClick={closeModal} style={{
                                position: "absolute", top: "16px", right: "20px",
                                background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#666"
                            }}>✕</button>

                            <h3 style={{ fontSize: "17px", fontWeight: "bold", marginBottom: "20px" }}>문의 상세</h3>

                            {/* 문의 정보 */}
                            <div style={{ background: "#f9f9f9", borderRadius: "6px", padding: "16px", marginBottom: "20px" }}>
                                <div style={{ display: "flex", gap: "16px", marginBottom: "10px", fontSize: "13px", color: "#666" }}>
                                    <span>카테고리: <b style={{ color: "#222" }}>{detail.inquiry.category}</b></span>
                                    <span>상태: <b style={{ color: detail.inquiry.status === "답변완료" ? "#2e7d32" : "#e65100" }}>{detail.inquiry.status}</b></span>
                                    <span>비밀글: {detail.inquiry.secretYn}</span>
                                    <span>등록일: {formatDate(detail.inquiry.createdAt)}</span>
                                </div>
                                <div style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "12px" }}>{detail.inquiry.title}</div>
                                <div style={{ fontSize: "14px", color: "#444", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{detail.inquiry.content}</div>

                                {/* 첨부파일 */}
                                {detail.files && detail.files.length > 0 && (
                                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #eee" }}>
                                        <p style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>첨부파일</p>
                                        {detail.files.map(f => (
                                            <div key={f.inquiryFileNo} style={{ fontSize: "13px", color: "#555" }}>
                                                📎 {f.fileName}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 기존 답변 목록 */}
                            {detail.comments && detail.comments.length > 0 && (
                                <div style={{ marginBottom: "20px" }}>
                                    <p style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px" }}>등록된 답변</p>
                                    {detail.comments.map(c => (
                                        <div key={c.inquiryCommentNo} style={{
                                            background: "#e8f5e9", borderRadius: "6px",
                                            padding: "14px 16px", marginBottom: "8px", position: "relative"
                                        }}>
                                            <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{c.content}</div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                                                <span style={{ fontSize: "11px", color: "#888" }}>{formatDate(c.createdAt)}</span>
                                                <button onClick={() => handleCommentDelete(c.inquiryCommentNo)}
                                                    style={{ background: "none", border: "none", color: "#e00", fontSize: "12px", cursor: "pointer" }}>
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 답변 작성 */}
                            <div>
                                <p style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "8px" }}>답변 작성</p>
                                <textarea value={commentContent} onChange={e => setCommentContent(e.target.value)}
                                    rows={5} placeholder="답변 내용을 입력하세요"
                                    style={{
                                        width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px",
                                        fontSize: "14px", resize: "vertical", boxSizing: "border-box"
                                    }} />
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                                    <button onClick={closeModal}
                                        style={{
                                            padding: "8px 20px", border: "1px solid #ddd", borderRadius: "4px",
                                            background: "#fff", cursor: "pointer", fontSize: "14px"
                                        }}>
                                        닫기
                                    </button>
                                    <button onClick={handleCommentSubmit}
                                        style={{
                                            padding: "8px 20px", background: "#222", color: "#fff", border: "none",
                                            borderRadius: "4px", cursor: "pointer", fontSize: "14px"
                                        }}>
                                        답변 등록
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AdminLayout>
        </>
    );
};

const th = { padding: "10px 12px", fontWeight: "bold", textAlign: "center", borderBottom: "1px solid #ddd" };
const td = { padding: "10px 12px", textAlign: "center", borderBottom: "1px solid #f0f0f0" };

export default AdminInquiryPage;
