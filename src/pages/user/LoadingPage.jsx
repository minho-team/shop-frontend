import Lottie from "lottie-react";
import animationData from "../../assets/shopping.json";
import "../../css/common/LoadingPage.css";

const LoadingPage = () => {
  return (
    <div className="loading-container">
      <Lottie
        animationData={animationData}
        loop={true}
        style={{ width: 200 }}
      />
      <div className="loading-text">Loading...</div>
    </div>
  );
};

export default LoadingPage;