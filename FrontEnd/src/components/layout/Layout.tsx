import { useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MarketTicker from "../common/MarketTicker";
import "./Layout.css";

type LayoutProps = {
  children: React.ReactNode;
};

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  // 티커를 숨길 경로 목록 (랜딩 페이지는 티커 노출)
  const hideTickerPaths = ["/login", "/signup", "/forgot-password", "/reset-password", "/mypage", "/admin"];
  // 사이드바와 헤더를 아예 숨길 경로 (랜딩, 로그인, 회원가입 등 전체화면 용)
  const fullScreenPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];
  
  const shouldShowTicker = !hideTickerPaths.includes(location.pathname);
  const isFullScreen = fullScreenPaths.includes(location.pathname);

  return (
    <div className="layout">
      {!isFullScreen && <Sidebar />}
      <div className="content-area" style={{ marginLeft: isFullScreen ? "0" : undefined }}>
        {!isFullScreen && <Header />}
        <main className="main" style={{ padding: isFullScreen ? "0" : undefined }}>
          {shouldShowTicker && <MarketTicker />}
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
