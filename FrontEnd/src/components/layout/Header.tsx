import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/axios";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("isAuthenticated") || !!sessionStorage.getItem("isAuthenticated")
  );

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(!!localStorage.getItem("isAuthenticated") || !!sessionStorage.getItem("isAuthenticated"));
    };
    
    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    
    return () => {
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("recentViews");
      localStorage.removeItem("watchlistIds");
      sessionStorage.removeItem("isAuthenticated");
      window.dispatchEvent(new Event("authChange"));
      navigate("/");
    }
  };

  return (
    <header className="header">
      <div className="topbar-left">
        <div className="market-status">
          <div className="status-dot"></div>
          <span>KOSPI MARKET OPEN</span>
        </div>
      </div>

      <div className="topbar-right">
        <nav className="top-nav">
          <Link to="/home">메인</Link>
          {isLoggedIn ? (
            <>
              <Link to="/mypage">마이페이지</Link>
              <span style={{ cursor: "pointer", color: "#94a3b8", fontWeight: 600 }} onClick={handleLogout}>로그아웃</span>
            </>
          ) : (
            <Link to="/login">로그인</Link>
          )}
        </nav>
        <div className="search-trigger">🔍</div>
      </div>
    </header>
  );
}

export default Header;