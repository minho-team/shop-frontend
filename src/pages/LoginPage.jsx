import { useState } from "react";
import Header from "../components/Header";
import { Button, Container, Form } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { useUser } from "../context/UserContext";
import Loading from "./Loading";

const LoginPage = () => {

    const nav = useNavigate();
    const { fetchMe, user, loading } = useUser();
    const [input, setInput] = useState({
        memberId:"",
        password:""
    });

    if (loading) return <Loading/>
    //로그인한 사용자가 주소창에 억지로 /login을 입력할 때의 방어
    if (user) return <Navigate to="/" replace />;

    const observeInput = (e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        })
    }

    const clickRegisterBtn = () => {
        nav('/registerPage')
    }

    const clickLoginBtn = async () => {
        try {
            const data = await login(input);
            await fetchMe();
            console.log(data);
            nav("/", { replace: true });
        } catch (err) {
            console.log(err);
        }

    }


    return (
        <>
            <Header />

            <Container style={{ maxWidth: "400px", marginTop: "50px" }}>
                <h2 className="mb-4">로그인</h2>

                <Form>
                    <Form.Group className="mb-3" controlId="loginId">
                        <Form.Control name="memberId" onChange={observeInput} type="text" placeholder="아이디 입력" />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="loginPassword">
                        <Form.Control onChange={observeInput} type="password" name="password" placeholder="비밀번호 입력" />

                    </Form.Group>

                    <Button variant="dark" type="button" className="w-100 mb-2" onClick={clickLoginBtn}>
                        로그인
                    </Button>
                    <Button onClick={clickRegisterBtn} variant="dark" type="button" className="w-100">
                        회원가입
                    </Button>
                </Form>
            </Container>
        </>
    );
};

export default LoginPage;