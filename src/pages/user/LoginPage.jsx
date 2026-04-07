import { useState } from "react";
import Header from "../../components/user/Header";
import { Button, Container, Form } from "react-bootstrap";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import KakaoLoginComponent from "../../components/user/KakaoLoginComponent";
import { login } from "../../api/common/authApi";
import Loading from "./LoadingPage";

const LoginPage = () => {
  const nav = useNavigate();
  const location = useLocation();
  const { fetchMe, user, loading } = useUser();

  const [input, setInput] = useState({
    memberId: "",
    password: "",
  });

  const redirectTo = location.state?.redirectTo || "/";

  if (loading) return <Loading />;
  if (user) return <Navigate to={redirectTo} replace />;

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
      nav(redirectTo, { replace: true });
    } catch (err) {
      if(err.response.status===887){
        alert('존재하지 않는 아이디입니다.')
      }else if(err.response.status===888){
        alert('정지된 회원입니다. 전화로 문의해 주시거나 다른 아이디로 로그인해주세요.')
      }else if(err.response.status===401){
        alert(`아이디 또는 비밀번호가 올바르지 않습니다.`)
      }
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
