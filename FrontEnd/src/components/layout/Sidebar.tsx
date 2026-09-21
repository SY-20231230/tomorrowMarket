import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Sidebar.css";
// 경로를 더 명확하게 지정합니다.
import logoImg from "../../assets/img/logo.png";
import api from "../../api/axios";

function Sidebar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api.get("/users/me").then(res => {
      if (res.data?.data) {
        setUser(res.data.data);
      }
    }).catch(console.error);
  }, []);
  const menuItems = [
    { name: "오늘의 증시", path: "/home", icon: "🏠" },
    { name: "주식 조회", path: "/stocks", icon: "🔍" },
    { name: "뉴스 모음", path: "/news", icon: "📰" },
    { name: "마이페이지", path: "/mypage", icon: "👤" },
  ];

  if (user?.role === "ROLE_ADMIN" || user?.role === "ADMIN") {
    menuItems.push({ name: "관리자", path: "/admin", icon: "⚙️" });
  }

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
                <span style={{ flex: 1 }}>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">{user?.name ? user.name.substring(0, 2).toUpperCase() : "G"}</div>
          <div className="user-info">
            <p className="username">{user?.name || "Guest"}</p>
            <p className="role">
              {user?.role === "ROLE_ADMIN" || user?.role === "ADMIN" ? "Admin" : 
               user?.role === "ROLE_PREMIUM" || user?.role === "PREMIUM" ? "Premium User" : 
               user?.role === "ROLE_USER" || user?.role === "USER" ? "Basic User" : "Visitor"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;