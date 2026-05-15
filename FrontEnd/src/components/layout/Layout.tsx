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
  
  // 티커를 숨길 경로 목록 (메인 페이지 "/" 제외)
  const hideTickerPaths = ["/login", "/signup", "/forgot-password", "/mypage", "/admin"];
  const shouldShowTicker = !hideTickerPaths.includes(location.pathname);

  return (
    <div className="layout">
      <Sidebar />
      <div className="content-area">
        <Header />
        <main className="main">
          {shouldShowTicker && <MarketTicker />}
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
