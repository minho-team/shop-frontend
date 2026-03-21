import { useState } from "react";
import Header from "../../components/user/Header";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { register } from "../../api/authApi";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {


    const nav = useNavigate();
    const [input, setInput] = useState({});

    const observeInput = (e) => {

        setInput({
            ...input,
            [e.target.name]: e.target.value
        })
    }


    const clickRegisterButton = async ()=>{

        try{
            const data = await register(input)
            console.log(data);
            nav('/');
        }catch(err){
            console.log(err);
        }
    }

    return (
        <>
            <Header />

            <Container style={{ maxWidth: "800px", marginTop: "40px" }}>
                <h2 className="mb-4">회원가입</h2>

                <Form>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="memberId">
                                <Form.Label>아이디</Form.Label>
                                <Form.Control required onChange={observeInput} name="memberId" type="text" placeholder="아이디 입력" />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="password">
                                <Form.Label>비밀번호</Form.Label>
                                <Form.Control required onChange={observeInput} name="password" type="password" placeholder="비밀번호 입력" />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="name">
                                <Form.Label>이름</Form.Label>
                                <Form.Control required onChange={observeInput} name="name" type="text" placeholder="이름 입력" />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="nickName">
                                <Form.Label>닉네임</Form.Label>
                                <Form.Control required onChange={observeInput} name="nickName" type="text" placeholder="닉네임 입력" />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="email">
                                <Form.Label>이메일</Form.Label>
                                <Form.Control required onChange={observeInput} name="email" type="email" placeholder="이메일 입력" />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="phoneNumber">
                                <Form.Label>전화번호</Form.Label>
                                <Form.Control required onChange={observeInput} name="phoneNumber" type="text" placeholder="전화번호 입력" />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group controlId="zipCode">
                                <Form.Label>우편번호</Form.Label>
                                <Form.Control onChange={observeInput} name="zipCode" type="text" placeholder="우편번호 입력" />
                            </Form.Group>
                        </Col>
                        <Col md={8}>
                            <Form.Group controlId="basicAddress">
                                <Form.Label>기본주소</Form.Label>
                                <Form.Control onChange={observeInput} name="basicAddress" type="text" placeholder="기본주소 입력" />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="detailAddress">
                        <Form.Label>상세주소</Form.Label>
                        <Form.Control onChange={observeInput} name="detailAddress" type="text" placeholder="상세주소 입력" />
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
                                <Form.Control onChange={observeInput} name="birthday" type="date" />
                            </Form.Group>
                        </Col>
                    </Row>

                    <hr className="my-4" />

                    <h5 className="mb-3">환불 계좌 정보(선택)</h5>

                    <Row className="mb-4">
                        <Col md={4}>
                            <Form.Group controlId="bankName">
                                <Form.Label>은행명</Form.Label>
                                <Form.Control onChange={observeInput} name="bankName" type="text" placeholder="은행명 입력" />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="bankCode">
                                <Form.Label>은행코드</Form.Label>
                                <Form.Control onChange={observeInput} type="text" name="bankCode" placeholder="은행코드 입력" />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="accountHolderName">
                                <Form.Label>예금주명</Form.Label>
                                <Form.Control onChange={observeInput} name="accountHolderName" type="text" placeholder="예금주명 입력" />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Button variant="dark" type="button" onClick={clickRegisterButton}>
                        회원가입
                    </Button>
                </Form>
            </Container>
        </>
    );
};

export default RegisterPage;