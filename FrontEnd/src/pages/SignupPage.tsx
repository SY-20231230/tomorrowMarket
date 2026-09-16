import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../contexts/ToastContext";
import "./SignupPage.css";

const INTEREST_OPTIONS = [
  "반도체", "2차전지", "바이오", "AI/플랫폼", "금융", "배당주", "미국주식", "암호화폐"
];

function SignupPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    birthdate: ""
  });
  const [errorMsg, setErrorMsg] = useState("");
  
  // Birthdate State
  const [birthdateRaw, setBirthdateRaw] = useState("");
  const [birthdateErrorMsg, setBirthdateErrorMsg] = useState("");
  const birthdateRef = useRef<HTMLInputElement>(null);

  // Name Validation State
  const [nameErrorMsg, setNameErrorMsg] = useState("");

  // Refs for focusing
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 허용하고 최대 8자리까지만 입력받음
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 8) {
      setBirthdateRaw(value);
    }
  };

  useEffect(() => {
    if (birthdateRaw.length === 8) {
      const year = parseInt(birthdateRaw.substring(0, 4), 10);
      const month = parseInt(birthdateRaw.substring(4, 6), 10);
      const day = parseInt(birthdateRaw.substring(6, 8), 10);
      
      const dateObj = new Date(year, month - 1, day);
      if (
        dateObj.getFullYear() !== year || 
        dateObj.getMonth() + 1 !== month || 
        dateObj.getDate() !== day ||
        year < 1900 || 
        year > new Date().getFullYear()
      ) {
        setBirthdateErrorMsg("존재하지 않거나 올바르지 않은 날짜입니다.");
      } else {
        setBirthdateErrorMsg("");
      }
    } else {
      setBirthdateErrorMsg("");
    }
  }, [birthdateRaw]);

  useEffect(() => {
    if (formData.name.length > 0) {
      const nameRegex = /^[가-힣a-zA-Z0-9]{2,10}$/;
      if (!nameRegex.test(formData.name)) {
        setNameErrorMsg("닉네임은 특수문자와 공백 없이 2~10자로 입력해주세요.");
      } else {
        setNameErrorMsg("");
      }
    } else {
      setNameErrorMsg("");
    }
  }, [formData.name]);

  // Email Verification State
  const [otpCode, setOtpCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [timerActive, setTimerActive] = useState(false);

  // Password validation state
  const [passwordStrength, setPasswordStrength] = useState("");
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      setIsCodeSent(false); // Reset if time expires
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === "password") {
      if (!value) {
        setPasswordStrength("");
      } else if (passwordRegex.test(value)) {
        setPasswordStrength("안전한 비밀번호입니다.");
      } else {
        setPasswordStrength("비밀번호는 8~20자리이며, 영문/숫자/특수문자를 모두 포함해야 합니다.");
      }
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const handleSendCode = async () => {
    if (!formData.email) {
      setErrorMsg("이메일을 입력해주세요.");
      return;
    }
    setErrorMsg("");
    try {
      await api.post("/auth/email/send", { email: formData.email });
      setIsCodeSent(true);
      setTimerActive(true);
      setTimeLeft(180);
      showToast("인증번호가 발송되었습니다. 3분 이내에 입력해주세요.", "success");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "인증번호 발송에 실패했습니다.");
    }
  };

  const handleVerifyCode = async () => {
    if (!otpCode) return;
    setErrorMsg("");
    try {
      await api.post("/auth/email/verify", { email: formData.email, code: otpCode });
      setIsEmailVerified(true);
      setTimerActive(false);
      showToast("이메일 인증이 완료되었습니다.", "success");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "인증번호가 올바르지 않습니다.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Custom Validation and Focus
    if (!formData.email) {
      setErrorMsg("이메일을 입력해주세요.");
      emailRef.current?.focus();
      return;
    }
    if (!isEmailVerified) {
      setErrorMsg("이메일 인증을 먼저 완료해주세요.");
      emailRef.current?.focus();
      return;
    }
    if (!formData.password) {
      setErrorMsg("비밀번호를 입력해주세요.");
      passwordRef.current?.focus();
      return;
    }
    if (!passwordRegex.test(formData.password)) {
      setErrorMsg("비밀번호 양식을 확인해주세요.");
      passwordRef.current?.focus();
      return;
    }
    if (!formData.passwordConfirm) {
      setErrorMsg("비밀번호 확인을 입력해주세요.");
      passwordConfirmRef.current?.focus();
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      passwordConfirmRef.current?.focus();
      return;
    }
    if (!formData.name) {
      setErrorMsg("닉네임(이름)을 입력해주세요.");
      nameRef.current?.focus();
      return;
    }
    if (nameErrorMsg) {
      setErrorMsg("올바른 닉네임을 입력해주세요.");
      nameRef.current?.focus();
      return;
    }
    if (birthdateRaw.length !== 8) {
      setErrorMsg("생년월일 8자리를 정확히 입력해주세요. (예: 19900101)");
      birthdateRef.current?.focus();
      return;
    }
    if (birthdateErrorMsg) {
      setErrorMsg("올바른 생년월일을 입력해주세요.");
      birthdateRef.current?.focus();
      return;
    }

    const formattedBirthdate = `${birthdateRaw.substring(0, 4)}-${birthdateRaw.substring(4, 6)}-${birthdateRaw.substring(6, 8)}`;

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        birthdate: formattedBirthdate
      };
      await api.post("/auth/signup", payload);
      showToast("회원가입이 완료되었습니다!", "success");
      navigate("/login");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "회원가입 중 오류가 발생했습니다.");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="signup-container">
      {/* 좌측 비주얼 섹션 */}
      <section className="signup-visual-section">
        <h1>나만의<br /><span>투자 아이덴티티</span><br />설정하기</h1>
        <p>
          내일장은 당신의 투자 성향을 분석하여 맞춤형 인사이트를 제공합니다. 
          지금 바로 합류하여 AI 기반의 스마트한 투자를 경험하세요.
        </p>
      </section>

      {/* 우측 폼 섹션 */}
      <section className="signup-form-section">
        <div className="signup-card">
          <h2>회원가입</h2>
          <p className="subtitle">내일장과 함께 성공적인 투자 여정을 시작하세요.</p>

          <form onSubmit={handleSignup} autoComplete="off" noValidate>
            {/* 브라우저 자동완성 덮어쓰기 방지 트랩 */}
            <input type="text" name="fake-email-trap" style={{ display: "none" }} aria-hidden="true" />
            <input type="password" name="fake-pw-trap" style={{ display: "none" }} aria-hidden="true" />
            
            {errorMsg && <div style={{ color: "white", background: "rgba(239, 68, 68, 0.8)", padding: "12px", borderRadius: "8px", marginBottom: "15px", fontSize: "14px", fontWeight: "bold", textAlign: "center" }}>{errorMsg}</div>}
            
            <div className="signup-input-group">
              <label>이메일 <span className="required-star">*</span></label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="example@tomorrow.com" disabled={isEmailVerified} autoComplete="off" style={{ flex: 1 }} ref={emailRef} />
                <button type="button" onClick={handleSendCode} disabled={isEmailVerified || (timerActive && timeLeft > 170)} style={{ padding: "0 15px", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", whiteSpace: "nowrap" }}>
                  {isCodeSent ? "재전송" : "인증번호 받기"}
                </button>
              </div>
            </div>

            {isCodeSent && !isEmailVerified && (
              <div className="signup-input-group">
                <label>인증번호 입력 <span className="required-star">*</span> <span style={{ color: "red" }}>({formatTime(timeLeft)})</span></label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="6자리 인증번호" autoComplete="off" style={{ flex: 1 }} />
                  <button type="button" onClick={handleVerifyCode} style={{ padding: "0 15px", background: "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", whiteSpace: "nowrap" }}>
                    인증 확인
                  </button>
                </div>
              </div>
            )}

            <div className="signup-input-group">
              <label>비밀번호 <span className="required-star">*</span></label>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="8~20자, 영문/숫자/특수문자 포함" autoComplete="new-password" ref={passwordRef} />
              {passwordStrength && (
                <div style={{ marginTop: "5px", fontSize: "12px", color: formData.password.match(passwordRegex) ? "#10b981" : "#ef4444" }}>
                  {passwordStrength}
                </div>
              )}
            </div>

            <div className="signup-input-group">
              <label>비밀번호 확인 <span className="required-star">*</span></label>
              <input type="password" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleInputChange} placeholder="비밀번호를 다시 입력하세요" autoComplete="new-password" ref={passwordConfirmRef} />
              {formData.passwordConfirm && (
                <div style={{ marginTop: "5px", fontSize: "12px", color: formData.password === formData.passwordConfirm ? "#10b981" : "#ef4444" }}>
                  {formData.password === formData.passwordConfirm ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
                </div>
              )}
            </div>

            <div className="signup-input-group">
              <label>닉네임(이름) <span className="required-star">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="특수문자 제외 2~10자" autoComplete="off" ref={nameRef} />
              {nameErrorMsg && (
                <div style={{ marginTop: "5px", fontSize: "12px", color: "#ef4444" }}>
                  {nameErrorMsg}
                </div>
              )}
            </div>

            <div className="signup-input-group">
              <label>생년월일 <span className="required-star">*</span></label>
              <input 
                type="text" 
                value={birthdateRaw} 
                onChange={handleBirthdateChange} 
                placeholder="YYYYMMDD (예: 19900101)" 
                autoComplete="off" 
                ref={birthdateRef} 
              />
              {birthdateErrorMsg && (
                <div style={{ marginTop: "5px", fontSize: "12px", color: "#ef4444" }}>
                  {birthdateErrorMsg}
                </div>
              )}
            </div>

            <div className="interest-group">
              <span className="interest-label">관심 분야 (다중 선택 가능)</span>
              <div className="interest-tags">
                {INTEREST_OPTIONS.map(interest => (
                  <div 
                    key={interest}
                    className={`interest-tag ${selectedInterests.includes(interest) ? "active" : ""}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="signup-submit-btn">회원가입 완료</button>

            <div className="login-link-container">
              이미 계정이 있으신가요? 
              <span onClick={() => navigate("/login")}>로그인하러 가기</span>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default SignupPage;