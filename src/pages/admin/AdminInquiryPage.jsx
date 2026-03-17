// =========================================
// 관리자 1:1 문의 페이지 컴포넌트
// 기능: 문의 목록 조회, 필터링, 상세 조회, 답변 작성/삭제, 문의 삭제, 페이징 (서버사이드)
// =========================================
import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import { getInquiryPage, getOneInquiry, adminDeleteInquiry } from "../../api/inquiryApi";
import { createComment, deleteComment } from "../../api/commentApi";
// [수정] 첨부파일 이미지 미리보기를 위해 API_SERVER_HOST import 추가
import { API_SERVER_HOST } from "../../api/apiClient";


const STATUS_LABELS = ["전체", "답변대기", "답변완료"];
const CATEGORY_LABELS = ["전체", "배송", "주문/결제", "취소/교환/반품", "상품/AS문의", "회원정보", "서비스", "이용안내"];

// 페이지당 문의 표시 개수
const PAGE_SIZE = 10;

// 한 번에 표시할 페이지 번호 개수
const PAGE_GROUP_SIZE = 5;

const AdminInquiryPage = () => {
    // 현재 페이지에 표시할 문의 목록
    const [inquiryList, setInquiryList] = useState([]);

    // 전체 건수 (서버에서 받아온 값)
    const [totalCount, setTotalCount] = useState(0);

    // 전체 페이지 수 (서버에서 받아온 값)
    const [totalPages, setTotalPages] = useState(1);

    // 현재 페이지 번호 (1부터 시작)
    const [currentPage, setCurrentPage] = useState(1);

    // 상태 필터 ("전체", "답변대기", "답변완료")
    const [statusFilter, setStatusFilter] = useState("전체");

    // 카테고리 필터 ("전체", "배송" 등)
    const [categoryFilter, setCategoryFilter] = useState("전체");

    // 검색 키워드 입력값 (문자열)
    const [searchKeyword, setSearchKeyword] = useState("");

    // 실제 API 호출에 사용되는 키워드 (검색 버튼 클릭 시 적용)
    const [appliedKeyword, setAppliedKeyword] = useState("");

    // 선택된 문의 번호 (상세 모달용, 숫자 또는 null)
    const [selectedInquiry, setSelectedInquiry] = useState(null);

    // 상세 데이터 { inquiry, files, comments } (객체 또는 null)
    const [detail, setDetail] = useState(null);

    // 답변 작성 내용 (문자열)
    const [commentContent, setCommentContent] = useState("");

    // 로딩 상태 (불리언)
    const [loading, setLoading] = useState(false);

    // =========================================
    // 필터(상태/카테고리/키워드), 페이지 변경 시 문의 목록 재조회
    // =========================================
    useEffect(() => {
        fetchList();
    }, [statusFilter, categoryFilter, appliedKeyword, currentPage]);

    // =========================================
    // 문의 페이징 조회 함수 (서버사이드)
    // 서버에서 현재 페이지 데이터만 받아옴
    // =========================================
    const fetchList = async () => {
        setLoading(true);
        try {
            // 서버에 page, size, status, category, keyword 전달
            const data = await getInquiryPage({
                page: currentPage,
                size: PAGE_SIZE,
                status: statusFilter,
                category: categoryFilter,
                keyword: appliedKeyword,
            });
            setInquiryList(data.list);      // 현재 페이지 문의 목록
            setTotalCount(data.totalCount); // 전체 건수
            setTotalPages(data.totalPages); // 전체 페이지 수
        } catch (e) {
            console.error("문의 목록 조회 실패:", e);
        } finally {
            setLoading(false);
        }
    };

    // =========================================
    // 필터 변경 핸들러 (상태/카테고리)
    // 필터 변경 시 첫 페이지부터 다시 조회
    // =========================================
    const handleFilterChange = (type, value) => {
        if (type === "status") setStatusFilter(value);
        if (type === "category") setCategoryFilter(value);
        setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
    };

    // =========================================
    // 검색 실행 (버튼 클릭 또는 엔터키)
    // =========================================
    const handleSearch = () => {
        setAppliedKeyword(searchKeyword);
        setCurrentPage(1); // 검색 시 첫 페이지로 이동
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
            await handleRowClick(selectedInquiry);  // 상세 조회 갱신 (상태 변경 반영)
            await fetchList();  // 목록 갱신 (상태 변경 반영)
        } catch (e) {
            alert("답변 삭제 실패");  // 실패 알림
        }
    };

    // =========================================
    // 문의 삭제 처리 (관리자 전용)
    // inquiryNo: 삭제할 문의 번호
    // =========================================
    const handleInquiryDelete = async (inquiryNo) => {
        if (!window.confirm("문의를 삭제하시겠습니까?")) return;  // 확인 대화상자
        try {
            await adminDeleteInquiry(inquiryNo);  // 관리자 문의 삭제 API 호출
            alert("삭제되었습니다.");
            closeModal();   // 모달 닫기
            fetchList();    // 목록 갱신
        } catch (e) {
            alert("문의 삭제 실패");  // 실패 알림
        }
    };

    // =========================================
    // 모달 닫기
    // =========================================
    const closeModal = () => {
        setSelectedInquiry(null);  // 선택 초기화
        setDetail(null);           // 상세 데이터 초기화
    };

    // =========================================
    // 날짜 포맷팅 함수 (목록용 - 날짜만)
    // ts: 타임스탬프
    // =========================================
    const formatDate = (ts) => {
        if (!ts) return "-";
        return new Date(ts).toLocaleDateString("ko-KR");
    };

    // =========================================
    // 날짜+시간 포맷팅 함수 (상세 모달용 - 날짜+시간 모두 표시)
    // ts: 타임스탬프
    // =========================================
    const formatDateTime = (ts) => {
        if (!ts) return "-";
        return new Date(ts).toLocaleString("ko-KR");
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
            <AdminHeader />
            <AdminLayout pageTitle="1:1 문의 관리">

                {/* 필터 영역 */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
                    {/* 상태 필터 */}
                    <div style={{ display: "flex", gap: "6px" }}>
                        {STATUS_LABELS.map(s => (
                            <button key={s} onClick={() => handleFilterChange("status", s)}
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
                    <select value={categoryFilter} onChange={e => handleFilterChange("category", e.target.value)}
                        style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "13px" }}>
                        {CATEGORY_LABELS.map(c => <option key={c}>{c}</option>)}
                    </select>

                    {/* 키워드 검색 */}
                    <input type="text" placeholder="제목/내용 검색" value={searchKeyword}
                        onChange={e => setSearchKeyword(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSearch()}
                        style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "13px", width: "160px" }} />
                    <button onClick={handleSearch}
                        style={{
                            padding: "6px 14px", background: "#222", color: "#fff",
                            border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px"
                        }}>
                        검색
                    </button>

                    {/* 전체 건수 (서버에서 받아온 실제 총 건수) */}
                    <span style={{ marginLeft: "auto", fontSize: "13px", color: "#888" }}>
                        총 {totalCount}건
                    </span>
                </div>

                {/* 목록 테이블 (현재 페이지 데이터만 표시) */}
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
                                <th style={th}>아이디</th>
                                <th style={th}>이름</th>
                                <th style={th}>상태</th>
                                <th style={th}>비밀글</th>
                                <th style={th}>등록일</th>
                                <th style={th}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inquiryList.length === 0 ? (
                                <tr><td colSpan={10} style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                                    조회된 문의가 없습니다.
                                </td></tr>
                            ) : inquiryList.map(item => (
                                <tr key={item.inquiryNo}
                                    style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                                    onMouseLeave={e => e.currentTarget.style.background = ""}>
                                    <td style={td} onClick={() => handleRowClick(item.inquiryNo)}>{item.inquiryNo}</td>
                                    <td style={td} onClick={() => handleRowClick(item.inquiryNo)}>{item.category}</td>
                                    <td style={{ ...td, textAlign: "left" }} onClick={() => handleRowClick(item.inquiryNo)}>
                                        {/* 비밀글이면 자물쇠 아이콘 표시 */}
                                        {item.secretYn === "Y" && <span style={{ color: "#e00", marginRight: "6px" }}>🔒</span>}
                                        {item.title}
                                    </td>
                                    {/* 회원번호 */}
                                    <td style={td} onClick={() => handleRowClick(item.inquiryNo)}>{item.memberNo}</td>
                                    {/* 회원 아이디 (JOIN으로 가져온 값) */}
                                    <td style={td} onClick={() => handleRowClick(item.inquiryNo)}>{item.memberId}</td>
                                    {/* 회원 이름 (JOIN으로 가져온 값) */}
                                    <td style={td} onClick={() => handleRowClick(item.inquiryNo)}>{item.memberName}</td>
                                    <td style={td} onClick={() => handleRowClick(item.inquiryNo)}>
                                        <span style={{
                                            padding: "3px 10px", borderRadius: "12px", fontSize: "12px",
                                            background: item.status === "답변완료" ? "#e8f5e9" : "#fff3e0",
                                            color: item.status === "답변완료" ? "#2e7d32" : "#e65100"
                                        }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td style={td} onClick={() => handleRowClick(item.inquiryNo)}>{item.secretYn === "Y" ? "Y" : "N"}</td>
                                    <td style={td} onClick={() => handleRowClick(item.inquiryNo)}>{formatDate(item.createdAt)}</td>
                                    {/* 삭제 버튼 - 클릭 시 행 클릭 이벤트와 겹치지 않도록 stopPropagation 처리 */}
                                    <td style={td}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleInquiryDelete(item.inquiryNo); }}
                                            style={{
                                                background: "none", border: "1px solid #e00", color: "#e00",
                                                borderRadius: "4px", padding: "3px 8px", fontSize: "12px", cursor: "pointer"
                                            }}
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* 페이지네이션 (5개씩 그룹으로 표시) */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "24px" }}>
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

                {/* 상세 모달 */}
                {selectedInquiry && detail && (
                    <div style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <div style={{
                            background: "#fff", borderRadius: "8px", width: "720px", maxHeight: "90vh",
                            overflow: "auto", padding: "32px", position: "relative"
                        }}>
                            {/* 닫기 버튼 */}
                            <button onClick={closeModal} style={{
                                position: "absolute", top: "16px", right: "20px",
                                background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#666"
                            }}>✕</button>

                            <h3 style={{ fontSize: "17px", fontWeight: "bold", marginBottom: "20px" }}>문의 상세</h3>

                            {/* 작성자 정보 영역 */}
                            <div style={{ background: "#f0f4ff", borderRadius: "6px", padding: "12px 16px", marginBottom: "16px" }}>
                                <div style={{ display: "flex", gap: "20px", fontSize: "13px", color: "#444" }}>
                                    {/* 회원번호 */}
                                    <span>회원번호: <b style={{ color: "#222" }}>{detail.inquiry.memberNo}</b></span>
                                    {/* 아이디 (JOIN으로 가져온 값) */}
                                    <span>아이디: <b style={{ color: "#222" }}>{detail.inquiry.memberId}</b></span>
                                    {/* 이름 (JOIN으로 가져온 값) */}
                                    <span>이름: <b style={{ color: "#222" }}>{detail.inquiry.memberName}</b></span>
                                </div>
                            </div>

                            {/* 문의 정보 영역 */}
                            <div style={{ background: "#f9f9f9", borderRadius: "6px", padding: "16px", marginBottom: "20px" }}>
                                {/* 카테고리, 상태, 비밀글, 조회수 */}
                                <div style={{ display: "flex", gap: "16px", marginBottom: "8px", fontSize: "13px", color: "#666", flexWrap: "wrap" }}>
                                    <span>카테고리: <b style={{ color: "#222" }}>{detail.inquiry.category}</b></span>
                                    <span>상태:
                                        <b style={{ color: detail.inquiry.status === "답변완료" ? "#2e7d32" : "#e65100", marginLeft: "4px" }}>
                                            {detail.inquiry.status}
                                        </b>
                                    </span>
                                    <span>비밀글: <b style={{ color: "#222" }}>{detail.inquiry.secretYn === "Y" ? "🔒 비밀글" : "공개"}</b></span>
                                    <span>조회수: <b style={{ color: "#222" }}>{detail.inquiry.viewCount}</b></span>
                                </div>
                                {/* 등록일 (날짜 + 시간 모두 표시) */}
                                <div style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
                                    등록일: <b style={{ color: "#222" }}>{formatDateTime(detail.inquiry.createdAt)}</b>
                                    {detail.inquiry.updatedAt && (
                                        <span style={{ marginLeft: "16px" }}>
                                            수정일: <b style={{ color: "#222" }}>{formatDateTime(detail.inquiry.updatedAt)}</b>
                                        </span>
                                    )}
                                </div>
                                {/* 문의 제목 */}
                                <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "12px", color: "#222" }}>
                                    {detail.inquiry.secretYn === "Y" && <span style={{ color: "#e00", marginRight: "6px" }}>🔒</span>}
                                    {detail.inquiry.title}
                                </div>
                                {/* 문의 내용 */}
                                <div style={{ fontSize: "14px", color: "#444", lineHeight: "1.8", whiteSpace: "pre-wrap", borderTop: "1px solid #eee", paddingTop: "12px" }}>
                                    {detail.inquiry.content}
                                </div>

                                {/* 첨부파일 목록 - 이미지면 미리보기, 아니면 다운로드 링크로 표시 */}
                                {detail.files && detail.files.length > 0 && (
                                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #eee" }}>
                                        <p style={{ fontSize: "12px", color: "#888", marginBottom: "6px" }}>첨부파일 ({detail.files.length}개)</p>
                                        {detail.files.map(f => (
                                            <div key={f.inquiryFileNo} style={{ marginBottom: "8px" }}>
                                                {f.fileType && f.fileType.startsWith("image/") ? (
                                                    // 이미지 파일 - 미리보기 표시
                                                    <img
                                                        src={`${API_SERVER_HOST}${f.fileUrl}`}
                                                        alt={f.fileName}
                                                        style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "4px", border: "1px solid #eee" }}
                                                    />
                                                ) : (
                                                    // 일반 파일 - 다운로드 링크
                                                    <a
                                                        href={`${API_SERVER_HOST}${f.fileUrl}`}
                                                        download={f.fileName}
                                                        style={{ fontSize: "13px", color: "#1a73e8" }}
                                                    >
                                                        📎 {f.fileName}
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 기존 답변 목록 */}
                            {detail.comments && detail.comments.length > 0 && (
                                <div style={{ marginBottom: "20px" }}>
                                    <p style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px" }}>
                                        등록된 답변 ({detail.comments.length}개)
                                    </p>
                                    {detail.comments.map(c => (
                                        <div key={c.inquiryCommentNo} style={{
                                            background: "#e8f5e9", borderRadius: "6px",
                                            padding: "14px 16px", marginBottom: "8px"
                                        }}>
                                            <div style={{ fontSize: "13px", color: "#444", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{c.content}</div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                                                {/* 답변 등록일 (날짜 + 시간 표시) */}
                                                <span style={{ fontSize: "12px", color: "#888" }}>{formatDateTime(c.createdAt)}</span>
                                                <button onClick={() => handleCommentDelete(c.inquiryCommentNo)}
                                                    style={{ background: "none", border: "none", color: "#e00", fontSize: "12px", cursor: "pointer" }}>
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 답변 작성 영역 */}
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

// 테이블 헤더 스타일
const th = { padding: "10px 12px", fontWeight: "bold", textAlign: "center", borderBottom: "1px solid #ddd" };
// 테이블 데이터 스타일
const td = { padding: "10px 12px", textAlign: "center", borderBottom: "1px solid #f0f0f0" };

export default AdminInquiryPage;
