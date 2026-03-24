// src/pages/admin/AdminMemberEditPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import { getAdminMemberDetail, updateAdminMember } from "../../api/admin/adminMemberApi";

// [추가] 가입경로 표시
const PROVIDER_LABEL = { LOCAL: "일반 가입", KAKAO: "카카오 로그인" };

const AdminMemberEditPage = () => {
    const { memberNo } = useParams();
    const navigate = useNavigate();

    // provider는 읽기 전용이라 별도로 관리
    const [provider, setProvider] = useState("");

    const [form, setForm] = useState({
        name: "",
        nickName: "",
        email: "",
        phoneNumber: "",
        gender: "",
        birthday: "",
        zipCode: "",
        basicAddress: "",
        detailAddress: "",
        bankName: "",
        bankCode: "",
        accountHolderName: "",
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const data = await getAdminMemberDetail(memberNo);
                const m = data.member;

                // [추가] provider 별도 저장 (수정 불가 표시용)
                setProvider(m.provider || "LOCAL");

                setForm({
                    name: m.name || "",
                    nickName: m.nickName || "",
                    email: m.email || "",
                    phoneNumber: m.phoneNumber || "",
                    gender: m.gender || "",
                    // birthday: LocalDate → "YYYY-MM-DD" 앞 10자리
                    birthday: m.birthday ? String(m.birthday).substring(0, 10) : "",
                    zipCode: m.zipCode || "",
                    basicAddress: m.basicAddress || "",
                    detailAddress: m.detailAddress || "",
                    bankName: m.bankName || "",
                    bankCode: m.bankCode || "",
                    accountHolderName: m.accountHolderName || "",
                });
            } catch (e) {
                console.error("회원 정보 조회 실패:", e);
                alert("회원 정보를 불러오지 못했습니다.");
                navigate(`/admin/member/detail/${memberNo}`);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [memberNo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        // [수정] 소셜 가입자는 name/email/phone이 null일 수 있으므로
        //        nickName만 필수 체크, 나머지는 선택
        if (!form.nickName.trim()) { alert("닉네임을 입력해주세요."); return; }
        if (!window.confirm("회원 정보를 수정하시겠습니까?")) return;

        setSaving(true);
        try {
            await updateAdminMember(memberNo, form);
            alert("수정되었습니다.");
            navigate(`/admin/member/detail/${memberNo}`);
        } catch (e) {
            alert(e.response?.data || "수정 중 오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <><AdminHeader />
            <AdminLayout pageTitle="회원 수정">
                <p style={{ textAlign: "center", padding: "60px", color: "#999" }}>로딩 중...</p>
            </AdminLayout></>
    );

    return (
        <>
            <AdminHeader />
            <AdminLayout pageTitle="회원 정보 수정">

                {/* 기본 정보 수정 */}
                <div style={card}>
                    <h3 style={cardTitle}>기본 정보</h3>
                    <div style={grid2}>
                        <FormRow label="이름" name="name" value={form.name} onChange={handleChange} />
                        <FormRow label="닉네임 *" name="nickName" value={form.nickName} onChange={handleChange} />
                        <FormRow label="이메일" name="email" value={form.email} onChange={handleChange} type="email" />
                        <FormRow label="전화번호" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="010-0000-0000" />

                        {/* 성별 */}
                        <div style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                            <label style={formLabel}>성별</label>
                            <select name="gender" value={form.gender} onChange={handleChange}
                                style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box", background: "#fff" }}>
                                <option value="">선택 안함</option>
                                <option value="M">남성</option>
                                <option value="F">여성</option>
                            </select>
                        </div>

                        {/* 생년월일 */}
                        <FormRow label="생년월일" name="birthday" value={form.birthday} onChange={handleChange} type="date" />

                        {/* [추가] 가입경로 - 읽기 전용 표시 */}
                        <div style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                            <label style={formLabel}>가입경로 (변경 불가)</label>
                            <div style={{
                                padding: "8px 10px", border: "1px solid #eee", borderRadius: "4px",
                                fontSize: "14px", background: "#f9f9f9", color: "#666"
                            }}>
                                {PROVIDER_LABEL[provider] || provider || "-"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 주소 정보 수정 */}
                <div style={card}>
                    <h3 style={cardTitle}>주소 정보</h3>
                    <div style={grid2}>
                        <FormRow label="우편번호" name="zipCode" value={form.zipCode} onChange={handleChange} />
                        <FormRow label="기본 주소" name="basicAddress" value={form.basicAddress} onChange={handleChange} />
                        <FormRow label="상세 주소" name="detailAddress" value={form.detailAddress} onChange={handleChange} />
                    </div>
                </div>

                {/* 계좌 정보 수정 */}
                <div style={card}>
                    <h3 style={cardTitle}>계좌 정보</h3>
                    <div style={grid2}>
                        <FormRow label="은행명" name="bankName" value={form.bankName} onChange={handleChange} />
                        <FormRow label="계좌번호" name="bankCode" value={form.bankCode} onChange={handleChange} />
                        <FormRow label="예금주" name="accountHolderName" value={form.accountHolderName} onChange={handleChange} />
                    </div>
                </div>

                {/* 하단 버튼 */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                    <button onClick={() => navigate(`/admin/member/detail/${memberNo}`)}
                        style={{ padding: "10px 24px", border: "1px solid #ddd", borderRadius: "4px", background: "#fff", cursor: "pointer", fontSize: "14px" }}>
                        취소
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        style={{ padding: "10px 24px", background: saving ? "#999" : "#222", color: "#fff", border: "none", borderRadius: "4px", cursor: saving ? "default" : "pointer", fontSize: "14px" }}>
                        {saving ? "저장 중..." : "저장하기"}
                    </button>
                </div>

            </AdminLayout>
        </>
    );
};

const FormRow = ({ label, name, value, onChange, type = "text", placeholder = "" }) => (
    <div style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
        <label style={formLabel}>{label}</label>
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
            style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box" }}
        />
    </div>
);

const card = { background: "#fff", border: "1px solid #eee", borderRadius: "8px", padding: "20px 24px", marginBottom: "16px" };
const cardTitle = { fontSize: "15px", fontWeight: "bold", marginBottom: "16px", color: "#222", borderBottom: "2px solid #222", paddingBottom: "8px" };
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 40px" };
const formLabel = { display: "block", fontSize: "12px", color: "#888", fontWeight: "bold", marginBottom: "4px" };

export default AdminMemberEditPage;