import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import MainCarousel from "../components/MainCarousel";
import MainProductList from "../components/MainProductList";
import Footer from "../components/Footer";

const MainHome = () => {
  const location = useLocation();

  console.log("MainHome location.search =", location.search);

  return (
    <>
      <Header />
      <MainCarousel />
      <MainProductList key={location.search} />
      <Footer />
    </>
  );
};

export default MainHome;