import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Header from "../../components/user/Header";
import MainCarousel from "../../components/user/MainCarousel";
import MainProductList from "../../components/user/MainProductList";
import Footer from "../../components/user/Footer";
import HomeProductSection from "../../components/user/HomeProductSection";
import { getHomeMainData } from "../../api/user/productApi";

const MainHome = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const categoryId = searchParams.get("categoryId");
  const keyword = searchParams.get("keyword");
  const sort = searchParams.get("sort");
  const discountOnly = searchParams.get("discountOnly");

  const isFiltered = !!categoryId || !!keyword || !!sort || !!discountOnly;

  const [homeData, setHomeData] = useState({
    newProducts: [],
    bestProducts: [],
    saleProducts: [],
    recommendProducts: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isFiltered) return;

    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const productRes = await getHomeMainData();

        setHomeData(
          productRes || {
            newProducts: [],
            bestProducts: [],
            saleProducts: [],
            recommendProducts: [],
          }
        );
      } catch (error) {
        console.error("메인 데이터 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [isFiltered]);

  return (
    <>
      <Header />

      {isFiltered ? (
        <MainProductList key={location.search} />
      ) : (
        <>
          <MainCarousel />

          <HomeProductSection
            label="NEW ARRIVAL"
            title="신상품"
            subtitle="최근 등록된 아이템을 가장 먼저 만나보세요."
            products={homeData.newProducts}
            loading={loading}
            moreLink="/?sort=new"
          />

          <HomeProductSection
            label="BEST SELLER"
            title="베스트 상품"
            subtitle="지금 가장 많이 찾는 인기 아이템입니다."
            products={homeData.bestProducts}
            loading={loading}
            moreLink="/?sort=best"
          />

          <HomeProductSection
            label="SPECIAL PRICE"
            title="할인 상품"
            subtitle="할인 중인 상품만 모아봤어요."
            products={homeData.saleProducts}
            loading={loading}
            moreLink="/?discountOnly=true&sort=sale"
          />

          <HomeProductSection
            label="RECOMMEND"
            title="추천 상품"
            subtitle="지금 둘러보기 좋은 상품을 추천합니다."
            products={homeData.recommendProducts}
            loading={loading}
            moreLink="/?sort=new"
          />
        </>
      )}

      <Footer />
    </>
  );
};

export default MainHome;