import Header from "../components/Header";
import MainCarousel from "../components/MainCarousel";
import MainProductList from "../components/MainProductList";
import Footer from "../components/Footer";

const MainHome = () => {
  return (
    <>
      <Header />
      <MainCarousel />
      <MainProductList />
      <Footer />
    </>
  );
};

export default MainHome;