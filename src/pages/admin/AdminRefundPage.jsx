import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import "../../css/admin/AdminRefundPage.css";
import { getAdminRefundList } from "../../api/admin/adminRefundApi";
const statusLabelMap = {
  REQUESTED: "환불요청",
  APPROVED: "승인완료",
  REJECTED: "거절",
  COMPLETED: "환불완료",
};

const PAGE_BLOCK_SIZE = 5;

const AdminRefundPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState({
    page: 1,
    size: 10,
    keyword: "",
    status: "ALL",
  });

  const [refundList, setRefundList] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    size: 10,
    totalCount: 0,
    totalPage: 0,
    startPage: 1,
    endPage: 1,
    hasPrev: false,
    hasNext: false,
  });
  const [loading, setLoading] = useState(false);

  const fetchRefundList = async (params = search) => {
    try {
      setLoading(true);
      const data = await getAdminRefundList(params);

      setRefundList(data.list || []);
      setPageInfo({
        page: data.page,
        size: data.size,
        totalCount: data.totalCount,
        totalPage: data.totalPage,
        startPage: data.startPage,
        endPage: data.endPage,
        hasPrev: data.hasPrev,
        hasNext: data.hasNext,
      });
    } catch (error) {
      console.error("환불 목록 조회 실패:", error);
      alert("환불 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefundList(search);
  }, []);

  const handleChangeSearch = (e) => {
    const { name, value } = e.target;
    setSearch((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitSearch = (e) => {
    e.preventDefault();

    const nextSearch = {
      ...search,
      page: 1,
    };

    setSearch(nextSearch);
    fetchRefundList(nextSearch);
  };

  const handleMovePage = (page) => {
    const nextSearch = {
      ...search,
      page,
    };

    setSearch(nextSearch);
    fetchRefundList(nextSearch);
  };

  const handleClickRow = (refundNo) => {
    navigate(`/admin/refund/detail/${refundNo}`);
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = pageInfo.startPage; i <= pageInfo.endPage; i++) {
      pages.push(
        <button
          key={i}
          type="button"
          className={pageInfo.page === i ? "active" : ""}
          onClick={() => handleMovePage(i)}
        >
          {i}
        </button>,
      );
    }
    return pages;
  };

  return (
    <>
      <AdminLayout pageTitle="환불 관리">
        <div className="admin-refund-page">
          <div className="admin-refund-top">
            <h2>환불 관리</h2>
            <p>환불 요청 목록을 확인하고 상세 페이지에서 처리할 수 있습니다.</p>
          </div>

          <form className="admin-refund-search" onSubmit={handleSubmitSearch}>
            <select
              name="status"
              value={search.status}
              onChange={handleChangeSearch}
            >
              <option value="ALL">전체</option>
              <option value="REQUESTED">환불요청</option>
              <option value="APPROVED">승인완료</option>
              <option value="REJECTED">거절</option>
              <option value="COMPLETED">환불완료</option>
            </select>

            <input
              type="text"
              name="keyword"
              value={search.keyword}
              onChange={handleChangeSearch}
              placeholder="환불번호, 주문번호, 회원ID, 상품명 검색"
            />

            <button type="submit">검색</button>
          </form>

          <div className="admin-refund-summary">
            총 <strong>{pageInfo.totalCount}</strong>건
          </div>

          <div className="admin-refund-table-wrap">
            <table className="admin-refund-table">
              <thead>
                <tr>
                  <th>환불번호</th>
                  <th>주문번호</th>
                  <th>회원</th>
                  <th>상품정보</th>
                  <th>총 환불금액</th>
                  <th>상태</th>
                  <th>요청일시</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      불러오는 중...
                    </td>
                  </tr>
                ) : refundList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      환불 목록이 없습니다.
                    </td>
                  </tr>
                ) : (
                  refundList.map((refund) => (
                    <tr
                      key={refund.refundNo}
                      className="clickable-row"
                      onClick={() => handleClickRow(refund.refundNo)}
                    >
                      <td>{refund.refundNo}</td>
                      <td>{refund.orderNo}</td>
                      <td>
                        <div>{refund.name}</div>
                        <div className="sub-text">{refund.memberId}</div>
                      </td>
                      <td className="item-cell">
                        {refund.items?.map((item) => (
                          <div key={item.refundItemNo} className="item-line">
                            <div className="item-name">{item.itemName}</div>
                            <div className="sub-text">
                              {item.itemColor} / {item.itemSize} /{" "}
                              {item.refundQuantity}개
                            </div>
                          </div>
                        ))}
                      </td>
                      <td>
                        {Number(refund.totalRefundAmount).toLocaleString()}원
                      </td>
                      <td>
                        <span
                          className={`status-badge status-${refund.refundStatus?.toLowerCase()}`}
                        >
                          {statusLabelMap[refund.refundStatus] ||
                            refund.refundStatus}
                        </span>
                      </td>
                      <td>
                        {refund.requestedAt?.replace("T", " ").slice(0, 16)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pageInfo.totalPage > 0 && (
            <div className="pagination">
              <button
                type="button"
                disabled={!pageInfo.hasPrev}
                onClick={() => handleMovePage(pageInfo.startPage - 1)}
              >
                {"<"}
              </button>

              {renderPageNumbers()}

              <button
                type="button"
                disabled={!pageInfo.hasNext}
                onClick={() => handleMovePage(pageInfo.endPage + 1)}
              >
                {">"}
              </button>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminRefundPage;
