import { Link, NavLink } from "react-router-dom";
import "./Sidebar.css";
// 경로를 더 명확하게 지정합니다.
import logoImg from "../../assets/img/logo.png";

function Sidebar() {
  const menuItems = [
    { name: "홈 대시보드", path: "/home", icon: "🏠" },
    { name: "특정 주식 조회", path: "/stock/005930", icon: "🔍" },
    { name: "분야 주식 조회", path: "/sector", icon: "📊" },
    { name: "종합지수 조회", path: "/market", icon: "📈" },
    { name: "마이페이지", path: "/mypage", icon: "👤" },
    { name: "모의투자", path: "/mock-invest", icon: "💰" },
    { name: "관리자", path: "/admin", icon: "⚙️" },
  ];

  return (
    <aside className="sidebar">
      {/* 로고 영역 정렬 보정 */}
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Link to="/" className="sidebar-logo" style={{ textDecoration: "none", padding: "10px 0", height: "auto" }}>
          <img
            src={logoImg}
            alt="내일장"
            style={{
              width: "180px",
              height: "auto",
              display: "block",
              transform: "scale(1.4)", // 레이아웃 영향 없이 이미지만 20% 확대
              transformOrigin: "center"
            }}
          />
        </Link>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                <span className="sidebar-icon">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">JD</div>
          <div className="user-info">
            <p className="username">John Doe</p>
            <p className="role">Premium User</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;