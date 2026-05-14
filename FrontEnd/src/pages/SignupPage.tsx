import Card from "../components/common/Card";
import SectionTitle from "../components/common/SectionTitle";

function SignupPage() {
  return (
    <>
      <SectionTitle
        title="회원가입"
        description="관심 분야를 선택하고 내일장을 시작하세요."
      />

      <Card>
        <form style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input type="email" placeholder="이메일" />
          <input type="password" placeholder="비밀번호" />
          <input type="text" placeholder="닉네임" />

          <select>
            <option>관심 분야 선택</option>
            <option>반도체</option>
            <option>2차전지</option>
            <option>바이오</option>
            <option>AI/플랫폼</option>
          </select>

          <button type="button">회원가입</button>
        </form>
      </Card>
    </>
  );
}

export default SignupPage;