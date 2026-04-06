import { useState, useEffect } from "react";
import Header from "../../components/user/Header";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { checkEmail, checkMemberId, CheckNickName, register } from "../../api/common/authApi";

const RegisterPage = () => {
  const nav = useNavigate();
  const [input, setInput] = useState({});
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [checkedIdMessage, setCheckedIdMessage] = useState("");
  const [availableId, setAvailableId] = useState(false);
  const [checkedNickNameMessage, setCheckedNickNameMessage] = useState("");
  const [checkedEmailMessage, setCheckedEmailMessage] = useState("");
  const [availableNickName, setAvailableNickName] = useState(false);
  const [availableEmail, setAvailableEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSame, setIsSame] = useState(false);

  const isIdValid = input.memberId && input.memberId.trim() !== "";
  const isNicknameValid = input.nickName && input.nickName.trim() !== "";
  const isEmailValid = input.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email);

  useEffect(() => {
    if (!password || !confirmPassword) {
      setIsSame(false);
      return;
    }
    setIsSame(password === confirmPassword);
  }, [password, confirmPassword]);

  const openPostcode = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setInput((prev) => ({
          ...prev,
          zipCode: data.zonecode,
          basicAddress: data.address,
        }));
      },
    }).open();
  };

  const observeInput = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const handlePassword = (e) => {
    const value = e.target.value;
    setPassword(value);

    setInput({
      ...input,
      password: value,
    });
  };

  const handleConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
  };

  const checkPasswordMessage = isSame ?
    <p style={{ color: "green", fontWeight: "bold" }}>비밀번호가 일치합니다</p>
    :
    <p style={{ color: "orange", fontWeight: "bold" }}>비밀번호가 일치하지 않습니다</p>;

  // 닉네임 중복 확인 함수
  const CheckAvailabilityNickName = async (nickName) => {
    const response = await CheckNickName(nickName);
    if (response[0] === '0') {
      setAvailableNickName(false)
    } else {
      setAvailableNickName(true)
    }
    setCheckedNickNameMessage(response[1])
  }

  //이메일 중복 확인 함수
  const CheckAvailabilityEmail = async (email) => {
    const response = await checkEmail(email);
    if (response[0] === '0') {
      setAvailableEmail(false)
    } else {
      setAvailableEmail(true)
    }
    setCheckedEmailMessage(response[1])

  }

  //아이디 중복 확인 함수
  const CheckAvailabilityId = async (memberId) => {
    const response = await checkMemberId(memberId);
    if (response[0] === '0') {
      setAvailableId(false)
    } else {
      setAvailableId(true)
    }
    setCheckedIdMessage(response[1]);
  }

  const clickRegisterButton = async () => {
    if (!input.memberId?.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }
    if (availableId === false) {
      alert("아이디가 중복되었는지 확인해주세요.")
      return;
    }

    if (isSame === false) {
      alert("두 입력 칸의 비밀번호가 일치하지 않습니다.")
      return;
    }

    if (!input.password?.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    if (!input.name?.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (!input.nickName?.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    if (availableNickName === false) {
      alert("닉네임이 중복되었는지 확인해주세요.")
      return;
    }


    if (!privacyChecked) {
      alert("개인정보처리방침을 확인해주세요.");
      return;
    }

    try {
      const data = await register(input);
      console.log(data);
      nav("/registerResult", { replace: true });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Header />

      <Container
        style={{ maxWidth: "800px", marginTop: "40px", marginBottom: "60px" }}
      >
        <h2 className="mb-4">회원가입</h2>
        <p>본 사이트는 포트폴리오 용 테스트 웹페이지입니다.</p>
        <p style={{ color: "#666", fontSize: "14px" }}>
          회원가입 시 입력한 정보는 회원 식별, 주문/배송/환불 기능 테스트를
          위해 처리됩니다.<br /> 자세한 내용은 개인정보처리방침을 확인해 주세요.
        </p>

        <h3 className="mt-5">필수사항</h3>
        <hr className="my-4" />

        <Form>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="memberId">
                <Form.Label>아이디</Form.Label>
                <Form.Control
                  required
                  onChange={observeInput}
                  name="memberId"
                  type="text"
                  placeholder="아이디 입력"
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button style={{ marginTop: "30px" }} variant="dark" type="button" onClick={() => CheckAvailabilityId(input.memberId)}
                disabled={!isIdValid}
              >중복확인</Button>
            </Col>
            <Col md={4}>
              <p style={{ marginTop: "35px" }}>{checkedIdMessage}</p>
            </Col>
          </Row>

          <Row style={{ marginBottom: "20px" }}>
            <Col md={6}>
              <Form.Group controlId="password">
                <Form.Label>비밀번호</Form.Label>
                <Form.Control
                  required
                  onChange={handlePassword}
                  name="password"
                  type="password"
                  placeholder="비밀번호 입력"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row style={{ marginBottom: "20px" }}>
            <Col md={6}>
              <Form.Group controlId="password">
                <Form.Label>비밀번호 확인</Form.Label>
                <Form.Control
                  required
                  onChange={handleConfirmPassword}
                  type="password"
                  placeholder="비밀번호 입력"
                />
              </Form.Group>
            </Col>
            <Col md={4} style={{ marginTop: "40px" }}>
              {password && confirmPassword &&
                <p>{checkPasswordMessage}</p>
              }
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="name">
                <Form.Label>이름</Form.Label>
                <Form.Control
                  required
                  onChange={observeInput}
                  name="name"
                  type="text"
                  placeholder="이름 입력"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group controlId="nickName">
                <Form.Label>닉네임</Form.Label>
                <Form.Control
                  required
                  onChange={observeInput}
                  name="nickName"
                  type="text"
                  placeholder="닉네임 입력"
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <div className="mt-4 mb-4">
                <Button style={{ marginTop: "8px" }} variant="dark" type="button" onClick={() => CheckAvailabilityNickName(input.nickName)}
                  disabled={!isNicknameValid}
                >중복확인</Button>
              </div>
            </Col>
            <Col>
              <div>
                <p style={{ marginTop: "40px" }}>{checkedNickNameMessage}</p>
              </div>
            </Col>
          </Row>

          <h3 className="mt-5">선택사항</h3>
          <hr className="my-4" />

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="email">
                <Form.Label>이메일</Form.Label>
                <Form.Control
                  required
                  onChange={observeInput}
                  name="email"
                  type="email"
                  placeholder="이메일 입력"
                />
              </Form.Group>
            </Col>

            <Col>
              <Button
                style={{ marginTop: "32px" }}
                variant="dark" type="button"
                onClick={() => CheckAvailabilityEmail(input.email)}
                disabled={!isEmailValid}
              >중복확인</Button>
            </Col>
            <Col md={4}>
              <p style={{ marginTop: "35px" }}>{checkedEmailMessage}</p>
            </Col>

          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="phoneNumber">
                <Form.Label>전화번호</Form.Label>
                <Form.Control
                  required
                  onChange={observeInput}
                  name="phoneNumber"
                  type="text"
                  placeholder="전화번호 입력"
                />
              </Form.Group>
            </Col>

          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="zipCode">
                <Form.Label>우편번호</Form.Label>
                <Form.Control
                  className="mb-3"
                  value={input.zipCode || ""}
                  onChange={observeInput}
                  name="zipCode"
                  type="text"
                />
              </Form.Group>
            </Col>
            <Col>
              <Button
                type="button"
                variant="dark"
                style={{ marginTop: "32px" }}
                onClick={openPostcode}>
                주소검색
              </Button>
            </Col>

            <Col md={8}>
              <Form.Group controlId="basicAddress">
                <Form.Label>기본주소</Form.Label>
                <Form.Control
                  value={input.basicAddress || ""}
                  onChange={observeInput}
                  name="basicAddress"
                  type="text"
                  placeholder="기본주소 입력"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="detailAddress">
            <Form.Label>상세주소</Form.Label>
            <Form.Control
              onChange={observeInput}
              name="detailAddress"
              type="text"
              placeholder="상세주소 입력"
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="gender">
                <Form.Label>성별</Form.Label>
                <Form.Select onChange={observeInput} name="gender">
                  <option value="">선택</option>
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="birthday">
                <Form.Label>생년월일</Form.Label>
                <Form.Control
                  onChange={observeInput}
                  name="birthday"
                  type="date"
                />
              </Form.Group>
            </Col>
          </Row>

          <hr className="my-4" />

          <h5 className="mb-3">환불 계좌 정보</h5>

          <Row className="mb-4">
            <Col md={4}>
              <Form.Group controlId="bankName">
                <Form.Label>은행명</Form.Label>
                <Form.Control
                  onChange={observeInput}
                  name="bankName"
                  type="text"
                  placeholder="은행명 입력"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="bankCode">
                <Form.Label>은행코드</Form.Label>
                <Form.Control
                  onChange={observeInput}
                  type="text"
                  name="bankCode"
                  placeholder="은행코드 입력"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="accountHolderName">
                <Form.Label>예금주명</Form.Label>
                <Form.Control
                  onChange={observeInput}
                  name="accountHolderName"
                  type="text"
                  placeholder="예금주명 입력"
                />
              </Form.Group>
            </Col>
          </Row>

          <div
            style={{
              padding: "14px 16px",
              backgroundColor: "#f7f7f7",
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px",
              color: "#555",
            }}
          >
            회원가입 시 입력한 정보는 회원 식별, 주문/배송/환불 기능 테스트를
            위해 처리됩니다. 본 서비스는 테스트용 프로젝트이며, 자세한 내용은{" "}
            <Link to="/privacy">개인정보처리방침</Link>
            을 확인해 주세요.
          </div>

          <Form.Group className="mb-4" controlId="privacyCheck">
            <Form.Check
              type="checkbox"
              label={
                <>
                  개인정보처리방침을 확인했습니다.{" "}
                  <Link to="/privacy">내용 보기</Link>
                </>
              }
              checked={privacyChecked}
              onChange={(e) => setPrivacyChecked(e.target.checked)}
            />
          </Form.Group>

          <Button variant="dark" type="button" onClick={clickRegisterButton}>
            회원가입
          </Button>
        </Form>
      </Container>
    </>
  );
};

export default RegisterPage;