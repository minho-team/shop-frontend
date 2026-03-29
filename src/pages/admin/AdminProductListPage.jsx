import AdminLayout from "../../components/admin/AdminLayout";
import { useEffect, useRef, useState } from "react";
import { getAdminProductList } from "../../api/admin/adminProductApi";
import { useNavigate, useLocation } from "react-router-dom";
import "../../css/admin/AdminProductListPage.css";
import { API_SERVER_HOST } from "../../api/common/apiClient";

// 카테고리 데이터
const genderCategories = [
  { categoryId: 1, name: "남성" },
  { categoryId: 2, name: "여성" },
];

const mainCategories = {
  1: [
    { categoryId: 11, name: "아우터" },
    { categoryId: 12, name: "상의" },
    { categoryId: 13, name: "하의" },
    { categoryId: 14, name: "악세사리" },
  ],
  2: [
    { categoryId: 21, name: "아우터" },
    { categoryId: 22, name: "상의" },
    { categoryId: 23, name: "하의" },
    { categoryId: 24, name: "악세사리" },
  ],
};

const subCategories = {
  11: [
    { categoryId: 111, name: "코트" },
    { categoryId: 112, name: "파카" },
    { categoryId: 113, name: "자켓" },
    { categoryId: 114, name: "가디건" },
  ],
  12: [
    { categoryId: 121, name: "니트" },
    { categoryId: 122, name: "셔츠" },
    { categoryId: 123, name: "스웨트 셔츠" },
    { categoryId: 124, name: "긴팔" },
    { categoryId: 125, name: "반팔" },
  ],
  13: [
    { categoryId: 131, name: "긴바지" },
    { categoryId: 132, name: "반바지" },
    { categoryId: 133, name: "데님" },
  ],
  14: [
    { categoryId: 141, name: "가방" },
    { categoryId: 142, name: "슈즈" },
    { categoryId: 143, name: "주얼리" },
    { categoryId: 144, name: "잡화" },
  ],
  21: [
    { categoryId: 211, name: "코트" },
    { categoryId: 212, name: "파카" },
    { categoryId: 213, name: "자켓" },
    { categoryId: 214, name: "가디건" },
  ],
  22: [
    { categoryId: 221, name: "니트" },
    { categoryId: 222, name: "셔츠" },
    { categoryId: 223, name: "스웨트 셔츠" },
    { categoryId: 224, name: "긴팔" },
    { categoryId: 225, name: "반팔" },
  ],
  23: [
    { categoryId: 231, name: "긴바지" },
    { categoryId: 232, name: "반바지" },
    { categoryId: 233, name: "데님" },
  ],
  24: [
    { categoryId: 241, name: "가방" },
    { categoryId: 242, name: "슈즈" },
    { categoryId: 243, name: "주얼리" },
    { categoryId: 244, name: "잡화" },
  ],
};

const defaultSearch = {
  page: 1,
  size: 10,
  keyword: "",
  genderCategoryId: "",
  mainCategoryId: "",
  categoryId: "",
  useYn: "",
  sameDayDeliveryYn: "",
};

const AdminProductListPage = () => {
  const [search, setSearch] = useState(defaultSearch);
  const [productList, setProductList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // restoredSearch가 중복 적용되지 않게 막는 용도
  const restoredOnceRef = useRef(false);

  // =========================
  // 1. 상세에서 돌아온 검색조건 복원
  // =========================
  useEffect(() => {
    const restoredSearch = location.state?.restoredSearch;

    if (restoredSearch && !restoredOnceRef.current) {
      restoredOnceRef.current = true;
      setSearch(restoredSearch);

      // 복원 후 state 비워서 뒤로가기/재렌더링 꼬임 방지
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }
  }, [location, navigate]);

  // =========================
  // 2. 목록 조회 함수
  // =========================
  const fetchProductList = async () => {
    try {
      setLoading(true);

      const data = await getAdminProductList(search);
      console.log("상품목록 응답:", data);

      setProductList(data.list || []);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error("상품 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 3. search 변경 시 목록 재조회
  // =========================
  useEffect(() => {
    fetchProductList();
  }, [search]);

  // =========================
  // 4. 검색 조건 변경
  // =========================
  const handleChangeSearch = (e) => {
    const { name, value } = e.target;

    setSearch((prev) => {
      const newSearch = {
        ...prev,
        [name]: value,
        page: 1,
      };

      // 성별 변경 시 대분류/소분류 초기화
      if (name === "genderCategoryId") {
        newSearch.mainCategoryId = "";
        newSearch.categoryId = "";
      }

      // 대분류 변경 시 소분류 초기화
      if (name === "mainCategoryId") {
        newSearch.categoryId = "";
      }

      return newSearch;
    });
  };

  // =========================
  // 5. 초기화
  // =========================
  const handleReset = () => {
    setSearch(defaultSearch);
  };

  // =========================
  // 6. 페이지 변경
  // =========================
  const handlePageChange = (pageNum) => {
    setSearch((prev) => ({
      ...prev,
      page: pageNum,
    }));
  };

  // =========================
  // 7. 상세페이지 이동
  // =========================
  const handleMoveToDetail = (productNo) => {
    navigate(`/admin/products/detail/${productNo}`, {
      state: {
        fromList: {
          searchState: search,
        },
      },
    });
  };

  // =========================
  // 8. 전체 페이지 수 계산
  // =========================
  const totalPages = Math.ceil(totalCount / search.size);

  // =========================
  // 9. 날짜 포맷
  // =========================
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";

    const d = new Date(dateStr);

    if (Number.isNaN(d.getTime())) return "-";

    return d.toLocaleDateString("ko-KR");
  };

  return (
    <AdminLayout pageTitle="상품 관리">
      <div className="admin-product-list-page">
        <h2>상품 목록</h2>

        {/* 검색 영역 */}
        <div className="admin-product-list-search">
          <input
            type="text"
            name="keyword"
            value={search.keyword}
            onChange={handleChangeSearch}
            placeholder="상품명을 입력하세요"
          />

          <select
            name="genderCategoryId"
            value={search.genderCategoryId}
            onChange={handleChangeSearch}
          >
            <option value="">전체 성별</option>
            {genderCategories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            name="mainCategoryId"
            value={search.mainCategoryId}
            onChange={handleChangeSearch}
            disabled={!search.genderCategoryId}
          >
            <option value="">전체 대분류</option>
            {(mainCategories[search.genderCategoryId] || []).map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            name="categoryId"
            value={search.categoryId}
            onChange={handleChangeSearch}
            disabled={!search.mainCategoryId}
          >
            <option value="">전체 소분류</option>
            {(subCategories[search.mainCategoryId] || []).map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            name="useYn"
            value={search.useYn}
            onChange={handleChangeSearch}
          >
            <option value="">전체 판매여부</option>
            <option value="Y">판매중</option>
            <option value="N">판매중지</option>
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

          <button type="button" className="admin-btn" onClick={handleReset}>
            초기화
          </button>
        </div>

        {/* 목록 개수 표시 */}
        <div className="admin-product-list-summary">
          총 <strong>{totalCount}</strong>개 상품
        </div>

        {/* 목록 영역 */}
        <div className="admin-product-list-section">
          {loading ? (
            <p className="admin-empty-text">로딩중...</p>
          ) : (
            <div className="admin-product-list-table-wrap">
              <table className="admin-product-list-table">
                <thead>
                  <tr>
                    <th>썸네일</th>
                    <th>상품번호</th>
                    <th>상품명</th>
                    <th>카테고리</th>
                    <th>정가</th>
                    <th>할인율</th>
                    <th>판매가</th>
                    <th>판매여부</th>
                    <th>조회수</th>
                    <th>당일배송</th>
                    <th>등록일</th>
                  </tr>
                </thead>

                <tbody>
                  {productList.length === 0 ? (
                    <tr className="admin-empty-row">
                      <td colSpan="11">
                        <span className="admin-empty-text">
                          조회된 상품이 없습니다.
                        </span>
                      </td>
                    </tr>
                  ) : (
                    productList.map((product) => {
                      const imageSrc = product.thumbnailUrl
                        ? `${API_SERVER_HOST}${product.thumbnailUrl}`
                        : "";

                      return (
                        <tr
                          key={product.productNo}
                          onClick={() => handleMoveToDetail(product.productNo)}
                        >
                          <td>
                            <div className="thumbnail-wrapper">
                              {product.thumbnailUrl ? (
                                <img
                                  src={imageSrc}
                                  alt={product.name}
                                  className="admin-product-thumbnail"
                                />
                              ) : (
                                <div className="admin-product-no-image">
                                  이미지 없음
                                </div>
                              )}

                              {product.useYn === "N" && (
                                <div className="thumbnail-overlay">
                                  <span className="soldout-badge">
                                    판매중지
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          <td>{product.productNo}</td>

                          <td className="admin-product-name-cell">
                            <div className="admin-product-name-text">
                              {product.name}
                            </div>
                          </td>

                          <td className="admin-product-category-cell">
                            {product.categoryName}
                          </td>

                          <td>{product.price?.toLocaleString()}원</td>
                          <td>{product.discountRate}%</td>
                          <td>{product.salePrice?.toLocaleString()}원</td>

                          <td>
                            <span
                              className={`admin-badge ${
                                product.useYn === "Y"
                                  ? "admin-badge-use"
                                  : "admin-badge-not-use"
                              }`}
                            >
                              {product.useYn === "Y" ? "판매중" : "판매중지"}
                            </span>
                          </td>

                          <td>{product.viewCount}</td>

                          <td>
                            <span
                              className={`admin-badge ${
                                product.sameDayDeliveryYn === "Y"
                                  ? "admin-badge-delivery"
                                  : "admin-badge-normal"
                              }`}
                            >
                              {product.sameDayDeliveryYn === "Y"
                                ? "당일배송"
                                : "일반배송"}
                            </span>
                          </td>

                          <td>{formatDate(product.createdAt)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 페이지네이션 */}
          <div className="admin-product-pagination">
            <button
              type="button"
              className="admin-btn admin-btn-page"
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
                  className={`admin-btn admin-btn-page ${
                    search.page === pageNum ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={search.page === pageNum}
                >
                  {pageNum}
                </button>
              ),
            )}

            <button
              type="button"
              className="admin-btn admin-btn-page"
              disabled={search.page === totalPages || totalPages === 0}
              onClick={() => handlePageChange(search.page + 1)}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductListPage;
