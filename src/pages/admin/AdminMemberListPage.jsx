// src/pages/admin/AdminMemberListPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import { getAdminMemberList } from "../../api/admin/adminMemberApi";

// 상태 필터 버튼 목록
const STATUS_OPTIONS = ["전체", "ACTIVE", "DORMANT", "SUSPENDED"];

// 상태 한글 표시
const STATUS_LABEL = { ACTIVE: "활성", DORMANT: "휴면", SUSPENDED: "정지" };

// 상태 뱃지 색상
const STATUS_STYLE = {
    ACTIVE: { background: "#e8f5e9", color: "#2e7d32" },
    DORMANT: { background: "#fff8e1", color: "#f57f17" },
    SUSPENDED: { background: "#fce4ec", color: "#c62828" },
};

// [추가] 가입경로 표시
const PROVIDER_LABEL = { LOCAL: "일반", KAKAO: "카카오" };
const PROVIDER_STYLE = {
    LOCAL: { background: "#f5f5f5", color: "#444" },
    KAKAO: { background: "#fff9c4", color: "#f57f17" },
};

const PAGE_SIZE = 5;
const PAGE_GROUP_SIZE = 5;

const AdminMemberListPage = () => {
    const navigate = useNavigate();

    const [memberList, setMemberList] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("전체");
    const [searchInput, setSearchInput] = useState("");
    const [appliedKeyword, setAppliedKeyword] = useState("");
    const [loading, setLoading] = useState(false);

    // 필터/검색/페이지 변경 시 목록 재조회
    useEffect(() => { fetchList(); }, [statusFilter, appliedKeyword, currentPage]);

    const fetchList = async () => {
        setLoading(true);
        try {
            const data = await getAdminMemberList({
                page: currentPage,
                size: PAGE_SIZE,
                status: statusFilter === "전체" ? null : statusFilter,
                keyword: appliedKeyword,
            });
            setMemberList(data.list);
            setTotalCount(data.totalCount);
            setTotalPages(data.totalPages);
        } catch (e) {
            console.error("회원 목록 조회 실패:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusFilter = (value) => { setStatusFilter(value); setCurrentPage(1); };
    const handleSearch = () => { setAppliedKeyword(searchInput); setCurrentPage(1); };
    const handleRowClick = (memberNo) => { navigate(`/admin/member/detail/${memberNo}`); };

    // 가입일 포맷
    const formatDate = (ts) => (!ts ? "-" : new Date(ts).toLocaleDateString("ko-KR"));

    // 전화번호 하이픈 포맷 (null 방어)
    const formatPhone = (phone) => {
        if (!phone) return "-";
        const c = phone.replace(/-/g, "");
        return c.length === 11 ? c.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3") : phone;
    };

    // 페이지 그룹 계산
    const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE);
    const startPage = (currentGroup - 1) * PAGE_GROUP_SIZE + 1;
    const endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

    return (
        <>
            <AdminHeader />
            <AdminLayout pageTitle="회원 관리">

                {/* 필터 + 검색 */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center", flexWrap: "wrap" }}>

                    {/* 상태 필터 */}
                    <div style={{ display: "flex", gap: "6px" }}>
                        {STATUS_OPTIONS.map((s) => (
                            <button key={s} onClick={() => handleStatusFilter(s)}
                                style={{
                                    padding: "6px 14px", borderRadius: "20px", fontSize: "13px", cursor: "pointer",
                                    border: "1px solid #ddd",
                                    background: statusFilter === s ? "#222" : "#fff",
                                    color: statusFilter === s ? "#fff" : "#333",
                                }}>
                                {s === "전체" ? "전체" : STATUS_LABEL[s]}
                            </button>
                        ))}
                    </div>

                    {/* 키워드 검색 */}
                    <input type="text" placeholder="아이디 또는 이름 검색"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        style={{ padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px", width: "180px" }}
                    />
                    <button onClick={handleSearch}
                        style={{ padding: "6px 16px", background: "#222", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}>
                        검색
                    </button>

                    {/* 전체 건수 */}
                    <span style={{ marginLeft: "auto", fontSize: "13px", color: "#888" }}>총 {totalCount}명</span>
                </div>

                {/* 회원 목록 테이블 */}
                {loading ? (
                    <p style={{ textAlign: "center", padding: "40px", color: "#999" }}>로딩 중...</p>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                        <thead>
                            <tr style={{ background: "#f5f5f5", borderTop: "2px solid #222" }}>
                                <th style={th}>번호</th>
                                <th style={th}>아이디</th>
                                <th style={th}>이름</th>
                                <th style={th}>이메일</th>
                                <th style={th}>전화번호</th>
                                <th style={th}>가입경로</th>  {/* [추가] */}
                                <th style={th}>구매횟수</th>
                                <th style={th}>가입일</th>
                                <th style={th}>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {memberList.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                                        조회된 회원이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                memberList.map((m) => (
                                    <tr key={m.memberNo}
                                        onClick={() => handleRowClick(m.memberNo)}
                                        style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                                        onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                                        <td style={td}>{m.memberNo}</td>
                                        <td style={td}>{m.memberId}</td>
                                        {/* null 방어 */}
                                        <td style={td}>{m.name || "-"}</td>
                                        <td style={td}>{m.email || "-"}</td>
                                        <td style={td}>{formatPhone(m.phoneNumber)}</td>
                                        {/* [추가] 가입경로 뱃지 */}
                                        <td style={td}>
                                            <span style={{
                                                padding: "3px 10px", borderRadius: "12px", fontSize: "12px",
                                                ...(PROVIDER_STYLE[m.provider] || { background: "#f5f5f5", color: "#444" })
                                            }}>
                                                {PROVIDER_LABEL[m.provider] || m.provider || "-"}
                                            </span>
                                        </td>
                                        <td style={td}>{m.purchaseCount}</td>
                                        <td style={td}>{formatDate(m.createdAt)}</td>
                                        <td style={td}>
                                            <span style={{
                                                padding: "3px 10px", borderRadius: "12px", fontSize: "12px",
                                                ...(STATUS_STYLE[m.status] || {})
                                            }}>
                                                {STATUS_LABEL[m.status] || m.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "24px" }}>
                        <button onClick={() => setCurrentPage(startPage - 1)} disabled={startPage === 1}
                            style={{ ...pageBtn, color: startPage === 1 ? "#ccc" : "#333" }}>&lt;</button>
                        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                            <button key={page} onClick={() => setCurrentPage(page)}
                                style={{ ...pageBtn, background: currentPage === page ? "#222" : "#fff", color: currentPage === page ? "#fff" : "#333" }}>
                                {page}
                            </button>
                        ))}
                        <button onClick={() => setCurrentPage(endPage + 1)} disabled={endPage === totalPages}
                            style={{ ...pageBtn, color: endPage === totalPages ? "#ccc" : "#333" }}>&gt;</button>
                    </div>
                )}

            </AdminLayout>
        </>
    );
};

const th = { padding: "10px 12px", fontWeight: "bold", textAlign: "center", borderBottom: "1px solid #ddd" };
const td = { padding: "10px 12px", textAlign: "center", borderBottom: "1px solid #f0f0f0" };
const pageBtn = { padding: "6px 12px", border: "1px solid #ddd", borderRadius: "4px", background: "#fff", cursor: "pointer", fontSize: "13px" };

export default AdminMemberListPage;