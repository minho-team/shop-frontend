import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import { getAdminMemberDetail, updateAdminMember } from "../../api/admin/adminMemberApi";

const AdminMemberEditPage = () => {
    const { memberNo } = useParams();
    const navigate = useNavigate();

    // 수정 폼 데이터 - gender, birthday 추가
    const [form, setForm] = useState({
        name: "",
        nickName: "",
        email: "",
        phoneNumber: "",
        gender: "",           // 추가
        birthday: "",         // 추가 (YYYY-MM-DD 형식)
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
                setForm({
                    name: data.member.name || "",
                    nickName: data.member.nickName || "",
                    email: data.member.email || "",
                    phoneNumber: data.member.phoneNumber || "",
                    // gender: "M"/"F"/null → 빈 문자열 처리
                    gender: data.member.gender || "",
                    // birthday: "2000-01-01" 형식으로 변환 (백엔드가 LocalDate면 그대로 사용)
                    birthday: data.member.birthday
                        ? String(data.member.birthday).substring(0, 10)
                        : "",
                    zipCode: data.member.zipCode || "",
                    basicAddress: data.member.basicAddress || "",
                    detailAddress: data.member.detailAddress || "",
                    bankName: data.member.bankName || "",
                    bankCode: data.member.bankCode || "",
                    accountHolderName: data.member.accountHolderName || "",
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

    // 일반 input 공통 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!form.name.trim()) { alert("이름을 입력해주세요."); return; }
        if (!form.nickName.trim()) { alert("닉네임을 입력해주세요."); return; }
        if (!form.email.trim()) { alert("이메일을 입력해주세요."); return; }
        if (!form.phoneNumber.trim()) { alert("전화번호를 입력해주세요."); return; }
        if (!window.confirm("회원 정보를 수정하시겠습니까?")) return;

        setSaving(true);
        try {
            await updateAdminMember(memberNo, form);
            alert("수정되었습니다.");
            navigate(`/admin/member/detail/${memberNo}`);
        } catch (e) {
            const msg = e.response?.data || "수정 중 오류가 발생했습니다.";
            alert(msg);
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
                        <FormRow label="이름 *" name="name" value={form.name} onChange={handleChange} />
                        <FormRow label="닉네임 *" name="nickName" value={form.nickName} onChange={handleChange} />
                        <FormRow label="이메일 *" name="email" value={form.email} onChange={handleChange} type="email" />
                        <FormRow label="전화번호 *" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="010-0000-0000" />

                        {/* 성별 - select 드롭다운 */}
                        <div style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                            <label style={{ display: "block", fontSize: "12px", color: "#888", fontWeight: "bold", marginBottom: "4px" }}>
                                성별
                            </label>
                            <select
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box", background: "#fff" }}
                            >
                                <option value="">선택 안함</option>
                                <option value="M">남성</option>
                                <option value="F">여성</option>
                            </select>
                        </div>

                        {/* 생년월일 - date input */}
                        <FormRow
                            label="생년월일"
                            name="birthday"
                            value={form.birthday}
                            onChange={handleChange}
                            type="date"
                        />
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
                    <button
                        onClick={() => navigate(`/admin/member/detail/${memberNo}`)}
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
        <label style={{ display: "block", fontSize: "12px", color: "#888", fontWeight: "bold", marginBottom: "4px" }}>
            {label}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box" }}
        />
    </div>
);

const card = { background: "#fff", border: "1px solid #eee", borderRadius: "8px", padding: "20px 24px", marginBottom: "16px" };
const cardTitle = { fontSize: "15px", fontWeight: "bold", marginBottom: "16px", color: "#222", borderBottom: "2px solid #222", paddingBottom: "8px" };
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 40px" };

export default AdminMemberEditPage;