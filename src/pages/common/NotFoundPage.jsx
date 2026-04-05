import { useNavigate } from "react-router-dom";
import animationData from "../../assets/404.json";
import Lottie from "lottie-react";

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <>
            <div style={{"display":"flex",
                "flexDirection":"column",
                "alignItems":"center",
                height:"100vh"
            }}>


                <div className="loading-container">
                    <Lottie
                        animationData={animationData}
                        loop={true}
                        style={{ width: 500}}
                    />
                    <div className="loading-text">Loading...</div>
                </div>

                <button style={{
                    "background": "black",
                    "color": "white",
                    "padding": "20px",
                    "width":"300px",
                    "marginBottom":"50px",
                    "borderRadius":"10px"


                }} onClick={() => navigate("/")}>
                    홈으로 돌아가기
                </button>
            </div>
        </>
    );
};

export default NotFoundPage;