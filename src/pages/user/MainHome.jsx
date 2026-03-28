import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Header from "../../components/user/Header";
import MainCarousel from "../../components/user/MainCarousel";
import MainProductList from "../../components/user/MainProductList";
import Footer from "../../components/user/Footer";
import HomeProductSection from "../../components/user/HomeProductSection";
import PopularKeywords from "../../components/user/PopularKeywords";
import RecentlyViewed from "../../components/user/RecentlyViewed";
import HomeReviewSection from "../../components/user/HomeReviewSection";
import { getHomeMainData } from "../../api/user/productApi";
import { useUser } from "../../context/UserContext";
// ★ 룰렛 모달 import 추가
import RouletteModal from "../../components/user/RouletteModal";
import TestNoticeBanner from "../../components/user/TestNoticeBanner";

const MainHome = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // ★ 로그인 여부 확인용
  const { user } = useUser();

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
    recentReviews: [],
    popularKeywords: [],
  });
  const [loading, setLoading] = useState(false);

  // ★ 룰렛 모달 표시 여부
  const [showRoulette, setShowRoulette] = useState(false);

  // 메인 데이터 로드
  useEffect(() => {
    if (isFiltered) return;
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const productRes = await getHomeMainData();
        setHomeData(productRes || {
          newProducts: [],
          bestProducts: [],
          saleProducts: [],
          recommendProducts: [],
          recentReviews: [],
          popularKeywords: [],
        });
      } catch (error) {
        console.error("메인 데이터 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, [isFiltered]);

  // ★ 로그인한 회원에게 하루 1번 룰렛 팝업 자동 표시
  useEffect(() => {
    if (!user) return; // 비로그인이면 팝업 안 띄움

    // ★ 계정별 키로 확인 (RouletteModal과 동일한 키 형식 사용)
    const storageKey = `roulette_last_spun_${user.memberId}`;
    const lastSpun = localStorage.getItem(storageKey);
    const today = new Date().toISOString().slice(0, 10);

    // 오늘 아직 안 돌렸으면 팝업 표시
    if (lastSpun !== today) {
      // 0.5초 딜레이 후 팝업 (페이지 로드 직후 바로 뜨면 어색해서)
      const timer = setTimeout(() => setShowRoulette(true), 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  return (
    <>
      <Header />

      {/* ★ 로그인 회원에게 룰렛 모달 표시 */}
      {showRoulette && (
        <RouletteModal onClose={() => setShowRoulette(false)} />
      )}

      {isFiltered ? (
        <MainProductList key={location.search} />
      ) : (
        <>
          <MainCarousel />

          <PopularKeywords keywords={homeData.popularKeywords} />

        <TestNoticeBanner/>

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

          <HomeReviewSection reviews={homeData.recentReviews} />

          <RecentlyViewed />
        </>
      )}

      <Footer />
    </>
  );
};

export default MainHome;