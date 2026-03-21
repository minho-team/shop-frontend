import { useState } from "react";
import Header from "../../components/user/Header";
import { Button, Container, Form } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import KakaoLoginComponent from "../../components/user/KakaoLoginComponent";
import { login } from "../../api/common/authApi";
import Loading from "./Loading";

const LoginPage = () => {
    const nav = useNavigate();
    const { fetchMe, user, loading } = useUser();

    const [input, setInput] = useState({
        memberId: "",
        password: "",
    });

    if (loading) return <Loading />;
    if (user) return <Navigate to="/" replace />;

    const observeInput = (e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value,
        });
    };

    const clickRegisterBtn = () => {
        nav("/register");
    };

    const clickLoginBtn = async () => {
        try {
            const data = await login(input);
            await fetchMe();
            console.log(data);
            nav("/", { replace: true });
        } catch (err) {
            console.log(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await clickLoginBtn();
    };

    return (
        <>
            <Header />

            <Container style={{ maxWidth: "400px", marginTop: "50px" }}>
                <h2 className="mb-4">로그인</h2>

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="loginId">
                        <Form.Control
                            name="memberId"
                            value={input.memberId}
                            onChange={observeInput}
                            type="text"
                            placeholder="아이디 입력"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="loginPassword">
                        <Form.Control
                            name="password"
                            value={input.password}
                            onChange={observeInput}
                            type="password"
                            placeholder="비밀번호 입력"
                        />
                    </Form.Group>

                    <Button variant="dark" type="submit" className="w-100 mb-1">
                        로그인
                    </Button>



                    <Button
                        onClick={clickRegisterBtn}
                        variant="dark"
                        type="button"
                        className="w-100 mt-2 mb-3"
                    >
                        회원가입
                    </Button>

                    <KakaoLoginComponent />
                </Form>
            </Container>
        </>
    );
};

export default LoginPage;