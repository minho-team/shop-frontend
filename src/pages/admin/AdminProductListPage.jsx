import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import { useEffect, useState } from "react";
import { getAdminProductList } from "../../api/admin/adminProductApi";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080";

const AdminProductListPage = () => {
  // 검색 조건 상태
  const [search, setSearch] = useState({
    page: 1,
    size: 10,
    keyword: "",
    categoryId: "",
    useYn: "",
    sameDayDeliveryYn: "",
  });

  // 상품 목록 상태
  const [productList, setProductList] = useState([]);
  // 전체 개수 / 페이지 정보 상태
  const [totalCount, setTotalCount] = useState(0);
  // 로딩 상태
  const [loading, setLoading] = useState(false);
  // 목록 조회 함수
  const fetchProductList = async () => {
    try {
      setLoading(true);

      const data = await getAdminProductList(search);
      console.log("상품목록 응답:", data.list);

      setProductList(data.list || []);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error("상품 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };
  // search 값이 바뀔 때마다 재조회
  useEffect(() => {
    fetchProductList();
  }, [search]);
  // 검색 조건 변경 핸들러
  const handleChangeSearch = (e) => {
    const { name, value } = e.target;

    setSearch((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // 검색조건 바뀌면 첫 페이지로 이동
    }));
  };
  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    setSearch((prev) => ({
      ...prev,
      page: 1,
    }));
  };
  // 초기화 버튼 클릭 핸들러
  const handleReset = () => {
    setSearch({
      page: 1,
      size: 10,
      keyword: "",
      categoryId: "",
      useYn: "",
      sameDayDeliveryYn: "",
    });
  };
  // 페이지 이동 함수
  const navigate = useNavigate();
  // 페이지 변경 핸들러
  const handlePageChange = (pageNum) => {
    setSearch((prev) => ({
      ...prev,
      page: pageNum,
    }));
  };
  // 페이지 계산
  const totalPages = Math.ceil(totalCount / search.size);
  // 날짜 포맷 함수
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  return (
    <>
      <AdminHeader />
      <AdminLayout pageTitle="상품 관리">
        <div>
          <h2>상품 목록</h2>
          {/* 검색 영역 */}
          <div>
            <input
              type="text"
              name="keyword"
              value={search.keyword}
              onChange={handleChangeSearch}
              placeholder="상품명을 입력하세요"
            />

            <select
              name="categoryId"
              value={search.categoryId}
              onChange={handleChangeSearch}
            >
              <option value="">전체 카테고리</option>
              <option value="1">상의</option>
              <option value="2">하의</option>
              <option value="3">아우터</option>
            </select>

            <select
              name="useYn"
              value={search.useYn}
              onChange={handleChangeSearch}
            >
              <option value="">전체 사용여부</option>
              <option value="Y">사용</option>
              <option value="N">미사용</option>
            </select>

            <select
              name="sameDayDeliveryYn"
              value={search.sameDayDeliveryYn}
              onChange={handleChangeSearch}
            >
              <option value="">전체 당일배송</option>
              <option value="Y">당일배송</option>
              <option value="N">일반배송</option>
            </select>

            <button type="button" onClick={handleSearch}>
              검색
            </button>

            <button type="button" onClick={handleReset}>
              초기화
            </button>
          </div>

          {/* 목록 영역 */}
          {loading ? (
            <p>로딩중...</p>
          ) : (
            <table border="1" cellPadding="10">
              <thead>
                <tr>
                  <th>썸네일</th>
                  <th>상품번호</th>
                  <th>상품명</th>
                  <th>카테고리</th>
                  <th>정가</th>
                  <th>할인율</th>
                  <th>판매가</th>
                  <th>사용여부</th>
                  <th>조회수</th>
                  <th>당일배송</th>
                  <th>등록일</th>
                </tr>
              </thead>
              <tbody>
                {productList.length === 0 ? (
                  <tr>
                    <td colSpan="11">조회된 상품이 없습니다.</td>
                  </tr>
                ) : (
                  productList.map((product) => {
                    const imageSrc = product.thumbnailUrl
                      ? `${API_BASE_URL}${product.thumbnailUrl}`
                      : "";

                    return (
                      <tr
                        key={product.productNo}
                        onClick={() =>
                          navigate(`/admin/products/detail/${product.productNo}`)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          {product.thumbnailUrl ? (
                            <img src={imageSrc} alt={product.name} width="60" />
                          ) : (
                            "이미지 없음"
                          )}
                        </td>
                        <td>{product.productNo}</td>
                        <td>{product.name}</td>
                        <td>{product.categoryName}</td>
                        <td>{product.price?.toLocaleString()}원</td>
                        <td>{product.discountRate}%</td>
                        <td>{product.salePrice?.toLocaleString()}원</td>
                        <td>{product.useYn === "Y" ? "사용" : "미사용"}</td>
                        <td>{product.viewCount}</td>
                        <td>
                          {product.sameDayDeliveryYn === "Y"
                            ? "당일배송"
                            : "일반배송"}
                        </td>
                        <td>{formatDate(product.createdAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* 페이지네이션 */}
          <div style={{ marginTop: "20px" }}>
            <button
              type="button"
              disabled={search.page === 1}
              onClick={() => handlePageChange(search.page - 1)}
            >
              이전
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  disabled={search.page === pageNum}
                >
                  {pageNum}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={search.page === totalPages || totalPages === 0}
              onClick={() => handlePageChange(search.page + 1)}
            >
              다음
            </button>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminProductListPage;
