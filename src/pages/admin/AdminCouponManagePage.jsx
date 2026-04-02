import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  getAdminAllCouponList,
  createAdminCoupon,
  deleteAdminMasterCoupon,
  issueAdminCouponToAll,
} from "../../api/admin/adminMemberApi";

const DISCOUNT_TYPE_LABEL = { FIXED: "정액 (원)", RATE: "정률 (%)" };

const AdminCouponManagePage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  // 쿠폰 생성 폼
  const [showCreate, setShowCreate] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    couponName: "",
    discountType: "FIXED",
    discountValue: "",
  });
  const [createLoading, setCreateLoading] = useState(false);

  // 전체 지급 상태
  const [issueAllCouponNo, setIssueAllCouponNo] = useState("");
  const [issueAllValidDays, setIssueAllValidDays] = useState(30);
  const [issueAllLoading, setIssueAllLoading] = useState(false);

  // 쿠폰 목록 페이지네이션 (10개씩 표시, 페이지 버튼 5개씩)
  const [couponPage, setCouponPage] = useState(1);
  const COUPON_PAGE_SIZE = 10;
  const PAGE_BTN_COUNT = 5; // 한 번에 보여줄 페이지 버튼 수

  useEffect(() => {
    fetchCoupons();
  }, []);

  // 쿠폰 목록 조회 - 페이지 최초 진입 및 변경 후 갱신 시 호출
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await getAdminAllCouponList();
      setCoupons(data);
      setCouponPage(1); // 목록 갱신 시 1페이지로 초기화
      // 전체 지급 선택박스 초기값: 첫 번째 쿠폰으로 설정
      if (data.length > 0 && !issueAllCouponNo) {
        setIssueAllCouponNo(data[0].couponNo);
      }
    } catch (e) {
      console.error("쿠폰 목록 조회 실패:", e);
      alert("쿠폰 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 쿠폰 생성 - 쿠폰명/할인유형/할인값 입력 후 서버에 저장
  const handleCreateCoupon = async () => {
    if (!newCoupon.couponName.trim() || !newCoupon.discountValue) {
      alert("쿠폰명과 할인값을 입력하세요.");
      return;
    }
    setCreateLoading(true);
    try {
      await createAdminCoupon({
        couponName: newCoupon.couponName.trim(),
        discountType: newCoupon.discountType,
        discountValue: Number(newCoupon.discountValue),
      });
      alert("쿠폰이 생성되었습니다.");
      setNewCoupon({ couponName: "", discountType: "FIXED", discountValue: "" });
      setShowCreate(false);
      fetchCoupons();
    } catch (e) {
      alert("쿠폰 생성에 실패했습니다.");
    } finally {
      setCreateLoading(false);
    }
  };

  // 쿠폰 삭제 - 확인 후 마스터 쿠폰 레코드 삭제 (회원에게 이미 지급된 쿠폰은 유지됨)
  const handleDeleteCoupon = async (couponNo, couponName) => {
    if (!window.confirm(`"${couponName}" 쿠폰을 삭제하시겠습니까?`)) return;
    try {
      await deleteAdminMasterCoupon(couponNo);
      alert("쿠폰이 삭제되었습니다.");
      fetchCoupons();
    } catch (e) {
      alert("쿠폰 삭제에 실패했습니다.");
    }
  };

  // 전체 회원 쿠폰 일괄 지급 - 선택한 쿠폰을 모든 활성 회원에게 유효기간 포함 지급
  const handleIssueAll = async () => {
    if (!issueAllCouponNo) {
      alert("지급할 쿠폰을 선택하세요.");
      return;
    }
    const selected = coupons.find((c) => String(c.couponNo) === String(issueAllCouponNo));
    if (!window.confirm(`전체 회원에게 "${selected?.couponName}" 쿠폰을 지급하시겠습니까?`)) return;
    setIssueAllLoading(true);
    try {
      await issueAdminCouponToAll(issueAllCouponNo, issueAllValidDays);
      alert("전체 회원에게 쿠폰이 지급되었습니다.");
    } catch (e) {
      alert("전체 지급에 실패했습니다.");
    } finally {
      setIssueAllLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: "32px 40px", maxWidth: 900 }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 28 }}>쿠폰 관리</h2>

        {/* ── 쿠폰 전체 지급 ─────────────────────────────────── */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            padding: "24px",
            marginBottom: 28,
          }}
        >
          <h5 style={{ fontWeight: 600, marginBottom: 16 }}>전체 회원 쿠폰 일괄 지급</h5>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <select
              className="form-select"
              style={{ width: 280 }}
              value={issueAllCouponNo}
              onChange={(e) => setIssueAllCouponNo(e.target.value)}
            >
              {coupons.length === 0 && <option value="">쿠폰 없음</option>}
              {coupons.map((c) => (
                <option key={c.couponNo} value={c.couponNo}>
                  {c.couponName} (
                  {c.discountType === "FIXED"
                    ? `${c.discountValue.toLocaleString()}원`
                    : `${c.discountValue}%`}
                  )
                </option>
              ))}
            </select>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label style={{ fontSize: 14, whiteSpace: "nowrap" }}>유효기간</label>
              <input
                type="number"
                className="form-control"
                style={{ width: 90 }}
                min={1}
                value={issueAllValidDays}
                onChange={(e) => setIssueAllValidDays(Number(e.target.value))}
              />
              <span style={{ fontSize: 14 }}>일</span>
            </div>
            <button
              className="btn btn-dark"
              onClick={handleIssueAll}
              disabled={issueAllLoading || coupons.length === 0}
            >
              {issueAllLoading ? "지급 중..." : "전체 지급"}
            </button>
          </div>
        </div>

        {/* ── 쿠폰 목록 ─────────────────────────────────────── */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h5 style={{ fontWeight: 600, margin: 0 }}>
              쿠폰 목록 <span style={{ color: "#888", fontSize: 14 }}>({coupons.length}개)</span>
            </h5>
            <button
              className="btn btn-outline-dark btn-sm"
              onClick={() => setShowCreate((v) => !v)}
            >
              {showCreate ? "닫기" : "+ 쿠폰 생성"}
            </button>
          </div>

          {/* 쿠폰 생성 폼 */}
          {showCreate && (
            <div
              style={{
                background: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: 6,
                padding: "16px",
                marginBottom: 16,
              }}
            >
              <h6 style={{ fontWeight: 600, marginBottom: 12 }}>새 쿠폰 생성</h6>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div>
                  <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>쿠폰명</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    style={{ width: 220 }}
                    placeholder="쿠폰명 입력"
                    value={newCoupon.couponName}
                    onChange={(e) => setNewCoupon({ ...newCoupon, couponName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>할인 유형</label>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 130 }}
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                  >
                    <option value="FIXED">정액 (원)</option>
                    <option value="RATE">정률 (%)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                    할인값 ({newCoupon.discountType === "FIXED" ? "원" : "%"})
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    style={{ width: 110 }}
                    placeholder="0"
                    min={0}
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                  />
                </div>
                <button
                  className="btn btn-dark btn-sm"
                  onClick={handleCreateCoupon}
                  disabled={createLoading}
                >
                  {createLoading ? "생성 중..." : "생성"}
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setShowCreate(false);
                    setNewCoupon({ couponName: "", discountType: "FIXED", discountValue: "" });
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* 쿠폰 테이블 - 5개씩 페이징 */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
              불러오는 중...
            </div>
          ) : coupons.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#aaa" }}>
              등록된 쿠폰이 없습니다.
            </div>
          ) : (
            <>
              <table className="table table-hover" style={{ fontSize: 14 }}>
                <thead style={{ background: "#f8f9fa" }}>
                  <tr>
                    <th style={{ width: 60 }}>번호</th>
                    <th>쿠폰명</th>
                    <th style={{ width: 110 }}>할인 유형</th>
                    <th style={{ width: 110 }}>할인값</th>
                    <th style={{ width: 80 }}>삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 현재 페이지에 해당하는 쿠폰만 슬라이싱하여 표시 */}
                  {coupons
                    .slice((couponPage - 1) * COUPON_PAGE_SIZE, couponPage * COUPON_PAGE_SIZE)
                    .map((c, idx) => (
                      <tr key={c.couponNo}>
                        {/* 전체 순번 유지: (현재페이지-1) * 페이지크기 + 인덱스 + 1 */}
                        <td style={{ color: "#888" }}>{(couponPage - 1) * COUPON_PAGE_SIZE + idx + 1}</td>
                        <td style={{ fontWeight: 500 }}>{c.couponName}</td>
                        <td>
                          <span
                            style={{
                              fontSize: 12,
                              padding: "2px 8px",
                              borderRadius: 4,
                              background: c.discountType === "FIXED" ? "#e3f2fd" : "#fff8e1",
                              color: c.discountType === "FIXED" ? "#1565c0" : "#f57f17",
                            }}
                          >
                            {DISCOUNT_TYPE_LABEL[c.discountType] ?? c.discountType}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {c.discountType === "FIXED"
                            ? `${Number(c.discountValue).toLocaleString()}원`
                            : `${c.discountValue}%`}
                        </td>
                        <td>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteCoupon(c.couponNo, c.couponName)}
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {/* 페이지네이션 - 총 페이지 수가 1 초과일 때만 표시, 페이지 버튼 5개씩 슬라이딩 */}
              {Math.ceil(coupons.length / COUPON_PAGE_SIZE) > 1 && (() => {
                const totalPages = Math.ceil(coupons.length / COUPON_PAGE_SIZE);
                // 현재 페이지 기준으로 보여줄 페이지 버튼 범위 계산
                const groupStart = Math.floor((couponPage - 1) / PAGE_BTN_COUNT) * PAGE_BTN_COUNT + 1;
                const groupEnd = Math.min(groupStart + PAGE_BTN_COUNT - 1, totalPages);
                return (
                  <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 12 }}>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setCouponPage((p) => Math.max(1, p - 1))}
                      disabled={couponPage === 1}
                    >
                      &lt;
                    </button>
                    {Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i).map((p) => (
                      <button
                        key={p}
                        className="btn btn-sm"
                        style={{
                          background: couponPage === p ? "#222" : "#fff",
                          color: couponPage === p ? "#fff" : "#333",
                          border: "1px solid #ddd",
                        }}
                        onClick={() => setCouponPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setCouponPage((p) => Math.min(totalPages, p + 1))}
                      disabled={couponPage === totalPages}
                    >
                      &gt;
                    </button>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCouponManagePage;
