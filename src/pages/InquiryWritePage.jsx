import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { createBoard } from "../api/inquiryApi";

// 문의 카테고리 목록
const CATEGORIES = ["배송", "주문/결제", "취소/교환/반품", "상품/AS문의", "회원정보", "서비스", "이용안내"];

const BoardWritePage = () => {
    const navigate = useNavigate();

    // 폼 입력 상태
    const [form, setForm] = useState({
        category: "배송",
        title: "",
        content: "",
        secretYn: "N",
    });

    // 첨부파일 목록
    const [files, setFiles] = useState([]);

    // 제출 중 상태 (중복 클릭 방지)
    const [submitting, setSubmitting] = useState(false);

    // 입력값 변경 핸들러 (체크박스는 Y/N 처리)
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? "Y" : "N") : value,
        }));
    };

    // 파일 선택 핸들러 (최대 3개 제한)
    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);
        if (selected.length > 3) {
            alert("첨부파일은 최대 3개까지 가능합니다.");
            return;
        }
        setFiles(selected);
    };

    // 선택된 파일 개별 제거
    const handleRemoveFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // 게시글 제출
    const handleSubmit = async () => {
        if (!form.title.trim())   { alert("제목을 입력해주세요."); return; }
        if (!form.content.trim()) { alert("내용을 입력해주세요."); return; }

        setSubmitting(true);
        try {
            await createBoard(form, files);
            alert("문의가 등록되었습니다.");
            navigate("/inquiry/my");
        } catch (e) {
            alert("문의 등록에 실패했습니다.");
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Header />
            <div style={{ maxWidth: "700px", margin: "40px auto", padding: "0 20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "30px" }}>1:1 문의하기</h2>

                {/* 카테고리 선택 */}
                <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", fontWeight: "bold" }}>카테고리 *</label>
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* 제목 입력 */}
                <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", fontWeight: "bold" }}>제목 *</label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="제목을 입력하세요"
                        maxLength={200}
                        style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box" }}
                    />
                </div>

                {/* 내용 입력 */}
                <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", fontWeight: "bold" }}>내용 *</label>
                    <textarea
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        placeholder="문의 내용을 입력하세요"
                        maxLength={2000}
                        rows={10}
                        style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }}
                    />
                    {/* 글자 수 카운터 */}
                    <div style={{ textAlign: "right", fontSize: "12px", color: "#999" }}>{form.content.length}/2000</div>
                </div>

                {/* 비밀글 여부 체크박스 */}
                <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                        <input
                            type="checkbox"
                            name="secretYn"
                            checked={form.secretYn === "Y"}
                            onChange={handleChange}
                        />
                        비밀글로 등록
                    </label>
                </div>

                {/* 첨부파일 (이미지, 최대 3개) */}
                <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", fontSize: "13px", marginBottom: "6px", fontWeight: "bold" }}>
                        첨부파일 (이미지만 가능, 최대 3개 · 각 10MB 이하)
                    </label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ fontSize: "13px" }}
                    />
                    {/* 선택된 파일 목록 */}
                    {files.length > 0 && (
                        <div style={{ marginTop: "10px" }}>
                            {files.map((file, index) => (
                                <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#555", marginTop: "4px" }}>
                                    <span>📎 {file.name}</span>
                                    <button
                                        onClick={() => handleRemoveFile(index)}
                                        style={{ background: "none", border: "none", color: "#e00", cursor: "pointer", fontSize: "12px" }}
                                    >
                                        삭제
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 버튼 영역 */}
                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ padding: "10px 24px", background: "#fff", color: "#222", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer" }}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{ padding: "10px 24px", background: "#222", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                        {submitting ? "등록 중..." : "문의 등록"}
                    </button>
                </div>
            </div>
        </>
    );
};

export default BoardWritePage;
