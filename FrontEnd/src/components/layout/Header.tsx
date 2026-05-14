import { Link } from "react-router-dom";
import "./Header.css";

function Header() {
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
          <Link to="/">메인</Link>
          <Link to="/login">로그인</Link>
        </nav>
        <div className="search-trigger">🔍</div>
      </div>
    </header>
  );
}

export default Header;