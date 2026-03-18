import AdminLayout from "../../components/admin/AdminLayout";
import AdminHeader from "../../components/admin/AdminHeader";
import { useEffect, useState } from "react";
import { getAdminProductList } from "../../api/admin/adminProductApi";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080";

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

const AdminProductListPage = () => {
  // 검색 조건 상태
  const [search, setSearch] = useState({
    page: 1,
    size: 10,
    keyword: "",
    genderCategoryId: "",
    mainCategoryId: "",
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

    setSearch((prev) => {
      let newSearch = {
        ...prev,
        [name]: value,
        page: 1,
      };

      if (name === "genderCategoryId") {
        newSearch.mainCategoryId = "";
        newSearch.categoryId = "";
      }

      if (name === "mainCategoryId") {
        newSearch.categoryId = "";
      }

      return newSearch;
    });
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
      genderCategoryId: "",
      mainCategoryId: "",
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
              {(mainCategories[search.genderCategoryId] || []).map(
                (category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ),
              )}
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
