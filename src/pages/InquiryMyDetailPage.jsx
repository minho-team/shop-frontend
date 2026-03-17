// 1:1 문의 리스트에서 한 가지를 클릭하면 들어오는 상세 페이지
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { getOneInquiry } from "../api/inquiryApi";
// [수정] API_SERVER_HOST import 경로: authApi → apiClient
import { API_SERVER_HOST } from "../api/apiClient";

const InquiryMyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // 게시글 데이터
    const [board, setBoard] = useState(null);

    // 첨부파일 목록
    const [files, setFiles] = useState([]);

    // 관리자 답변 목록
    const [comments, setComments] = useState([]);

    // 로딩 상태
    const [loading, setLoading] = useState(true);

    // 컴포넌트 마운트 시 상세 조회
    useEffect(() => {
        fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            // 반환값: { inquiry, files, comments }
            const data = await getOneInquiry(id);
            // [수정] data.board → data.inquiry (백엔드 반환 키명)
            setBoard(data.inquiry);
            setFiles(data.files || []);
            setComments(data.comments || []);
        } catch (e) {
            console.error("게시글 조회 실패:", e);
            alert("게시글을 불러올 수 없습니다.");
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    // 날짜+시간 포맷 (YYYY. MM. DD. HH:mm)
    const formatDateTime = (timestamp) => {
        if (!timestamp) return "";
        return new Date(timestamp).toLocaleString("ko-KR");
    };

    if (loading) return <><Header /><p style={{ textAlign: "center", padding: "60px" }}>로딩 중...</p></>;

    return (
        <>
            <Header />
            <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>

                {/* 뒤로가기 버튼 */}
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#666", marginBottom: "20px" }}
                >
                    ← 목록으로
                </button>

                {/* 게시글 헤더 (카테고리, 상태, 비밀글, 제목, 작성일, 조회수) */}
                <div style={{ borderTop: "2px solid #222", borderBottom: "1px solid #eee", padding: "20px 0" }}>
                    {/* 배지 영역 (카테고리, 상태, 비밀글) */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
                        {/* 카테고리 배지 */}
                        <span style={{ fontSize: "12px", color: "#666", background: "#f5f5f5", padding: "3px 10px", borderRadius: "12px", border: "1px solid #eee" }}>
                            {board.category}
                        </span>
                        {/* 답변 상태 배지 */}
                        <span style={{
                            fontSize: "12px", padding: "3px 10px", borderRadius: "12px",
                            background: board.status === "답변완료" ? "#e8f5e9" : "#fff3e0",
                            color: board.status === "답변완료" ? "#2e7d32" : "#e65100"
                        }}>
                            {board.status}
                        </span>
                        {/* 비밀글 표시 */}
                        {board.secretYn === "Y" && (
                            <span style={{ fontSize: "12px", color: "#999", background: "#fff0f0", padding: "3px 10px", borderRadius: "12px", border: "1px solid #fdd" }}>
                                🔒 비밀글
                            </span>
                        )}
                    </div>

                    {/* 제목 */}
                    <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "12px", color: "#222" }}>
                        {board.title}
                    </h2>

                    {/* 메타 정보 (작성일, 조회수) */}
                    <div style={{ display: "flex", gap: "20px", fontSize: "13px", color: "#999" }}>
                        <span>작성일: {formatDateTime(board.createdAt)}</span>
                        <span>조회수: {board.viewCount}</span>
                        {/* 수정일이 있을 때만 표시 */}
                        {board.updatedAt && <span>수정일: {formatDateTime(board.updatedAt)}</span>}
                    </div>
                </div>

                {/* 게시글 내용 */}
                <div style={{
                    padding: "24px 0", borderBottom: "1px solid #eee",
                    fontSize: "15px", lineHeight: "1.9", whiteSpace: "pre-wrap", color: "#333", minHeight: "120px"
                }}>
                    {board.content}
                </div>

                {/* 첨부파일 목록 (이미지면 미리보기, 아니면 다운로드 링크) */}
                {files.length > 0 && (
                    <div style={{ padding: "16px 0", borderBottom: "1px solid #eee" }}>
                        <p style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "10px", color: "#444" }}>
                            첨부파일 ({files.length}개)
                        </p>
                        {files.map((file) => (
                            // [수정] file.fileNo → file.inquiryFileNo (백엔드 필드명)
                            <div key={file.inquiryFileNo} style={{ marginBottom: "10px" }}>
                                {file.fileType && file.fileType.startsWith("image/") ? (
                                    // 이미지 파일 - 미리보기
                                    <img
                                        src={`${API_SERVER_HOST}${file.fileUrl}`}
                                        alt={file.fileName}
                                        style={{ maxWidth: "100%", maxHeight: "400px", borderRadius: "4px", border: "1px solid #eee" }}
                                    />
                                ) : (
                                    // 일반 파일 - 다운로드 링크
                                    <a
                                        href={`${API_SERVER_HOST}${file.fileUrl}`}
                                        download={file.fileName}
                                        style={{ fontSize: "13px", color: "#1a73e8", display: "flex", alignItems: "center", gap: "4px" }}
                                    >
                                        📎 {file.fileName}
                                        {file.fileSize && (
                                            <span style={{ color: "#999", fontSize: "12px" }}>
                                                ({(file.fileSize / 1024).toFixed(1)}KB)
                                            </span>
                                        )}
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* 관리자 답변 영역 */}
                <div style={{ margin: "24px 0" }}>
                    <p style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px", color: "#222" }}>
                        관리자 답변
                        {comments.length > 0 && (
                            <span style={{ marginLeft: "8px", fontSize: "12px", color: "#2e7d32", background: "#e8f5e9", padding: "2px 8px", borderRadius: "10px" }}>
                                {comments.length}개
                            </span>
                        )}
                    </p>
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            // [수정] comment.commentNo → comment.inquiryCommentNo (백엔드 필드명)
                            <div key={comment.inquiryCommentNo} style={{
                                background: "#f0faf0", border: "1px solid #c8e6c9",
                                borderRadius: "8px", padding: "16px 20px", marginBottom: "12px"
                            }}>
                                {/* 답변 헤더 */}
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                                    <span style={{ fontSize: "12px", background: "#2e7d32", color: "#fff", padding: "2px 8px", borderRadius: "10px" }}>
                                        관리자
                                    </span>
                                    {/* 답변 등록일 (날짜+시간) */}
                                    <span style={{ fontSize: "12px", color: "#888" }}>{formatDateTime(comment.createdAt)}</span>
                                </div>
                                {/* 답변 내용 */}
                                <div style={{ fontSize: "14px", color: "#333", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
                                    {comment.content}
                                </div>
                                {/* 수정일이 있을 때만 표시 */}
                                {comment.updatedAt && (
                                    <div style={{ fontSize: "12px", color: "#aaa", marginTop: "8px" }}>
                                        수정: {formatDateTime(comment.updatedAt)}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        // 아직 답변 없을 때
                        <div style={{
                            textAlign: "center", padding: "40px 0", color: "#999",
                            fontSize: "14px", background: "#f9f9f9", borderRadius: "8px", border: "1px solid #eee"
                        }}>
                            <div style={{ fontSize: "24px", marginBottom: "8px" }}>💬</div>
                            아직 답변이 등록되지 않았습니다.
                            <div style={{ fontSize: "12px", marginTop: "6px", color: "#bbb" }}>
                                빠른 시일 내에 답변 드리겠습니다.
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
};

export default InquiryMyDetailPage;
