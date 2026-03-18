import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import { getAdminMemberDetail, updateAdminMember } from "../../api/admin/adminMemberApi";

const AdminMemberEditPage = () => {
    const { memberNo } = useParams();
    const navigate = useNavigate();

    // 수정 폼 데이터
    const [form, setForm] = useState({
        name: "",
        nickName: "",
        email: "",
        phoneNumber: "",
        zipCode: "",
        basicAddress: "",
        detailAddress: "",
        bankName: "",
        bankCode: "",
        accountHolderName: "",
    });

    // 로딩 상태
    const [loading, setLoading] = useState(false);

    // 저장 중 상태 (중복 클릭 방지)
    const [saving, setSaving] = useState(false);

    // ================================================
    // 페이지 진입 시 기존 회원 정보 불러와서 폼에 세팅
    // 상세 API가 { member, recentOrders, recentInquiries, cartItemCount }
    // 형태로 반환하므로 data.member 에서 꺼내야 함
    // ================================================
    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const data = await getAdminMemberDetail(memberNo);
                // data.member 에서 각 필드 꺼내서 폼에 세팅
                setForm({
                    name: data.member.name || "",
                    nickName: data.member.nickName || "",
                    email: data.member.email || "",
                    phoneNumber: data.member.phoneNumber || "",
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
                // 실패 시 상세 페이지로 돌아가기
                navigate(`/admin/member/detail/${memberNo}`);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [memberNo]);

    // 입력값 변경 핸들러 (모든 input 공통으로 사용)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // ================================================
    // 저장 처리
    // 필수 항목 유효성 검사 후 API 호출
    // 저장 완료 시 상세 페이지로 이동
    // ================================================
    const handleSave = async () => {
        // 필수 항목 유효성 검사
        if (!form.name.trim()) { alert("이름을 입력해주세요."); return; }
        if (!form.nickName.trim()) { alert("닉네임을 입력해주세요."); return; }
        if (!form.email.trim()) { alert("이메일을 입력해주세요."); return; }
        if (!form.phoneNumber.trim()) { alert("전화번호를 입력해주세요."); return; }

        if (!window.confirm("회원 정보를 수정하시겠습니까?")) return;

        // 저장 중 상태로 변경 (버튼 중복 클릭 방지)
        setSaving(true);
        try {
            await updateAdminMember(memberNo, form);
            alert("수정되었습니다.");
            // 저장 완료 후 상세 페이지로 이동
            navigate(`/admin/member/detail/${memberNo}`);
        } catch (e) {
            // 서버에서 반환한 에러 메시지 표시
            const msg = e.response?.data || "수정 중 오류가 발생했습니다.";
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    // 로딩 중일 때 표시
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

                {/* 하단 버튼 (취소 / 저장하기) */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                    {/* 취소 → 상세 페이지로 돌아가기 */}
                    <button onClick={() => navigate(`/admin/member/detail/${memberNo}`)}
                        style={{ padding: "10px 24px", border: "1px solid #ddd", borderRadius: "4px", background: "#fff", cursor: "pointer", fontSize: "14px" }}>
                        취소
                    </button>
                    {/* 저장하기 → 저장 중일 때 버튼 비활성화 */}
                    <button onClick={handleSave} disabled={saving}
                        style={{ padding: "10px 24px", background: saving ? "#999" : "#222", color: "#fff", border: "none", borderRadius: "4px", cursor: saving ? "default" : "pointer", fontSize: "14px" }}>
                        {saving ? "저장 중..." : "저장하기"}
                    </button>
                </div>

            </AdminLayout>
        </>
    );
};

// ================================================
// 폼 입력 행 컴포넌트
// label: 라벨 텍스트
// name: input name (handleChange에서 key로 사용)
// value: 현재 입력값
// onChange: 변경 핸들러
// type: input 타입 (기본값 "text")
// placeholder: 힌트 텍스트 (기본값 없음)
// ================================================
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

// 공통 스타일
const card = { background: "#fff", border: "1px solid #eee", borderRadius: "8px", padding: "20px 24px", marginBottom: "16px" };
const cardTitle = { fontSize: "15px", fontWeight: "bold", marginBottom: "16px", color: "#222", borderBottom: "2px solid #222", paddingBottom: "8px" };
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 40px" };

export default AdminMemberEditPage;